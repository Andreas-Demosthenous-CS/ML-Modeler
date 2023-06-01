<?php

$json_experiment = file_get_contents('php://input');
$json_experiment_decoded = json_decode($json_experiment);
$json_experiment_decoded->id = uniqid();

//load mongodb lib file
require 'vendor/autoload.php';
$connection = new MongoDB\Client("mongodb://localhost:27017");
// $connection = new MongoDB\Client("mongodb://admin:Kpi3qwSwQp6fP7zS@SG-AndreasDimos-57315.servers.mongodirector.com:27017/admin");
$collection = $connection->MLWebsite->Experiments;

$collection->insertOne($json_experiment_decoded);

#only for windows environment as the server
shell_exec('cmd /c "cd ../python & start /b python experiments_handler.py" '.$json_experiment_decoded->id);

?>