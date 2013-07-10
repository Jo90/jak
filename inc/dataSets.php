<?php
/** //inc/dataSets.php
 *
 */
namespace ja;

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
     *  prop
     */
    if (in_array('prop',$arr) && $stmt = $mysqli->prepare("select * from `prop`")) {
        $stmt->execute();
        $rs->prop = fetch_info($stmt);
        $stmt->close();
    }
    /**
     *  qa
     */
    if (in_array('qa',$arr) && $stmt = $mysqli->prepare("select * from `qa`")) {
        $stmt->execute();
        $rs->qa = fetch_info($stmt);
        $stmt->close();
    }
    /**
     *  qaLink
     */
    if (in_array('qaLink',$arr) && $stmt = $mysqli->prepare("select * from `qaLink`")) {
        $stmt->execute();
        $rs->qaLink = fetch_info($stmt);
        $stmt->close();
    }
    /**
     *  tagOption
     */
    if (in_array('tagOption',$arr) && $stmt = $mysqli->prepare("select * from `tagOption`")) {
        $stmt->execute();
        $rs->tagOption = fetch_info($stmt);
        $stmt->close();
    }
    /**
     *  service
     */
    if (in_array('service',$arr) && $stmt = $mysqli->prepare("select * from `service` order by seq,name")) {
        $stmt->execute();
        $rs->service = fetch_info($stmt);
        $stmt->close();
    }
    if ($echo) {
        echo PHP_EOL , '//core info'
            ,PHP_EOL , 'if(!window.JA){var JA={};}'
            ,PHP_EOL , 'if(!JA.data){JA.data={};}'
            ,PHP_EOL , 'JA.data=' , json_encode($rs) , ';';
    } else return $rs;
}
