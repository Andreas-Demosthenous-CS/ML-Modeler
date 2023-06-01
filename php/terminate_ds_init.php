<?php
use MongoDB\Operation\UpdateOne;

$json_dataset_id = file_get_contents('php://input');
$json_dataset_id_decoded = json_decode($json_dataset_id);

//load mongodb lib file
require 'vendor/autoload.php';
$connection = new MongoDB\Client("mongodb://localhost:27017");

$collection = $connection->MLWebsite->Datasets;

$filter = ['id' => $json_dataset_id_decoded];
$update = ['status' => 'Terminated', 'kill' => 1];
$options = ['multi' => false, 'upsert' => false];

$collection->updateOne($filter, ['$set' => $update], $options);

?>