<?php
/* //file/upload.php
 */

//XHR2
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    exit;
} else {
    header('Access-Control-Allow-Origin: *');
}

define ('SITE_ROOT', realpath(dirname(__FILE__)));
$data = json_decode($_POST['data']);
$data->post = $_FILES;

//multi file (currently each file sent seperately, future?)
foreach ($_FILES as $fieldName => $file) {
    if (isset($data->address)) {
        $dir = SITE_ROOT . '/address/' . $data->address;
        @mkdir($dir);
        $data->success = move_uploaded_file($_FILES['Filedata']['tmp_name'], $dir . '/' . $_FILES['Filedata']['name']);
    }
    if (isset($data->usr)) {
        $dir = SITE_ROOT . '/usr/' . $data->usr;
        @mkdir($dir);
        $data->success = move_uploaded_file($_FILES['Filedata']['tmp_name'], $dir . '/' . $_FILES['Filedata']['name']);
    }
}
unset($data->post['Filedata']['tmp_name']);
header('Content-type: text/plain');
echo json_encode($data);