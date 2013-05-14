<?php
/** //db/job/id.php
 *
 */
namespace jak;

require_once 'common.php';
require_once '../shared/common.php';

$post = json_decode(file_get_contents('php://input'));

foreach ($post as $i) {

    if (!isset($i->data) &&
        !isset($i->data->job) &&
        !isset($i->data->job->record) &&
        !isset($i->data->job->create) &&
        !isset($i->data->job->duplicate) &&
        !isset($i->data->job->remove)) {$i->error = 'parameter error'; continue;}

    job_setJob($i->data->job);

}
header('Content-type: text/plain');
echo json_encode($post);
