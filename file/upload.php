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



$directory_path = "//file/";

$path = $directory_path.basename($_FILES['Filedata']['name']);

// multi file
foreach ($_FILES as $fieldName => $file) {
    move_uploaded_file($_FILES['Filedata']['tmp_name'], $path);
}


try{
    if (isset($_FILES['Filedata'] )) {
        move_uploaded_file($_FILES['Filedata']['tmp_name'], "/dev/null");
        $name = $_FILES['Filedata']['name'];


        $files = print_r($_FILES['Filedata'], true);
        $post = print_r($_POST, true);
        $get = print_r($_GET,true);

        echo "filename: $name<br>";
        echo "POST: $post <br>";
        echo "GET: $get <br>";
        echo "FILES: $files <br>";
    }
}catch(Exception $ex){
    echo "We are sorry, an error occurred trying to save the file: $ex->getMessage()";
}


