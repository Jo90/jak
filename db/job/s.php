<?php
/** /db/job/s.php
 *
 */
namespace jak;
require_once 'common.php';
require_once '../shared/common.php';

$post = json_decode(file_get_contents('php://input'));

foreach ($post as $i) {

    $i->log    = array();

    if (!isset($i->criteria) && !isset($i->criteria->jobIds)) {$r->log[] = 'invalid parameters'; continue;}

    $i->result = new \stdClass;
    $r         = $i->result;

    $r->job = job_getJob($i->criteria);
}
header('Content-type: text/plain');
echo json_encode($post);
