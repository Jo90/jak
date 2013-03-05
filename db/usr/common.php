<?php
/** /db/usr/common.php
 *
 *  JAK
 *
 *  usr functions
 */
namespace jak;

function usr_getUsr($criteria) {
    global $mysqli;
    if (!isset($criteria)) {return null;}
    $r = new \stdClass;
    $r->criteria = $criteria;
    $cnd  = '';
    $cols = '';
    if (isset($criteria->usrIds)) {
        $cols = '`id`,`created`,`logon`,`firstName`,`lastName`,`title`';
        $cnd  = 'id in (' . implode(',', $criteria->usrIds) . ')';
    }
    if (isset($criteria->logon)) {
        $cols = '*';
        $cnd  = 'logon = "' . $mysqli->real_escape_string($criteria->logon) . '"';
    }
    if ($stmt = $mysqli->prepare(
        "select $cols
           from `usr`
          where $cnd"
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
