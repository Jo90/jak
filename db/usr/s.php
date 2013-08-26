<?php
/** //db/usr/s.php
 *
 */
namespace ja;

require_once 'common.php';
require_once '../common.php';
require_once '../address/common.php';

$post = json_decode(file_get_contents('php://input'));

foreach ($post as $i) {

    if (!isset($i->usr) &&
        !isset($i->usr->criteria) &&
        !isset($i->usr->criteria->usrIds)
    ) {continue;}

    //shortcuts
        $r = initResult($i);
        $c = $i->usr->criteria;

    $r->usr = usr_getUsr($i->usr);

    $r->usrAddress = usr_getUsrAddress($i->usr);
    if (isset($r->usrAddress->data) && (count(get_object_vars($r->usrAddress->data)) > 0)) {
        foreach ($r->usrAddress->data as $d) {$c->addressIds[] = $d->address;}
        $r->address = addr_getAddress($i->usr);
        $c->locationIds = array();
        foreach ($r->address->data as $d) {$c->locationIds[] = $d->location;}
        $r->location = addr_getLocation($i->usr);
    }

    $r->usrInfo = usr_getUsrInfo($i->usr);

    $r->usrGrp = usr_getUsrGrp($i->usr); //get specified users groups
    if (isset($r->usrGrp->data) && (count(get_object_vars($r->usrGrp->data)) > 0)) {

        //get groups
        $c->grpIds = array();
        foreach ($r->usrGrp->data as $d) {$c->grpIds[] = $d->grp;}
        $c->grpIds = array_values(array_unique($c->grpIds));

        //fetch groups from grpIds
        $r->grp = shared_getGrp($i->usr);

        //fetch all usrGrp records for grpIds
        $r->usrGrp = usr_getUsrGrp((object) array('criteria' => (object) array('grpIds' => $c->grpIds)));
        foreach ($r->usrGrp->data as $d) {$c->usrIds[] = $d->usr;}
        $c->usrIds = array_values(array_unique($c->usrIds));
        
        //fetch users from usrIds
        $r->usr = usr_getUsr($i->usr);
    }
}
header('Content-type: text/plain');
echo json_encode($post);
