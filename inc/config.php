<?php
/** //inc/config.php
 *
 * general configuration
 *
 * namespace
 * NAMED CONSTANTS
 * __autoload
 * shared functions
 * environment (error logging, DB connections)
 * 
 */
namespace jak;

if (!isset($_SESSION)) {session_start();}
//php session timeout 30 mins
ini_set('session.gc_maxlifetime',30*60);

/**
 * NAMED CONSTANTS
 */
define('JAK_COMPANY'            , 'JAK');
define('JAK_SLOGON'             , 'Pest Control');
define('JAK_ADMIN_EMAIL'        , 'john@jakinspections.com');
define('JAK_ADMIN_ADMINISTRATOR', 'John Krok');
define('JAK_QUERY_LIMIT_OFFSET' , 0);
define('JAK_QUERY_LIMIT_ROWS'   , 30);
define('JAK_COOKIE_DEVICE'      , 'jak-device'); //>>>>FUTURE
define('JAK_COOKIE_THEME'       , 'jak-theme');  //>>>>FUTURE
if (isset($_COOKIE[JAK_COOKIE_DEVICE],$_COOKIE[JAK_COOKIE_THEME])) {
    define('JAK_ENV_DEVICE', $_COOKIE[JAK_COOKIE_DEVICE]);
    define('JAK_ENV_THEME' , $_COOKIE[JAK_COOKIE_THEME]);
}
//old
//<link rel="stylesheet" type="text/css" id="yuibasecss" href="http://yui.yahooapis.com/3.10.1/build/cssfonts/fonts-min.css?3.10.1/build/cssreset/reset-min.css&3.10.1/build/cssbase/base-min.css">
define('YUI_CSS'                ,'<link rel="stylesheet" type="text/css" href="http://yui.yahooapis.com/3.10.1/build/cssnormalize/cssnormalize-min.css">');
define('YUI_JS'                 ,'<script type="text/javascript" src="http://yui.yahooapis.com/combo?3.10.1/build/yui/yui-min.js&3.10.1/build/loader/loader-min.js"></script>');
define('JAK_SALT'                ,'SALT'); //userLogon Challenge Handshake AP - salt initializer
define('JAK_MEMBER'              ,'member'); //refer userLogon
define('JAK_USERLOGON_REMEMBER'  , 'userLogon-remember');

define('JAK_FILESERVER','jak');
define('JAK_SERVER','jak');

define('ROOT', realpath(dirname(__FILE__) . '/..'));

ini_set('display_errors','On'); //production change to Off

if ($_SERVER['SERVER_ADMIN'] == 'joe@dargaville.net') {
    $mysqli = new \mysqli('localhost', 'root', 'joe123', 'jak');
} else {
    $mysqli = new \mysqli('localhost', 'root', 'root', 'jak');
}
//else {
//    $mysqli = new \mysqli('jakpest.db.11127692.hostedresource.com', 'jakpest', 'j@Kp35t01', 'jakpest');
//}

/**
 *  shared PHP functions
 */
function exitIfNotConnected() {
    if (!isset($_SESSION[JAK_MEMBER])) {exit('{connected:false,error:"not connected"}');}
}
/**
 *
 *  emulate generic fetch
 *
 *  Note:
 *  - Need to determine if this sort of approach is okay with text/blob fields?
 *  - table field names must not conflict with local variables, used __variable__ to try to ensure uniqueness
 */
/**
 *  usual fetch data
 *
 *  @parameters
 *  __stmt__ reference to mysqli resource
 *  __fieldName__ whether to use field as primary key
 *  __keys__ true resolve result to [key=>value,...] or false [value,...]
 */
function fetch_result(&$__stmt__,$__fieldName__=null,$__keys__=true) {
    $__meta__ = $__stmt__->result_metadata();
    $__columns__ = array();
    $__dataStructure__ = $__fieldName__==null ? array() : new \stdClass;
    while ($__field__ = $__meta__->fetch_field()) {
        $var = $__field__->name;
        $__columns__[$var] = &$$var;
    }
    call_user_func_array(array($__stmt__,'bind_result'),$__columns__);
    while ($__stmt__->fetch()) {
        $__c__ = $__keys__ ? (object)array() : array();
        foreach($__columns__ as $k=>$v) {
            $__keys__
                ?$__c__->{$k} = $v
                :$__c__[] = $v;
        }
        $__fieldName__==null
            ?$__dataStructure__[] = $__c__
            :$__dataStructure__->{$$__fieldName__} = $__c__;
    }
    return $__dataStructure__;
}
/**
 *  fetch data purely as numeric arrays and includes meta data to resolve field names
 *
 *  @parameters
 *  __stmt__ reference to mysqli resource
 */
function fetch_info(&$__stmt__) {
    $__meta__ = $__stmt__->result_metadata();
    $__columns__ = array();
    $__dataStructure__ = array();
    while ($__field__ = $__meta__->fetch_field()) {
        $var = $__field__->name;
        $__columns__[$var] = &$$var;
    }
    call_user_func_array(array($__stmt__,'bind_result'),$__columns__);
    while ($__stmt__->fetch()) {
        $c = array();
        foreach($__columns__ as $v) {$c[] = $v;}
        $__dataStructure__[] = $c;
    }
    return (object)array(
        'meta' => $__meta__->fetch_fields()
       ,'data' => $__dataStructure__
    );
}
function firstElement($o) {foreach($o as $v) {return $v;}}
/**
 *  dbTables
 */
if ($stmt = $mysqli->prepare("select id,name from `dbTable`")) {
    $stmt->execute();
    $stmt->bind_result($id,$name);
    while ($stmt->fetch()) {
        $dbTable[$id]   = $name;
        $dbTable[$name] = $id;
    }
    $stmt->close();
}
function sql_fields($arr, $prefix = '') {
    if (!isset($arr) || !is_array($arr) || count($arr)==0) {return '*';}
    if ($prefix != '' && substr($prefix, -1) != '.') {$prefix .= '.';}
    return $prefix . implode(",$prefix", $arr);
}
