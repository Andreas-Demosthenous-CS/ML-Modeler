var experiment
updateExperiments()
window.addEventListener("load", (event) => {

    processParameters()
});

function processParameters() {

    var parameters = location.search.replaceAll("%20", " ")
    var splitted = parameters.substring(1).split('=')

    if (splitted[0].trim() != 'id' || localStorage.getItem(splitted[1]) == null) {
        return
    }

    exp = JSON.parse(localStorage.getItem(splitted[1]))
    experiment = exp
    displayExperiment(exp)

}

function updateExperiments() {
    var xhr = new XMLHttpRequest();

    xhr.open("POST", "php/get_experiments.php");
    xhr.setRequestHeader("Content-Type", "application/json");

    //sending request to server
    xhr.send(JSON.stringify({ field: "id", ascending: 1 }));

    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            //clearing the local cache except from the clipboard(saved features that can be pasted)
            experiments_JSON = JSON.parse(xhr.responseText)
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i)
                if (!key.startsWith("Clipboard_features_")) {
                    localStorage.removeItem(key)
                }
            }
            for (const i in experiments_JSON) {
                //saving the JSON object of each experiment in the local memory to be accessible from all pages
                localStorage.setItem(experiments_JSON[i].id, JSON.stringify(experiments_JSON[i]));
            }
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

function displayExperiment(exp) {
    container = document.getElementById("exp_container")
    container.style.marginLeft = "60px"

    basic_info_div = document.createElement("div")
    basic_info_div.innerHTML =
        "<h2 class = 'noleftspace' style = 'padding-bottom:0!important;'>Experiment&nbsp" +
        "<small style = 'color: #6c757d!important;'>#" + exp.id + "</small>" +
        "</h2>" +
        "<ul class = 'noleftspace' style = 'list-style: none; margin-top:2;'>" +
        "<li>Name&nbsp <b>" + exp.name + "</b> </li>" +
        "<li>Type&nbsp <b>" + exp.type + "</b> </li>" +
        "<li>Status&nbsp <b>" + exp.status + "</b> </li>" +
        "<li>Pid&nbsp <b>" + exp.pid + "</b> </li>" +
        "<li>Date submitted&nbsp <b>" + exp.date + "</b> </li>" +
        "</ul>"


    container.append(basic_info_div)



    dataset_info_div = document.createElement("div")
    dataset_info_div.style.width = "97%"

    if (exp.hasOwnProperty("dataset_info")) {
        dataset_info_div.innerHTML += "<h2 class = 'noleftspace' style = 'padding-bottom:0!important;'>Dataset&nbsp" +
            "<small style = 'color: #6c757d!important;'>" + exp.dataset_Obj.name + "</small>" +
            "</h2>";

        dataset_info_div.innerHTML +=
            '<div class="scroll_enable"><table id = "scrollable_table" class="dataset_table scrollable_table table table-striped table-sm" style="column-width:auto;border:groove; border-width:1; vertical-align: middle; width:10%;">' +
            "<thead>" +
            "<tr id = 'discription_table_head'>" +
            '<th >' +
            "/" +
            "</th>" +
            "</tr>" +
            "</thead>" +
            '<tbody style=" vertical-align: middle;" id = "discription_table_body">' +

            "</tbody>" +
            "</table></div>"

        container.append(dataset_info_div)

        table_head = document.getElementById("discription_table_head")

        for (var col_index = 0; col_index < exp.dataset_info.description.columns.length; col_index++) {
            table_head.innerHTML += '<th >' + exp.dataset_info.description.columns[col_index] + '</th>'

        }

        table_body = document.getElementById("discription_table_body")

        body = ""
        for (var properties_index = 0; properties_index < exp.dataset_info.description.index.length; properties_index++) {
            body += '<tr> <td >' + exp.dataset_info.description.index[properties_index] + '</td>'

            for (var data_index = 0; data_index < exp.dataset_info.description.columns.length; data_index++) {
                body += '<td >' + exp.dataset_info.description.data[properties_index][data_index].toFixed(2) + '</td>'

            }
            body += "</tr>"
        }
        table_body.innerHTML = body


        dataset_info_div.innerHTML +=
            '<div><table id="distr_table" class="distribution_table noleftspace table table-striped table-sm" style="border:groove; border-width:1; vertical-align: middle; width:10%;">' +
            "<thead>" +
            "<tr>" +
            '<th >' +
            "Target class" +
            "</th>" +
            '<th style="">' +
            "Samples" +
            "</th>" +
            "</tr>" +
            "</thead>" +
            '<tbody style=" vertical-align: middle;" id = "distribution_table">' +

            "</tbody>" +
            "</table></div>";

        container.append(dataset_info_div)
        table = document.getElementById("distribution_table")
        for (var index = 0; index < exp.dataset_info.target_distribution.index.length; index++) {
            table.innerHTML += '<tr> <td >' + exp.dataset_info.target_distribution.index[index] + '</td>'
                + '<td style="">' + exp.dataset_info.target_distribution.data[index] + '</td> </tr>'
        }


        extra_div = document.createElement("div")
        extra_div.width = "100%"
        extra_div.style.display = "block"

        //invisible seperator
        line = document.createElement("hr")
        line.style.borderTop = "1px solid white"
        container.append(line)

        dataset_info_div.append(extra_div)
    }


    results_div = document.createElement("div")
    results_div.className = "scroll_enable"
    results_div.style.width = "97%"
    if (exp.type == 'Model Training') {

        results_div.innerHTML = "<h2 class = 'noleftspace' style = 'display:block;padding-bottom:0!important;width:100%'>Results&nbsp" +
            "</h2>" +
            '<table id = "res_table" class="noleftspace scrollable_table table table-striped table-sm" style="column-width:auto; border:groove; border-width:1;">' +
            "<thead>" +
            "<tr>" +

            '<th style="margin: 0 2;">' +
            "#" +
            "</th>" +

            '<th style="margin: 0 2;">' +
            "Algorithm" +
            "</th>" +

            '<th style="margin: 0 2;">' +
            "K-Fold" +
            "</th>" +

            '<th style="margin: 0 10!important;">' +
            "Features" +
            "</th>" +

            '<th style="margin: 0 2;">' +
            "Training Duration" +
            "</th>" +

            '<th style="margin: 0 2;">' +
            "Training Accuracy" +
            "</th>" +

            '<th style="margin: 0 2;">' +
            "Training Precision" +
            "</th>" +

            '<th style="margin: 0 2;">' +
            "Training Recall" +
            "</th>" +

            '<th style="margin: 0 2;">' +
            "Training F1" +
            "</th>" +

            '<th style="margin: 0 2;">' +
            "Validation Accuracy" +
            "</th>" +

            '<th style="margin: 0 2;">' +
            "Validation Precision" +
            "</th>" +


            '<th style="margin: 0 2;">' +
            "Validation Recall" +
            "</th>" +

            '<th style="margin: 0 2;">' +
            "Validation F1" +
            "</th>" +

            "</tr>" +
            "</thead>" +
            '<tbody style=" vertical-align: middle;" id = "results_table">' +

            "</tbody>" +
            "</table>";

        container.append(results_div)
        results_table_body = document.getElementById("results_table")

        body = ""
        cnt = 0
        for (var model of exp.models_list) {

            if (model.hasOwnProperty("model_results")) {
                for (var subset of model.model_results) {

                    body += '<tr> <td >' + cnt++ + '</td>' +

                        '<td >' + model.algorithm_abr + '</td>' +
                        '<td >' + model.k + '</td>' +
                        '<td > <select style="margin-bottom:0!important;" data-v-02d89d7c="" class="form-control form-control-sm mr-2 d-inline-block">' +
                        '<option data-v-02d89d7c="" disabled="disabled" selected = "selected">' + subset.features_susbet.length + " Features</option>"
                    for (var feature of subset.features_susbet) {
                        body += '<option data-v-02d89d7c="" disabled="disabled">' + feature + "</option>"
                    }
                    body += '</select></td>'

                    //duration
                    body += '<td >' + getTimeAsString(subset["results"]["Total Duration"]) + '</td>'

                    //training accuracy
                    body += '<td > <select style="margin-bottom:0!important; width:140px;"data-v-02d89d7c="" class="form-control form-control-sm mr-2 d-inline-block">' +
                        '<option data-v-02d89d7c="" disabled="disabled" selected = "selected">Mean = ' + subset["results"]["Mean Training Accuracy"].toFixed(2) + "%</option>"
                    ind = 1
                    for (var score of subset["results"]["Training Accuracy scores"]) {
                        body += '<option data-v-02d89d7c="" disabled="disabled">k = ' + ind++ + ' : ' + (score * 100).toFixed(2) + "%</option>"

                    }
                    body += '</select></td>'

                    //training precision
                    body += '<td > <select style="margin-bottom:0!important; width:140px;"data-v-02d89d7c="" class="form-control form-control-sm mr-2 d-inline-block">' +
                        '<option data-v-02d89d7c="" disabled="disabled" selected = "selected">Mean = ' + (subset["results"]["Mean Training Precision"] * 100).toFixed(2) + "%</option>"
                    ind = 1
                    for (var score of subset["results"]["Training Precision scores"]) {
                        body += '<option data-v-02d89d7c="" disabled="disabled">k = ' + ind++ + ' : ' + (score * 100).toFixed(2) + "%</option>"

                    }
                    body += '</select></td>'

                    //training recall
                    body += '<td > <select style="margin-bottom:0!important; width:140px;"data-v-02d89d7c="" class="form-control form-control-sm mr-2 d-inline-block">' +
                        '<option data-v-02d89d7c="" disabled="disabled" selected = "selected">Mean = ' + (subset["results"]["Mean Training Recall"] * 100).toFixed(2) + "%</option>"
                    ind = 1
                    for (var score of subset["results"]["Training Recall scores"]) {
                        body += '<option data-v-02d89d7c="" disabled="disabled">k = ' + ind++ + ' : ' + (score * 100).toFixed(2) + "%</option>"

                    }
                    body += '</select></td>'

                    //training F1
                    body += '<td > <select style="margin-bottom:0!important; width:140px;"data-v-02d89d7c="" class="form-control form-control-sm mr-2 d-inline-block">' +
                        '<option data-v-02d89d7c="" disabled="disabled" selected = "selected">Mean = ' + (subset["results"]["Mean Training F1 Score"] * 100).toFixed(2) + "%</option>"
                    ind = 1
                    for (var score of subset["results"]["Training F1 scores"]) {
                        body += '<option data-v-02d89d7c="" disabled="disabled">k = ' + ind++ + ' : ' + (score * 100).toFixed(2) + "%</option>"

                    }
                    body += '</select></td>'

                    //Validation accuracy
                    body += '<td > <select style="margin-bottom:0!important; width:140px;"data-v-02d89d7c="" class="form-control form-control-sm mr-2 d-inline-block">' +
                        '<option data-v-02d89d7c="" disabled="disabled" selected = "selected">Mean = ' + subset["results"]["Mean Validation Accuracy"].toFixed(2) + "%</option>"
                    ind = 1
                    for (var score of subset["results"]["Validation Accuracy scores"]) {
                        body += '<option data-v-02d89d7c="" disabled="disabled">k = ' + ind++ + ' : ' + (score * 100).toFixed(2) + "%</option>"

                    }
                    body += '</select></td>'

                    //Validation precision
                    body += '<td > <select style="margin-bottom:0!important; width:140px;"data-v-02d89d7c="" class="form-control form-control-sm mr-2 d-inline-block">' +
                        '<option data-v-02d89d7c="" disabled="disabled" selected = "selected">Mean = ' + (subset["results"]["Mean Validation Precision"] * 100).toFixed(2) + "%</option>"
                    ind = 1
                    for (var score of subset["results"]["Validation Precision scores"]) {
                        body += '<option data-v-02d89d7c="" disabled="disabled">k = ' + ind++ + ' : ' + (score * 100).toFixed(2) + "%</option>"

                    }
                    body += '</select></td>'

                    //Validation recall
                    body += '<td > <select style="margin-bottom:0!important; width:140px;"data-v-02d89d7c="" class="form-control form-control-sm mr-2 d-inline-block">' +
                        '<option data-v-02d89d7c="" disabled="disabled" selected = "selected">Mean = ' + (subset["results"]["Mean Validation Recall"] * 100).toFixed(2) + "%</option>"
                    ind = 1
                    for (var score of subset["results"]["Validation Recall scores"]) {
                        body += '<option data-v-02d89d7c="" disabled="disabled">k = ' + ind++ + ' : ' + (score * 100).toFixed(2) + "%</option>"

                    }
                    body += '</select></td>'

                    //Validation F1
                    body += '<td > <select style="margin-bottom:0!important; width:140px;"data-v-02d89d7c="" class="form-control form-control-sm mr-2 d-inline-block">' +
                        '<option data-v-02d89d7c="" disabled="disabled" selected = "selected">Mean = ' + (subset["results"]["Mean Validation F1 Score"] * 100).toFixed(2) + "%</option>"
                    ind = 1
                    for (var score of subset["results"]["Validation F1 scores"]) {
                        body += '<option data-v-02d89d7c="" disabled="disabled">k = ' + ind++ + ' : ' + (score * 100).toFixed(2) + "%</option>"

                    }
                    body += '</select></td>'

                    body += '</tr>'
                }

            }

        }
        results_table_body.innerHTML = body

    }
    else if (exp.type == 'Hyperparameters Tuning') {



        results_div.innerHTML = "<h2 class = 'noleftspace' style = 'display:block;padding-bottom:0!important;width:100%'>Results&nbsp" + "</h2>"


        container.append(results_div)
        // results_table_body = document.getElementById("results_table")


        var model_index = 0
        for (var model of exp.hyperparam_models_list) {
            subset_index = 0
            if (model.hasOwnProperty("model_results")) {

                for (var subset of model.model_results) {
                    body = ""
                    for (var hpt_set of subset.results) {
                        if (hpt_set.rank_test_score == 1) {
                            body += '<tr style="font-weight:bold; background-color: yellow">'
                        }
                        else {
                            body += '<tr>'
                        }
                        body +=
                            '<td >' + model.algorithm + '</td>' +
                            '<td >' + model.k + '</td>' +
                            '<td > <select style="margin-bottom:0!important;" data-v-02d89d7c="" class="form-control form-control-sm mr-2 d-inline-block">' +
                            '<option data-v-02d89d7c="" disabled="disabled" selected = "selected">' + subset.features_susbet.length + " Features</option>"
                        for (var feature of subset.features_susbet) {
                            body += '<option data-v-02d89d7c="" disabled="disabled">' + feature + "</option>"
                        }
                        body += '</select></td>'

                        body += ' <td >' + hpt_set.mean_fit_time.toFixed(2) + ' seconds </td>' +
                            '<td >' + (hpt_set.mean_train_score * 100) + '%</td>' +
                            '<td >' + hpt_set.mean_test_score * 100 + '%</td>' +
                            '<td >' + hpt_set.rank_test_score + '</td>'

                        for (var hpt in hpt_set.params) {
                            body += '<td >' + hpt.substring(2) + ' = ' + hpt_set.params[hpt] + '</td>'
                        }

                        body += '</tr>'

                    }

                    subset_index++
                    results_div.innerHTML += '<table id = "res_table" class="noleftspace scrollable_table table table-striped table-sm" style="column-width:auto; border:groove; border-width:1;">' +
                        "<thead>" +
                        "<tr>" +

                        '<th style="margin: 0 2;">' +
                        "Algorithm" +
                        "</th>" +

                        '<th style="margin: 0 2;">' +
                        "K-Fold" +
                        "</th>" +

                        '<th style="margin: 0 10!important;">' +
                        "Features" +
                        "</th>" +

                        '<th style="margin: 0 2;">' +
                        "Mean Training Duration" +
                        "</th>" +

                        '<th style="margin: 0 2;">' +
                        "Mean Training Accuracy" +
                        "</th>" +

                        '<th style="margin: 0 2;">' +
                        "Mean Validation Accuracy" +
                        "</th>" +

                        '<th style="margin: 0 2;">' +
                        "Ranking" +
                        "</th>" +

                        '<th style="margin: 0 2;">' +
                        "Hyperparameters: " +
                        "</th>" +

                        "</tr>" +
                        "</thead>" +
                        '<tbody id ="hpt_table' + stringToHash(JSON.stringify(subset)) + '" style=" vertical-align: middle;" id = "results_table">' +
                        body +
                        "</tbody>" +
                        "</table>";
                    //sorting the table based on the ranking
                    const table = document.getElementById('hpt_table' + stringToHash(JSON.stringify(subset)));

                    const rows = Array.from(table.querySelectorAll('tr'));
                    const sortedRows = rows.sort((rowA, rowB) => {
                        const rankA = parseInt(rowA.cells[6].textContent);
                        const rankB = parseInt(rowB.cells[6].textContent);
                        if (rankA < rankB) {
                            return -1;
                        } else if (rankA > rankB) {
                            return 1;
                        } else {
                            return 0;
                        }
                    });
                    sortedRows.forEach((row) => {
                        table.appendChild(row);
                    });



                }

            }
            model_index++
        }





    }

    else if (exp.type == 'Correlated Features Selection') {
        results_div.innerHTML = "<h2 class = 'noleftspace' style = 'display:block;padding-bottom:0!important;width:100%'>Results&nbsp" +
            "</h2>" +
            '<table id = "res_table" class="noleftspace scrollable_table table table-striped table-sm" style="column-width:auto; border:groove; border-width:1;">' +
            "<thead>" +
            "<tr>" +

            '<th style="margin: 0 2;">' +
            "#" +
            "</th>" +

            '<th style="margin: 0 2;">' +
            "Algorithm" +
            "</th>" +

            '<th style="margin: 0 2;">' +
            "Correlation Threshold" +
            "</th>" +

            '<th style="margin: 0 10!important;">' +
            "Features" +
            "</th>" +

            '<th style="margin: 0 10!important;">' +
            "Correlated Features" +
            "</th>" +

            '<th style="margin: 0 10!important;">' +
            "Correlations: " +
            "</th>" +

            "</tr>" +
            "</thead>" +
            "<tbody id = 'results_table' style='vertical-align: middle;' >" +

            "</tbody>" +
            "</table>"

        container.append(results_div)
        results_table_body = document.getElementById("results_table")

        body = ""
        cnt_models = 0
        var model_index = 0
        for (var model of exp.corr_models_list) {
            subset_index = 0
            if (model.hasOwnProperty("model_results")) {
                for (var subset of model.model_results) {
                    body += '<tr> <td >' + cnt_models++ + '</td>' +
                        '<td >' + model.algorithm + '</td>' +
                        '<td >' + model.threshold * 100 + '%</td>' +
                        '<td > <select style="margin-bottom:0!important;" data-v-02d89d7c="" class="form-control form-control-sm mr-2 d-inline-block">' +
                        '<option data-v-02d89d7c="" disabled="disabled" selected = "selected">' + subset.features_susbet.length + " Features</option>"
                    for (var feature of subset.features_susbet) {
                        body += '<option data-v-02d89d7c="" disabled="disabled">' + feature + "</option>"
                    }
                    body += '</select></td>'


                    correlated_features = subset.correlated_features
                    var cnt = 0
                    var options = ""
                    var correlated_features_list = []
                    for (var index = 0; index < correlated_features.length; index++) {
                        if (correlated_features[index].length > 0) {
                            options += '<option data-v-02d89d7c="" disabled="disabled">' + subset.features_susbet[index] + "</option>"
                            cnt++
                        }
                    }
                    body += '<td > <select style="margin-bottom:0!important;" data-v-02d89d7c="" class="form-control form-control-sm mr-2 d-inline-block">'

                    body += '<option data-v-02d89d7c="" disabled="disabled" selected = "selected">' + cnt + " Correlated Features</option>"
                        + options

                    body += '</select>'
                    body += '<href title= "Copy Features" id="cpyFeatures" class="btn btn-clipboard" style = "vertical-align: middle;" onclick = "copyCorrFeatures(' + model_index + ', ' + subset_index + ')">' +
                        '<i aria-hidden="true" class="fa fa-copy">' +
                        '</i>' +
                        '</href>' +
                        '</td>'

                    cnt = 0
                    for (var index = 0; index < correlated_features.length; index++) {
                        if (correlated_features[index].length > 0) {
                            cnt++
                            correlated_features_list.push(subset.features_susbet[index])
                            body += '<td > <select style="margin-bottom:0!important;" data-v-02d89d7c="" class="form-control form-control-sm mr-2 d-inline-block">' +
                                '<option data-v-02d89d7c="" disabled="disabled" selected = "selected">' + cnt + '. ' + subset.features_susbet[index] + "</option>"

                        }
                        for (var corr_feature of correlated_features[index]) {
                            body += '<option data-v-02d89d7c="" disabled="disabled">' + corr_feature + "</option>"
                        }
                        body += '</select></td>'
                    }

                    results_table_body.innerHTML = body
                    document.getElementById("cpyFeatures").onclick = function () {
                        alert()
                    }

                    body += '</tr>'
                    subset_index++
                }

            }
            model_index++
        }
        results_table_body.innerHTML = body


    }
    else if (exp.type == 'K-best Features Selection') {
        results_div.innerHTML = "<h2 class = 'noleftspace' style = 'display:block;padding-bottom:0!important;width:100%'>Results&nbsp" +
            "</h2>" +
            '<table id = "res_table" class="noleftspace scrollable_table table table-striped table-sm" style="column-width:auto; border:groove; border-width:1;">' +
            "<thead>" +
            "<tr>" +

            '<th style="margin: 0 2;">' +
            "#" +
            "</th>" +

            '<th style="margin: 0 2;">' +
            "Algorithm" +
            "</th>" +

            '<th style="margin: 0 2;">' +
            "K" +
            "</th>" +

            '<th style="margin: 0 10!important;">' +
            "Features" +
            "</th>" +


            '<th style="margin: 0 10!important;">' +
            "K-Best Features" +
            "</th>" +

            "</tr>" +
            "</thead>" +
            "<tbody id = 'results_table' style='vertical-align: middle;' >" +

            "</tbody>" +
            "</table>"


        container.append(results_div)
        results_table_body = document.getElementById("results_table")

        body = ""
        cnt_models = 0
        var model_index = 0
        for (var model of exp.kbest_models_list) {
            subset_index = 0
            if (model.hasOwnProperty("model_results")) {
                for (var subset of model.model_results) {
                    body += '<tr> <td >' + cnt_models++ + '</td>' +
                        '<td >' + model.algorithm + '</td>' +
                        '<td >' + model.k + '</td>' +
                        '<td > <select style="margin-bottom:0!important;" data-v-02d89d7c="" class="form-control form-control-sm mr-2 d-inline-block">' +
                        '<option data-v-02d89d7c="" disabled="disabled" selected = "selected">' + subset.features_susbet.length + " Features</option>"
                    for (var feature of subset.features_susbet) {
                        body += '<option data-v-02d89d7c="" disabled="disabled">' + feature + "</option>"
                    }
                    body += '</select></td>'


                    kbest_features = subset.KBest_features
                    var cnt = 0
                    var options = ""
                    for (var index = 0; index < kbest_features.length; index++) {
                        if (kbest_features[index].length > 0) {
                            options += '<option data-v-02d89d7c="" disabled="disabled">' + kbest_features[index] + "</option>"
                            cnt++
                        }
                    }
                    body += '<td > <select style="margin-bottom:0!important;" data-v-02d89d7c="" class="form-control form-control-sm mr-2 d-inline-block">'

                    body += '<option data-v-02d89d7c="" disabled="disabled" selected = "selected">' + cnt + " K-Best Features</option>"
                        + options

                    body += '</select>'
                    body += '<href title= "Copy Features" id="cpyFeatures" class="btn btn-clipboard" style = "vertical-align: middle;" onclick = "copyKbestFeatures(' + model_index + ', ' + subset_index + ')">' +
                        '<i aria-hidden="true" class="fa fa-copy">' +
                        '</i>' +
                        '</href>' +
                        '</td>'

                    body += '</tr>'
                    results_table_body.innerHTML = body
                    subset_index++
                }

            }
            model_index++
        }
        results_table_body.innerHTML = body


    }
    else if (exp.type == 'Constant Features Selection') {
        results_div.innerHTML = "<h2 class = 'noleftspace' style = 'display:block;padding-bottom:0!important;width:100%'>Results&nbsp" +
            "</h2>" +
            '<table id = "res_table" class="noleftspace scrollable_table table table-striped table-sm" style="column-width:auto; border:groove; border-width:1;">' +
            "<thead>" +
            "<tr>" +

            '<th style="margin: 0 2;">' +
            "#" +
            "</th>" +

            '<th style="margin: 0 2;">' +
            "Algorithm" +
            "</th>" +

            '<th style="margin: 0 10!important;">' +
            "Features" +
            "</th>" +


            '<th style="margin: 0 10!important;">' +
            "Constant Features" +
            "</th>" +

            "</tr>" +
            "</thead>" +
            "<tbody id = 'results_table' style='vertical-align: middle;' >" +

            "</tbody>" +
            "</table>"


        container.append(results_div)
        results_table_body = document.getElementById("results_table")

        body = ""
        cnt = 0

        if (exp.hasOwnProperty("constant_features_results")) {
            subset_index = 0
            for (var subset of exp.constant_features_results) {

                body += '<tr> <td >' + cnt++ + '</td>' +
                    '<td >Variance Threshold</td>' +
                    '<td > <select style="margin-bottom:0!important;" data-v-02d89d7c="" class="form-control form-control-sm mr-2 d-inline-block">' +
                    '<option data-v-02d89d7c="" disabled="disabled" selected = "selected">' + subset.features_susbet.length + " Features</option>"
                for (var feature of subset.features_susbet) {
                    body += '<option data-v-02d89d7c="" disabled="disabled">' + feature + "</option>"
                }
                body += '</select></td>'


                constant_features = subset.constant_features
                var options = ""
                for (var index = 0; index < constant_features.length; index++) {
                    options += '<option data-v-02d89d7c="" disabled="disabled">' + subset.constant_features[index] + "</option>"

                }
                body += '<td > <select style="margin-bottom:0!important;" data-v-02d89d7c="" class="form-control form-control-sm mr-2 d-inline-block">'

                body += '<option data-v-02d89d7c="" disabled="disabled" selected = "selected">' + constant_features.length + " Constant Features</option>"
                    + options

                body += '</select>'
                body += '<href title= "Copy Features" id="cpyFeatures" class="btn btn-clipboard" style = "vertical-align: middle;" onclick = "copyConstantFeatures(' + subset_index + ')">' +
                    '<i aria-hidden="true" class="fa fa-copy">' +
                    '</i>' +
                    '</href>' +
                    '</td>'

                body += '</tr>'
                results_table_body.innerHTML = body
                subset_index++

            }

            results_table_body.innerHTML = body

        }
    }
    var export_button = document.createElement("a")
    export_button.className = "btn btn-add-to-exp"

    export_button.innerHTML = "<i class = 'fa-solid fa-file-export'> </i>&nbspExport to Excel"

    export_button.onclick = function () {
        exportToExcel("csv", "res_table", exp.id + '_results')
    }
    container.append(export_button)
}

//convert a string to hash
function stringToHash(string) {

    var hash = 0;

    if (string.length == 0) return hash;

    for (i = 0; i < string.length; i++) {
        char = string.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }

    return hash;
}

function copyCorrFeatures(exp_model_index, exp_subset_index) {
    var corr_features = []
    if (experiment != null) {
        for (var index = 0; index < experiment.corr_models_list[exp_model_index].model_results[exp_subset_index].correlated_features.length; index++) {
            if (experiment.corr_models_list[exp_model_index].model_results[exp_subset_index].correlated_features[index].length > 0) {
                corr_features.push(experiment.corr_models_list[exp_model_index].model_results[exp_subset_index].features_susbet[index])
            }
        }
    }
    localStorage.setItem("Clipboard_features_" + experiment.dataset_Obj.name, JSON.stringify(corr_features))

    if (corr_features.length > 1) {
        generatePopup("info", corr_features.length + " features copied!")
    }
    else {
        generatePopup("info", corr_features.length + " feature copied!")
    }

}

function copyKbestFeatures(exp_model_index, exp_subset_index) {
    let features = experiment.kbest_models_list[exp_model_index].model_results[exp_subset_index].KBest_features
    localStorage.setItem("Clipboard_features_" + experiment.dataset_Obj.name, JSON.stringify(features))

    if (features.length > 1) {
        generatePopup("info", features.length + " features copied!")
    }
    else {
        generatePopup("info", features.length + " feature copied!")
    }


}

function copyConstantFeatures(exp_subset_index) {
    let features = experiment.constant_features_results[exp_subset_index].constant_features

    localStorage.setItem("Clipboard_features_" + experiment.dataset_Obj.name, JSON.stringify(features))
    if (features.length > 1) {
        generatePopup("info", features.length + " features copied!")
    }
    else {
        generatePopup("info", features.length + " feature copied!")
    }
}

function getTimeAsString(timeInSeconds) {


    var duration_string = ""

    var time_diff_days = Math.floor(timeInSeconds / (60 * 60 * 24))
    var time_diff_hours = Math.floor(timeInSeconds / (60 * 60))
    var time_diff_minutes = Math.floor(timeInSeconds / (60))

    if (time_diff_days > 0) {
        duration_string += time_diff_days + " days,"
        time_diff_hours -= time_diff_days * 24
        time_diff_minutes -= time_diff_days * 60 * 24
    }

    if (time_diff_hours > 0) {
        duration_string += time_diff_hours + " hours, "
        time_diff_minutes -= time_diff_hours * 60
    }

    if (time_diff_minutes >= 0) {
        duration_string += time_diff_minutes + " minutes"
    }

    return duration_string
}

function exportToExcel(type, tableId, filename, fn, dl) {


    var tables = document.getElementsByTagName('table');

    // Merge all tables into a single table
    var mergedTable = document.createElement('table');
    for (var i = 0; i < tables.length; i++) {
        var table = tables[i];
        var rows = table.rows;
        for (var j = 0; j < rows.length; j++) {
            var row = rows[j];
            var clonedRow = row.cloneNode(true);
            mergedTable.appendChild(clonedRow);
        }
    }

    var wb = XLSX.utils.table_to_book(mergedTable, { sheet: "sheet1" });
    return dl ?
        XLSX.write(wb, { bookType: type, bookSST: true, type: 'base64' }) :
        XLSX.writeFile(wb, fn || (filename + '.' + (type || 'xlsx')));

}


