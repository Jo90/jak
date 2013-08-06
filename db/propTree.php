<?php
/** /db/propTree.php
 *
 *  generate propTree JSON from rules in prop, propType and propChild
 */
namespace ja;

date_default_timezone_set('Australia/NSW');

$r = new \stdClass;

echo '<h3>Build propTree ', date('l jS \of F Y h:i:s A') , '</h3>';

    if ($stmt = $mysqli->prepare("select * from `prop`")) {
        $r->propSuccess = $stmt->execute();
        $r->prop = \ja\fetch_result($stmt,'id');
        $stmt->close();
    }
    if ($stmt = $mysqli->prepare("select * from `propType`")) {
        $r->propTypeSuccess = $stmt->execute();
        $r->propType = \ja\fetch_result($stmt,'id');
        $stmt->close();
    }
    if ($stmt = $mysqli->prepare("select * from `propChild`")) {
        $r->propChildSuccess = $stmt->execute();
        $r->propChild = \ja\fetch_result($stmt,'id');
        $stmt->close();
    }

function propChildren($propIdArr) {
    global $r;
    $children = array();
    foreach ($r->propChild as $propChild) {
        if (in_array($propChild->prop, $propIdArr)) {$children[] = $propChild->child;}
    }
    //if child is type get all of type
    $childs = $children;
    foreach ($childs as $child) {
        $prop = $r->prop->{$child};
        if ($prop->type) {
            foreach ($r->propType as $propType) {
                if ($propType->type == $prop->id) {
                    $children[] = $propType->prop;
                }
            }
        }
    }
    //remove meta child
    foreach ($children as $key=>$child) {
        $prop = $r->prop->{$child};
        if ($prop->type) {
            unset($children[$key]);
        }
    }
    return $children;
}

function buildTree($propIds) {
    global $r;
    $propIdArr = $propIds;
    foreach ($propIds as $propId) {
        $prop = $r->prop->{$propId};
        if (!$prop->type) {//actual prop part
            //get any types
            foreach ($r->propType as $propType) {
                if ($propType->prop == $propId) {
                    $propIdArr[] = $r->prop->{$propType->type}->id;
                }
            }
        }
    }
    $propChildren = propChildren($propIdArr);
    if (!is_array($propChildren)) return null;

    $tree = new \stdClass;
    foreach ($propChildren as $childId) {
        $tree->{$childId} = buildTree(array($childId));
    }
    return $tree;
}

//start with prop with type 'site'
foreach ($r->prop as $prop) {
    if ($prop->name == 'site') {$propRoot = $prop;}
}
print_r(buildTree(array($propRoot->id)));
file_put_contents('propTree.json', json_encode((object) array($propRoot->id=>buildTree(array($propRoot->id)))));
