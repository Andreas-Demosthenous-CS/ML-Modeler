<?php
use MongoDB\Operation\UpdateOne;

$json_experiment_id = file_get_contents('php://input');
$experiment_id_decoded = json_decode($json_experiment_id);

//$bat_command = "get_Experiments.bat";
//shell_exec($bat_command);

//load mongodb lib file
require 'vendor/autoload.php';
$connection = new MongoDB\Client("mongodb://localhost:27017");

$collection = $connection->MLWebsite->Experiments;

$filter = ['id' => $experiment_id_decoded];
$update = ['status' => 'Terminated', 'kill' => 1];
$options = ['multi' => false, 'upsert' => false];

$collection->updateOne($filter, ['$set' => $update], $options);

?>