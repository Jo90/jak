<?php
/** /db/grp/u.php
 *
 *  Kauri Coast Promotion Society
 *
 */
namespace kc;
require_once 'common.php';
require_once '../tg/common.php';
require_once '../usr/common.php';

$post = json_decode(file_get_contents('php://input'));
if (!isset($post)) {exit('{"error":"insufficient parameters"}');}

foreach ($post as $i) {
    if (!isset($i->criteria, $i->criteria->grp)) {continue;}
    foreach ($i->criteria->grp as $ix) {
        if (!isset($ix->data)) {continue;}
        grp_setGrp($ix);
        foreach ($ix->children->grpInfo as $ic) {
            //cascade grp
            $ic->data->grp = $ix->data->id;
            grp_setGrpInfo($ic);
        }
        foreach ($ix->children->tgLink  as $ic) {
            //cascade grp
            $ic->data->pk = $ix->data->id;
            tg_setLink($ic);
        }
    }
}
$mysqli->close();
header('Content-type: text/plain');
echo json_encode($post);
