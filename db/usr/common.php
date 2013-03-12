<?php
/** /db/usr/common.php
 *
 */
namespace jak;

function usr_getUsr($criteria) {
    global $mysqli;
    if (!isset($criteria)) {return null;}
    $r = new \stdClass;
    $r->criteria = $criteria;
    $cnd  = '';
    $cols = '`id`,`created`,`logon`,`firstName`,`lastName`,`title`';
    $limit = '';

    if (isset($criteria->usrIds)) {
        $cnd  = 'id in (' . implode(',', $criteria->usrIds) . ')';
    } else
    if (isset($criteria->logon)) {
        $cols = '*';
        $cnd  = 'logon = "' . $mysqli->real_escape_string($criteria->logon) . '"';
    } else
    if (isset($criteria->firstName, $criteria->firstName)) {
        $cnd  = 'firstName like "' . $mysqli->real_escape_string($criteria->firstName) . '%" and '
              . 'lastName like "' . $mysqli->real_escape_string($criteria->lastName) . '%"';
    }

    if (isset($criteria->rowLimit)) {
        $limit = ' limit ' . $criteria->rowLimit;
    }

    if ($stmt = $mysqli->prepare(
        "select $cols
           from `usr`
          where $cnd $limit"
    )) {
        $r->success = $stmt->execute();
        $r->rows = $mysqli->affected_rows;
        $r->data = \jak\fetch_result($stmt,'id');
        $stmt->close();
    }
    return $r;
}

function usr_getUsrInfo($criteria) {
    global $mysqli;
    if (!isset($criteria, $criteria->usrIds)) {return null;}
    $r           = new \stdClass;
    $r->criteria = $criteria;
    $usrIds      = implode(',', $criteria->usrIds);
    if ($stmt = $mysqli->prepare(
        "select *
           from `usrInfo`
          where usr in ($usrIds)"
    )) {
        $r->success = $stmt->execute();
        $r->rows = $mysqli->affected_rows;
        $r->data = \jak\fetch_result($stmt,'id');
        $stmt->close();
    }
    return $r;
}

function usr_getUsrJob($criteria) {
    global $mysqli;
    $r = new \stdClass;
    $r->criteria = $criteria;
    $cnd   = '';
    $limit = '';

    //conditions
    if (isset($criteria->usrJobIds) && is_array($criteria->usrJobIds) && count($criteria->usrJobIds) > 0) {
        $usrJobIds = implode(',', $criteria->usrJobIds);
        $cnd = "where id in ($usrJobIds)";
    } else
    if (isset($criteria->jobIds) && is_array($criteria->jobIds) && count($criteria->jobIds) > 0) {
        $jobIds = implode(',', $criteria->jobIds);
        $cnd = "where job in ($jobIds)";
    } else
    //usrs
    if (isset($criteria->usrIds) && is_array($criteria->usrIds) && count($criteria->usrIds) > 0) {
        $usrIds = implode(',', $criteria->usrIds);
        $cnd = "where usr in ($usrIds)";
    }

    if (isset($criteria->rowLimit)) {
        $limit = ' limit ' . $criteria->rowLimit;
    }

    if ($stmt = $mysqli->prepare(
        "select *
           from `usrJob` $cnd $limit"
    )) {
        $r->success = $stmt->execute();
        $r->rows = $mysqli->affected_rows;
        $r->data = \jak\fetch_result($stmt,'id');
        $stmt->close();
    }
    return $r;
}

function usr_setUsr(&$criteria) {
    global $mysqli;
    $criteria->result = new \stdClass;
    $r = $criteria->result;
    if (isset($criteria->remove) && $criteria->remove) {
        if ($stmt = $mysqli->prepare(
            "delete from `usr`
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
            "update `usr`
                set firstName = ?,
                    lastName = ?,
                    spouse = ?,
                    title = ?
            where id = ?"
        )) {
            $stmt->bind_param('ssssi'
                ,$criteria->data->firstName
                ,$criteria->data->lastName
                ,$criteria->data->spouse
                ,$criteria->data->title
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
        "insert into `usr`
                (firstName,lastName,spouse,title)
        values (?,?,?,?)"
    )) {
        $stmt->bind_param('ss'
            ,$criteria->data->firstName
            ,$criteria->data->lastName
            ,$criteria->data->spouse
            ,$criteria->data->title
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


function usr_setUsrInfo(&$criteria) {
    global $mysqli;
    $criteria->result = new \stdClass;
    $r = $criteria->result;
    if (isset($criteria->remove) && $criteria->remove) {
        if ($stmt = $mysqli->prepare(
            "delete from `usrInfo`
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
            "update `usrInfo`
                set usr = ?,
                    info = ?,
                    description = ?
              where id = ?"
        )) {
            $stmt->bind_param('issi'
                ,$criteria->data->usr
                ,$criteria->data->info
                ,$criteria->data->description
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
        "insert into `usrInfo`
                (usr,info,description)
        values (?,?,?)"
    )) {
        $stmt->bind_param('iss'
                ,$criteria->data->usr
                ,$criteria->data->info
                ,$criteria->data->description
        );
        $r->successInsert = $stmt->execute();
        $r->successInsert
            ?$criteria->data->id = $stmt->insert_id
            :$r->errorInsert = $mysqli->error;
        $stmt->close();
    }
    return $r;
}
