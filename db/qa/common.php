<?php
/** //db/qa/common.php
 *
 */
namespace jak;

function qa_getAnswer($criteria) {
    global $mysqli;

    $r = initResult($criteria);

    $cnd   = '';
    $limit = '';

    if (isset($criteria->answerIds) && is_array($criteria->answerIds) && count($criteria->answerIds) > 0) {
        $answerIds = implode(',', $criteria->answerIds);
        $cnd = "where id in ($answerIds)";
    }

    if (isset($criteria->jobIds) && is_array($criteria->jobIds) && count($criteria->jobIds) > 0) {
        $jobIds = implode(',', $criteria->jobIds);
        $cnd = "where job in ($jobIds)";
    }

    if (isset($criteria->questionIds) && is_array($criteria->questionIds) && count($criteria->questionIds) > 0) {
        $questionIds = implode(',', $criteria->questionIds);
        $cnd = "where question in ($questionIds)";
    }

    if (isset($criteria->rowLimit)) {
        $limit = ' limit ' . $criteria->rowLimit;
    }

    if ($stmt = $mysqli->prepare(
        "select *
           from `answer` $cnd $limit"
    )) {
        $r->success = $stmt->execute();
        $r->rows = $mysqli->affected_rows;
        $r->data = \jak\fetch_result($stmt,'id');
        $stmt->close();
    }
    return $r;
}

function qa_getPropPartAnswer($criteria) {
    global $mysqli;

    $r = initResult($criteria);

    $cnd   = '';
    $limit = '';

    if (isset($criteria->propPartAnswerIds) && is_array($criteria->propPartAnswerIds) && count($criteria->propPartAnswerIds) > 0) {
        $propPartAnswerIds = implode(',', $criteria->propPartAnswerIds);
        $cnd = "where id in ($propPartAnswerIds)";
    } else

    if (isset($criteria->propPartIds) && is_array($criteria->propPartIds) && count($criteria->propPartIds) > 0) {
        $propPartIds = implode(',', $criteria->propPartIds);
        $cnd = "where propPart in ($propPartIds)";
    }

    if (isset($criteria->rowLimit)) {
        $limit = ' limit ' . $criteria->rowLimit;
    }

    if ($stmt = $mysqli->prepare(
        "select *
           from `propPartAnswer` $cnd $limit"
    )) {
        $r->success = $stmt->execute();
        $r->rows = $mysqli->affected_rows;
        $r->data = \jak\fetch_result($stmt,'id');
        $stmt->close();
    }
    return $r;
}

function qa_getQuestion($criteria) {
    global $mysqli;

    $r = initResult($criteria);

    $cnd   = '';
    $limit = '';

    if (isset($criteria->questionIds) && is_array($criteria->questionIds) && count($criteria->questionIds) > 0) {
        $questionIds = implode(',', $criteria->questionIds);
        $cnd = "where id in ($questionIds)";
    }

    if (isset($criteria->rowLimit)) {
        $limit = ' limit ' . $criteria->rowLimit;
    }

    if ($stmt = $mysqli->prepare(
        "select *
           from `question` $cnd $limit"
    )) {
        $r->success = $stmt->execute();
        $r->rows = $mysqli->affected_rows;
        $r->data = \jak\fetch_result($stmt,'id');
        $stmt->close();
    }
    return $r;
}

function qa_getQuestionMatrix($criteria) {
    global $mysqli;

    $r = initResult($criteria);

    $cnd   = '';
    $limit = '';

    if (isset($criteria->questionMatrixIds) && is_array($criteria->questionMatrixIds) && count($criteria->questionMatrixIds) > 0) {
        $questionMatrixIds = implode(',', $criteria->questionMatrixIds);
        $cnd = "where id in ($questionMatrixIds)";
    }

    if (isset($criteria->rowLimit)) {
        $limit = ' limit ' . $criteria->rowLimit;
    }

    if ($stmt = $mysqli->prepare(
        "select *
           from `questionMatrix` $cnd $limit"
    )) {
        $r->success = $stmt->execute();
        $r->rows = $mysqli->affected_rows;
        $r->data = \jak\fetch_result($stmt,'id');
        $stmt->close();
    }
    return $r;
}

function qa_setAnswer(&$i) {
    global $mysqli;

    remove('answer',$i);

    foreach ($i->record as $rec) {

	    $r = initResult($rec);

        if (isset($rec->data->id) && $rec->data->id != '') {
	        if ($stmt = $mysqli->prepare(
    	        "update `answer`
        	        set question = ?,
            	        job      = ?,
                	    seq   	 = ?,
                    	detail   = ?
              	  where id = ?"
        	)) {
            	$stmt->bind_param('iiisi'
                	,$rec->data->question
                	,$rec->data->job
                	,$rec->data->seq
                	,$rec->data->detail
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
       		"insert into `answer`
                	(question, job, detail)
	         values (?,?,?)"
    	)) {
        	$stmt->bind_param('iii'
           		,$rec->data->question
           		,$rec->data->job
           		,$rec->data->detail
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

function qa_setPropPartAnswer(&$i) {
    global $mysqli;

    remove('propPartAnswer', $i);

    foreach ($i->record as $rec) {

	    $r = initResult($rec);

        if (isset($rec->data->id) && $rec->data->id != '') {
	        if ($stmt = $mysqli->prepare(
    	        "update `propPartAnswer`
        	        set propPart = ?,
            	        answer   = ?,
                	    current  = ?,
                    	job      = ?,
                    	seq      = ?
              	  where id = ?"
        	)) {
            	$stmt->bind_param('iiiiii'
                	,$rec->data->propPart
                	,$rec->data->answer
                	,$rec->data->current
                	,$rec->data->job
                	,$rec->data->seq
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
        	"insert into `propPartAnswer`
            	    (propPart, answer, current, job, seq)
         	values (?,?,?,?,?)"
    	)) {
        	$stmt->bind_param('iiiii'
           		,$rec->data->propPart
           		,$rec->data->answer
           		,$rec->data->current
           		,$rec->data->job
           		,$rec->data->seq
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
