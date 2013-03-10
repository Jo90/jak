<?php
/** /db/address/common.php
 *
 */
namespace jak;

function addr_getAddress($criteria) {
    global $mysqli;
    $r = new \stdClass;
    $r->criteria = $criteria;
    $cnd   = '';
    $limit = '';

    //criteria
    if (isset($criteria->addressIds) && is_array($criteria->addressIds) && count($criteria->addressIds) > 0) {
        $addressIds = implode(',', $criteria->addressIds);
        $cnd = "where id in ($addressIds)";
    } else
    if (isset($criteria->location, $criteria->streetName, $criteria->streetRef)) {
        $cnd = 'where location = ' . $criteria->location
             . ' and streetName like "' . $criteria->streetName . '%"'
             . ' and streetRef like "' . $criteria->streetRef . '%"';
    }

    if (isset($criteria->rowLimit)) {
        $limit = ' limit ' . $criteria->rowLimit;
    }

    if ($stmt = $mysqli->prepare(
        "select *
           from `address` $cnd $limit"
    )) {
        $r->success = $stmt->execute();
        $r->rows = $mysqli->affected_rows;
        $r->data = \jak\fetch_result($stmt);
        $stmt->close();
    }
    return $r;
}

