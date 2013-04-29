<?php
/** //db/shared/iudInfo.php
 *
 */
namespace jak;

require_once 'common.php';

$post = json_decode(file_get_contents('php://input'));

foreach ($post as $i) {

    if (!isset($i->data)) {continue;}

    foreach ($i->data as $ix) {
        shared_setInfo($ix);
    }

}
$mysqli->close();
header('Content-type: text/plain');
echo json_encode($post);
