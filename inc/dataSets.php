<?php
/** //inc/dataSets.php
 *
 */
namespace jak;

function dataSets($arr, $echo=false) {
    global $mysqli;
    $rs = new \stdClass;
    /**
     *  dbTable
     */
    if (in_array('dbTable',$arr) && $stmt = $mysqli->prepare("select * from `dbTable` order by name")) {
        $stmt->execute();
        $rs->dbTable = fetch_info($stmt);
        $stmt->close();
    }
    /**
     *  grp
     */
    if (in_array('grp',$arr) && $stmt = $mysqli->prepare("select * from `grp` order by name")) {
        $stmt->execute();
        $rs->grp = fetch_info($stmt);
        $stmt->close();
    }

    if ($echo) {
        echo PHP_EOL , '//core info'
            ,PHP_EOL , 'if(!window.JAK){var JAK={};}'
            ,PHP_EOL , 'if(!JAK.data){JAK.data={};}'
            ,PHP_EOL , 'JAK.data=' , json_encode($rs) , ';';
    } else return $rs;
}