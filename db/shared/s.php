<?php
/** //db/shared/s.php
 *
 */
namespace ja;

require_once 'common.php';

$post = json_decode(file_get_contents('php://input'));

foreach ($post as $i) {

    $r = initResult($i);

    if (!isset($i->criteria) &&
        !isset($i->criteria->dataSet)) {$r->log[] = 'invalid parameters'; continue;}

    switch ($i->criteria->dataSet) {
        case 'info':
            $r->info = shared_getInfo($i->criteria);
            break;
    }
}
header('Content-type: text/plain');
echo json_encode($post);
