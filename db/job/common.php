<?php
/** /db/job/common.php
 *
 */
namespace ja;

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
        $r->data = \ja\fetch_result($stmt,'id');
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
    } else
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
        $r->data = \ja\fetch_result($stmt,'id');
        $stmt->close();
    }
    return $r;
}

function job_setJob(&$i) {
    global $mysqli;

    if (!isset($i->record) &&
        !isset($i->create) &&
        !isset($i->duplicate) &&
        !isset($i->remove)) {$i->error = 'invalid parameters'; return null;}

    db::remove('job',$i);

    if (isset($i->record)) {

        foreach ($i->record as $rec) {

            if (!db::update('job',$rec)) {

                //insert
                $rec->data->created = time();
                $rec->data->createdBy = $_SESSION['member'];
                db::insert('job',$rec);
                //insert supporting data

                $jobId = $rec->data->id;
                //default property propPart
                $mysqli->query(
                    "insert into `propPart`
                            (job, propPartType, seq, indent, name)
                    values ($jobId,1,0,0,'')"
                );
                $rec->log[] = 'insert into `propPart`';
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
                    $propPartDef = \ja\fetch_result($stmt);
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
                $rec->log[] = 'insert into `answer`';
                //questions/answers
                $mysqli->query(
                    "insert into `answer`
                            (question, job, detail)
                    select id, $jobId, def
                    from `question`"
                );
                //>>>>>>>>>>>>>>>FIX used distinct because of duplicate - why?
                $rec->log[] = 'insert into `propPartAnswer`';
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
    }

    if (isset($i->duplicate)) {
        $jobId = $i->duplicate;
        $i->duplicate = new \stdClass;
        $r = initResult($i->duplicate);
        $r->data = new \stdClass;
        $r->data->created = time();
        $r->data->createdBy = $_SESSION['member'];
        $i->duplicate->log[] = 'duplicating';

        $temp = job_getJob((object) array('criteria' => array('jobIds' => array($jobId))));
        $r->data->address = $temp->data->{$jobId}->address;
        $r->data->ref     = $temp->data->{$jobId}->ref;
        $r->data->created = $temp->data->{$jobId}->created;
        $r->data->createdBy = $temp->data->{$jobId}->createdBy;
        $r->data->appointment = $temp->data->{$jobId}->appointment;
        $r->data->confirmed = $temp->data->{$jobId}->confirmed;
        $r->data->reminder = $temp->data->{$jobId}->reminder;
        $r->data->weather = $temp->data->{$jobId}->weather;

		// create new job
        if ($stmt = $mysqli->prepare(
            "insert into `job`
                   (address, ref, created, createdBy, appointment, confirmed, reminder, weather)
             values (?,?,?,?,?,?,?,?)"
        )) {
            $stmt->bind_param('iiisiiis'
                ,$r->data->address
                ,$r->data->ref
        		,$r->data->created
        		,$r->data->createdBy
        		,$r->data->appointment
        		,$r->data->confirmed
        		,$r->data->reminder
        		,$r->data->weather
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
            $jobNewId = $r->data->id;
            
            // jobService
            if ($stmt = $mysqli->prepare(
                "select *
                   from `jobService`
                  where job = $jobId"
            )) {
                $stmt->execute();
                $jobService = \ja\fetch_result($stmt);
                $stmt->close();

                foreach ($jobService as $d) {
                    $mysqli->query(
                        "insert into `jobService`
	                            (job, service, fee)
    	                 values ($jobNewId, $d->service, $d->fee)"
        	        );
                }
            }
                    
            if ($stmt = $mysqli->prepare(
                "select pp.*,
                		a.id as aId, a.question, a.seq as aSeq, a.detail,
                		ppa.propPart, ppa.current, ppa.seq as ppaSeq 
                   from `propPart`		 as pp,
                   		`answer`		 as a,
                   		`propPartAnswer` as ppa	
                  where pp.id = ppa.propPart
                    and ppa.answer = a.id
                    and pp.job = ?"
            )) {
				$stmt->bind_param('i'
            		,$jobId
            	);
                $stmt->execute();
                $propPartAnswer = \ja\fetch_result($stmt);
                $stmt->close();

				$ppArr = array();
				$aArr  = array();

                foreach ($propPartAnswer as $d) {
					if (!array_key_exists($d->id, $ppArr)){
				        if ($stmt = $mysqli->prepare(
                            "insert into `propPart`
                                    (job, propPartType, seq, indent, name)
                             values (?,?,?,?,?)"
                        )){
							$stmt->bind_param('iiiis'
                				,$jobNewId
                				,$d->propPartType
                				,$d->seq
                				,$d->indent
                				,$d->name
            				);
            				$rpp = new \stdClass;
           					$rpp->successInsert = $stmt->execute();
	            			$rpp->successInsert
                				?$ppArr[] = array($d->id => $stmt->insert_id)
                				:$rpp->errorInsert = $mysqli->error;
            				$stmt->close();
        				}
					}
					$ppNewId = 0;
					foreach($ppArr as $oldId => $newId){
						if ($oldId == $d->id)
							$ppNewId = $newId;
					}

					if (!array_key_exists($d->aId, $aArr)){
				        if ($stmt = $mysqli->prepare(
                            "insert into `answer`
                                    (question, job, seq, detail)
                             values (?,?,?,?)"
                        )){
                        	$stmt->bind_param('iiis'
                				,$d->question
                				,$jobNewId
                				,$d->aSeq
                				,$d->detail
            				);
            				$ra = new \stdClass;
           					$ra->successInsert = $stmt->execute();
            				$ra->successInsert
                				?$aArr[] = array($d->aId => $stmt->insert_id)
                				:$ra->errorInsert = $mysqli->error;
            				$stmt->close();
        				}
        			}	
					$aNewId = 0;
					foreach($aArr as $oldId => $newId){
						if ($oldId == $d->aId)
							$aNewId = $newId;
					}

					// insert into propPartAnswer 
                    $mysqli->query(
                        "insert into `propPartAnswer`
	                            (propPart, answer, current, job, seq)
    	                 values ($ppNewId, $aNewId, $d->current, $jobNewId, $d->ppaSeq)"
        	        );
                }
			}
        }
    }
}

function job_setPropPart(&$i) {
    global $mysqli;
    db::remove('propPart', $i);
    if (isset($i->record)) {
        foreach ($i->record as $rec) {
            db::update('propPart',$rec) or db::insert('propPart',$rec);
        }
    }
}
