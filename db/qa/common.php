<?php
/** //db/qa/common.php
 *
 */
namespace ja;

require_once '../common.php';

function qa_getQA($i) {
    global $mysqli;

    $r = initResult($i);
    $c = $i->criteria;

    $cnd   = '';
    $limit = '';

    if (isset($c->qaIds) && is_array($c->qaIds) && count($c->qaIds) > 0) {
        $qaIds = implode(',', $c->qaIds);
        $cnd = "where id in ($qaIds)";
    }

    if (isset($c->rowLimit)) {
        $limit = ' limit ' . $c->rowLimit;
    }

    if ($stmt = $mysqli->prepare(
        "select *
           from `qa` $cnd $limit"
    )) {
        $r->success = $stmt->execute();
        $r->rows = $mysqli->affected_rows;
        $r->data = \ja\fetch_result($stmt,'id');
        $stmt->close();
    }
    return $r;
}
