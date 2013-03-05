<?php
/** //inc/userLogon.php
 *
 */
namespace jak;

//logout
if (isset($_REQUEST['logout'])) {unset($_SESSION[JAK_MEMBER]); exit;}

if (!isset($_REQUEST['logon'], $_REQUEST['hash'])) {exit;}

//logon
require_once '../db/usr/common.php';
$criteria = new \stdClass;

$criteria->logon = $_REQUEST['logon'];
$r = usr_getUsr($criteria);
if (!isset($r->data)) {exit;}
$member = firstElement($r->data);

if (!isset($member)) {exit;}

//verify password
if (SHA1($member->password . SHA1($_SESSION[JAK_SALT])) == $_REQUEST['hash']) {
    $_SESSION[JAK_MEMBER] = $member->id;
    //security
    unset($member->logon);
    unset($member->password);
} else exit;
if (!isset($_COOKIE[JAK_USERLOGON_REMEMBER])) {
    unset($_SESSION[JAK_MEMBER]);
}
header('Content-type: application/json');
echo json_encode($r);
