<?php
//recursive function that recusrively searches for a name that is not already used 
//e.g. for sampleName the function will make the following searches until it hits un unused name:
// sampleName, sampleName(1),sampleName(2), sampleName(3) ...
function generateValidName($cnt, $name)
{
  //load mongodb lib file
  require 'vendor/autoload.php';
  $connection = new MongoDB\Client("mongodb://localhost:27017");

  $collection = $connection->MLWebsite->Datasets;
  
  $temp_name = $name;
  if($cnt <= 0){
    $nameOccurances = $collection->countDocuments(['name' => $name]);
  }
  else{
    $temp_name = $name."(".$cnt.")";
    $nameOccurances = $collection->countDocuments(['name' => $temp_name]);
  }
  
  if($nameOccurances <= 0){
    return $temp_name;
  }
  else{
    return generateValidName($cnt+1, $name);
  }

}


if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_FILES["file"])) {

  $ds_name = $_POST["ds_name"];

  $file = $_FILES["file"];
  $filename = $file["name"];
  $filetype = $file["type"];
  $filesize = $file["size"];
  $filetmpname = $file["tmp_name"];

  $uploadsDir = "../python/datasets/";
  $dsDir = $uploadsDir . '/' . $ds_name . '/';
  $uploadFilePath = $dsDir . $filename;

  // Check if file was uploaded successfully
  if ($file["error"] !== UPLOAD_ERR_OK) {
    http_response_code(500);
    echo "Error uploading file: " . $file["error"];
    http_response_code(400);

    if (is_dir($dsDir)) {
      removeDirectory($dsDir);
    } else {
      echo "Directory does not exist.";
    }

    exit();
  }

  // Check if file is of allowed type
  $allowedTypes = ["application/vnd.ms-excel", "text/csv"];
  if (!in_array($filetype, $allowedTypes)) {
    http_response_code(400);
    echo "Error: only .xlsx and .csv files are allowed.";
    exit();
  }

  // Move file from temporary directory to uploads directory
  $uploadsDir = "uploads/";
  if (!is_dir($uploadsDir)) {
    mkdir($uploadsDir);
  }
  if (!is_dir($dsDir)) {
    mkdir($dsDir);
  }

  if (move_uploaded_file($filetmpname, $uploadFilePath)) {
    echo "File uploaded successfully.";
  } else {
    http_response_code(500);
    echo "Error uploading file.";
    exit();
  }
} else {

  echo "Error: Invalid request.";
  exit();
}

function removeDirectory($dir)
{
  if (is_dir($dir)) {
    $files = array_diff(scandir($dir), array('.', '..'));
    foreach ($files as $file) {
      $path = $dir . '/' . $file;
      if (is_dir($path)) {
        removeDirectory($path);
      } else {
        unlink($path);
      }
    }
    return rmdir($dir);
  }
  return false;
}
?>