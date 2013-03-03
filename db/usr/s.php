<?php
/** /db/usr/s.php
 *
 *  JAK
 *
 */
namespace kc;
require_once 'common.php';
require_once '../grp/common.php';

$post = json_decode(file_get_contents('php://input'));
if (!isset($post)) {exit('{"error":"insufficient parameters"}');}

foreach ($post as $i) {
    if (!isset($i->criteria, $i->criteria->usrIds)) {continue;}
    $i->result = new \stdClass;
    $r         = $i->result;
    $r->usr    = usr_getUsr($i->criteria);
    $r->usrInfo = usr_getUsrInfo($i->criteria);
    $r->grpUsr  = grp_getGrpUsr($i->criteria);
}
header('Content-type: text/plain');
echo json_encode($post);
