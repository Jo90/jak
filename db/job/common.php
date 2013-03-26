<?php
/** /db/job/common.php
 *
 */
namespace jak;

require_once '../prop/common.php';

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

function job_setJob(&$i) {
    global $mysqli;
    $i->result = new \stdClass;
    $r = $i->result;

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

    //finish duplication
    if(isset($i->criteria->duplicate)){
    	$jobId = $i->criteria->data->id;
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
		$propPart = prop_getPropPart($criteriaPropPart);
/*		
		// answerMatrix	    
		$propPartIds = array();
		$propPartIds = selectIds($propPart, 'id');	
	    if ($stmt = $mysqli->prepare(
    	    "insert into answerMatrix
    	    	   (answer, propPart, service)
    	     select answer, propPart, service	   
        	   from `answerMatrix` 
        	  where propPart in ($propPartIds)"
    	)) {
        	$r->success = $stmt->execute();
        	$r->rows = $mysqli->affected_rows;
        	$stmt->close();
    	}
*/
    }    
}
