<?php
/** //db/email.php
 *
 */
namespace ja;

require_once 'common.php';

$post = json_decode(file_get_contents('php://input'));

foreach ($post as $i) {

    $r = initResult($criteria);

    //sentry
        if (!isset($i->criteria->email, $i->criteria->subject, $i->criteria->message)) {$r->log[] = 'invalid parameters'; continue;}

    $r->success = mail($i->criteria->email, $i->criteria->subject, $i->criteria->message);

}
$mysqli->close();
header('Content-type: text/plain');
echo json_encode($post);
