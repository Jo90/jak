<?php
/** /db/usr/common.php
 *
 */
namespace ja;

require_once ROOT . '/db/common.php';

function usr_getUsr($criteria) {
    global $mysqli;

    $r = initResult($criteria);

    if (!isset($criteria)) {return null;}

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
    if (isset($criteria->firstName, $criteria->lastName)) {
        $cnd  = 'firstName like "' . $mysqli->real_escape_string($criteria->firstName) . '%" and '
              . 'lastName like "'  . $mysqli->real_escape_string($criteria->lastName) . '%"';
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
        $r->data = \ja\fetch_result($stmt,'id');
        $stmt->close();
    }
    return $r;
}

function usr_setUsr(&$i) {
    global $mysqli;

    db::remove('usr', $i);
    if (isset($i->record)) {
        foreach ($i->record as $rec) {
            db::update('usr',$rec) or db::insert('usr',$rec);
        }
    }
}

