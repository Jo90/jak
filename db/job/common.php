<?php
/** /db/job/common.php
 *
 */
namespace ja;

require_once ROOT . '/db/common.php';
require_once ROOT . '/db/prop/common.php';

function job_getJob($criteria) {
    global $mysqli;

    $r = initResult($criteria);

    $cnd     = '';
    $orderBy = '';
    $limit   = '';

    //criteria
    if (isset($criteria->jobIds) && is_array($criteria->jobIds) && count($criteria->jobIds) > 0) {
        $jobIds = implode(',', $criteria->jobIds);
        $cnd = "where id in ($jobIds)";
    } else
    if (isset($criteria->addressIds) && is_array($criteria->addressIds) && count($criteria->addressIds) > 0) {
        $addressIds = implode(',', $criteria->addressIds);
        $cnd = "where address in ($addressIds)";
    } else
    if (isset($criteria->appointmentStart,$criteria->appointmentEnd)) {
        $cnd = "where appointment between $criteria->appointmentStart and $criteria->appointmentEnd";
    } else
    //last jobs
    if (isset($criteria->lastJob) && $criteria->lastJob) {
        $orderBy = 'order by id desc';
    }

    if (isset($criteria->orderBy)) {
        $orderBy = ' order by ' . $criteria->orderBy;
    }
    if (isset($criteria->rowLimit)) {
        $limit = ' limit ' . $criteria->rowLimit;
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

function job_getJobUsr($criteria) {
    global $mysqli;

    $r = initResult($criteria);

    $cnd   = '';
    $limit = '';

    //conditions
    if (isset($criteria->usrJobIds) && is_array($criteria->usrJobIds) && count($criteria->usrJobIds) > 0) {
        $jobUsrIds = implode(',', $criteria->jobUsrIds);
        $cnd = "where id in ($jobUsrIds)";
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
           from `jobUsr` $cnd $limit"
    )) {
        $r->success = $stmt->execute();
        $r->rows = $mysqli->affected_rows;
        $r->data = \ja\fetch_result($stmt,'id');
        $stmt->close();
    }
    return $r;
}

function job_getJobProperty($criteria) {
    global $mysqli;

    $r = initResult($criteria);

    $cnd   = '';
    $limit = '';

    if (isset($criteria->jobPropertyIds) && is_array($criteria->jobPropertyIds) && count($criteria->jobPropertyIds) > 0) {
        $jobPropertyIds = implode(',', $criteria->jobPropertyIds);
        $cnd = "where id in ($jobPropertyIds)";
    } else
    if (isset($criteria->jobIds) && is_array($criteria->jobIds) && count($criteria->jobIds) > 0){
        $jobIds = implode(',', $criteria->jobIds);
        $cnd = "where job in ($jobIds)";
    } else
    if (isset($criteria->propertyIds) && is_array($criteria->propertyIds) && count($criteria->propertyIds) > 0){
        $propertyIds = implode(',', $criteria->propertyIds);
        $cnd = "where property in ($propertyIds)";
    }

    if (isset($criteria->rowLimit)) {
        $limit = ' limit ' . $criteria->rowLimit;
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
