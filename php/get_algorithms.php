<?php

$algorithms = array();

require 'vendor/autoload.php';
$connection = new MongoDB\Driver\Manager("mongodb://localhost:27017");

$filter = [];
$options = [];

$query = new MongoDB\Driver\Query($filter, $options);
$algorithms_docs = $connection->executeQuery('MLWebsite.Algorithms', $query);

foreach ($algorithms_docs as $ds) {
    $algorithms[] = $ds;
}


echo json_encode($algorithms);

?>