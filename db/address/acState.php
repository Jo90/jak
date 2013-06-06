<?php
/** //db/address/acState.php
 *
 *  used by
 *  - /mod/job.js
 */
namespace ja;

$post = json_decode(file_get_contents('php://input'));
if (!isset($_REQUEST['state'], $_REQUEST['location'])) {exit;}

$state    = $_REQUEST['state'];
$location = $_REQUEST['location'] . '%';
$data     = new \stdClass;

if ($stmt = $mysqli->prepare(
    "select l.*
       from `location` as l,
            `location` as state
      where l.parent = state.id
        and state.abbrev = ?
        and state.category = 'State'
        and l.name like ?
      limit 10"
)) {
    $stmt->bind_param('ss',
        $state,
        $location
    );
    $stmt->execute();
    $data = \ja\fetch_result($stmt,null,false);
    $stmt->close();
}
$mysqli->close();
header('Content-type: text/plain');
echo json_encode($data);