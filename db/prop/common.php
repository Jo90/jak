<?php
/** /db/prop/common.php
 *
 */
namespace ja;

function prop_getProp($criteria) {
    global $mysqli;

    $r = initResult($i);

    $cnd   = '';
    $limit = '';

    if (isset($criteria->propIds) && is_array($criteria->propIds) && count($criteria->propIds) > 0) {
        $propIds = implode(',', $criteria->propIds);
        $cnd = "where id in ($propIds)";
    }

    if (isset($criteria->rowLimit)) {
        $limit = ' limit ' . $criteria->rowLimit;
    }

    if ($stmt = $mysqli->prepare(
        "select *
           from `prop` $cnd $limit"
    )) {
        $r->success = $stmt->execute();
        $r->rows = $mysqli->affected_rows;
        $r->data = \ja\fetch_result($stmt,'id');
        $stmt->close();
    }
    return $r;
}
