<?php
/** /db/prop/common.php
 *
 */
namespace jak;

function prop_getPropItemType($criteria) {
    global $mysqli;
    $r = new \stdClass;
    $r->criteria = $criteria;
    $cnd   = '';
    $limit = '';

    if (isset($criteria->propItemTypeIds) && is_array($criteria->propItemTypeIds) && count($criteria->propItemTypeIds) > 0) {
        $propIds = implode(',', $criteria->propItemTypeIds);
        $cnd = "where id in (propItemTypeIds)";
    }

    if (isset($criteria->rowLimit)) {
        $limit = ' limit ' . $criteria->rowLimit;
    }

    if ($stmt = $mysqli->prepare(
        "select *
           from `propItemType` $cnd $limit"
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
        $propIds = implode(',', $criteria->propTemplateIds);
        $cnd = "where id in (propTemplateIds)";
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

function prop_getPropTemplateItem($criteria) {
    global $mysqli;
    $r = new \stdClass;
    $r->criteria = $criteria;
    $cnd   = '';
    $limit = '';

    if (isset($criteria->propTemplateItemIds) && is_array($criteria->propTemplateItemIds) && count($criteria->propTemplateItemIds) > 0) {
        $propIds = implode(',', $criteria->propTemplateItemIds);
        $cnd = "where id in (propTemplateItemIds)";
    } else

    if (isset($criteria->propTemplateIds) && is_array($criteria->propTemplateIds) && count($criteria->propTemplateIds) > 0) {
        $propIds = implode(',', $criteria->propTemplateIds);
        $cnd = "where propTemplate in (propTemplateIds)";
    } else

    if (isset($criteria->propItemTypeIds) && is_array($criteria->propItemTypeIds) && count($criteria->propItemTypeIds) > 0) {
        $propIds = implode(',', $criteria->propItemTypeIds);
        $cnd = "where propItemType in (propItemTypeIds)";
    }

    if (isset($criteria->rowLimit)) {
        $limit = ' limit ' . $criteria->rowLimit;
    }

    if ($stmt = $mysqli->prepare(
        "select *
           from `propTemplateItem` $cnd $limit"
    )) {
        $r->success = $stmt->execute();
        $r->rows = $mysqli->affected_rows;
        $r->data = \jak\fetch_result($stmt,'id');
        $stmt->close();
    }
    return $r;
}

