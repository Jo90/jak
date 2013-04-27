<?php
/** /db/shared/common.php
 *
 * tables with dbTable and pk
 */
namespace jak;

/**
 *  General functions
 */

function initResult(&$i) {
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

function remove($table, &$i) {
    global $mysqli;

    if (!isset($i->remove)) {$i->removeError = 'no remove parameter'; return false;}

    if (is_numeric($i->remove)) {$cnd = 'where id = ' . $i->remove;}
    else if (is_array($i->remove))   {$cnd = 'where id in ("' . implode('","', array_map('mysql_real_escape_string', $i->remove)) . '")';}
    else {$cnd = 'where id = "' . $mysqli->real_escape_string($i->remove) . '"';}

    if ($stmt = $mysqli->prepare(
        "delete from `$table` $cnd"
    )) {
        $i->removeSuccess = $stmt->execute();
        $i->removeRows = $mysqli->affected_rows;
        $i->removeSuccess OR $r->removeError = $mysqli->error;
        $stmt->close();
    }
    return true;
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

    $r = initResult($criteria);

    if (isset($criteria->infoIds) && is_array($criteria->infoIds) && count($criteria->infoIds) > 0) {
        $infoIds = implode(',', $criteria->infoIds);
        $cnd = "where id in ($infoIds)";
    }
    if (isset($criteria->dbTable, $criteria->pks) && is_array($criteria->pks) && count($criteria->pks) > 0) {
        $pks = implode(',', $criteria->pks);
        $cnd = "where dbTable = $criteria->dbTable and pk in ($pks)";
    }
    if (isset($criteria->dbTable, $criteria->pk)) {
        $cnd = "where dbTable = $criteria->dbTable and pk = $criteria->pk";
    }

    if ($stmt = $mysqli->prepare(
        "select *
           from `info` $cnd
          order by seq, id desc"
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

    $r = initResult($criteria);

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

function shared_setInfo(&$i) {
    global $mysqli;

    remove('info',$i);

    foreach ($i->record as $rec) {

        $r = initResult($rec);

        if (isset($rec->data->id) && $rec->data->id != '') {
            if ($stmt = $mysqli->prepare(
                "update `info`
                    set seq      = ?,
                        category = ?,
                        detail   = ?
                where id = ?"
            )) {
                $stmt->bind_param('issi'
                    ,$rec->data->seq
                    ,$rec->data->category
                    ,$rec->data->detail
                    ,$rec->data->id
                );
                $r->successUpdate = $stmt->execute();
                $r->rows = $mysqli->affected_rows;
                $r->successUpdate OR $r->errorUpdate = $mysqli->error;
                $stmt->close();
            }
            continue;
        }
        //insert
        if ($stmt = $mysqli->prepare(
                "insert into `info`
                        (dbTable,pk,seq,category,detail)
                values (?,?,?,?,?)"
        )) {
            $stmt->bind_param('iiiss'
            ,$rec->data->dbTable
            ,$rec->data->pk
            ,$rec->data->seq
            ,$rec->data->category
            ,$rec->data->detail
            );
            $r->successInsert = $stmt->execute();
            $r->rows = $mysqli->affected_rows;
            $r->successInsert
                ?$rec->data->id = $stmt->insert_id
                :$r->errorInsert = $mysqli->error;
            $stmt->close();
        }
    }
}

function shared_setTag(&$i) {
    global $mysqli;

    $r = initResult($i);

    if (!isset($i) &&
        !isset($i->data) &&
        !isset($i->dbTable, $i->data->pk) &&
        !isset($i->remove)) {return null;}

    remove('tag',$i);

    if (isset($i->data->id)) {
        if ($stmt = $mysqli->prepare(
            "update `tag`
                set displayOrder = ?,
                    name         = ?
              where id = ?"
        )) {
            $stmt->bind_param('isi'
                ,$i->data->displayOrder
                ,$i->data->name
                ,$i->data->id
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
           ,$i->data->dbTable
           ,$i->data->pk
           ,$i->data->displayOrder
           ,$i->data->name
        );
        $r->successInsert = $stmt->execute();
        $r->rows = $mysqli->affected_rows;
        $r->successInsert
            ?$i->data->id = $stmt->insert_id
            :$r->errorInsert = $mysqli->error;
        $stmt->close();
    }
}
