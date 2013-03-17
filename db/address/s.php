<?php
/** /db/address/s.php
 *
 */
namespace jak;
require_once '../shared/common.php';
require_once 'common.php';
require_once '../job/common.php';
require_once '../usr/common.php';

$post = json_decode(file_get_contents('php://input'));

foreach ($post as $i) {

    $r = initStep($i);

    if (!isset($i->criteria) &&
        !isset($i->criteria->addressIds)) {$r->log[] = 'parameter error'; continue;}

    $r->address = addr_getAddress($i->criteria);

    $i->criteria->locationIds = selectIds($r->address->data, 'location');
    $r->location = addr_getLocation($i->criteria);

    $r->job = job_getJob($i->criteria);
    $i->criteria->jobIds = selectIds($r->job->data, 'id');

    $r->usrJob = usr_getUsrJob($i->criteria);
}
header('Content-type: text/plain');
echo json_encode($post);
