<?php
/** /db/prop/common.php
 *
 */
namespace jak;

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

