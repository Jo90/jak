<?php
/** /db/shared/common.php
 *
 * tables with dbTable and pk
 */
namespace jak;

function initStep(&$i) {
    $i->log = array();
    $i->result = new \stdClass;
    return $i->result;
}

function selectIds($dataSet, $field) {
    $ids = array();
    foreach ($dataSet as $d) {
        $ids[] = $d->{$field};
    }
    return $ids;
}

function tg_getTag($criteria) {
    global $mysqli;
    $r = new \stdClass;
    $r->criteria = $criteria;
    $dbTable = $criteria->dbTable;
    $pks     = implode(',', $criteria->pks);
    if ($stmt = $mysqli->prepare(
        "select *
           from `tag`
           where dbTable = $dbTable
             and pk in ($pks)"
    )) {
        $r->success = $stmt->execute();
        $r->rows = $mysqli->affected_rows;
        $r->data = \jak\fetch_result($stmt,'id');
        $stmt->close();
    }
    return $r;
}

function info_setTag(&$criteria) {
    global $mysqli;
    $criteria->result = new \stdClass;
    $r = $criteria->result;
    if (!isset($criteria, $criteria->data, $criteria->data->dbTable, $criteria->data->pk)) {return null;}

    if (isset($criteria->remove) && $criteria->remove) {
        if ($stmt = $mysqli->prepare(
            "delete from `tag`
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
            "update `tag`
                set displayOrder = ?,
                    name         = ?
              where id = ?"
        )) {
            $stmt->bind_param('isi'
                ,$criteria->data->displayOrder
                ,$criteria->data->name
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
            "insert into `tag`
                    (dbTable,pk,displayOrder,name)
             values (?,?,?,?)"
    )) {
        $stmt->bind_param('iiis'
           ,$criteria->data->dbTable
           ,$criteria->data->pk
           ,$criteria->data->displayOrder
           ,$criteria->data->name
        );
        $r->successInsert = $stmt->execute();
        $r->rows = $mysqli->affected_rows;
        $r->successInsert
            ?$criteria->data->id = $stmt->insert_id
            :$r->errorInsert = $mysqli->error;
        $stmt->close();
    }
}
