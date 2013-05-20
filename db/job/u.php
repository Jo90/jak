<?php
/** /db/job/u.php
 *
 */
namespace jak;

require_once 'common.php';
require_once '../shared/common.php';
require_once '../qa/common.php';

$post = json_decode(file_get_contents('php://input'));

foreach ($post as $i) {

    job_setJob          ($i->data->job);
    qa_setAnswer        ($i->data->answer);
    qa_setPropPartAnswer($i->data->propPartAnswer);

}
header('Content-type: text/plain');
echo json_encode($post);
