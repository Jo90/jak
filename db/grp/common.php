<?php
/** /db/grp/common.php
 *
 *  Kauri Coast Promotion Society
 *
 */
namespace kc;

function grp_getGrp($criteria) {
    global $mysqli;
    if (!isset($criteria->grpIds)) {return null;}
    $r = new \stdClass;
    $r->criteria = $criteria;
    $cnd = '';
    if (isset($criteria->grpIds) && count($criteria->grpIds) != 0) { //empty array return all
        $cnd = "where id in (" . implode(',', $criteria->grpIds) . ")";
    }
    if ($stmt = $mysqli->prepare(
        "select *
           from `grp` $cnd"
    )) {
        $r->success = $stmt->execute();
        $r->rows = $mysqli->affected_rows;
        $r->data = \kc\fetch_result($stmt,'id');
        $stmt->close();
    }
    return $r;
}

function grp_getGrpInfo($criteria) {
    global $mysqli;
    if (!isset($criteria->grpIds)) {return null;}
    $r = new \stdClass;
    $r->criteria = $criteria;
    $grpIds = implode(',', $criteria->grpIds);
    if ($stmt = $mysqli->prepare(
        "select *
           from `grpInfo`
          where grp in ($grpIds)
            order by displayOrder, category"
    )) {
        $r->success = $stmt->execute();
        $r->rows = $mysqli->affected_rows;
        $r->data = \kc\fetch_result($stmt,'id');
        $stmt->close();
    }
    return $r;
}

function grp_getGrpUsr($criteria) {
    global $mysqli;
    if (!isset($criteria->grpIds) && !isset($criteria->usrIds)) {return null;}
    $r = new \stdClass;
    $r->criteria = $criteria;
    $cnd = '';
    if (isset($criteria->grpIds)) {
        $cnd = "where grp in (" . implode(',', $criteria->grpIds) . ")";
    }
    if (isset($criteria->usrIds)) {
        $cnd = "where usr in (" . implode(',', $criteria->usrIds) . ")";
    }
    if ($stmt = $mysqli->prepare(
        "select *
           from `grpUsr` $cnd"
    )) {
        $r->success = $stmt->execute();
        $r->rows = $mysqli->affected_rows;
        $r->data = \kc\fetch_result($stmt,'id');
        $stmt->close();
    }
    return $r;
}

function grp_setGrp(&$criteria) {
    global $mysqli;
    $criteria->result = new \stdClass;
    $r = $criteria->result;
    if (isset($criteria->remove) && $criteria->remove) {
        if ($stmt = $mysqli->prepare(
            "delete from `grp`
              where id = ?"
        )) {
            $stmt->bind_param('i'
                ,$criteria->data->id
            );
            $r->successDelete = $stmt->execute();
            $r->rows = $mysqli->affected_rows;
            $r->successDelete OR $r->errorDelete = $mysqli->error;
            $stmt->close();
        }
        return $r;
    }
    if (isset($criteria->data->id)) {
        if ($stmt = $mysqli->prepare(
            "update `grp`
                set name = ?,
                    contactDetail = ?
            where id = ?"
        )) {
            $stmt->bind_param('ssi'
                ,$criteria->data->name
                ,$criteria->data->contactDetail
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
        "insert into `grp`
                (name,contactDetail)
        values (?,?)"
    )) {
        $stmt->bind_param('ss'
            ,$criteria->data->name
            ,$criteria->data->contactDetail
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

function grp_setGrpInfo(&$criteria) {
    global $mysqli;
    $criteria->result = new \stdClass;
    $r = $criteria->result;
    if (isset($criteria->remove) && $criteria->remove) {
        if ($stmt = $mysqli->prepare(
            "delete from `grpInfo`
              where `id` = ?"
        )) {
            $stmt->bind_param('i'
                ,$criteria->data->id
            );
            $r->successDelete = $stmt->execute();
            $r->rows = $mysqli->affected_rows;
            $r->successDelete OR $r->errorDelete = $mysqli->error;
            $stmt->close();
        }
        return $r;
    }
    if (isset($criteria->data->id)) {
        if ($stmt = $mysqli->prepare(
            "update `grpInfo`
                set `grp`          = ?,
                    `displayOrder` = ?,
                    `viewable`     = ?,
                    `category`     = ?,
                    `info`         = ?
              where `id`           = ?"
        )) {
            $stmt->bind_param('iiissi'
                ,$criteria->data->grp
                ,$criteria->data->displayOrder
                ,$criteria->data->viewable
                ,$criteria->data->category
                ,$criteria->data->info
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
        "insert into `grpInfo`
                (`grp`,`displayOrder`,viewable,`category`,`info`)
        values (?,?,?,?)"
    )) {
        $stmt->bind_param('iiiss'
                ,$criteria->data->grp
                ,$criteria->data->displayOrder
                ,$criteria->data->viewable
                ,$criteria->data->category
                ,$criteria->data->info
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

function grp_setGrpUsr(&$criteria) {
    global $mysqli;
    $criteria->result = new \stdClass;
    $r = $criteria->result;
    if (isset($criteria->remove) && $criteria->remove) {
        if ($stmt = $mysqli->prepare(
            "delete from `grpUsr`
              where `id` = ?"
        )) {
            $stmt->bind_param('i'
                ,$criteria->data->id
            );
            $r->successDelete = $stmt->execute();
            $r->rows = $mysqli->affected_rows;
            $r->successDelete OR $r->errorDelete = $mysqli->error;
            $stmt->close();
        }
        return $r;
    }
    if (isset($criteria->data->id)) {
        if ($stmt = $mysqli->prepare(
            "update `grpUsr`
                set `grp`         = ?,
                    `usr`         = ?,
                    `member`      = ?,
                    `admin`       = ?,
                    `joinRequest` = ?,
                    `joinReason`  = ?
              where `id`          = ?"
        )) {
            $stmt->bind_param('iiiiisi'
                ,$criteria->data->grp
                ,$criteria->data->usr
                ,$criteria->data->member
                ,$criteria->data->admin
                ,$criteria->data->joinRequest
                ,$criteria->data->joinReason
                ,$criteria->data->id
            );
            $r->successUpdate = $stmt->execute();
            $r->rows = $mysqli->affected_rows;
            $r->successUpdate OR $r->errorUpdate = $mysqli->error;
            $stmt->close();
        }
        return $r;
    }
    //join request
        if (isset($criteria->data->grp, $criteria->data->usr, $criteria->data->joinReason)
            && !isset($criteria->data->member, $criteria->data->admin, $criteria->data->joinRequest)) {
            if ($stmt = $mysqli->prepare(
                "insert into `grpUsr`
                        (grp,usr,joinReason)
                 values (?,?,?)"
            )) {
                $stmt->bind_param('iis'
                    ,$criteria->data->grp
                    ,$criteria->data->usr
                    ,$criteria->data->joinReason
                );
                $r->successInsertRequest = $stmt->execute();
                $r->rows = $mysqli->affected_rows;
                $r->successInsertRequest
                    ?$criteria->data->id = $stmt->insert_id
                    :$r->errorInsertRequest = $mysqli->error;
                $stmt->close();
            }

        }
    //administrator
        if (isset($criteria->data->grp, $criteria->data->usr, $criteria->data->member)) {
            //>>>>FINISH specific member and admin cases
            if ($stmt = $mysqli->prepare(
                "insert into `grpUsr`
                        (grp,usr,member,admin,joinRequest,joinReason,approved,approvedBy)
                 values (?,?,?,?,?,?,?,?)"
            )) {
                $stmt->bind_param('iiiiisis'
                    ,$criteria->data->grp
                    ,$criteria->data->usr
                    ,$criteria->data->member
                    ,$criteria->data->admin
                    ,$criteria->data->joinRequest
                    ,$criteria->data->joinReason
                    ,$criteria->data->approved
                    ,$criteria->data->approvedBy
                );
                $r->successInsert = $stmt->execute();
                $r->rows = $mysqli->affected_rows;
                $r->successInsert
                    ?$criteria->data->id = $stmt->insert_id
                    :$r->errorInsert = $mysqli->error;
                $stmt->close();
            }
        }
    return $r;
}
