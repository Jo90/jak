<?php
/** //db/shared/d.php
 *
 */
namespace jak;

require_once 'common.php';

$post = json_decode(file_get_contents('php://input'));

foreach ($post as $i) {

    if (!isset($i->data) &&
        !isset($i->dataSet) &&
        !isset($i->data->{$i->dataSet}->remove)) {$i->error = 'parameter error'; continue;}

    if ($i->dataSet == 'answer') {
        require_once '../qa/common.php';
        qa_setAnswer($i->data->answer);
    }
    if ($i->dataSet == 'propPart') {
        require_once '../job/common.php';
        job_setPropPart($i->data->propPart);
    }

}
header('Content-type: text/plain');
echo json_encode($post);
