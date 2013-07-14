<?php
/** //db/siud.php
 *
 */
namespace ja;
require_once 'common.php';

$post = json_decode(file_get_contents('php://input'));

foreach ($post as $i) {
    foreach ($i as $key => $dataSet) {

        $criteria = isset($dataSet->criteria) && $r = initResult($dataSet);

        switch ($key) {
            case 'address':
                require_once 'address/common.php';
                $criteria
                    ? $r->address = addr_getAddress($dataSet)
                    : addr_setAddress($dataSet);
                break;
            case 'info':
                $criteria
                    ? $r->info = shared_getInfo($dataSet)
                    : shared_setInfo($dataSet);
                break;
            case 'job':
                require_once 'job/common.php';
                $criteria
                    ? $r->job = job_getJob($dataSet)
                    : job_setJob($dataSet);
                break;
            case 'jobProperty':
                require_once 'job/common.php';
                $criteria
                    ? $r->job = job_getJobProperty($dataSet)
                    : job_setJobProperty($dataSet);
                break;
            case 'property':
                require_once 'address/common.php';
                $criteria
                    ? $r->property = addr_getProperty($dataSet)
                    : addr_setProperty($dataSet);
                break;
            case 'usr':
                break;
        }
    }
}
$mysqli->close();
header('Content-type: text/plain');
echo json_encode($post);