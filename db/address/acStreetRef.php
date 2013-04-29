<?php
/** //db/address/acStreetRef.php
 *
 *  used by
 *  - /mod/job.js
 */
namespace jak;

require_once 'jak-config.php';

$post = json_decode(file_get_contents('php://input'));
if (!isset($_REQUEST['streetRef'], $_REQUEST['streetName'], $_REQUEST['location'])) {exit;}

$streetRef  = $_REQUEST['streetRef'] . '%';
$streetName = $_REQUEST['streetName'] . '%';
$location   = $_REQUEST['location'];
$data       = new \stdClass;
$cnd        = '';
$limit      = 'limit 10';

if ($location != '') {
    $cnd = 'and location = ' . $location;
}
if ($streetName != '') {
    $cnd .= ' and streetName like "' . $streetName . '%"';
}

if (isset($criteria->rowLimit)) {
    $limit = ' limit ' . $criteria->rowLimit;
}

if ($stmt = $mysqli->prepare(
    "select id,streetRef
       from `address`
      where streetRef like ? $cnd $limit"
)) {
    $stmt->bind_param('s',
        $streetRef
    );
    $stmt->execute();
    $data = \jak\fetch_result($stmt,null,false);
    $stmt->close();
}
$mysqli->close();
header('Content-type: text/plain');
echo json_encode($data);