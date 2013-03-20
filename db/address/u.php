<?php
/** /db/address/u.php
 *
 *  JAK
 *
 */
namespace kc;
require_once 'common.php';

$post = json_decode(file_get_contents('php://input'));
if (!isset($post)) {exit('{"error":"insufficient parameters"}');}

foreach ($post as $i) {
    if (!isset($i->criteria, $i->criteria->usr)) {continue;}
    foreach ($i->criteria->usr as $ix) {
        if (!isset($ix->data)) {continue;}
        addr_setAddress($ix);
    }
}
$mysqli->close();
header('Content-type: text/plain');
echo json_encode($post);
