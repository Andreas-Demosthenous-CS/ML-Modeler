<?php

$options = json_decode(file_get_contents('php://input'));
$field_to_sort_by = $options->field;
$ascending = $options->ascending;

$datasets = array();

require 'vendor/autoload.php';
$connection = new MongoDB\Driver\Manager("mongodb://localhost:27017");

$filter = [];
$options = ['sort' => [$field_to_sort_by => $ascending]];

$query = new MongoDB\Driver\Query($filter, $options);
$datasets_docs = $connection->executeQuery('MLWebsite.Datasets', $query);

foreach ($datasets_docs as $ds) {
    $datasets[] = $ds;
}


echo json_encode($datasets);

?>