
// The structure to hold the json object for the experiments
var datasets = []

//Adding the click listener for the head items of the table
//to retrieve the experiments from the databse in a sorted manner.
const table = document.getElementById('exp_table_head');
table.addEventListener('click', function (event) {
    let target = event.target;
    if (target.tagName === "I") {
        target = target.parentNode
    }
    if (target.tagName === 'TH') {
        //retrieving the experiments
        retrieveExperiments(target.getAttribute('value'), parseInt(target.getAttribute('sorted')))
        //updating the sorted attr
        target.setAttribute('sorted', (parseInt(target.getAttribute('sorted')) * (-1)).toString())
        faicon = target.getElementsByTagName('i')
        if (parseInt(target.getAttribute('sorted')) == 1) {
            faicon[0].className = "fa-solid fa-caret-up"
        }
        else {
            faicon[0].className = "fa-solid fa-caret-down"
        }
    }

});


//Adding the window listener to load the experiments after the page is completely loaded
window.addEventListener("load", (event) => {

    for (let i = 0; i < localStorage.length; i++) {
        let key = localStorage.key(i)
        if (key == "pop") {
            generatePopup("info", localStorage.getItem(key))
            localStorage.removeItem(key)
        }

    }

    //default sorting is by id and descending(1)(from the latest)
    retrieveExperiments("id", -1)
});


//Function to retriece the experiments 
function retrieveExperiments(field, ascending) {

    var xhr = new XMLHttpRequest();

    xhr.open("POST", "php/get_experiments.php");
    xhr.setRequestHeader("Content-Type", "application/json");

    //sending request to server
    xhr.send(JSON.stringify({ field: field, ascending: ascending }));

    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            loadExperiments(JSON.parse(xhr.responseText))
        };
    };

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

//loads experiements rows on the index screen
function loadExperiments(experiments_JSON) {

    //empting the experiments structure 
    datasets = []

    //empting the panel 
    document.getElementById("experiments_panel").innerHTML = ""

    //initializing the counters
    var running = 0, drafts = 0, terminated = 0, completed = 0, queued = 0;

    //clearing the local cache except from the clipboard(saved features that can be pasted)
    for (let i = 0; i < localStorage.length; i++) {
        let key = localStorage.key(i)

        if (!key.startsWith("Clipboard_features_")) {
            localStorage.removeItem(key)
        }


    }

    //adding the experiments to the structure saving them in the local cache and updating the counters
    for (const i in experiments_JSON) {
        datasets.push(experiments_JSON[i])

        //saving the JSON object of each experiment in the local memory to be accessible from all pages
        localStorage.setItem(experiments_JSON[i].id, JSON.stringify(experiments_JSON[i]));

        if (experiments_JSON[i].status == "Running") {
            running++
        }
        else if (experiments_JSON[i].status == "Draft") {
            drafts++
        }
        else if (experiments_JSON[i].status == "Terminated") {
            terminated++
        }
        else if (experiments_JSON[i].status == "Completed") {
            completed++
        }
        else if (experiments_JSON[i].status == "Queued") {
            queued++
        }

        //loading the experiment's row
        loadDatasetRow(experiments_JSON[i])
    }

    //updating the counters
    document.getElementById('running_cnt').innerHTML = running
    document.getElementById('queued_cnt').innerHTML = queued
    document.getElementById('drafts_cnt').innerHTML = drafts
    document.getElementById('terminated_cnt').innerHTML = terminated
    document.getElementById('completed_cnt').innerHTML = completed

}

//Function that loads an experiment's data on a new table row to be visible in the page
function loadDatasetRow(experiment) {

    //getting the tbody element to add the new row onto
    panel = document.getElementById("experiments_panel")

    //creating the new row
    new_row = document.createElement("tr")

    //creating a data item for the id
    id_col = document.createElement("td")
    id_col.className = "t_item_left"
    id_col.innerHTML = "<a href='details.html?id=" + experiment.id + "'>" + experiment.id + "</a>"

    new_row.append(id_col)


    //creating a data item for the name
    name_col = document.createElement("td")
    name_col.className = "t_item_center"
    name_col.innerHTML = experiment.name

    new_row.append(name_col)


    //creating a data item for the dataset's name
    dataset_col = document.createElement("td")
    dataset_col.className = "t_item_center"
    dataset_col.innerHTML = experiment.dataset_Obj.name

    new_row.append(dataset_col)


    //creating a data item for the experiment's type
    type_col = document.createElement("td")
    type_col.className = "t_item_center"
    type_col.innerHTML = experiment.type

    new_row.append(type_col)


    //creating a data item for the date
    date_col = document.createElement("td")
    date_col.className = "t_item_center"
    if (experiment.hasOwnProperty('date')) {
        date_col.innerHTML = new Date(experiment.date).toLocaleString()
    }
    else {
        date_col.innerHTML = " - "
    }

    new_row.append(date_col)


    //if the experiment is completed -> use the timestamp created by the server (duration field)
    if (experiment.hasOwnProperty("duration") && experiment.status != "Running") {
        var diffTime = experiment.duration
    }
    else {
        //if the experiment keeps running, calculate the time diff from the submition date and use that
        diffTime = Math.abs(new Date() - new Date(experiment.date));
    }

    //No duration for drafted experiments
    if (experiment.status == "Draft") {
        var duration_string = " - "
    }
    else {
        //calculating the time in a days/hours/minutes format
        duration_string = getTimeDiffasString(diffTime)
    }

    //creating a data item for the duration
    duration_col = document.createElement("td")
    duration_col.className = "t_item_center"
    duration_col.innerHTML = duration_string

    new_row.append(duration_col)


    // create mem usage column
    var memUsage = experiment.memUsage

    memUsage_col = document.createElement("td")
    memUsage_col.className = "t_item_center"
    memUsage_col.innerHTML = memUsage

    new_row.append(memUsage_col)


    //create cpu usage column
    var cpuUsage = experiment.cpuUsage

    cpuUsage_col = document.createElement("td")
    cpuUsage_col.className = "t_item_center"
    cpuUsage_col.innerHTML = cpuUsage

    new_row.append(cpuUsage_col)


    //create status element
    status_col = document.createElement("td")
    status_col.className = "t_item_right"

    //applying the write classes depending on the status
    if (experiment.status == "Running") {
        status_col.innerHTML = "<span class='running_cnt badge-state badge'>" + experiment.status + "</span>"
    }
    else if (experiment.status == "Draft") {
        status_col.innerHTML = "<span class='drafts_cnt badge-state badge'>" + experiment.status + "</span>"
    }
    else if (experiment.status == "Queued") {
        status_col.innerHTML = "<span class='queued_cnt badge-state badge'>" + experiment.status + "</span>"
    }
    else if (experiment.status == "Terminated") {
        status_col.innerHTML = "<span class='terminated_cnt badge-state badge'>" + experiment.status + "</span>"
    }
    else if (experiment.status == "Completed") {
        status_col.innerHTML = "<span class='completed_cnt badge-state badge'>" + experiment.status + "</span>"
    }

    new_row.append(status_col)


    //creating the item for the dropdown toggle 
    dropdown_button = document.createElement("td")

    div = document.createElement("div")
    div.className = "toggle_drop dropdown"

    dropdown_button.append(div)


    //creating the toggle
    toggle_button = document.createElement("button")
    toggle_button.className = "btn_tog text-secondary dropdown-toggle"
    toggle_button.type = "button"
    toggle_button.onclick = function (event) {
        //close var and show class handles the visibility of the popup
        var close = false
        if (document.getElementById('dropdown_elem_' + experiment.id).classList.contains("show")) {
            close = true
        }

        for (var dropdown_elem of document.getElementsByClassName("dropdown-menu")) {
            if (dropdown_elem.classList.contains("show")) {
                dropdown_elem.classList.remove("show");
            }
        }

        if (!close) {
            document.getElementById('dropdown_elem_' + experiment.id).classList.add("show");

        }
    }

    div.append(toggle_button)


    //Creating the popup menu
    dropdown_menu = document.createElement("span")
    dropdown_menu.id = 'dropdown_elem_' + experiment.id
    dropdown_menu.className = "dropdown-menu"

    //edit button added all kinds of statuses
    //creating the edit button
    a_edit = document.createElement("a")
    a_edit.className = "dropdown-item cursor"
    a_edit.innerHTML = "<i class='fa fa-pencil'>" + "</i>" + "&nbsp&nbsp&nbspEdit"
    a_edit.onclick = function () {
        location.replace('experiment.html?id=' + experiment.id)
    }


    dropdown_menu.append(a_edit)

    //depending on the status we add the corresponding buttons
    if (experiment.status == "Running") {

        a_view_details = document.createElement("a")
        a_view_details.className = "dropdown-item cursor"
        a_view_details.innerHTML = "<i class='fa fa-circle-info'>" + "</i>" + "&nbsp&nbspView details"
        a_view_details.onclick = function () {
            location.replace("details.html?id=" + experiment.id)
        }

        dropdown_menu.append(a_view_details)


        a_terminate = document.createElement("a")
        a_terminate.className = "dropdown-item cursor"
        a_terminate.style.marginLeft = "1px"
        a_terminate.innerHTML = "<i class='fa fa-stop'>" + "</i>" + "&nbsp&nbsp&nbspTerminate"

        a_terminate.onclick = function () {
            var xhr = new XMLHttpRequest();

            xhr.open("POST", "php/terminate_exp.php");

            xhr.setRequestHeader("Content-Type", "application/json");

            xhr.send(JSON.stringify(experiment.id));

            setTimeout(() => { location.replace("index.html") }, 200)

            xhr.onreadystatechange = function () {
                if ((xhr.readyState == 4 && xhr.status == 400)) {
                    generatePopup("error", xhr.responseText)
                };

            };

        }

        dropdown_menu.append(a_terminate)
    }
    else if (experiment.status == "Completed" || experiment.status == "Terminated") {
        a_view_details = document.createElement("a")
        a_view_details.className = "dropdown-item cursor"
        a_view_details.innerHTML = "<i class='fa fa-circle-info'>" + "</i>" + "&nbsp&nbspView details"
        a_view_details.onclick = function () {
            location.replace("details.html?id=" + experiment.id)

        }

        dropdown_menu.append(a_view_details)

        a_remove = document.createElement("a")
        a_remove.className = "dropdown-item cursor"
        a_remove.style.marginLeft = "1px"
        a_remove.innerHTML = "<i class='fa fa-trash'>" + "</i>" + "&nbsp&nbsp&nbspRemove"
        a_remove.onclick = function () {
            var xhr = new XMLHttpRequest();

            xhr.open("POST", "php/remove_exp.php");
            xhr.setRequestHeader("Content-Type", "application/json");

            localStorage.setItem("pop", "Experiment " + experiment.name + " removed!")

            xhr.send(JSON.stringify(experiment.id));

            setTimeout(() => { location.replace("index.html") }, 500)

            xhr.onreadystatechange = function () {
                if ((xhr.readyState == 4 && xhr.status == 400)) {
                    generatePopup("error", xhr.responseText)
                };

            };

        }

        dropdown_menu.append(a_remove)
    }
    else {

        a_remove = document.createElement("a")
        a_remove.className = "dropdown-item cursor"
        a_remove.style.marginLeft = "1px"
        a_remove.innerHTML = "<i class='fa fa-trash'>" + "</i>" + "&nbsp&nbsp&nbspRemove"
        a_remove.onclick = function () {
            var xhr = new XMLHttpRequest();

            xhr.open("POST", "php/remove_exp.php");
            xhr.setRequestHeader("Content-Type", "application/json");

            localStorage.setItem("pop", "Experiment " + experiment.name + " removed!")

            xhr.send(JSON.stringify(experiment.id));

            setTimeout(() => { location.replace("index.html") }, 500)

            xhr.onreadystatechange = function () {
                if ((xhr.readyState == 4 && xhr.status == 400)) {
                    generatePopup("error", xhr.responseText)
                };

            };
        }
        dropdown_menu.append(a_remove)
    }


    div.append(dropdown_menu)
    new_row.append(dropdown_button)
    panel.append(new_row)

}

//Function to retrieve the time in a days/hours/minutes format given the time in ms
function getTimeDiffasString(time_in_ms) {

    var duration_string = ""

    var time_diff_days = Math.floor(time_in_ms / (1000 * 60 * 60 * 24))
    var time_diff_hours = Math.floor(time_in_ms / (1000 * 60 * 60))
    var time_diff_minutes = Math.floor(time_in_ms / (1000 * 60))

    if (time_diff_days > 0) {
        duration_string += time_diff_days + " days "
        time_diff_hours -= time_diff_days * 24
        time_diff_minutes -= time_diff_days * 60 * 24
    }

    if (time_diff_hours > 0) {
        duration_string += time_diff_hours + " hours "
        time_diff_minutes -= time_diff_hours * 60
    }

    if (time_diff_minutes >= 0) {
        duration_string += time_diff_minutes + " minutes"
    }
    return duration_string
}

//on click of the window disappear any dropdown menu that is open
window.onclick = function (event) {

    for (var dropdown_elem of document.getElementsByClassName("dropdown-menu")) {
        if (dropdown_elem.classList.contains("show") && event.target.className != "btn_tog text-secondary dropdown-toggle") {
            dropdown_elem.classList.remove("show");
        }
    }
}
