<?php
/** //db/job/s.php
 *
 */
namespace ja;

require_once 'common.php';
require_once '../common.php';
require_once '../address/common.php';
require_once '../prop/common.php';
require_once '../qa/common.php';
require_once '../usr/common.php';

$post = json_decode(file_get_contents('php://input'));

foreach ($post as $i) {

    if (!isset($i->job) &&
        !isset($i->job->criteria) &&
        !isset($i->job->criteria->jobIds) &&
        !isset($i->job->criteria->lastJob) &&
        !isset($i->job->criteria->firstName) &&
        !isset($i->job->criteria->lastName) &&
        !isset($i->job->criteria->streetName) &&
        !isset($i->job->criteria->location) &&
        !isset($i->job->criteria->appointmentStart) &&
        !isset($i->job->criteria->appointmentEnd)
    ) {continue;}

    //shortcuts
        $r = initResult($i);
        $c = $i->job->criteria;

    //find criteria
        if (isset($c->location, $c->streetName, $c->streetRef)) {
            $temp = addr_getAddress($i->job);
            $c->addressIds = array();
            foreach ($temp->data as $d) {$c->addressIds[] = $d->id;}
        } else

        if (isset($c->firstName, $c->lastName)) {
            $temp = usr_getUsr($i->job);
            $c->usrIds = array();
            foreach ($temp->data as $d) {$c->usrIds[] = $d->id;}
            $temp = job_getJobUsr($i->job);
            foreach ($temp->data as $d) {$c->jobIds[] = $d->job;}
        }

    $r->job = job_getJob($i->job);

    unset($c->addressIds, $c->usrIds, $c->jobIds);

    $c->addressIds = array();
    foreach ($r->job->data as $d) {$c->addressIds[] = $d->address;}
    $r->jobAddress = addr_getAddress($i->job);
    $c->locationIds = array();
    foreach ($r->jobAddress->data as $d) {$c->locationIds[] = $d->location;}
    $r->jobAddressLocation = addr_getLocation($i->job);

    $r->jobUsr = job_getJobUsr($i->job);
    if (isset($r->jobUsr->data)) {
        foreach ($r->jobUsr->data as $d) {$i->job->usrIds[] = $d->usr;}
        $r->usr        = usr_getUsr($i->job);
        $r->usrAddress = usr_getUsrAddress($i->job);
        $r->usrInfo    = usr_getUsrInfo($i->job);

        if (isset($r->usrAddress->data)) {
            $c->usrAddressIds = array();
            foreach ($r->usrAddress->data as $d) {$c->usrAddressIds[] = $d->address;}
            $r->usrAddress = addr_getAddress((object) array('criteria' => (object) array('addressIds' => $c->usrAddressIds)));
        }
    }

    $r->property = addr_getProperty($i->job);
}
header('Content-type: text/plain');
echo json_encode($post);
