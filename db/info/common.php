<?php
/** /db/info/common.php
 *
 *  Kauri Coast Promotion Society
 *
 */
namespace kc;

function info_getInfo($criteria) {
    global $mysqli;
    $r = new \stdClass;
    $r->criteria = $criteria;
    $cnd = '';
    if (isset($criteria->infoIds) && is_array($criteria->infoIds) && count($criteria->infoIds) > 0) {
        $infoIds = implode(',', $criteria->infoIds);
        $cnd = "where id in ($infoIds)";
    }
    if (isset($criteria->dbTable, $criteria->pks) && is_array($criteria->pks) && count($criteria->pks) > 0) {
        $pks   = implode(',', $criteria->pks);
        $dbTab = $criteria->dbTable;
        $cnd = "where dbTable = $dbTab and pk in ($pks)";
    }
    if ($stmt = $mysqli->prepare(
        "select *
           from `info` $cnd"
    )) {
        $r->success = $stmt->execute();
        $r->rows = $mysqli->affected_rows;
        $r->data = \kc\fetch_result($stmt);
        $stmt->close();
    }
    return $r;
}

function info_setInfo(&$criteria) {
    global $mysqli;
    $criteria->result = new \stdClass;
    $r = $criteria->result;
    if (!isset($criteria, $criteria->data, $criteria->data->dbTable, $criteria->data->pk)) {return null;}

    if (isset($criteria->remove) && $criteria->remove) {
        if ($stmt = $mysqli->prepare(
            "delete from `info`
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
            "update `info`
                set displayOrder = ?,
                    viewable     = ?,
                    category     = ?,
                    detail       = ?
              where id = ?"
        )) {
            $stmt->bind_param('iissi'
                ,$criteria->data->displayOrder
                ,$criteria->data->viewable
                ,$criteria->data->category
                ,$criteria->data->detail
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
            "insert into `info`
                    (dbTable,pk,displayOrder,viewable,category,detail)
             values (?,?,?,?,?,?)"
    )) {
        $stmt->bind_param('iiiiss'
           ,$criteria->data->dbTable
           ,$criteria->data->pk
           ,$criteria->data->displayOrder
           ,$criteria->data->viewable
           ,$criteria->data->category
           ,$criteria->data->detail
        );
        $r->successInsert = $stmt->execute();
        $r->rows = $mysqli->affected_rows;
        $r->successInsert
            ?$criteria->data->id = $stmt->insert_id
            :$r->errorInsert = $mysqli->error;
        $stmt->close();
    }
}
