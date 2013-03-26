<?php
/** /db/prop/common.php
 *
 */
namespace jak;

function prop_getAnswerMatrix($criteria) {
    global $mysqli;
    $r = new \stdClass;
    $r->criteria = $criteria;
    $cnd   = '';
    $limit = '';

    if (isset($criteria->answerMatrixIds) && is_array($criteria->answerMatrixIds) && count($criteria->answerMatrixIds) > 0) {
        $answerMatrixIds = implode(',', $criteria->answerMatrixIds);
        $cnd = "where id in ($answerMatrixIds)";
    }

	if (isset($criteria->propPartIds) && is_array($criteria->propPartIds) && count($criteria->propPartIds) > 0){
        $propPartIds = implode(',', $criteria->propPartIds);
        $cnd = "where propPart in ($propPartIds)";
	}
	
    if (isset($criteria->rowLimit)) {
        $limit = ' limit ' . $criteria->rowLimit;
    }

    if ($stmt = $mysqli->prepare(
        "select *
           from `answerMatrix` $cnd $limit"
    )) {
        $r->success = $stmt->execute();
        $r->rows = $mysqli->affected_rows;
        $r->data = \jak\fetch_result($stmt,'id');
        $stmt->close();
    }
    return $r;
}

function prop_getPropPart($criteria) {
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
           from `propPart` $cnd $limit"
    )) {
        $r->success = $stmt->execute();
        $r->rows = $mysqli->affected_rows;
        $r->data = \jak\fetch_result($stmt,'id');
        $stmt->close();
    }
    return $r;
}

function prop_getPropPartType($criteria) {
    global $mysqli;
    $r = new \stdClass;
    $r->criteria = $criteria;
    $cnd   = '';
    $limit = '';

    if (isset($criteria->propPartTypeIds) && is_array($criteria->propPartTypeIds) && count($criteria->propPartTypeIds) > 0) {
        $propIds = implode(',', $criteria->propPartTypeIds);
        $cnd = "where id in (propPartTypeIds)";
    }

    if (isset($criteria->rowLimit)) {
        $limit = ' limit ' . $criteria->rowLimit;
    }

    if ($stmt = $mysqli->prepare(
        "select *
           from `propPartType` $cnd $limit"
    )) {
        $r->success = $stmt->execute();
        $r->rows = $mysqli->affected_rows;
        $r->data = \jak\fetch_result($stmt,'id');
        $stmt->close();
    }
    return $r;
}

function prop_getPropTemplate($criteria) {
    global $mysqli;
    $r = new \stdClass;
    $r->criteria = $criteria;
    $cnd   = '';
    $limit = '';

    if (isset($criteria->propTemplateIds) && is_array($criteria->propTemplateIds) && count($criteria->propTemplateIds) > 0) {
        $propTemplateIds = implode(',', $criteria->propTemplateIds);
        $cnd = "where id in ($propTemplateIds)";
    }

    if (isset($criteria->rowLimit)) {
        $limit = ' limit ' . $criteria->rowLimit;
    }

    if ($stmt = $mysqli->prepare(
        "select *
           from `propTemplate` $cnd $limit"
    )) {
        $r->success = $stmt->execute();
        $r->rows = $mysqli->affected_rows;
        $r->data = \jak\fetch_result($stmt,'id');
        $stmt->close();
    }
    return $r;
}

function prop_getPropTemplatePart($criteria) {
    global $mysqli;
    $r = new \stdClass;
    $r->criteria = $criteria;
    $cnd   = '';
    $limit = '';

    if (isset($criteria->propTemplatePartIds) && is_array($criteria->propTemplatePartIds) && count($criteria->propTemplatePartIds) > 0) {
        $propIds = implode(',', $criteria->propTemplatePartIds);
        $cnd = "where id in ($propTemplatePartIds)";
    } else

    if (isset($criteria->propTemplateIds) && is_array($criteria->propTemplateIds) && count($criteria->propTemplateIds) > 0) {
        $propIds = implode(',', $criteria->propTemplateIds);
        $cnd = "where propTemplate in ($propTemplateIds)";
    } else

    if (isset($criteria->propPartTypeIds) && is_array($criteria->propPartTypeIds) && count($criteria->propPartTypeIds) > 0) {
        $propIds = implode(',', $criteria->propPartTypeIds);
        $cnd = "where propPartType in ($propPartTypeIds)";
    }

    if (isset($criteria->rowLimit)) {
        $limit = ' limit ' . $criteria->rowLimit;
    }

    if ($stmt = $mysqli->prepare(
        "select *
           from `propTemplatePart` $cnd $limit"
    )) {
        $r->success = $stmt->execute();
        $r->rows = $mysqli->affected_rows;
        $r->data = \jak\fetch_result($stmt,'id');
        $stmt->close();
    }
    return $r;
}

