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

    if (!isset($i->data)) {continue;}

	foreach ($i->data as $ix) {

	    $r = initResult($ix);

	    if (!isset($ix->job)) {$r->log[] = 'parameter error'; continue;}

    	job_setJob($ix->job);

    	foreach ($ix->answer         as $answer        ) {qa_setAnswer($answer);}
    	foreach ($ix->propPartAnswer as $propPartAnswer) {qa_setPropPartAnswer($propPartAnswer);}
	}
}
header('Content-type: text/plain');
echo json_encode($post);
