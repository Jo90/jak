<?php
/** //db/shared/iud.php
 *
 */
namespace ja;
require_once 'common.php';

$post = json_decode(file_get_contents('php://input'));

foreach ($post as $i) {
    foreach ($i as $key => $dataSet) {

        switch ($key) {
            case 'answer':
                require_once '../qa/common.php';
                qa_setAnswer($dataSet);
                break;
            case 'info':
                shared_setInfo($dataSet);
                break;
            case 'job':
                require_once '../job/common.php';
                job_setJob($dataSet);
                break;
            case 'propPart':
                require_once '../job/common.php';
                job_setPropPart($dataSet);
                break;
            case 'propPartAnswer':
                require_once '../qa/common.php';
                qa_setPropPartAnswer($dataSet);
                break;
            case 'usr':
                break;
        }
    }
}
$mysqli->close();
header('Content-type: text/plain');
echo json_encode($post);
