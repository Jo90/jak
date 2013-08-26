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
            case 'grp':
                $criteria
                    ? $r->info = shared_getGrp($dataSet)
                    : shared_setGrp($dataSet);
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
            case 'jobUsr':
                require_once 'job/common.php';
                $criteria
                    ? $r->jobUsr = job_getJobUsr($dataSet)
                    : job_setJobUsr($dataSet);
                break;
            case 'property':
                require_once 'address/common.php';
                $criteria
                    ? $r->property = addr_getProperty($dataSet)
                    : addr_setProperty($dataSet);
                break;
            case 'usr':
                require_once 'usr/common.php';
                $criteria
                    ? $r->usr = usr_getUsr($dataSet)
                    : usr_setUsr($dataSet);
                break;
            case 'usrAddress':
                require_once 'usr/common.php';
                $criteria
                    ? $r->usrAddress = usr_getUsrAddress($dataSet)
                    : usr_setUsrAddress($dataSet);
                break;
            case 'usrGrp':
                require_once 'usr/common.php';
                $criteria
                    ? $r->usrAddress = usr_getUsrGrp($dataSet)
                    : usr_setUsrGrp($dataSet);
                break;
            case 'usrInfo':
                require_once 'usr/common.php';
                $criteria
                    ? $r->usrInfo = usr_getUsrInfo($dataSet)
                    : usr_setUsrInfo($dataSet);
                break;
        }
    }
}
$mysqli->close();
header('Content-type: text/plain');
echo json_encode($post);