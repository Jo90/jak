<?php
/** //inc/userData.js.php
 *
 * return user data as javascript
 *
 */
namespace jak;

require_once 'userData.php';
if (isset($_SESSION[JAK_MEMBER])) {
    //remove password
    $data = userData();
    unset($data->user->password);
    echo('JAK.user=' . json_encode($data) . ';' . PHP_EOL);
}
//Challenge Handshake AP
if (!isset($_SESSION[JAK_SALT])) {
    //>>>>FINISH What about using PHP mcrypt_create_iv Initialization Vector?
    $seed      = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    $randomStr = '';
    $seedLen   = strlen($seed) - 1;
    $i         = 40;
    while (--$i) {
        $randomStr .= substr($seed,rand(0,$seedLen),1);
    }
    $_SESSION[JAK_SALT] = $randomStr;
    echo 'if(!JAK.user){JAK.user={};}' ,
         'JAK.user.SALT="' , $_SESSION[JAK_SALT] , '";' , PHP_EOL;
}
