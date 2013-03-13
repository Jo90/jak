<?php
/** /db/job/common.php
 *
 */
namespace jak;

function job_getJob($criteria) {
    global $mysqli;
    $r = new \stdClass;
    $r->criteria = $criteria;
    $cnd   = '';
    $limit = '';

    //jobs
    if (isset($criteria->jobIds) && is_array($criteria->jobIds) && count($criteria->jobIds) > 0) {
        $jobIds = implode(',', $criteria->jobIds);
        $cnd = "where id in ($jobIds)";
    } else
    if (isset($criteria->addressIds) && is_array($criteria->addressIds) && count($criteria->addressIds) > 0) {
        $addressIds = implode(',', $criteria->addressIds);
        $cnd = "where address in ($addressIds)";
    } else
    //last jobs
    if (isset($criteria->lastJob) && $criteria->lastJob) {
        $cnd = 'order by id desc';
    }

    if (isset($criteria->rowLimit)) {
        $limit = ' limit ' . $criteria->rowLimit;
    }

    if ($stmt = $mysqli->prepare(
        "select *
           from `job` $cnd $limit"
    )) {
        $r->success = $stmt->execute();
        $r->rows = $mysqli->affected_rows;
        $r->data = \jak\fetch_result($stmt,'id');
        $stmt->close();
    }
    return $r;
}

function job_setJob(&$criteria) {
    global $mysqli;
    $criteria->result = new \stdClass;
    $r = $criteria->result;
    if (!isset($criteria, $criteria->data, $criteria->data->dbTable, $criteria->data->pk)) {return null;}

    if (isset($criteria->remove) && $criteria->remove) {
        if ($stmt = $mysqli->prepare(
            "delete from `job`
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
    }
    if (isset($criteria->data->id)) {
        if ($stmt = $mysqli->prepare(
            "update `job`
                set ref      = ?,
                    property = ?,
                    reminder = ?,
                    status   = ?,
                    weather  = ?
              where id = ?"
        )) {
            $stmt->bind_param('iiiss'
                ,$criteria->data->ref
                ,$criteria->data->property
                ,$criteria->data->reminder
                ,$criteria->data->status
                ,$criteria->data->id
            );
            $r->successUpdate = $stmt->execute();
            $r->rows = $mysqli->affected_rows;
            $r->successUpdate OR $r->errorUpdate = $mysqli->error;
            $stmt->close();
        }
        return $r;
    }
    //insert
    if ($stmt = $mysqli->prepare(
            "insert into `job`
                    (ref,created,property,reminder,status,weather)
             values (?,?,?,?,?,?)"
    )) {
        $stmt->bind_param('iiiiss'
           ,$criteria->data->ref
           ,$criteria->data->created
           ,$criteria->data->property
           ,$criteria->data->reminder
           ,$criteria->data->status
           ,$criteria->data->weather
        );
        $r->successInsert = $stmt->execute();
        $r->rows = $mysqli->affected_rows;
        $r->successInsert
            ?$criteria->data->id = $stmt->insert_id
            :$r->errorInsert = $mysqli->error;
        $stmt->close();
    }
}
