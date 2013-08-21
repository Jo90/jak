<?php
/** /db/job/common.php
 *
 */
namespace ja;

require_once ROOT . '/db/common.php';
require_once ROOT . '/db/prop/common.php';

function job_getJob($i, $extend = false) {
    global $mysqli;

    $r = $extend ? initResult($i) : new \stdClass;
    $c = $i->criteria;

    $cnd     = '';
    $orderBy = '';
    $limit   = '';

    //criteria
    if (isset($c->jobIds) && is_array($c->jobIds) && count($c->jobIds) > 0) {
        $jobIds = implode(',', $c->jobIds);
        $cnd = "where id in ($jobIds)";
    } else
    if (isset($c->addressIds) && is_array($c->addressIds) && count($c->addressIds) > 0) {
        $addressIds = implode(',', $c->addressIds);
        $cnd = "where address in ($addressIds)";
    } else
    if (isset($c->appointmentStart,$c->appointmentEnd)) {
        $cnd = "where appointment between $c->appointmentStart and $c->appointmentEnd";
    } else
    //last jobs
    if (isset($c->lastJob) && $c->lastJob == 1) {
        $orderBy = 'order by id desc';
    }

    if (isset($c->orderBy)) {
        $orderBy = ' order by ' . $c->orderBy;
    }
    if (isset($c->rowLimit)) {
        $limit = ' limit ' . $c->rowLimit;
    }

    if ($stmt = $mysqli->prepare(
        "select *
           from `job` $cnd $orderBy $limit"
    )) {
        $r->success = $stmt->execute();
        $r->rows = $mysqli->affected_rows;
        $r->data = \ja\fetch_result($stmt,'id');
        $stmt->close();
    }
    return $r;
}

function job_getJobUsr($i, $extend = false) {
    global $mysqli;

    $r = $extend ? initResult($i) : new \stdClass;
    $c = $i->criteria;

    $cnd   = '';
    $limit = '';

    //conditions
    if (isset($c->jobUsrIds) && is_array($c->jobUsrIds) && count($c->jobUsrIds) > 0) {
        $jobUsrIds = implode(',', $c->jobUsrIds);
        $cnd = "where id in ($jobUsrIds)";
    } else
    if (isset($c->jobIds) && is_array($c->jobIds) && count($c->jobIds) > 0) {
        $jobIds = implode(',', $c->jobIds);
        $cnd = "where job in ($jobIds)";
    } else
    //usrs
    if (isset($c->usrIds) && is_array($c->usrIds) && count($c->usrIds) > 0) {
        $usrIds = implode(',', $c->usrIds);
        $cnd = "where usr in ($usrIds)";
    }

    if (isset($c->rowLimit)) {
        $limit = ' limit ' . $c->rowLimit;
    }

    if ($stmt = $mysqli->prepare(
        "select *
           from `jobUsr` $cnd $limit"
    )) {
        $r->success = $stmt->execute();
        $r->rows = $mysqli->affected_rows;
        $r->data = \ja\fetch_result($stmt,'id');
        $stmt->close();
    }
    return $r;
}

function job_getJobProperty($i, $extend = false) {
    global $mysqli;

    $r = $extend ? initResult($i) : new \stdClass;
    $c = $i->criteria;

    $cnd   = '';
    $limit = '';

    if (isset($c->jobPropertyIds) && is_array($c->jobPropertyIds) && count($c->jobPropertyIds) > 0) {
        $jobPropertyIds = implode(',', $c->jobPropertyIds);
        $cnd = "where id in ($jobPropertyIds)";
    } else
    if (isset($c->jobIds) && is_array($c->jobIds) && count($c->jobIds) > 0){
        $jobIds = implode(',', $c->jobIds);
        $cnd = "where job in ($jobIds)";
    } else
    if (isset($c->propertyIds) && is_array($c->propertyIds) && count($c->propertyIds) > 0){
        $propertyIds = implode(',', $c->propertyIds);
        $cnd = "where property in ($propertyIds)";
    }

    if (isset($c->rowLimit)) {
        $limit = ' limit ' . $c->rowLimit;
    }

    if ($stmt = $mysqli->prepare(
        "select *
           from `jobProperty` $cnd order by seq $limit"
    )) {
        $r->success = $stmt->execute();
        $r->rows = $mysqli->affected_rows;
        $r->data = \ja\fetch_result($stmt,'id');
        $stmt->close();
    }
    return $r;
}

function job_setJob(&$i) {
    global $mysqli;
    $tab = 'job';
    db::remove($tab,$i);
    if (isset($i->record)) {
        foreach ($i->record as $rec) {
            db::update($tab,$rec) or db::insert($tab,$rec);
        }
    }
}

function job_setJobUsr(&$i) {
    global $mysqli;
    $tab = 'jobUsr';
    db::remove($tab,$i);
    if (isset($i->record)) {
        foreach ($i->record as $rec) {
            db::update($tab,$rec) or db::insert($tab,$rec);
        }
    }
}

function job_setJobProperty(&$i) {
    global $mysqli;
    $tab = 'jobProperty';
    db::remove($tab,$i);
    if (isset($i->record)) {
        foreach ($i->record as $rec) {
            db::update($tab,$rec) or db::insert($tab,$rec);
        }
    }
}
