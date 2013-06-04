<?php
/** //db/job/id.php
 *
 */
namespace jak;

require_once 'common.php';
require_once '../shared/common.php';

$post = json_decode(file_get_contents('php://input'));

foreach ($post as $i) {

    if (!isset($i->job) &&
        !isset($i->job->record) &&
        !isset($i->job->duplicate) &&
        !isset($i->job->remove)) {$i->error = 'parameter error'; continue;}

    job_setJob($i->job);

}
header('Content-type: text/plain');
echo json_encode($post);
