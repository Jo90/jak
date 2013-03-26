<?php
/** /db/address/u.php
 *
 *  JAK
 *
 */
namespace jak;
require_once 'common.php';

$post = json_decode(file_get_contents('php://input'));
if (!isset($post)) {exit('{"error":"insufficient parameters"}');}

foreach ($post as $i) {
    if (!isset($i->criteria, $i->criteria->usr)) {continue;}







}
$mysqli->close();
header('Content-type: text/plain');
echo json_encode($post);
