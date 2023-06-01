<?php

$json_experiment = file_get_contents('php://input');
$json_experiment_decoded = json_decode($json_experiment, true);
$json_experiment_decoded_id_to_replace = $json_experiment_decoded['id'];


// unset($json_experiment_decoded['_id']);

//load mongodb lib file
require 'vendor/autoload.php';
$connection = new MongoDB\Client("mongodb://localhost:27017");

$collection = $connection->MLWebsite->Experiments;

$filter = ['id' => $json_experiment_decoded_id_to_replace];
$options = ['upsert' => false];

$collection->replaceOne($filter, $json_experiment_decoded, $options);

#only for windows environment as the server
shell_exec('cmd /c "cd ../python & start /b python experiments_handler.py" '.$json_experiment_decoded_id_to_replace);

?>