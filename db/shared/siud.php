<?php
/** //db/shared/siud.php
 *
 */
namespace ja;
require_once 'common.php';

$post = json_decode(file_get_contents('php://input'));

foreach ($post as $i) {
    foreach ($i as $key => $dataSet) {

        $criteria = false;
        if (isset($dataSet->criteria)) {
            $criteria = true;
            $r = initResult($dataSet);
        }

        switch ($key) {
            case 'answer':
                require_once '../qa/common.php';
                if ($criteria) {$r->answer = qa_getAnswer($dataSet);}
                else qa_setAnswer($dataSet);
                break;
            case 'info':
                if ($criteria) {$r->info = shared_getInfo($dataSet);}
                else shared_setInfo($dataSet);
                break;
            case 'job':
                require_once '../job/common.php';
                if ($criteria) {$r->job = job_getJob($dataSet);}
                else job_setJob($dataSet);
                break;
            case 'propPart':
                require_once '../job/common.php';
                if ($criteria) {$r->propPart = job_getPropPart($dataSet);}
                else job_setPropPart($dataSet);
                break;
            case 'propPartAnswer':
                require_once '../qa/common.php';
                if ($criteria) {$r->propPartAnswer = qa_getPropPartAnswer($dataSet);}
                else qa_setPropPartAnswer($dataSet);
                break;
            case 'usr':
                break;
        }
    }
}
$mysqli->close();
header('Content-type: text/plain');
echo json_encode($post);