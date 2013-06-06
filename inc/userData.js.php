<?php
/** //inc/userData.js.php
 *
 * return user data as JSON
 *
 */
namespace ja;

require_once 'userData.php';
if (isset($_SESSION[JA_MEMBER])) {
    //remove password
    $data = userData();
    unset($data->user->password);
    echo('JA.user=' . json_encode($data) . ';' . PHP_EOL);
}
//Challenge Handshake AP
if (!isset($_SESSION[JA_SALT])) {
    //>>>>FINISH What about using PHP mcrypt_create_iv Initialization Vector?
    $seed      = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    $randomStr = '';
    $seedLen   = strlen($seed) - 1;
    $i         = 40;
    while (--$i) {
        $randomStr .= substr($seed,rand(0,$seedLen),1);
    }
    $_SESSION[JA_SALT] = $randomStr;
    echo 'if(!JA.user){JA.user={};}' ,
         'JA.user.SALT="' , $_SESSION[JA_SALT] , '";' , PHP_EOL;
}
