<?php

 $json_dataset_id = file_get_contents('php://input');
 $dataset_id_decoded = json_decode($json_dataset_id);

//load mongodb lib file
require 'vendor/autoload.php';
$connection = new MongoDB\Client("mongodb://localhost:27017");


$collection = $connection->MLWebsite->Datasets;

$collection->deleteOne(['id' => $dataset_id_decoded]);

?>