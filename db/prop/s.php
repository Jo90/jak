<?php
/** /db/prop/s.php
 *
 */
namespace jak;
require_once 'common.php';
require_once '../shared/common.php';

$post = json_decode(file_get_contents('php://input'));

foreach ($post as $i) {

    $r = initStep($i);

    if (!isset($i->criteria) &&
        !isset($i->criteria->propPartTypeIds)) {$r->log[] = 'parameter error'; continue;}

    //find criteria
    if (isset($i->criteria->firstName, $i->criteria->lastName)) {
        $temp = usr_getUsr($i->criteria);
        foreach ($temp->data as $d) {
            $i->criteria->usrIds[] = $d->id;
        }
        $temp = usr_getUsrJob($i->criteria);
        foreach ($temp->data as $d) {
            $i->criteria->propIds[] = $d->prop;
        }
    }

    $r->prop = prop_getJob($i->criteria);

    foreach ($r->prop->data as $d) {
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
