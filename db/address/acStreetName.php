<?php
/** //db/address/acStreetName.php
 *
 *  used by
 *  - /mod/job.js
 */
namespace jak;

require_once 'jak-config.php';

$post = json_decode(file_get_contents('php://input'));
if (!isset($_REQUEST['streetName'], $_REQUEST['location'])) {exit;}

$streetName = $_REQUEST['streetName'] . '%';
$location   = $_REQUEST['location'  ];
$data       = new \stdClass;
$cnd        = '';
$limit      = 'limit 10';

if ($location != '') {
    $cnd = 'and location = ' . $location;
}

if (isset($criteria->rowLimit)) {
    $limit = ' limit ' . $criteria->rowLimit;
}

if ($stmt = $mysqli->prepare(
    "select distinct streetName
       from `address`
      where streetName like ? $cnd $limit"
)) {
    $stmt->bind_param('s',
        $streetName
    );
    $stmt->execute();
    $data = \jak\fetch_result($stmt,null,false);
    $stmt->close();
}
$mysqli->close();
header('Content-type: text/plain');
echo json_encode($data);