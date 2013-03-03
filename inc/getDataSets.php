<?php
/** //inc/getDataSets.php?d[]=dataSet1&[]=dataSet2&...
 *
 */
namespace jak;

require 'dataSets.php';
header('Content-type: application/json');
echo json_encode(dataSets($_REQUEST['d']));
