<?php
/** /db/usr/s.php
 *
 */
namespace jak;

require_once 'common.php';
require_once '../shared/common.php';
require_once '../usr/common.php';

$post = json_decode(file_get_contents('php://input'));
if (!isset($post)) {exit('{"error":"insufficient parameters"}');}

foreach ($post as $i) {

    $r = initResult($i);

    if (!isset($i->criteria, $i->criteria->usrIds)) {continue;}

    $r->usr    = usr_getUsr($i->criteria);
    $r->usrInfo = usr_getUsrInfo($i->criteria);
    $r->grpUsr  = grp_getGrpUsr($i->criteria);
}
header('Content-type: text/plain');
echo json_encode($post);
