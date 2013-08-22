<?php
/** /db/prop/common.php
 *
 */
namespace ja;

function prop_getProp($i) {
    global $mysqli;

    $r = initResult($i);
    $c = $i->criteria;

    $cnd   = '';
    $limit = '';

    if (isset($c->propIds) && is_array($c->propIds) && count($c->propIds) > 0) {
        $propIds = implode(',', $c->propIds);
        $cnd = "where id in ($propIds)";
    }

    if (isset($c->rowLimit)) {
        $limit = ' limit ' . $c->rowLimit;
    }

    if ($stmt = $mysqli->prepare(
        "select *
           from `prop` $cnd $limit"
    )) {
        $r->success = $stmt->execute();
        $r->rows = $mysqli->affected_rows;
        $r->data = \ja\fetch_result($stmt,'id');
        $stmt->close();
    }
    return $r;
}
