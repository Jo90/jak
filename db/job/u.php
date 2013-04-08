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

    $r = initStep($i);

    if (!isset($i->criteria) &&
        !isset($i->criteria->job) &&
        !isset($i->remove) &&
        !isset($i->criteria->jobIds)) {$r->log[] = 'parameter error'; continue;}

    $r->job          = job_setJob($i);
    $r->answer       = qa_setAnswer($i);
    $r->answerMatrix = qa_setAnswerMatrix($i);

}
header('Content-type: text/plain');
echo json_encode($post);
