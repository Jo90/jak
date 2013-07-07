<?php
/** //db/address/siud.php
 *
 */
namespace ja;

require_once '../common.php';
require_once 'common.php';
require_once '../job/common.php';
require_once '../usr/common.php';

$post = json_decode(file_get_contents('php://input'));

foreach ($post as $i) {

    $address = $i->address;

    if (!isset($address->criteria) &&
        !isset($address->record) &&
        !isset($address->remove)) {
        $address->error = 'parameter error';
        continue;
    }

    if (isset($address->criteria)) {

        $r = initResult($address);

        $r->address = addr_getAddress($address->criteria);

        $address->criteria->locationIds = selectIds($r->address->data, 'location');
        $r->location = addr_getLocation($address->criteria);

        $r->job = job_getJob($address->criteria);
        $address->criteria->jobIds = selectIds($r->job->data, 'id');

        $r->usrJob = usr_getUsrJob($address->criteria);

    }
}
header('Content-type: text/plain');
echo json_encode($post);
