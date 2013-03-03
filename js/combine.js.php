<?php //  //js/combine.css.php

$separator = substr(PHP_OS,0,3)=='WIN' ? '' : '/';

if(isset($_GET['file'])){
    $f = fopen($_SERVER['DOCUMENT_ROOT'] . $separator . $_GET['file'], 'w');
}

foreach ($_GET as $k => $v) {
    //PHP replaces dots and spaces with underscores (condition: server file suffix must be lowercase)
    $jsFile = str_replace('_js','.js',$k);
    $file = $_SERVER['DOCUMENT_ROOT'] . $separator . $jsFile;
    if (file_exists($file)) {
        include $file;
        if(isset($_GET['file'])){
            fwrite($f, file_get_contents($file));
        }
    }
}

if(isset($_GET['file'])){
    fclose($f);
}
