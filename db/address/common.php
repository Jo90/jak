<?php
/** //db/address/common.php
 *
 */
namespace ja;

require_once ROOT . '/db/common.php';

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
        $r->data = \ja\fetch_result($stmt,'id');
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
        $r->data = \ja\fetch_result($stmt,'id');
        $stmt->close();
    }
    return $r;
}

function addr_getProperty($criteria) {
    global $mysqli;

    $r = initResult($criteria);

    $cnd   = '';
    $limit = '';

    if (isset($criteria->propertyIds) && is_array($criteria->propertyIds) && count($criteria->propertyIds) > 0) {
        $propertyIds = implode(',', $criteria->propertyIds);
        $cnd = "where id in ($propertyIds)";
    }
    if (isset($criteria->addressIds) && is_array($criteria->addressIds) && count($criteria->addressIds) > 0) {
        $addressIds = implode(',', $criteria->addressIds);
        $cnd = "where address in ($addressIds)";
    }

    if (isset($criteria->rowLimit)) {
        $limit = ' limit ' . $criteria->rowLimit;
    }

    if ($stmt = $mysqli->prepare(
        "select *
           from `property` $cnd $limit"
    )) {
        $r->success = $stmt->execute();
        $r->rows = $mysqli->affected_rows;
        $r->data = \ja\fetch_result($stmt,'id');
        $stmt->close();
    }
    return $r;
}

function addr_setAddress(&$i) {
    global $mysqli;
    db::remove('address', $i);
    if (isset($i->record)) {
        foreach ($i->record as $rec) {
            if (!db::update('address', $rec)) {
                db::insert('address', $rec);

                //site, null parent
                //>>>>>FINISH should not hard code
                $siteId     = 31;
                $buildingId = 32;
                $landId     = 33;
                $addressId = $rec->data->id;
                $rec->property = (object) array (
                    'record' => array (
                        (object) array (
                            'data' => (object) array (
                                'address' => $addressId,
                                'prop'    => $siteId
                            )
                        )
                    )
                );
                $recPtr = $rec->property->record[0];
                db::insert('property', $recPtr);

                //building, land, with site parent
                $rec->property->record[] = (object) array (
                    'data' => (object) array (
                        'address' => $addressId,
                        'parent'  => $recPtr->data->id,
                        'prop'    => $buildingId
                    ),
                    'data' => (object) array (
                        'address' => $addressId,
                        'parent'  => $recPtr->data->id,
                        'prop'    => $landId
                    )
                );

                //building rooms

                


                
            }
        }
    }
}

function addr_setProperty(&$i) {
    global $mysqli;
    db::remove('property', $i);
    if (isset($i->record)) {
        foreach ($i->record as $rec) {
            db::update('property',$rec) or db::insert('property',$rec);
        }
    }
}