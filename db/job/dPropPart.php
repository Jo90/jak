<?php
/** //db/job/dPropPart.php
 *
 */
namespace jak;

require_once 'common.php';
require_once '../shared/common.php';

$post = json_decode(file_get_contents('php://input'));

foreach ($post as $i) {

    $r = initResult($i);

    if (!isset($i->remove)) {$r->log[] = 'parameter error'; continue;}

    $r->job = job_setPropPart($i);

}
header('Content-type: text/plain');
echo json_encode($post);
