<?php
/** //db/prop/iud.php
 *
 */
namespace ja;

//>>>>>>>>>>>>>>FINISH convert to shared/iud.php

require_once 'common.php';
require_once '../shared/common.php';

$post = json_decode(file_get_contents('php://input'));

foreach ($post as $i) {

    $r = initResult($i);

    if (!isset($i->criteria) &&
        !isset($i->criteria->data) &&
        !isset($i->criteria->propPart) &&
        !isset($i->remove) &&
        !isset($i->criteria->propPartIds)) {$r->log[] = 'parameter error'; continue;}

    $r->propPart = prop_setPropPart($i);

}
header('Content-type: text/plain');
echo json_encode($post);
