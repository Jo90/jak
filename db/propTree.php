<?php
/** /db/propTree.php
 *
 * generate propTree records from rules in prop
 */
namespace ja;

$r = new \stdClass;

echo '<h3>Build propTree ', date('l jS \of F Y h:i:s A') , '</h3>';

    if ($stmt = $mysqli->prepare("select * from `prop`")) {
        $r->propSuccess = $stmt->execute();
        $r->propRows = $mysqli->affected_rows;
        $r->prop = \ja\fetch_result($stmt,'id');
        $stmt->close();
    }
    if ($stmt = $mysqli->prepare("select * from `propType`")) {
        $r->propTypeSuccess = $stmt->execute();
        $r->propTypeRows = $mysqli->affected_rows;
        $r->propType = \ja\fetch_result($stmt,'id');
        $stmt->close();
    }
    if ($stmt = $mysqli->prepare("select * from `propLink`")) {
        $r->propLinkSuccess = $stmt->execute();
        $r->propLinkRows = $mysqli->affected_rows;
        $r->propLink = \ja\fetch_result($stmt,'id');
        $stmt->close();
    }

    if ($stmt = $mysqli->prepare(
        "select p.id, p.name, group_concat(ptp.id separator ', ') as 'types'
           from prop     as p,
                propType as pt,
                prop     as ptp
          where p.id=pt.prop
            and pt.propType=ptp.id
       group by p.id, p.name"
    )) {
        $r->v_prop_typesSuccess = $stmt->execute();
        $r->v_prop_typesRows = $mysqli->affected_rows;
        $r->v_prop_typeId = \ja\fetch_result($stmt,'id');
        $stmt->close();
    }

    //start with prop with type 'site'
    foreach ($r->v_prop_typeId as $propType) {
        if ($propType->name == 'site') {$propRoot = $propType;}
    }

function getNodeTypes($node) {
    global $r;
    foreach ($r->v_prop_typeId as $prop) {
        if ($prop->id == $node) {$arr = explode(',', $prop->types);}
    }
    return isset($arr) ? $arr : false;
}

function getNodesOfType($type) {
    global $r;
    $arr = array();
    foreach ($r->v_prop_typeId as $prop) {
        if (in_array($type, explode(',', $prop->types))) {
            $arr[] = $prop->id;
        }
    }
    return count($arr)>0 ? $arr : false;
}

function nodeChildren($node) {
    global $r;
    $typeChildren = array();
    if ($types = getNodeTypes($node)) {
        foreach ($r->propLink as $pl) {
            if (in_array($pl->prop, $types)) {$typeChildren[] = $pl->child;}
        }
    }
    return count($typeChildren)>0 ? $typeChildren : false;
}

function buildTree($node) {
    global $r;
    if (!($nodeChildren = nodeChildren($node))) return;
    $tree = new \stdClass;
    foreach ($nodeChildren as $child) {
        $childNodeTypes = getNodeTypes($child);
        foreach ($childNodeTypes as $childType) {
            //if a propType get any associated nodes
            if ($childType == 1 && ($nodesOftype = getNodesOfType($child))) {
                foreach ($nodesOftype as $branchNode) {
                    $tree->{$branchNode} = buildTree($branchNode);
                }
            }
        }
    }
    return $tree;
}
file_put_contents('propTree.json', json_encode((object) array($propRoot->id=>buildTree($propRoot->id))));
