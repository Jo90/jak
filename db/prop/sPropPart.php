<?php
/** /db/prop/sPropPart.php
 *
 */
namespace jak;
require_once 'common.php';
require_once '../shared/common.php';

$post = json_decode(file_get_contents('php://input'));

foreach ($post as $i) {

    $r = initStep($i);

    if (!isset($i->criteria) &&
        !isset($i->criteria->propPartIds)) {$r->log[] = 'parameter error'; continue;}

    $r->propPart = prop_getPropPart($i->criteria);

}
header('Content-type: text/plain');
echo json_encode($post);
