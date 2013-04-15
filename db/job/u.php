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

    if (!isset($i->job)) {$r->log[] = 'parameter error'; continue;}

    job_setJob($i->job);

    foreach ($i->answer         as $answer        ) {qa_setAnswer($answer);}
    foreach ($i->propPartAnswer as $propPartAnswer) {qa_setPropPartAnswer($propPartAnswer);}

}
header('Content-type: text/plain');
echo json_encode($post);
