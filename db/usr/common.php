<?php
/** /db/usr/common.php
 *
 */
namespace ja;

require_once ROOT . '/db/common.php';

function usr_getUsr($i, $extend = false) {
    global $mysqli;

    $r = $extend ? initResult($i) : new \stdClass;
    $c = $i->criteria;


    if (!isset($c)) {return null;}

    $cnd  = '';
    $cols = '`id`,`created`,`logon`,`firstName`,`lastName`,`title`';
    $limit = '';

    if (isset($c->usrIds)) {
        $cnd  = 'id in (' . implode(',', $c->usrIds) . ')';
    } else
    if (isset($c->logon)) {
        $cols = '*';
        $cnd  = 'logon = "' . $mysqli->real_escape_string($c->logon) . '"';
    } else
    if (isset($c->firstName, $c->lastName)) {
        $cnd  = 'firstName like "' . $mysqli->real_escape_string($c->firstName) . '%" and '
              . 'lastName like "'  . $mysqli->real_escape_string($c->lastName) . '%"';
    }

    if (isset($c->rowLimit)) {
        $limit = ' limit ' . $c->rowLimit;
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

function usr_getUsrAddress($i, $extend = false) {
    global $mysqli;

    $r = $extend ? initResult($i) : new \stdClass;
    $c = $i->criteria;

    if (!isset($c)) {return null;}

    $cnd  = '';
    $limit = '';

    if (isset($c->usrAddressIds)) {
        $cnd  = 'id in (' . implode(',', $c->usrAddressIds) . ')';
    } else
    if (isset($c->usrIds)) {
        $cnd  = 'usr in (' . implode(',', $c->usrIds) . ')';
    } else
    if (isset($c->addressIds)) {
        $cnd  = 'address in (' . implode(',', $c->addressIds) . ')';
    }

    if (isset($c->rowLimit)) {
        $limit = ' limit ' . $c->rowLimit;
    }

    if ($stmt = $mysqli->prepare(
        "select *
           from `usrAddress`
          where $cnd $limit"
    )) {
        $r->success = $stmt->execute();
        $r->rows = $mysqli->affected_rows;
        $r->data = \ja\fetch_result($stmt,'id');
        $stmt->close();
    }
    return $r;
}

function usr_getUsrInfo($i, $extend = false) {
    global $mysqli;

    $r = $extend ? initResult($i) : new \stdClass;
    $c = $i->criteria;

    if (!isset($c)) {return null;}

    $cnd  = '';
    $limit = '';

    if (isset($c->usrInfoIds)) {
        $cnd  = 'id in (' . implode(',', $c->usrInfoIds) . ')';
    } else
    if (isset($c->usrIds)) {
        $cnd  = 'usr in (' . implode(',', $c->usrIds) . ')';
    }

    if (isset($c->rowLimit)) {
        $limit = ' limit ' . $c->rowLimit;
    }

    if ($stmt = $mysqli->prepare(
        "select *
           from `usrInfo`
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
    $tab = 'usr';
    db::remove($tab, $i);
    if (isset($i->record)) {
        foreach ($i->record as $rec) {
            db::update($tab,$rec) or db::insert($tab,$rec);
        }
    }
}

function usr_setUsrAddress(&$i) {
    global $mysqli;
    $tab = 'usrAddress';
    db::remove($tab, $i);
    if (isset($i->record)) {
        foreach ($i->record as $rec) {
            db::update($tab,$rec) or db::insert($tab,$rec);
        }
    }
}

function usr_setUsrInfo(&$i) {
    global $mysqli;
    $tab = 'usrInfo';
    db::remove($tab, $i);
    if (isset($i->record)) {
        foreach ($i->record as $rec) {
            db::update($tab,$rec) or db::insert($tab,$rec);
        }
    }
}

