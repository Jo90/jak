<?php
/** /db/grp/i.php
 *
 *  Kauri Coast Promotion Society
 *
 */
namespace kc;
require_once 'common.php';

$post = json_decode(file_get_contents('php://input'));

foreach ($post as $i) {
    if (!isset($i->data, $i->data->name)) {continue;}
    grp_setGrp($i);
    grp_setGrpUsr($i);
}
$mysqli->close();
header('Content-type: text/plain');
echo json_encode($post);
