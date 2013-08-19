<?php
/** //db/address/ac.php
 */
namespace ja;

$post = json_decode(file_get_contents('php://input'));
if (!isset($_REQUEST['firstName'], $_REQUEST['lastName'])) {exit;}

$firstName = $_REQUEST['firstName'] . '%';
$lastName  = $_REQUEST['lastName']  . '%';
$data      = new \stdClass;

if ($stmt = $mysqli->prepare(
    "select firstName,lastName
       from `usr`
      where firstName like ?
        and lastName like ?
      limit 10"
)) {
    $stmt->bind_param('ss',
        $firstName,
        $lastName
    );
    $stmt->execute();
    $data = \ja\fetch_result($stmt,null,false);
    $stmt->close();
}
$mysqli->close();
header('Content-type: text/plain');
echo json_encode($data);