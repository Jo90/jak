<?php
/** /db/info/u.php
 *
 *  Kauri Coast Promotion Society
 *
 */
namespace kc;
require_once 'common.php';

$post = json_decode(file_get_contents('php://input'));
if (!isset($post)) {exit('{"error":"insufficient parameters"}');}

foreach ($post as $i) {
    if (!isset($i->criteria, $i->criteria->info)) {continue;}
    foreach ($i->criteria->info as $ix) {
        if (!isset($ix->data)) {continue;}
        info_setInfo($ix);
    }
}
$mysqli->close();
header('Content-type: text/plain');
echo json_encode($post);
