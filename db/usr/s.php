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
    if (isset($r->usrAddress->data)) {
        foreach ($r->usrAddress->data as $d) {$c->addressIds[] = $d->address;}
        $r->address = addr_getAddress($i->usr);
        $c->locationIds = array();
        foreach ($r->address->data as $d) {$c->locationIds[] = $d->location;}
        $r->location = addr_getLocation($i->usr);
    }

    $r->usrInfo = usr_getUsrInfo($i->usr);
}
header('Content-type: text/plain');
echo json_encode($post);
