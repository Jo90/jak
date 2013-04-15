<?php
/** /db/shared/common.php
 *
 * tables with dbTable and pk
 */
namespace jak;

/**
 *  General functions
 */

function initStep(&$i) {
    $i->log = array();
    $i->result = new \stdClass;
    return $i->result;
}

function explodeArrayForInsert($data, $fields, $dataTypes) { //array, string, string
    $out = array();
    $fieldsArr = explode(',', $fields);
    $fieldsCnt = count($fieldArr);
    foreach ($data as $row) {
        $fields = array();
        for ($i = 0; $i < $fieldsCnt; $i++) {
            if ($dataTypes[$i] == 'i') {
                $fields[] = $row[$i];
            } else {
                $fields[] = '"' . mysql_real_escape_string($row['']) . '"';
            }
        }
        $out[] = $fields;
    }
    return '(' . implode('),(',$out) . ')';
}

function selectIds($dataSet, $field) {
    $ids = array();
    foreach ($dataSet as $d) {
        $ids[] = $d->{$field};
    }
    return $ids;
}

/**
 *  DB get/set
 */

function shared_getInfo($criteria) {
    global $mysqli;

    $r = initStep($criteria);

    $dbTable = $criteria->dbTable;
    $pks     = implode(',', $criteria->pks);
    if ($stmt = $mysqli->prepare(
        "select *
           from `info`
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

function shared_getTag($criteria) {
    global $mysqli;

    $r = initStep($criteria);

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

function shared_setTag(&$criteria) {
    global $mysqli;

    $r = initStep($criteria);

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
