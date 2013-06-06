<?php
/** //db/usr/u.php
 *
 */
namespace ja;
require_once 'common.php';
require_once '../shared/common.php';

$post = json_decode(file_get_contents('php://input'));
if (!isset($post)) {exit('{"error":"insufficient parameters"}');}

foreach ($post as $i) {
    if (!isset($i->criteria, $i->criteria->usr)) {continue;}
    foreach ($i->criteria->usr as $ix) {
        if (!isset($ix->data)) {continue;}
        usr_setUsr($ix);
    }
}
$mysqli->close();
header('Content-type: text/plain');
echo json_encode($post);
