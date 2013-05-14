<?php
/** /db/job/common.php
 *
 */
namespace jak;

require_once '../shared/common.php';
require_once '../prop/common.php';

function job_getJob($criteria) {
    global $mysqli;

    $r = initResult($criteria);

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
    if (isset($criteria->appointmentStart,$criteria->appointmentEnd)) {
        $cnd = "where appointment between $criteria->appointmentStart and $criteria->appointmentEnd";
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

    $r = initResult($criteria);

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

    if (!isset($i->record) &&
        !isset($i->create) &&
        !isset($i->duplicate) &&
        !isset($i->remove)) {return null;}

    if (isset($i->remove)) {remove('job',$i);}

    if (isset($i->record)) {
        foreach ($i->record as $rec) {

            $r = initResult($rec);

            if (isset($rec->data->id) && $rec->data->id != '') {
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
                        ,$rec->data->ref
                        ,$rec->data->appointment
                        ,$rec->data->address
                        ,$rec->data->confirmed
                        ,$rec->data->reminder
                        ,$rec->data->weather
                        ,$rec->data->id
                    );
                    $r->successUpdate = $stmt->execute();
                    $r->rows = $mysqli->affected_rows;
                    $r->successUpdate OR $r->errorUpdate = $mysqli->error;
                    $stmt->close();
                }
                continue;
            }
            if ($stmt = $mysqli->prepare(
                "insert into `job`
                        (ref, created, createdBy, appointment, address, confirmed, reminder, weather)
                values (?,unix_timestamp(now()),?,?,?,?,?,?)"
            )) {
                $stmt->bind_param('isiiiis'
                    ,$rec->data->ref
                    ,$_SESSION['member']
                    ,$rec->data->appointment
                    ,$rec->data->address
                    ,$rec->data->confirmed
                    ,$rec->data->reminder
                    ,$rec->data->weather
                );
                $r->successInsert = $stmt->execute();
                $r->rows = $mysqli->affected_rows;
                $r->successInsert
                    ?$rec->data->id = $stmt->insert_id
                    :$r->errorInsert = $mysqli->error;
                $stmt->close();
            }
        }
    }

    if (isset($i->create)) {
        $i->create = new \stdClass;
        $r = initResult($i->create);
        $r->data = new \stdClass;
        $r->data->created = time();
        $r->data->createdBy = $_SESSION['member'];
        if ($stmt = $mysqli->prepare(
            "insert into `job`
                   (created, createdBy)
             values (?,?)"
        )) {
            $stmt->bind_param('is'
                ,$r->data->created
                ,$r->data->createdBy
            );
            $r->successInsert = $stmt->execute();
            $r->rows = $mysqli->affected_rows;
            $r->successInsert
                ?$r->data->id = $stmt->insert_id
                :$r->errorInsert = $mysqli->error;
            $stmt->close();
        }
        //supporting data
        if ($r->successInsert) {
            $jobId = $r->data->id;
            //default property propPart
            $mysqli->query(
                "insert into `propPart`
                        (job, propPartType, seq, indent, name)
                 values ($jobId,1,0,0,'')"
            );
            $i->create->log[] = 'insert into `propPart`';
            //use propTemplate.def
            if ($stmt = $mysqli->prepare(
                'select ptp.*,
                        pt.name  as propTemplateName,
                        ppt.name as propPartTypeName
                   from `propTemplatePart` as ptp,
                        `propTemplate`     as pt,
                        `propPartType`     as ppt
                  where ptp.propTemplate = pt.id
                    and ptp.propPartType = ppt.id
                    and pt.def           = 1'
            )) {
                $stmt->execute();
                $propPartDef = \jak\fetch_result($stmt);
                $stmt->close();

                foreach ($propPartDef as $d) {
                    for ($j = 0; $j < $d->defaultRecs; $j++) {
                        $mysqli->query(
                            "insert into `propPart`
                                    (job, propPartType, seq, indent, name)
                             values ($jobId, $d->propPartType, 0, 0, '')"
                        );
                    }
                }
            }
            $i->create->log[] = 'insert into `answer`';
            //questions/answers
            $mysqli->query(
                "insert into `answer`
                        (question, job, detail)
                 select id, $jobId, def
                   from `question`"
            );
            //>>>>>>>>>>>>>>>FIX used distinct because of duplicate - why?
            $i->create->log[] = 'insert into `propPartAnswer`';
            $mysqli->query(
                "insert into `propPartAnswer`
                        (propPart, answer, job, seq)
                 select distinct pp.id, a.id, $jobId, qm.seq
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

    if (isset($i->duplicate)) {
        $jobId = $i->duplicate;
        $i->duplicate = new \stdClass;
        $r = initResult($i->duplicate);
        $r->data = new \stdClass;
        $r->data->created = time();
        $r->data->createdBy = $_SESSION['member'];
        $i->duplicate->log[] = 'duplicating';

        $temp = job_getJob((object) array(criteria => array(jobIds => array($jobId))));
        $r->data->ref     = $temp->data->{$jobId}->ref;
        $r->data->address = $temp->data->{$jobId}->address;
    }

/*

        if (!$r->successInsert) {$r->log[] = 'job insert error'; return;}
        $jobId = $rec->data->id;

        //finish duplication
        if (isset($rec->duplicate)) {

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

            // answers and answers related to propPart propPartAnswer
            $propPartIds = array();
            $propPartIds = selectIds($propParts->data, 'id');
            if (count($propPartIds) > 0) {
                if ($stmt = $mysqli->prepare(
                    "insert into `propPartAnswer`
                           (propPart, answer, job)
                     select propPart, answer, $jobId
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
        }
    }
*/
}

function job_setPropPart(&$i) {
    global $mysqli;

    $r = initResult($i);

    if (!isset($i->data) &&
        !isset($i->remove)) {return null;}

    remove('propPart', $i);

    if (isset($i->data->id)) {
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
                ,$i->data->job
                ,$i->data->propPartType
                ,$i->data->seq
                ,$i->data->indent
                ,$i->data->name
                ,$i->data->id
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
           ,$i->data->job
           ,$i->data->propPartType
           ,$i->data->seq
           ,$i->data->indent
           ,$i->data->name
        );
        $r->successInsert = $stmt->execute();
        $r->rows = $mysqli->affected_rows;
        $r->successInsert
            ?$i->data->id = $stmt->insert_id
            :$r->errorInsert = $mysqli->error;
        $stmt->close();
    }

}
