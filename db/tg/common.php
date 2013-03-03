<?php
/** /db/tag/common.php
 *
 *  Kauri Coast Promotion Society
 *
 */
namespace kc;

function tg_getLink($criteria) {
    global $mysqli;
    $r = new \stdClass;
    $r->criteria = $criteria;
    $dbTable = $criteria->dbTable;
    $pks     = implode(',', $criteria->pks);
    if ($stmt = $mysqli->prepare(
        "select tl.*
           from `tgLink`
           where dbTable = $dbTable
             and pk in ($pks)"
    )) {
        $r->success = $stmt->execute();
        $r->rows = $mysqli->affected_rows;
        $r->data = \kc\fetch_result($stmt,'id');
        $stmt->close();
    }
    return $r;
}

function tg_setLink(&$criteria) {
    global $mysqli;
    $criteria->result = new \stdClass;
    $r = $criteria->result;
//>>>>>>>>>>>>>>>>>>>DO
    if (!isset($criteria, $criteria->data, $criteria->data->tagIds, $criteria->data->pk)) {return null;}
    //parametric polymorphism - if required get collectionTable
    $cnd = '';
    if (count($criteria->data->tagIds)>0) {
        $tagIds = implode(',', $criteria->data->tagIds);
        $cnd = "and tag not in ($tagIds)";
    }
    if (isset($criteria->data->id)) {
        if ($stmt = $mysqli->prepare(
            "delete from `tgLink`
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
    //insert
    if (count($criteria->data->tagIds)>0) {
        if ($stmt = $mysqli->prepare(
            "insert into `tgLink`
                    (dbTable,pk,tag)
             values (?,?,?)"
        )) {
            $stmt->bind_param('iis'
                ,$criteria->data->dbTable
                ,$criteria->data->pk
                ,$criteria->data->tag
            );
            $r->successInsert = $stmt->execute();
            $r->rows = $mysqli->affected_rows;
            $r->successInsert OR $r->errorInsert = $mysqli->error;
            $stmt->close();
        }
    }
}
