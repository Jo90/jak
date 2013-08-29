<?php
/* //file/upload.php
 */

//XS access
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    exit;
} else {
    header('Access-Control-Allow-Origin: *');
}

define ('SITE_ROOT', realpath(dirname(__FILE__)));

$data = json_decode($_POST['data']);

// multi file
foreach ($_FILES as $fieldName => $file) {
    if (isset($data->address)) {
        $dir = SITE_ROOT . '/address/' . $data->address;
        mkdir($dir);
        move_uploaded_file($_FILES['Filedata']['tmp_name'], $dir . '/' . $_FILES['Filedata']['name']);
    }
    if (isset($data->usr)) {
        $dir = SITE_ROOT . '/usr/' . $data->usr;
        mkdir($dir);
        move_uploaded_file($_FILES['Filedata']['tmp_name'], $dir . '/' . $_FILES['Filedata']['name']);
    }
}
