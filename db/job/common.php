<?php
/** /db/job/common.php
 *
 */
namespace jak;

require_once '../prop/common.php';
require_once '../shared/common.php';

function job_getJob($criteria) {
    global $mysqli;
    $r = new \stdClass;
    $r->criteria = $criteria;
    $cnd   = '';
    $limit = '';

    //criteria
    if (isset($criteria->jobIds) && is_array($criteria->jobIds) && count($criteria->jobIds) > 0) {
        $jobIds = implode(',', $criteria->jobIds);
        $cnd = "where id in ($jobIds)";
    } else
    if (isset($criteria->addressIds) && is_array($criteria->addressIds) && count($criteria->addressIds) > 0) {
        $addressIds = implode(',', $criteria->addressIds);
        $cnd = "where address in ($addressIds)";
    } else
    //last jobs
    if (isset($criteria->lastJob) && $criteria->lastJob) {
        $cnd = 'order by id desc';
    }

    if (isset($criteria->rowLimit)) {
        $limit = ' limit ' . $criteria->rowLimit;
    }

    if ($stmt = $mysqli->prepare(
        "select *
           from `job` $cnd $limit"
    )) {
        $r->success = $stmt->execute();
        $r->rows = $mysqli->affected_rows;
        $r->data = \jak\fetch_result($stmt,'id');
        $stmt->close();
    }
    return $r;
}

function job_getPropPart($criteria) {
    global $mysqli;
    $r = new \stdClass;
    $r->criteria = $criteria;
    $cnd   = '';
    $limit = '';

    if (isset($criteria->propPartIds) && is_array($criteria->propPartIds) && count($criteria->propPartIds) > 0) {
        $propPartIds = implode(',', $criteria->propPartIds);
        $cnd = "where id in ($propPartIds)";
    }

    if (isset($criteria->jobIds) && is_array($criteria->jobIds) && count($criteria->jobIds) > 0){
        $jobIds = implode(',', $criteria->jobIds);
        $cnd = "where job in ($jobIds)";
    }

    if (isset($criteria->rowLimit)) {
        $limit = ' limit ' . $criteria->rowLimit;
    }

    if ($stmt = $mysqli->prepare(
        "select *
           from `propPart` $cnd order by seq $limit"
    )) {
        $r->success = $stmt->execute();
        $r->rows = $mysqli->affected_rows;
        $r->data = \jak\fetch_result($stmt,'id');
        $stmt->close();
    }
    return $r;
}

function job_setJob(&$i) {
    global $mysqli;

    $r = initStep($i);

    if (!isset($i->criteria) &&
        !isset($i->remove) &&
        !isset($i->criteria->duplicate)) {return null;}

    if (isset($i->remove) && is_array($i->remove)) {
        $jobIds = implode(',', $i->remove);
        if ($stmt = $mysqli->prepare(
            "delete from `job`
              where id in ($jobIds)"
        )) {
            $r->successDelete = $stmt->execute();
            $r->rows = $mysqli->affected_rows;
            $r->successDelete OR $r->errorDelete = $mysqli->error;
            $stmt->close();
        }
        return $r;
    }

    if (isset($i->criteria->data->id)) {
        if ($stmt = $mysqli->prepare(
            "update `job`
                set ref         = ?,
                    appointment = ?,
                    address     = ?,
                    confirmed   = ?,
                    reminder    = ?,
                    weather     = ?
              where id = ?"
        )) {
            $stmt->bind_param('iiiiisi'
                ,$i->criteria->data->ref
                ,$i->criteria->data->appointment
                ,$i->criteria->data->address
                ,$i->criteria->data->confirmed
                ,$i->criteria->data->reminder
                ,$i->criteria->data->weather
                ,$i->criteria->data->id
            );
            $r->successUpdate = $stmt->execute();
            $r->rows = $mysqli->affected_rows;
            $r->successUpdate OR $r->errorUpdate = $mysqli->error;
            $stmt->close();
        }
        return $r;
    }

    //insert
    if(isset($i->criteria->duplicate)){

        $i->criteria->jobIds = array($i->criteria->duplicate);
        if (!isset($i->criteria->data)) {$i->criteria->data = new \stdClass;}
        $temp = job_getJob($i->criteria);
        $i->criteria->data->ref     = $temp->data->{$i->criteria->duplicate}->ref;
        $i->criteria->data->address = $temp->data->{$i->criteria->duplicate}->address;
    }

    if ($stmt = $mysqli->prepare(
        "insert into `job`
                (ref,created,appointment,address,confirmed,reminder,weather)
         values (?,UNIX_TIMESTAMP(NOW()),?,?,?,?,?)"
    )) {
        $stmt->bind_param('iiiiis'
           ,$i->criteria->data->ref
           ,$i->criteria->data->appointment
           ,$i->criteria->data->address
           ,$i->criteria->data->confirmed
           ,$i->criteria->data->reminder
           ,$i->criteria->data->weather
        );
        $r->successInsert = $stmt->execute();
        $r->rows = $mysqli->affected_rows;
        $r->successInsert
            ?$i->criteria->data->id = $stmt->insert_id
            :$r->errorInsert = $mysqli->error;
        $stmt->close();
    }

    if (!$r->successInsert) {$r->log[] = 'job insert error'; return;}
    $jobId = $i->criteria->data->id;

    //finish duplication
    if (isset($i->criteria->duplicate)) {

        // jobService
        if ($stmt = $mysqli->prepare(
            "insert into jobService
                   (job, service)
             select job, service
               from `jobService`
              where job = $jobId"
        )) {
            $r->success = $stmt->execute();
            $r->rows = $mysqli->affected_rows;
            $stmt->close();
        }

        // propPart
        if ($stmt = $mysqli->prepare(
            "insert into propPart
                   (job, propPartType, seq, indent, name)
             select job, propPartType, seq, indent, name
               from `propPart`
              where job = $jobId"
        )) {
            $r->success = $stmt->execute();
            $r->rows = $mysqli->affected_rows;
            $stmt->close();
        }
        $criteriaPropPart = new \stdClass;
        $criteriaPropPart->jobIds = array($jobId);
        $propParts = prop_getPropPart($criteriaPropPart);

        //questionMatrix and propPart
        if ($stmt = $mysqli->prepare(
            "select qm.*
               from `propPart`       as pp,
                    `questionMatrix` as qm
              where pp.propPartType = qm.propPartType"
        )) {
            $stmt->execute();
            $qm = \jak\fetch_result($stmt);
            $stmt->close();

            //use qm


            
        }
        
        
        // answers and answerMatrix
        $propPartIds = array();
        $propPartIds = selectIds($propParts->data, 'id');
        if (count($propPartIds) > 0) {
            if ($stmt = $mysqli->prepare(
                "insert into answerMatrix
                       (answer, propPart, service, job)
                 select answer, propPart, service, $jobId
                   from `questionMatrix`
                  where propPart in ($propPartIds)"
            )) {
                $r->success = $stmt->execute();
                $r->rows = $mysqli->affected_rows;
                $stmt->close();
            }
        }
    } else

    //create plain job
    {
        //default property propPart
        $mysqli->query(
            "insert into `propPart`
                    (job, propPartType, seq, indent, name)
             values ($jobId,1,0,0,'')"
        );
        //use propTemplate.def
        if ($stmt = $mysqli->prepare(
            'select ptp.*,
                    pt.name  as propTemplateName,
                    ppt.name as propPartTypeName
               from `propTemplatePart`  as ptp,
                    `propTemplate`      as pt,
                    `propPartType`      as ppt
              where ptp.propTemplate = pt.id
                and ptp.propPartType = ppt.id
                and pt.def           = 1'
        )) {
            $stmt->execute();
            $propPartDef = \jak\fetch_result($stmt);
            $stmt->close();

            $r->propPartSuccess = array();
            foreach ($propPartDef as $d) {
                for ($i = 0; $i < $d->defaultRecs; $i++) {
                    $mysqli->query(
                        "insert into `propPart`
                                (job, propPartType, seq, indent, name)
                         values ($jobId, $d->propPartType, 0, 0, '')"
                    );
                }
            }
        }
        //questions/answers
        $mysqli->query(
            "insert into `answer`
                    (question, job, detail)
             select id, $jobId, def
               from `question`"
        );
        $mysqli->query(
            "insert into `answerMatrix`
                    (answer, propPart, service, seq, job)
             select a.id, pp.id, qm.service, qm.seq, $jobId
               from `questionMatrix` as qm,
                    `answer`         as a,
                    `propPart`       as pp
               where qm.question     = a.question
                 and qm.propPartType = pp.propPartType
                 and a.job           = $jobId
                 and pp.job          = $jobId"
        );
    }
}

function job_setPropPart(&$i) {
    global $mysqli;
    $i->result = new \stdClass;
    $r = $i->result;

    if (!isset($i->criteria) &&
        !isset($i->remove)) {return null;}

    if (isset($i->remove) && is_array($i->remove)) {
        $propPartIds = implode(',', $i->remove);
        if ($stmt = $mysqli->prepare(
            "delete from `propPart`
              where id in ($propPartIds)"
        )) {
            $r->successDelete = $stmt->execute();
            $r->rows = $mysqli->affected_rows;
            $r->successDelete OR $r->errorDelete = $mysqli->error;
            $stmt->close();
        }
        return $r;
    }

    if (isset($i->criteria->data->id)) {
        if ($stmt = $mysqli->prepare(
            "update `propPart`
                set job          = ?,
                    propPartType = ?,
                    seq          = ?,
                    indent       = ?,
                    name         = ?
              where id = ?"
        )) {
            $stmt->bind_param('iiiisi'
                ,$i->criteria->data->job
                ,$i->criteria->data->propPartType
                ,$i->criteria->data->seq
                ,$i->criteria->data->indent
                ,$i->criteria->data->name
                ,$i->criteria->data->id
            );
            $r->successUpdate = $stmt->execute();
            $r->rows = $mysqli->affected_rows;
            $r->successUpdate OR $r->errorUpdate = $mysqli->error;
            $stmt->close();
        }
        return $r;
    }

    if ($stmt = $mysqli->prepare(
        "insert into `propPart`
                (job, propPartType, seq, indent, name)
         values (?,?,?,?,?)"
    )) {
        $stmt->bind_param('iiiis'
           ,$i->criteria->data->job
           ,$i->criteria->data->propPartType
           ,$i->criteria->data->seq
           ,$i->criteria->data->indent
           ,$i->criteria->data->name
        );
        $r->successInsert = $stmt->execute();
        $r->rows = $mysqli->affected_rows;
        $r->successInsert
            ?$i->criteria->data->id = $stmt->insert_id
            :$r->errorInsert = $mysqli->error;
        $stmt->close();
    }

}
