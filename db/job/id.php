<?php
/** /db/job/id.php
 *
 */
namespace jak;
require_once 'common.php';
require_once '../shared/common.php';

$post = json_decode(file_get_contents('php://input'));

foreach ($post as $i) {

    $r = initStep($i);

    if (!isset($i->data) &&
        !isset($i->data->job) &&
        !isset($i->create) &&
        !isset($i->remove) &&
        !isset($i->duplicate) &&
        !isset($i->data->jobIds)) {$r->log[] = 'parameter error'; continue;}

    $r->job = job_setJob($i);

}
header('Content-type: text/plain');
echo json_encode($post);
