<?php
/** /db/shared/sInfo.php
 *
 */
namespace jak;
require_once 'common.php';

$post = json_decode(file_get_contents('php://input'));

foreach ($post as $i) {

    $r = initResult($i);

    if (!isset($i->criteria) &&
        !isset($i->criteria->infoIds) &&
        !isset($i->criteria->dbTable) &&
        !isset($i->criteria->pks)) {$r->log[] = 'invalid parameters'; continue;}

    $r->info = shared_getInfo($i->criteria);
}
header('Content-type: text/plain');
echo json_encode($post);
