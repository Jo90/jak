<?php
/** //db/address/common.php
 */
namespace ja;

require_once ROOT . '/db/common.php';

function addr_getAddress($i, $extend = false) {
    global $mysqli;

    $r = $extend ? initResult($i) : new \stdClass;
    $c = $i->criteria;

    $cnd   = '';
    $limit = '';

    //criteria
    if (isset($c->addressIds) && is_array($c->addressIds) && count($c->addressIds) > 0) {
        $addressIds = implode(',', $c->addressIds);
        $cnd = "where id in ($addressIds)";
    } else
    if (isset($c->location, $c->streetName, $c->streetRef)) {
        $cnd = 'where location = ' . $c->location
             . ' and streetName like "' . $c->streetName . '%"'
             . ' and streetRef like "' . $c->streetRef . '%"';
    }

    if (isset($c->rowLimit)) {
        $limit = ' limit ' . $c->rowLimit;
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

function addr_getLocation($i, $extend = false) {
    global $mysqli;

    $r = $extend ? initResult($i) : new \stdClass;
    $c = $i->criteria;

    $cnd   = '';
    $limit = '';

    //criteria
    if (isset($c->locationIds) && is_array($c->locationIds) && count($c->locationIds) > 0) {
        $locationIds = implode(',', $c->locationIds);
        $cnd = "where id in ($locationIds)";
    }

    if (isset($c->rowLimit)) {
        $limit = ' limit ' . $c->rowLimit;
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

function addr_getProperty($i, $extend = false) {
    global $mysqli;

    $r = $extend ? initResult($i) : new \stdClass;
    $c = $i->criteria;

    $cnd   = '';
    $limit = '';

    if (isset($c->propertyIds) && is_array($c->propertyIds) && count($c->propertyIds) > 0) {
        $propertyIds = implode(',', $c->propertyIds);
        $cnd = "where id in ($propertyIds)";
    }
    if (isset($c->addressIds) && is_array($c->addressIds) && count($c->addressIds) > 0) {
        $addressIds = implode(',', $c->addressIds);
        $cnd = "where address in ($addressIds)";
    }

    if (isset($c->rowLimit)) {
        $limit = ' limit ' . $c->rowLimit;
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
                //>>>>>FINISH should not hard code site, et al Ids
                $siteId     = 21;
                $buildingId = 22;
                $landId     = 23;
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
                $recPtr = $rec->property->record;
                db::insert('property', $recPtr[0]);

                //building, land, with site parent
                $recPtr[] = (object) array (
                    'data' => (object) array (
                        'address' => $addressId,
                        'parent'  => $recPtr[0]->data->id,
                        'prop'    => $buildingId
                    )
                );
                db::insert('property', $recPtr[1]);
                $recPtr[] = (object) array (
                    'data' => (object) array (
                        'address' => $addressId,
                        'parent'  => $recPtr[0]->data->id,
                        'prop'    => $landId
                    )
                );
                db::insert('property', $recPtr[2]);

                //building rooms
                $propBuildingId = $recPtr[1]->data->id;
                //>>>>>FINISH should not hard code room Ids, use room type instead
                if ($stmt = $mysqli->prepare(
                    "insert into `property`
                            (address, parent, prop)
                     select $addressId, $propBuildingId, id
                       from `prop`
                      where id between 34 and 39"
                )) {
                    $rec->roomsInsertSuccess = $stmt->execute();
                    $rec->roomsRows          = $mysqli->affected_rows;
                    $stmt->close();
                }
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