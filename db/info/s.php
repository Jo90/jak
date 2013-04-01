<?php
/** /db/info/s.php
 *
 *  Kauri Coast Promotion Society
 *
 */
namespace kc;
require_once '../shared/common.php';
require_once 'common.php';

$post = json_decode(file_get_contents('php://input'));

foreach ($post as $i) {

    $r = initStep($i);

//>>>>FINISH criteria
    if (!isset($i->criteria) &&
        !isset($i->criteria->infoIds)) {$r->log[] = 'invalid parameters'; continue;}

    $r->info = info_getInfo($i->criteria);
}
header('Content-type: text/plain');
echo json_encode($post);
