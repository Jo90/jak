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

    //find criteria
    if (isset($i->criteria->location, $i->criteria->streetName, $i->criteria->streetRef)) {
        $temp = addr_getAddress($i->criteria);
        $i->criteria->addressIds  = array();
        foreach ($temp->data as $d) {
            $i->criteria->addressIds[] = $d->id;
        }
    } else

    if (isset($i->criteria->firstName, $i->criteria->lastName)) {
        $temp = usr_getUsr($i->criteria);
        foreach ($temp->data as $d) {
            $i->criteria->usrIds[] = $d->id;
        }
        $temp = usr_getUsrJob($i->criteria);
        foreach ($temp->data as $d) {
            $i->criteria->jobIds[] = $d->job;
        }
    }

    $r->job = job_getJob($i->criteria);

    foreach ($r->job->data as $d) {
        $i->criteria->addressIds[] = $d->address;
    }
    $r->address = addr_getAddress($i->criteria);
    $i->criteria->locationIds = array();
    foreach ($r->address->data as $d) {
        $i->criteria->locationIds[] = $d->location;
    }
    $r->location = addr_getLocation($i->criteria);

    $r->usrJob = usr_getUsrJob($i->criteria);
    foreach ($r->usrJob->data as $d) {
        $i->criteria->usrIds[] = $d->usr;
    }
    $r->usr = usr_getUsr($i->criteria);
    
}
header('Content-type: text/plain');
echo json_encode($post);
