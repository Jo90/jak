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
     *  propItemType
     */
    if (in_array('propItemType',$arr) && $stmt = $mysqli->prepare("select * from `propItemType` order by name")) {
        $stmt->execute();
        $rs->propItemType = fetch_info($stmt);
        $stmt->close();
    }

    /**
     *  propTemplate
     */
    if (in_array('propTemplate',$arr) && $stmt = $mysqli->prepare("select * from `propTemplate` order by name")) {
        $stmt->execute();
        $rs->propTemplate = fetch_info($stmt);
        $stmt->close();
    }

    /**
     *  propTemplateItem
     */
    if (in_array('propTemplateItem',$arr) && $stmt = $mysqli->prepare("select * from `propTemplateItem` order by propTemplate,seq")) {
        $stmt->execute();
        $rs->propTemplateItem = fetch_info($stmt);
        $stmt->close();
    }

    if ($echo) {
        echo PHP_EOL , '//core info'
            ,PHP_EOL , 'if(!window.JAK){var JAK={};}'
            ,PHP_EOL , 'if(!JAK.data){JAK.data={};}'
            ,PHP_EOL , 'JAK.data=' , json_encode($rs) , ';';
    } else return $rs;
}