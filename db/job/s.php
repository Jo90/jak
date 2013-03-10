<?php
/** /db/job/s.php
 *
 */
namespace jak;
require_once 'common.php';
require_once '../shared/common.php';
require_once '../address/common.php';
require_once '../usr/common.php';

$post = json_decode(file_get_contents('php://input'));

foreach ($post as $i) {

    $i->log = array();

    if (!isset($i->criteria) &&
        !isset($i->criteria->jobIds) &&
        !isset($i->criteria->last) &&
        !isset($i->criteria->firstName) &&
        !isset($i->criteria->lastName) &&
        !isset($i->criteria->streetName) &&
        !isset($i->criteria->location)) {$r->log[] = 'parameter error'; continue;}

    $i->result = new \stdClass;
    $r         = $i->result;

    //address
    if (isset($i->criteria->location, $i->criteria->streetName), $i->criteria->streetRef)) {
        $r->address = addr_getAddress($i->criteria);
    }
    //usr
    if (isset($i->criteria->firstName, $i->criteria->lastName)) {
        $r->usr = usr_getUsr($i->criteria);
    }
    
    $r->job = job_getJob($i->criteria);
}
header('Content-type: text/plain');
echo json_encode($post);
