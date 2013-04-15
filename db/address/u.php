<?php
/** /db/address/u.php
 *
 */
namespace jak;
require_once '../shared/common.php';
require_once 'common.php';

$post = json_decode(file_get_contents('php://input'));
if (!isset($post)) {exit('{"error":"insufficient parameters"}');}

foreach ($post as $i) {

    $r = initStep($i);

    if (!isset($i->remove)) {continue;}

    addr_setAddress($i);





}
$mysqli->close();
header('Content-type: text/plain');
echo json_encode($post);
