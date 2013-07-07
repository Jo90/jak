<?php
/** //db/qa/common.php
 *
 */
namespace ja;

require_once '../common.php';

function qa_getAnswer($criteria) {
    global $mysqli;

    $r = initResult($criteria);

    $cnd   = '';
    $limit = '';

    if (isset($criteria->answerIds) && is_array($criteria->answerIds) && count($criteria->answerIds) > 0) {
        $answerIds = implode(',', $criteria->answerIds);
        $cnd = "where id in ($answerIds)";
    } else
    if (isset($criteria->jobIds) && is_array($criteria->jobIds) && count($criteria->jobIds) > 0) {
        $jobIds = implode(',', $criteria->jobIds);
        $cnd = "where job in ($jobIds)";
    } else
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
        $r->data = \ja\fetch_result($stmt,'id');
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
        $r->data = \ja\fetch_result($stmt,'id');
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
        $r->data = \ja\fetch_result($stmt,'id');
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
        $r->data = \ja\fetch_result($stmt,'id');
        $stmt->close();
    }
    return $r;
}

function qa_setAnswer(&$i) {
    global $mysqli;
    db::remove('answer',$i);
    if (isset($i->record)) {
        foreach ($i->record as $rec) {
            db::update('answer',$rec) or db::insert('answer',$rec);
        }
    }
}

function qa_setPropPartAnswer(&$i) {
    global $mysqli;
    db::remove('propPartAnswer',$i);
    if (isset($i->record)) {
        foreach ($i->record as $rec) {
            db::update('propPartAnswer',$rec) or db::insert('propPartAnswer',$rec);
        }
    }
}
