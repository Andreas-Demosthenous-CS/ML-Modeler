<?php

$ds_properties = file_get_contents('php://input');
$ds_properties_decoded = json_decode($ds_properties);
$ds_properties_decoded->id = uniqid();


//load mongodb lib file
require 'vendor/autoload.php';
$connection = new MongoDB\Client("mongodb://localhost:27017");

$collection = $connection->MLWebsite->Datasets;

$collection->insertOne($ds_properties_decoded);

#only for windows environment as the server
shell_exec('cmd /c "cd ../python & start /b python dataset_init_handler.py" '.$ds_properties_decoded->id);

?>