<?php
/** /db/common.php
 *
 */
namespace ja;

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

function selectIds($dataSet, $field) {
    $ids = array();
    foreach ($dataSet as $d) {$ids[] = $d->{$field};}
    return $ids;
}

/**
 *  Classes
 */

class db {

    public static function insert($table, &$i) {
        global $mysqli;

        $fieldBind  = array();
        $fieldInfo  = array();
        $fieldPlace = array();
        $fieldSet   = array();
        $fieldTypes = '';
        $parameters = array();
        $results    = array();

        if (!($i->insert = isset($i->data))) {return false;}

        $r = initResult($i);

        $stmt = $mysqli->prepare("show columns from `$table`") or die("Problem finding columns in `$table`");
        $stmt->execute();
        $meta = $stmt->result_metadata();
        while ($field = $meta->fetch_field()) {
            $parameters[] = &$row[$field->name];
        }
        call_user_func_array(array($stmt, 'bind_result'), $parameters);

        $fieldBind  = array();
        $fieldNames = array();
        $fieldTypes = '';
        while ($stmt->fetch()) {
            $fieldInfo = array();
            foreach ($row as $key => $val) {$fieldInfo[$key] = $val;}
            $results[] = $fieldInfo;

            if ($fieldInfo['Key'] != 'PRI' && isset($i->data->{$fieldInfo['Field']})) {

                $fieldNames[]   = $fieldInfo['Field'];
                $fieldMarkers[] = '?';
                $fieldBind[]    = '$i->data->' . $fieldInfo['Field'];

                //>>>>>FINISH all types???????
                if ($fieldInfo['Type'] == 'text' || strpos($fieldInfo['Type'], 'char') !== false) {$fieldTypes .= 's';}
                else if (strpos($fieldInfo['Type'], 'int') !== false) {$fieldTypes .= 'i';}
                else {$fieldTypes .= 'd';}
            }
        }
        $fieldBind    =       implode(','  , $fieldBind   );
        $fieldMarkers =       implode(','  , $fieldMarkers);
        $fieldNames   = '`' . implode('`,`', $fieldNames  ) . '`';
        //>>>>FINISH naughty eval, FUTURE bind correctly
        eval(
            "if (\$stmt = \$mysqli->prepare(
                \"insert into  `$table` ($fieldNames) values ($fieldMarkers)\"
             )) {
                \$stmt->bind_param('$fieldTypes',
                    $fieldBind
                );
                \$r->successInsert = \$stmt->execute();
                \$r->rows = \$mysqli->affected_rows;
                \$r->successInsert
                    ?\$i->data->id    = \$stmt->insert_id
                    :\$r->errorInsert = \$mysqli->error;
                \$stmt->close();
            }"
        );
    }

    public static function remove($table, &$i) {
        global $mysqli;

        if (!isset($i->remove) || !is_array($i->remove) || !count($i->remove) > 0) {$i->removeMessage = 'nothing to remove'; return false;}

        if (is_numeric($i->remove)) {$cnd = 'where id = ' . $i->remove;}
        else if (is_array($i->remove))   {$cnd = 'where id in ("' . implode('","', array_map(array($mysqli, 'real_escape_string'), $i->remove)) . '")';}
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

    public static function update($table, &$i) {
        global $mysqli;

        $fieldBind  = array();
        $fieldInfo  = array();
        $fieldSet   = array();
        $fieldTypes = '';
        $parameters = array();
        $results    = array();

        if (!isset($i->data, $i->data->id) || $i->data->id == '' || $i->data->id == null) {$i->update = false; return false;}
        $i->update = true;

        $r = initResult($i);

        $stmt = $mysqli->prepare("show columns from `$table`") or die("Problem finding columns in `$table`");
        $stmt->execute();
        $meta = $stmt->result_metadata();
        while ($field = $meta->fetch_field()) {
            $parameters[] = &$row[$field->name];
        }
        call_user_func_array(array($stmt, 'bind_result'), $parameters);

        $fieldBind  = array();
        $fieldSet   = array();
        $fieldTypes = '';
        while ($stmt->fetch()) {
            $fieldInfo = array();
            foreach ($row as $key => $val) {$fieldInfo[$key] = $val;}
            $results[] = $fieldInfo;

            if ($fieldInfo['Key'] != 'PRI' && isset($i->data->{$fieldInfo['Field']})) {

                $fieldSet[] = $fieldInfo['Field'] . ' = ?';
                $fieldBind[] = '$i->data->' . $fieldInfo['Field'];

                //>>>>>FINISH all types???????
                if ($fieldInfo['Type'] == 'text' || strpos($fieldInfo['Type'], 'char') !== false) {$fieldTypes .= 's';}
                else if (strpos($fieldInfo['Type'], 'int') !== false) {$fieldTypes .= 'i';}
                else {$fieldTypes .= 'd';}
            }
        }
        //>>>>FINISH naughty eval, FUTURE bind correctly
        eval(
            'if ($stmt = $mysqli->prepare("'
            . "update `$table` set " . implode(' , ', $fieldSet) . " where id = ?"
            . '")) {
                $stmt->bind_param("' . $fieldTypes . 'i", '
                    . implode(',', $fieldBind)
                    . ',$i->data->id
                );
                $r->successUpdate = $stmt->execute();
                $r->rows = $mysqli->affected_rows;
                $r->successUpdate OR $r->errorUpdate = $mysqli->error;
                $stmt->close();
            }'
        );
        return true;
    }
}

/**
 *  DB get/set
 */

function shared_getInfo($criteria) {
    global $mysqli;
    $r = initResult($criteria);
    $cnd = "";
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
        $r->data = \ja\fetch_result($stmt,'id');
        $stmt->close();
    }
    return $r;
}

function shared_setInfo(&$i) {
    global $mysqli;
    db::remove('info', $i);
    if (isset($i->record)) {
        foreach ($i->record as $rec) {
            db::update('info',$rec) or db::insert('info',$rec);
        }
    }
}
