<?php /** //css/combine.css.php
 *
 *  combine css files
 */
namespace ja;
require_once 'config.php';
header('Content-type: text/css');

include 'base.css';
include 'ja.css';
include 'yui3.css'; //yui3 overrides

//passed css files, also include specific device extensions
foreach ($_GET as $k => $v) {
    //PHP replaces dots and spaces with underscores (condition: server css suffix must be lowercase)
    $cssFile = str_replace('_css','.css',$k);
    if (file_exists($cssFile)) include $cssFile;
}
