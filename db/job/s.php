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

    $r = initResult($i);
	
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
    ) {$r->log[] = 'parameter error'; continue;}

	$criteria = $i->job->criteria;

    //find criteria
    if (isset($criteria->location, $criteria->streetName, $criteria->streetRef)) {
        $temp = addr_getAddress($criteria);
        $criteria->addressIds  = array();
        foreach ($temp->data as $d) {$criteria->addressIds[] = $d->id;}
    } else

    if (isset($criteria->firstName, $criteria->lastName)) {
        $temp = usr_getUsr($criteria);
        $criteria->usrIds = array();
        foreach ($temp->data as $d) {$criteria->usrIds[] = $d->id;}
        $temp = usr_getUsrJob($criteria);
        foreach ($temp->data as $d) {$criteria->jobIds[] = $d->job;}
    }

    $r->job = job_getJob($criteria);

    foreach ($r->job->data as $d) {if ($d->address != '') {$criteria->addressIds[] = $d->address;}}
    $r->address = addr_getAddress($criteria);
    $criteria->locationIds = array();
    foreach ($r->address->data as $d) {$criteria->locationIds[] = $d->location;}
    $r->location = addr_getLocation($criteria);

    $r->usrJob = usr_getUsrJob($criteria);
    foreach ($r->usrJob->data as $d) {$criteria->usrIds[] = $d->usr;}
    $r->usr = usr_getUsr($criteria);
    
    $r->property = addr_getProperty($criteria);

    $criteria->propertyIds = array();
    foreach ($r->property->data as $d) {$criteria->propertyIds[] = $d->id;}

/* >>>>FINISH
    $r->propPartAnswer = qa_getPropPartAnswer($criteria);
    $criteria->answerIds = array();
    foreach ($r->propPartAnswer->data as $d) {$criteria->answerIds[] = $d->answer;}

    $r->answer = qa_getAnswer($criteria);

    $r->answerInfo         = shared_getInfo((object)array('dbTable'=>$dbTable['answer']        ,'pks'=>$criteria->answerIds));
    $r->propPartAnswerInfo = shared_getInfo((object)array('dbTable'=>$dbTable['propPartAnswer'],'pks'=>$criteria->propPartIds));
*/
}
header('Content-type: text/plain');
echo json_encode($post);
