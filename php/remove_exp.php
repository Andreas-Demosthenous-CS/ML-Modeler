<?php

 $json_experiment_id = file_get_contents('php://input');
 $experiment_id_decoded = json_decode($json_experiment_id);

//load mongodb lib file
require 'vendor/autoload.php';
$connection = new MongoDB\Client("mongodb://localhost:27017");


$collection = $connection->MLWebsite->Experiments;

$collection->deleteOne(['id' => $experiment_id_decoded]);

?>