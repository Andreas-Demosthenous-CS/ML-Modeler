<?php

$options = json_decode(file_get_contents('php://input'));
$field_to_sort_by = $options->field;
$ascending = $options->ascending;

$experiments = array();

//Use composer to load dependencies of mongodb into the working directory

//load mongodb lib file
require 'vendor/autoload.php';
$connection = new MongoDB\Driver\Manager("mongodb://localhost:27017");

$filter = [];
$options = ['sort' => [$field_to_sort_by => $ascending]];

$query = new MongoDB\Driver\Query($filter, $options);
$experiments_docs = $connection->executeQuery('MLWebsite.Experiments', $query);
#$experiments_docs->sort(['id' => 1]);

foreach ($experiments_docs as $exp) {
    unset($exp->_id);
    $experiments[] = $exp;
}

echo json_encode($experiments)

?>