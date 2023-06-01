var datasetFiles = []
const fileUploadContainer = document.querySelector(".file-upload-container");
fileUploadContainer.addEventListener("dragover", (e) => {
    e.preventDefault();
    fileUploadContainer.classList.add("dragging");
});
fileUploadContainer.addEventListener("dragleave", (e) => {
    e.preventDefault();
    fileUploadContainer.classList.remove("dragging");
});
fileUploadContainer.addEventListener("drop", (e) => {
    e.preventDefault();
    fileUploadContainer.classList.remove("dragging");
    const files = e.dataTransfer.files;
    for (let i = 0; i < files.length; i++) {
        if (files[i].type === "application/vnd.ms-excel" || files[i].type === "text/csv") {
            displayFileInfo(files[i]);
        } else {
            alert(`File ${files[i].name} is not a valid .xlsx or .csv file and will not be uploaded!`);
        }
    }
});
const fileUploadInput = document.querySelector(".file-upload-input");
fileUploadInput.addEventListener("change", (e) => {
    const files = e.target.files;
    for (let i = 0; i < files.length; i++) {
        if (files[i].type === "application/vnd.ms-excel" || files[i].type === "text/csv") {
            displayFileInfo(files[i]);
        } else {
            alert(`File ${files[i].name} is not a valid .xlsx or .csv file and will not be uploaded!`);
        }
    }
});

function displayFileInfo(file) {
    newFile = new DatasetFile(file, file.name, file.type, formatFileSize(file.size))
    datasetFiles.push(newFile)
    add_file(newFile)
    updateFilesCnt(datasetFiles.length)
    // uploadFile(file)
    // Here you can use AJAX or fetch to upload the file to your server
}

function add_file(dataset_file) {
    let model_text = dataset_file.string_text

    let div_elem = document.createElement('div')
    div_elem.id = dataset_file.string_text
    div_elem.className = "mt-rem035"

    let parent_elem = document.getElementById('files_platform')

    let span_elem_Text = document.createElement('span')
    span_elem_Text.className = "badge badge-info"
    span_elem_Text.id = "platform_" + dataset_file.string_text
    span_elem_Text.innerHTML = model_text

    div_elem.append(span_elem_Text)


    let span_elem_remButton = document.createElement('span')
    span_elem_remButton.className = "tooltip badge tag-func cursor"

    let tooltip_elem = document.createElement("span")
    tooltip_elem.className = "tooltiptext"
    tooltip_elem.innerHTML = "Remove"
    tooltip_elem.style.bottom = "125%"


    span_elem_remButton.append(tooltip_elem)

    let rem_button = document.createElement("i")
    rem_button.className = "fa fa-trash-o"
    rem_button.title = "Remove"
    rem_button.onclick = function () {
        const index = datasetFiles.findIndex(file => { return file.string_text == dataset_file.string_text });
        if (index > -1) { // only splice array when item is found
            datasetFiles.splice(index, 1); // 2nd parameter means remove one item only
            div_elem.remove()
            updateFilesCnt(datasetFiles.length)
        }

    }

    span_elem_remButton.append(rem_button)

    div_elem.append(span_elem_remButton)

    parent_elem.append(div_elem)

    // if (type == "Model Training") {
    //   updateModelsCnt(dataset_configs[selected_exp_index].models_list.length)
    // }

}
function updateFilesCnt(cnt) {
    //rebuild element displaying amount of models on the screen
    document.getElementById("files_cnt").innerHTML = "<label id = 'files_cnt'>" + cnt +
        " files selected: <a class = 'cursor' onclick = 'clearAllFiles()'>clear all</a></label>"
}

function clearAllFiles() {
    for (let file of datasetFiles) {
        document.getElementById(file.string_text).remove()
    }
    datasetFiles = []
    updateFilesCnt(0)
}

function isNumeric(str) {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
        !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}

//validates the defined name of the dataset
function checkName(name) {
    if (name.length < 1) {
        return [false, "Invalid name. Name cannot be empty"]
    }
    if (name.length > 40) {
        return [false, "Invalid name. Name cannot contain > 40 characters"]
    }
    for (var char of name) {
        if (!(char >= 'a' && char <= 'z' || char >= 'A' && char <= 'Z' || char >= '0' && char <= '9' || char == '_' || char == '-')) {
            return [false, "Invalid name. Character " + char + " is not valid. Only alphanumeric characters, '-' and '_' are allowed"]
        }
    }
    return [true]
}

async function uploadDatasets() {

    let ds_name = document.getElementById("ds_name").value
    let target_col_index = document.getElementById("ds_target_index").value
    let type = document.querySelector("#dropDownMenu option:checked").value

    if (datasetFiles.length < 1) {
        generatePopup("error", "No files selected! Please specify your dataset files")
        return;
    }

    var nameValid = checkName(ds_name)
    if (nameValid[0] != true) {
        generatePopup("error", nameValid[1]);
        return
    }

    if (!isNumeric(target_col_index) || Number(target_col_index) < -1) {
        generatePopup("error", "Target column index must be an integer >= -1!")
        return;
    }

    if (!isNumeric(target_col_index) || Number(target_col_index) < -1) {
        generatePopup("error", "Target column index must be an integer >= -1!")
        return;
    }
    let properties = {
        "name": ds_name,
        "target_index": target_col_index,
        "type": type,
        "date": new Date(),
        "status": "Queued",
        "memUsage": "0.00%",
        "cpuUsage": "0.00%"
    }


    // Get references to HTML elements
    const popupContainer = document.querySelector("#upload-popup-container");
    // const progressBarFill = document.querySelector("#progress-bar-fill");
    const fileList = document.querySelector("#file-list");
    const cancelBtn = document.querySelector("#cancel-btn");

    // Show popup container
    popupContainer.style.display = "block";
    // Create array to hold file objects with progress data
    const fileObjects = [];

    // Loop through files and create file objects with progress data
    for (let i = 0; i < datasetFiles.length; i++) {
        const fileObject = {
            file: datasetFiles[i].file,
            progress: 0,
            loaded: 0,
            total: 0
        };

        fileObjects.push(fileObject);
    }
    // Loop through file objects and upload each file
    fileObjects.forEach(function (fileObject, index) {
        // Create FormData object to send file
        const formData = new FormData();
        formData.append("ds_name", ds_name);
        formData.append("file", fileObject.file);
        // Create XMLHttpRequest object
        const xhr = new XMLHttpRequest();

        // Add event listener for progress updates
        xhr.upload.addEventListener("progress", function (event) {
            if (event.lengthComputable) {
                // Update progress data for file object
                fileObject.progress = event.loaded / event.total;
                fileObject.loaded = event.loaded;
                fileObject.total = event.total;

                // Update progress bar and label for file
                const progressBar = document.querySelector(`#file-${index} .progress-bar`);
                progressBar.style.width = `${fileObject.progress * 100}%`;

                const bytesUploaded = fileObject.loaded;
                const bytesTotal = fileObject.total;
                const progressLabel = `${formatFileSize(bytesUploaded)} / ${formatFileSize(bytesTotal)} bytes uploaded`;
                const progressText = document.querySelector(`#file-${index} .progress-text`);
                progressText.textContent = progressLabel;
                if (fileObject.progress === 1) {
                    const filename = document.querySelector(`#file-name-${index}`);
                    filename.innerHTML += "<i class = 'fa-solid fa-check' style = 'color:green; margin-left:15px;'></i>Completed"
                }
                // Check if all files have finished uploading
                const allFilesFinished = fileObjects.every(function (fileObject) {
                    return fileObject.progress === 1;
                });

                if (allFilesFinished) {
                    // Hide popup container when all files have finished uploading
                    popupContainer.innerHTML = '<div id="buttons"><button id="cancel-btn">Cancel</button></div><div id="file-list"></div>'
                    popupContainer.style.display = 'none'
                    generatePopup("info", fileObjects.length + " files uploaded successfully!")

                    //sending the initialization command
                    initializeDataset(properties)
                }
            }
        });
        cancelBtn.addEventListener("click", function () {
            xhr.abort()
            // Hide popup container when all files have finished uploading
            popupContainer.innerHTML = '<div id="buttons"><button id="cancel-btn">Cancel</button></div><div id="file-list"></div>'
            popupContainer.style.display = 'none'
            generatePopup("info", "Upload cancelled")
        })

        xhr.addEventListener("load", function (event) {
            if (xhr.status >= 400) {
                generatePopup("error", fileObject.file + " upload Error. status code = " + xhr.statusText)
            }
        });

        // Set file index property on XMLHttpRequest object
        xhr.fileIndex = index;

        // Send XMLHttpRequest object with FormData object
        xhr.open("POST", "php/upload_ds.php");
        xhr.send(formData);

        // Add file item to file list in popup
        const fileItem = document.createElement("div");
        fileItem.setAttribute("id", `file-${index}`);
        fileItem.setAttribute("class", "file-item");

        const fileName = document.createElement("div");
        fileName.setAttribute("class", "file-name");
        fileName.setAttribute("id", `file-name-${index}`);
        fileName.textContent = fileObject.file.name;

        const progressContainer = document.createElement("div");
        progressContainer.setAttribute("class", "progress-container");

        const progressBar = document.createElement("div");
        progressBar.setAttribute("class", "progress-bar");

        const progressText = document.createElement("div");
        progressText.setAttribute("class", "progress-text");
        progressContainer.appendChild(progressBar);
        progressContainer.appendChild(progressText);

        fileItem.appendChild(fileName);
        fileItem.appendChild(progressContainer);
        fileList.appendChild(fileItem);
    });

}

function submit() {
    uploadDatasets();
}

function generatePopup(popupType, message) {
    
    if (message.length > 200) {
        message = message.substring(0, 200) + " ... "
    }

    const popupContainer = document.getElementById('popup-container');
    const popupContent = document.getElementById('popup-content');
    popupContent.innerHTML = ""

    if (popupType == "info") {

        popupContainer.style.backgroundColor = "#0069d9";
        popupContent.innerHTML = "<div class = 'fas fa-info-circle' style = 'text-align:center;position:absolute;top:14%;left:45%;'></div><p style='margin-top:25px;'>" + message + "</p>"

    }
    else if (popupType == "error") {
        popupContainer.style.backgroundColor = "red";
        popupContent.innerHTML = "<div class = 'fa fa-exclamation-triangle' style = 'text-align:center;position:absolute;top:14%;left:45%;'></div><p style='margin-top:25px;'>" + message + "</p>"
    }

    popupContainer.classList.remove('slide-in');
    popupContainer.classList.remove('slide-out');
    popupContainer.classList.add('slide-in');
    setTimeout(function () {
        popupContainer.classList.add('slide-out');
    }, 1000)

}

function formatFileSize(bytes) {
    const kilobytes = bytes / 1024;
    const megabytes = kilobytes / 1024;
    const gigabytes = megabytes / 1024;
    let size, unit;

    if (gigabytes >= 1) {
        size = gigabytes.toFixed(2);
        unit = 'GB';
    } else if (megabytes >= 1) {
        size = megabytes.toFixed(2);
        unit = 'MB';
    } else {
        size = kilobytes.toFixed(2);
        unit = 'KB';
    }

    return `${size} ${unit}`;
}

function uploadFile(file) {


    // Get references to HTML elements
    const popupContainer = document.querySelector("#upload-popup-container");
    const progressBarFill = document.querySelector("#progress-bar-fill");

    // Show popup container
    popupContainer.style.display = "block";

    // Create FormData object to send file
    const formData = new FormData();
    formData.append("file", file)

    // Create XMLHttpRequest object
    const xhr = new XMLHttpRequest();


    // Add event listener for progress updates
    xhr.upload.addEventListener("progress", function (event) {
        if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            progressBarFill.style.width = percentComplete + "%";
        }
    });

    // Add event listener for upload completion
    xhr.addEventListener("load", function (event) {
        // Hide popup container
        popupContainer.style.display = "none";

        // Handle upload completion
        if (xhr.status === 200) {
            alert("File uploaded successfully!");
        } else {
            alert("Error uploading file." + xhr.responseText);
        }
    });

    // Send the file
    xhr.open("POST", "php/upload_ds.php");
    xhr.send(formData);

}

function initializeDataset(properties) {

    // Create XMLHttpRequest object
    const xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {

        if ((xhr.readyState == 4 && xhr.status >= 400)) {
            generatePopup("error", "Error " + xhr.status + ". Error initializing dataset:" + xhr.responseText);
        }

    };

    // Send the file
    xhr.open("POST", "php/init_ds.php");
    xhr.send(JSON.stringify(properties));

    setTimeout(() => { location.replace("resources.html") }, 200)
}

