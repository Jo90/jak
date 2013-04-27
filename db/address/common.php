<?php
/** /db/address/common.php
 *
 */
namespace jak;

require_once '../shared/common.php';

function addr_getAddress($criteria) {
    global $mysqli;

    $r = initResult($criteria);

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
        $r->data = \jak\fetch_result($stmt,'id');
        $stmt->close();
    }
    return $r;
}

function addr_getLocation($criteria) {
    global $mysqli;

    $r = initResult($criteria);

    $cnd   = '';
    $limit = '';

    //criteria
    if (isset($criteria->locationIds) && is_array($criteria->locationIds) && count($criteria->locationIds) > 0) {
        $locationIds = implode(',', $criteria->locationIds);
        $cnd = "where id in ($locationIds)";
    }

    if (isset($criteria->rowLimit)) {
        $limit = ' limit ' . $criteria->rowLimit;
    }

    if ($stmt = $mysqli->prepare(
        "select *
           from `location` $cnd $limit"
    )) {
        $r->success = $stmt->execute();
        $r->rows = $mysqli->affected_rows;
        $r->data = \jak\fetch_result($stmt,'id');
        $stmt->close();
    }
    return $r;
}

function addr_setAddress(&$i) {
    global $mysqli;

    $r = initResult($i);

    $cnd   = '';
    $limit = '';

    remove('address', $i);

    if (isset($criteria->data->id)) {
        if ($stmt = $mysqli->prepare(
            "update `address`
                set location = ?,
                    streetName = ?,
                    streetRef = ?,
                    postcode = ?
            where id = ?"
        )) {
            $stmt->bind_param('ssssi'
                ,$criteria->data->location
                ,$criteria->data->streetName
                ,$criteria->data->streetRef
                ,$criteria->data->postcode
                ,$criteria->data->id
            );
            $r->successUpdate = $stmt->execute();
            $r->rows = $mysqli->affected_rows;
            $r->successUpdate OR $r->errorUpdate = $mysqli->error;
            $stmt->close();
        }
        return $r;
    }
    if ($stmt = $mysqli->prepare(
        "insert into `address`
                (location,streetName,streetRef,postcode)
        values (?,?,?,?)"
    )) {
        $stmt->bind_param('ssss'
            ,$criteria->data->location
            ,$criteria->data->streetName
            ,$criteria->data->streetRef
            ,$criteria->data->postcode
        );
        $r->successInsert = $stmt->execute();
        $r->rows = $mysqli->affected_rows;
        $r->successInsert
            ?$criteria->data->id = $stmt->insert_id
            :$r->errorInsert = $mysqli->error;
        $stmt->close();
    }
    return $r;
}
