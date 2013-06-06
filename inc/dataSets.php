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
     *  propPartTag
     */
    if (in_array('propPartTag',$arr) && $stmt = $mysqli->prepare("select * from `propPartTag` order by name")) {
        $stmt->execute();
        $rs->propPartTag = fetch_info($stmt);
        $stmt->close();
    }
    /**
     *  propPartType
     */
    if (in_array('propPartType',$arr) && $stmt = $mysqli->prepare("select * from `propPartType` order by name")) {
        $stmt->execute();
        $rs->propPartType = fetch_info($stmt);
        $stmt->close();
    }
    /**
     *  propPartTypeTag
     */
    if (in_array('propPartTypeTag',$arr) && $stmt = $mysqli->prepare("select * from `propPartTypeTag`")) {
        $stmt->execute();
        $rs->propPartTypeTag = fetch_info($stmt);
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
     *  propTemplatePart
     */
    if (in_array('propTemplatePart',$arr) && $stmt = $mysqli->prepare("select * from `propTemplatePart` order by seq")) {
        $stmt->execute();
        $rs->propTemplatePart = fetch_info($stmt);
        $stmt->close();
    }
    /**
     *  question
     */
    if (in_array('question',$arr) && $stmt = $mysqli->prepare("select * from `question`")) {
        $stmt->execute();
        $rs->question = fetch_info($stmt);
        $stmt->close();
    }
    /**
     *  questionMatrix
     */
    if (in_array('questionMatrix',$arr) && $stmt = $mysqli->prepare("select * from `questionMatrix` order by service,seq")) {
        $stmt->execute();
        $rs->questionMatrix = fetch_info($stmt);
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
