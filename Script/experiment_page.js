var datasets_Obj = []
var algorithms = []

var exp_cnt = 0;
var dataset_configs = []


window.addEventListener("load", (event) => {
  openConfig('Experiment')
  requestAlgorithms();

  interval = setInterval(() => {
    if (algorithms.length > 0) {
      clearInterval(interval)
      requestDatasets("id", 1)

      //setting the focusout listener of the name component to update the experiment structuer with the name
      document.getElementById("exp_name").addEventListener('focusout', (event) => {
        dataset_configs[dataset_configs.findIndex(selectedConfig)].name = document.getElementById("exp_name").value


      });
    }
  }, 500)



});


//on click of the window disappear any dropdown menu that is open
window.onclick = function (event) {

  for (var dropdown_elem of document.getElementsByClassName("hpt_popup")) {
    if (event.target.className != "hpt_popup show")
      dropdown_elem.classList.remove("show")
  }
  for (var dropdown_elem of document.getElementsByClassName("hpt_popup")) {
    if ('b_' + dropdown_elem.id == event.target.id || dropdown_elem.contains(event.target) && !event.target.classList.contains("btn-save-hpt")) {
      dropdown_elem.classList.add("show")
      break;
    }

  }
}

//for Experiment tab:
//When new type of experiment is chosen
//This function identifies the selected type of experiment and loads the panel for it o be configured.
//Also loads any previous configuration applied on the same type of the same dataset.
function dropDownChange() {
  //get selected type value
  var sel = document.getElementById("dropDownMenu").options[document.getElementById("dropDownMenu").selectedIndex].value

  //setting the current type to the current experiment
  dataset_configs[dataset_configs.findIndex(selectedConfig)].type = sel
  if(sel == 'Constant Features Selection'){
    document.getElementById("exp_next").style.display = "none"
  }else{
    document.getElementById("exp_next").style.display = "initial"
  }

  //depending on the sel value appear the right configuration tabs
  if (sel == 'Model Training') {

    document.getElementById("ModelTab").style.display = "inline"

    document.getElementById("models_label").innerHTML = " Select an algorithm and k for cross validation"

    var algorithmDropDown = document.getElementById("algorithmDropDown")

    algorithmDropDown.innerHTML =
      "<option data-v-02d89d7c='' value='all' disabled='disabled'>" +
      "algorithm" +
      "</option>"

    for (let algorithm of algorithms) {
      algorithmDropDown.innerHTML +=
        "<option data-v-02d89d7c='' value='" + algorithm.name_abr + "'>" +
        algorithm.name +
        "</option>"
    }

    //set the k for kfold options
    var kfoldDropDown = document.getElementById("kfoldDropDown")
    kfoldDropDown.innerHTML =
      "<option data-v-02d89d7c='' value='all' disabled='disabled'>" +
      "k" +
      "</option>" +
      "<option data-v-02d89d7c='' value='2'>" +
      "2" +
      "</option>" +
      "<option data-v-02d89d7c='' value='5'>" +
      "5" +
      "</option>" +
      "<option data-v-02d89d7c='' value='10'>" +
      "10" +
      "</option>"

    //update the models cnt
    document.getElementById("models_platform").innerHTML = "<label id = 'models_cnt'>" + dataset_configs[dataset_configs.findIndex(selectedConfig)].models_list.length +
      " models selected: <a class = 'cursor' onclick = 'clearAllModels() '>clear all</a></label>"
    //load any saved models of the selected experiment
    for (let model of dataset_configs[dataset_configs.findIndex(selectedConfig)].models_list) {
      loadModel(new Model(model.algorithm, model.algorithm_abr, model.k, model.hyper_parameters), sel)
    }
  }
  else if (sel == "Hyperparameters Tuning") {
    document.getElementById("ModelTab").style.display = "inline"

    document.getElementById("models_label").innerHTML = " Select an algorithm and k for cross validation"

    var algorithmDropDown = document.getElementById("algorithmDropDown")

    algorithmDropDown.innerHTML =
      "<option data-v-02d89d7c='' value='all' disabled='disabled'>" +
      "algorithm" +
      "</option>"

    for (let algorithm of algorithms) {
      algorithmDropDown.innerHTML +=
        "<option data-v-02d89d7c='' value='" + algorithm.name_abr + "'>" +
        algorithm.name +
        "</option>"
    }

    //set the k for kfold options
    var kfoldDropDown = document.getElementById("kfoldDropDown")
    kfoldDropDown.innerHTML =
      "<option data-v-02d89d7c='' value='all' disabled='disabled'>" +
      "k" +
      "</option>" +
      "<option data-v-02d89d7c='' value='2'>" +
      "2" +
      "</option>" +
      "<option data-v-02d89d7c='' value='5'>" +
      "5" +
      "</option>" +
      "<option data-v-02d89d7c='' value='10'>" +
      "10" +
      "</option>"

    //update the models cnt
    document.getElementById("models_platform").innerHTML = "<label id = 'models_cnt'>" + dataset_configs[dataset_configs.findIndex(selectedConfig)].hyperparam_models_list.length +
      " models selected: <a class = 'cursor' onclick = 'clearAllModels() '>clear all</a></label>"
    //load any saved models of the selected experiment
    for (let model of dataset_configs[dataset_configs.findIndex(selectedConfig)].hyperparam_models_list) {
      loadModel(new HyperParamModel(model.algorithm, model.algorithm_abr, model.k, model.hyper_parameters), sel)
    }

  }

  else if (sel == 'Correlated Features Selection') {

    document.getElementById("models_label").innerHTML = " Select an algorithm and correlation threshold (0: no correlation, 1: absolute correlation). "

    document.getElementById("ModelTab").style.display = "inline"

    //set the correlation algorithms options
    var algorithmDropDown = document.getElementById("algorithmDropDown")
    algorithmDropDown.innerHTML =
      "<option data-v-02d89d7c='' value='all' disabled='disabled'>" +
      "algorithm" +
      "</option>" +
      "<option data-v-02d89d7c='' value='Pearson'>" +
      "Pearson" +
      "</option>" +
      "<option data-v-02d89d7c='' value='Spearman'>" +
      "Spearman" +
      "</option>"

    //set threshold (left as kfoldDropdown from model training type)
    var thresholdDropDown = document.getElementById("kfoldDropDown")
    thresholdDropDown.innerHTML =
      "<option data-v-02d89d7c='' value='all' disabled='disabled'>" +
      "Correlation Threshold" +
      "</option>" +
      "<option data-v-02d89d7c='' value='0.80'>" +
      "0.80" +
      "</option>" +
      "<option data-v-02d89d7c='' value='0.85'>" +
      "0.85" +
      "</option>" +
      "<option data-v-02d89d7c='' value='0.90'>" +
      "0.90" +
      "</option>" +
      "<option data-v-02d89d7c='' value='0.95'>" +
      "0.95" +
      "</option>" +
      "<option data-v-02d89d7c='' value='1.00'>" +
      "1.00" +
      "</option>"

    document.getElementById("models_platform").innerHTML = "<label id = 'models_cnt'>" + dataset_configs[dataset_configs.findIndex(selectedConfig)].corr_models_list.length +
      " models selected: <a class = 'cursor' onclick = 'clearAllModels() '>clear all</a></label>"
    for (const model of dataset_configs[dataset_configs.findIndex(selectedConfig)].corr_models_list) {
      loadModel(new CorrelationModel(model.algorithm, model.threshold), sel)
    }
  }
  else if (sel == 'K-best Features Selection') {

    document.getElementById("models_label").innerHTML = " Select an algorithm and k for the k best features to be computed."

    document.getElementById("ModelTab").style.display = "inline"

    var algorithmDropDown = document.getElementById("algorithmDropDown")
    algorithmDropDown.innerHTML =
      "<option data-v-02d89d7c='' value='all' disabled='disabled'>" +
      "algorithm" +
      "</option>" +
      "<option data-v-02d89d7c='' value='Chi-2'>" +
      "Chi-2" +
      "</option>" +
      "<option data-v-02d89d7c='' value='F-Test'>" +
      "F-Test" +
      "</option>" +
      "<option data-v-02d89d7c='' value='Mutual Information Test'>" +
      "Mutual Information Test" +
      "</option>"

    var kfoldDropDown = document.getElementById("kfoldDropDown")
    kfoldDropDown.innerHTML =
      "<option data-v-02d89d7c='' value='all' disabled='disabled'>" +
      "k" +
      "</option>"

    for (var i = 5; i <= dataset_configs[dataset_configs.findIndex(selectedConfig)].dataset_Obj.features.length - 5; i += 5) {
      kfoldDropDown.innerHTML +=
        "<option data-v-02d89d7c='' value='" + i + "'>" +
        i +
        "</option>"
    }

    document.getElementById("models_platform").innerHTML = "<label id = 'models_cnt'>" + dataset_configs[dataset_configs.findIndex(selectedConfig)].kbest_models_list.length +
      " models selected: <a class = 'cursor' onclick = 'clearAllModels() '>clear all</a></label>"
    for (const model of dataset_configs[dataset_configs.findIndex(selectedConfig)].kbest_models_list) {
      loadModel(new KBestModel(model.algorithm, model.k), sel)
    }
  }
  else if (sel == 'Constant Features Selection') {
    document.getElementById("ModelTab").style.display = "none"

  }
}


//This function updates the experiment structure when a preprocessing option is clicked
function optionClicked() {

  for (var i = 0; i < 3; i++) {
    if (document.getElementById("preprocessing_" + i).checked) {
      dataset_configs[dataset_configs.findIndex(selectedConfig)].preprocessing_list[i] = true
    }
    else {
      dataset_configs[dataset_configs.findIndex(selectedConfig)].preprocessing_list[i] = false
    }
  }
}


//When a different dataset is selected: update the tabs with the previous configuration
//This function loads the configuraion:targets, features, previous configurations of the selected dataset.
function datasetChange() {

  loadConfig(dataset_configs[dataset_configs.findIndex(selectedConfig)])
  dropDownChange()
  generatePopup("info", "Dataset is changed to " + dataset_configs[dataset_configs.findIndex(selectedConfig)].dataset_Obj.name)

}

//loads the config of a selected experiment/dataset
function loadConfig(experiment_Obj) {


  document.getElementById("exp_name").value = experiment_Obj.name

  //if exp_name is empty give a default name
  if (!document.getElementById("exp_name").value) {
    document.getElementById("exp_name").value = "exp_" + Math.floor(Math.random() * 10000);
    experiment_Obj.name = document.getElementById("exp_name").value
  }

  var types = document.getElementById("dropDownMenu").options
  for (var i = 0; i < types.length; i++) {
    if (types[i].value == experiment_Obj.type) {
      document.getElementById("dropDownMenu").options[i].selected = "selected"
      sel = experiment_Obj.type
      //depending on the sel value appear the right configuration tabs
      if (sel == 'Model Training') {
        document.getElementById("ModelTab").style.display = "inline"
      }
      else if (sel == "Hyperparameters Tuning") {
        document.getElementById("ModelTab").style.display = "inline"
      }
      else if (sel == 'Correlated Features Selection') {
        document.getElementById("ModelTab").style.display = "inline"
      }
      else if (sel == 'K-best Features Selection') {
        document.getElementById("ModelTab").style.display = "inline"
      }
      else if (sel == 'Constant Features Selection') {
        document.getElementById("ModelTab").style.display = "none"
      }
    }
  }

  //load dataset name
  document.getElementById("datasetName_field").value = experiment_Obj.dataset_Obj.name

  //load target classes 
  var targets_dropdown = document.getElementById("targetclassDropDown")
  targets_dropdown.innerHTML = "<option data-v-02d89d7c='' value='all' disabled='disabled'>" +
    "Target class</option>"

  for (const target of experiment_Obj.dataset_Obj.target_classes) {
    var new_target_option = document.createElement("option")
    new_target_option.value = target
    new_target_option.text = target
    targets_dropdown.add(new_target_option)
  }
  var new_target_option = document.createElement("option")
  new_target_option.value = "all"
  new_target_option.text = "all"
  new_target_option.selected = "selected"
  targets_dropdown.add(new_target_option)

  //load configurations
  document.getElementById("configurations_platform").innerHTML = "<label id = 'configurations_cnt'>" + experiment_Obj.configurations_list.length +
    " configurations selected: <a class = 'cursor' onclick = 'clearAllConfigurations() '>clear all</a></label>"
  for (const config of experiment_Obj.configurations_list) {
    loadConfiguration(config)
  }

  clearAllFeatures()
  //load features
  createFeatureElements(experiment_Obj.dataset_Obj.features)

  //laod subsets
  document.getElementById("subsets_platform").innerHTML = "<label id = 'subsets_cnt'>" + experiment_Obj.subsets_list.length +
    " subsets selected: <a class = 'cursor' onclick = 'clearAllSubsets() '>clear all</a></label>"
  for (const subset of experiment_Obj.subsets_list) {
    loadSubset(subset)
  }

  //load preprocessing options
  for (var opt_index = 0; opt_index < experiment_Obj.preprocessing_list.length; opt_index++) {
    if (experiment_Obj.preprocessing_list[opt_index] == true) {
      document.getElementById("preprocessing_" + opt_index).checked = "checked"

    }
    else {
      document.getElementById("preprocessing_" + opt_index).checked = ""
    }
  }

  if (experiment_Obj.type == "Model Training") {
    var list = experiment_Obj.models_list
    for (const model of list) {
      loadModel(new Model(model.algorithm, model.algorithm_abr, model.k, model.hyper_parameters), experiment_Obj.type)
    }
  }
  else if (experiment_Obj.type == "Hyperparameters Tuning") {
    var list = experiment_Obj.hyperparam_models_list
    for (const model of list) {
      loadModel(new HyperParamModel(model.algorithm, model.algorithm_abr, model.k, model.hyper_parameters), experiment_Obj.type)
    }
  }
  else if (experiment_Obj.type == "Correlated Features Selection") {
    list = experiment_Obj.corr_models_list
    for (const model of list) {
      loadModel(new CorrelationModel(model.algorithm, model.threshold), experiment_Obj.type)
    }
  }
  else if (experiment_Obj.type == "K-best Features Selection") {
    list = experiment_Obj.kbest_models_list
    for (const model of list) {
      loadModel(new KBestModel(model.algorithm, model.k), experiment_Obj.type)
    }
  }

  //load Models
  if(list){
      document.getElementById("models_platform").innerHTML = "<label id = 'models_cnt'>" + list.length +
    " models selected: <a class = 'cursor' onclick = 'clearAllModels() '>clear all</a></label>"

  }

}

//method for findIndex to return the index of the selected experiment
function selectedConfig(experiment) {
  return experiment.id == document.getElementById("datasetDropDown").options[document.getElementById("datasetDropDown").selectedIndex].value
}

//if the quantity of a given target class is already set
function targetClassQuantityExists(configuration, configurations_list) {

  for (const config of configurations_list) {
    if (config.dataset == configuration.dataset && config.target_class == configuration.target_class) {

      return config.string_text
    }
  }
  return false
}


//for Dataset/Configuration tab:
//method to add a selected configuration to the current experiment and display the config on the tab
function addConfigurationToExperiment() {

  selected_exp = dataset_configs.findIndex(selectedConfig)

  let datasetFile = document.getElementById("datasetName_field").value
  let targetClass = document.getElementById("targetclassDropDown").options[document.getElementById("targetclassDropDown").selectedIndex].value
  let qty = document.getElementById("qtyDropDown").options[document.getElementById("qtyDropDown").selectedIndex].value

  let config_Obj = new Configuration(datasetFile, targetClass, qty)

  //adding all classes
  if (targetClass == 'all' && document.getElementById("targetclassDropDown").selectedIndex == document.getElementById("targetclassDropDown").options.length - 1) {

    for (let targetClassIndx = 1; targetClassIndx < document.getElementById("targetclassDropDown").options.length - 1; targetClassIndx++) {

      let config_Object = new Configuration(datasetFile, document.getElementById("targetclassDropDown").options[targetClassIndx].value, qty)

      if (sameClass = targetClassQuantityExists(config_Object, dataset_configs[selected_exp].configurations_list)) {

        document.getElementById(sameClass).remove()

        const index = dataset_configs[selected_exp_index].configurations_list.findIndex(configuration => { return configuration.string_text == sameClass });
        if (index > -1) { // only splice array when item is found
          dataset_configs[selected_exp_index].configurations_list.splice(index, 1); // 2nd parameter means remove one item only
        }

        //rebuild element displaying amount of datasets on the screen
        updateConfigurationCnt(dataset_configs[selected_exp].configurations_list.length)

        dataset_configs[selected_exp].configurations_list.push(config_Object)
        loadConfiguration(config_Object)
        continue
      }

      else if (dataset_configs[selected_exp].configurations_list.findIndex(conf => {
        return conf.string_text == config_Object.string_text
      }) > -1) {

        document.getElementById(config_Object.string_text).remove()

        const index = dataset_configs[selected_exp_index].configurations_list.findIndex(configuration => { return configuration.string_text == config_Object.string_text });
        if (index > -1) { // only splice array when item is found
          dataset_configs[selected_exp_index].configurations_list.splice(index, 1); // 2nd parameter means remove one item only
        }

        //rebuild element displaying amount of datasets on the screen
        updateConfigurationCnt(dataset_configs[selected_exp].configurations_list.length)

        dataset_configs[selected_exp].configurations_list.push(config_Object)
        loadConfiguration(config_Object)
        continue

      }

      dataset_configs[selected_exp].configurations_list.push(config_Object)
      loadConfiguration(config_Object)
    }

    generatePopup("info", qty + " samples from each target class are added to the experiment")
    return
  }

  //adding the selected class only
  //checking if it already exists we delete the previous and overwrite it
  if (sameClass = targetClassQuantityExists(config_Obj, dataset_configs[selected_exp].configurations_list)) {

    document.getElementById(sameClass).remove()

    const index = dataset_configs[selected_exp_index].configurations_list.findIndex(configuration => { return configuration.string_text == sameClass });
    if (index > -1) { // only splice array when item is found
      dataset_configs[selected_exp_index].configurations_list.splice(index, 1); // 2nd parameter means remove one item only
    }

    //rebuild element displaying amount of datasets on the screen
    updateConfigurationCnt(dataset_configs[selected_exp].configurations_list.length)

    dataset_configs[selected_exp].configurations_list.push(config_Obj)
    loadConfiguration(config_Obj)
    return
  }

  //checking if it already exists we delete the previous and overwrite it
  else if (dataset_configs[selected_exp].configurations_list.findIndex(conf => {
    return conf.string_text == config_Obj.string_text
  }) > -1) {

    document.getElementById(config_Obj.string_text).remove()

    const index = dataset_configs[selected_exp_index].configurations_list.findIndex(configuration => { return configuration.string_text == config_Obj.string_text });
    if (index > -1) { // only splice array when item is found
      dataset_configs[selected_exp_index].configurations_list.splice(index, 1); // 2nd parameter means remove one item only
    }

    //rebuild element displaying amount of datasets on the screen
    updateConfigurationCnt(dataset_configs[selected_exp].configurations_list.length)

    dataset_configs[selected_exp].configurations_list.push(config_Obj)
    loadConfiguration(config_Obj)
    return

  }

  dataset_configs[selected_exp].configurations_list.push(config_Obj)
  loadConfiguration(config_Obj)

  generatePopup("info", qty + " " + targetClass + " samples are added to the experiment")
}

//appends a configuration entry on the screen
function loadConfiguration(configuration_Obj) {

  var datasetFile = configuration_Obj.dataset
  var targetClass = configuration_Obj.target_class
  var qty = configuration_Obj.quantity

  var configuration_text = configuration_Obj.string_text
  selected_exp_index = dataset_configs.findIndex(selectedConfig);

  div_elem = document.createElement('div')
  div_elem.id = configuration_text
  div_elem.style.marginTop = "0.35rem"
  parent_elem = document.getElementById('configurations_platform')

  span_elem_Text = document.createElement('span')
  span_elem_Text.className = "badge badge-info "
  span_elem_Text.innerHTML = datasetFile + " | " + targetClass + " | " + qty

  span_elem_remButton = document.createElement('span')
  span_elem_remButton.className = "tooltip badge tag-func cursor"

  let tooltip_elem = document.createElement("span")
  tooltip_elem.className = "tooltiptext"
  tooltip_elem.innerHTML = "Remove"
  tooltip_elem.style.bottom = "125%"

  span_elem_remButton.append(tooltip_elem)

  rem_button = document.createElement("i")
  rem_button.className = "fa fa-trash-o"
  rem_button.onclick = function () {
    //remove element
    document.getElementById(configuration_text).remove()

    const index = dataset_configs[selected_exp_index].configurations_list.findIndex(configuration => { return configuration.string_text == configuration_Obj.string_text });
    if (index > -1) { // only splice array when item is found
      dataset_configs[selected_exp_index].configurations_list.splice(index, 1); // 2nd parameter means remove one item only
    }

    //rebuild element displaying amount of datasets on the screen
    updateConfigurationCnt(dataset_configs[dataset_configs.findIndex(selectedConfig)].configurations_list.length)
  }

  span_elem_remButton.append(rem_button)

  div_elem.append(span_elem_Text)
  div_elem.append(span_elem_remButton)
  parent_elem.append(div_elem)

  updateConfigurationCnt(dataset_configs[dataset_configs.findIndex(selectedConfig)].configurations_list.length)

}

//function to update the configuration cnt
function updateConfigurationCnt(cnt) {
  //rebuild element displaying amount of datasets on the screen
  document.getElementById("configurations_cnt").innerHTML = "<label id = 'configurations_cnt'>" + cnt +
    " configurations selected: <a class = 'cursor' onclick = 'clearAllConfigurations() '>clear all</a></label>"
}

//function to remove all configurations
function clearAllConfigurations() {

  for (var configs of dataset_configs[dataset_configs.findIndex(selectedConfig)].configurations_list) {
    document.getElementById(configs.string_text).remove()
  }

  dataset_configs[dataset_configs.findIndex(selectedConfig)].configurations_list = []
  updateConfigurationCnt(0)

}


//for Features/Subsets Tab:

//adds the checked features to a subset list bound on the selected experiment and calls loadSubset to append it on the screen
function addFeaturesToSubset() {
  var features_checkboxes = document.querySelectorAll(".cbox")
  selected_exp_index = dataset_configs.findIndex(selectedConfig)
  var subset = []

  //Gather all selected feature checkboxes
  for (var feature of features_checkboxes) {
    if (feature.checked) {
      subset.push(feature.value)
    }
  }
  if (subset.length == 0) {
    generatePopup("error", "No features selected!");

    return
  }

  subset_Obj = new Subset(subset)

  if (dataset_configs[selected_exp_index].subsets_list.findIndex(sub => { return sub.string_text == subset_Obj.string_text }) > -1) {
    generatePopup("error", "Selected subset is already in the list");
    return
  }

  dataset_configs[selected_exp_index].subsets_list.push(subset_Obj)
  loadSubset(subset_Obj)

  if (subset.length > 1) {
    generatePopup("info", "Subset of " + subset.length + " features is added to the experiment");
  }
  else {
    generatePopup("info", "Subset of " + subset.length + " feature is added to the experiment");
  }

}

//appends a subset on the screen
function loadSubset(subset_Obj) {

  subset_text = subset_Obj.string_text
  selected_exp_index = dataset_configs.findIndex(selectedConfig)

  //Add the subset to the panel
  div_newsubset_elem = document.createElement('div')
  div_newsubset_elem.id = subset_Obj.id
  div_newsubset_elem.className = "mt-rem035"

  parent_div = document.getElementById("subsets_platform")
  parent_div.append(div_newsubset_elem)

  span_elem_Text = document.createElement('span')
  span_elem_Text.className = "badge badge-info mb-0"
  span_elem_Text.innerHTML = subset_text

  span_elem_remButton = document.createElement('span')
  span_elem_remButton.className = "tooltip badge tag-func cursor"
  span_elem_remButton.title = "Remove"

  let tooltip_elem = document.createElement("span")
  tooltip_elem.className = "tooltiptext"
  tooltip_elem.innerHTML = "Remove"
  tooltip_elem.style.bottom = "125%"

  span_elem_remButton.append(tooltip_elem)

  rem_button = document.createElement("i")
  rem_button.className = "fa fa-trash-o"
  rem_button.onclick = function () {

    var index = dataset_configs[selected_exp_index].subsets_list.findIndex(subset => { return subset.string_text == subset_Obj.string_text });
    if (index > -1) { // only splice array when item is found
      dataset_configs[selected_exp_index].subsets_list.splice(index, 1); // 2nd parameter means remove one item only
    }

    //remove element
    document.getElementById(subset_Obj.id).remove()

    //rebuild element displaying amount of datasets on the screen
    updateSubsetCnt(dataset_configs[selected_exp_index].subsets_list.length)
  }

  span_elem_remButton.append(rem_button)


  span_elem_cpyButton = document.createElement('span')
  span_elem_cpyButton.className = "tooltip badge tag-func cursor"
  span_elem_cpyButton.title = "Copy Features"

  let cpy_tooltip_elem = document.createElement("span")
  cpy_tooltip_elem.className = "tooltiptext"
  cpy_tooltip_elem.innerHTML = "Copy features to clipboard"
  cpy_tooltip_elem.style.bottom = "125%"

  span_elem_cpyButton.append(cpy_tooltip_elem)

  cpy_button = document.createElement("i")
  cpy_button.className = "fa fa-copy"

  cpy_button.onclick = function () {
    var subset = subset_Obj.features
    localStorage.setItem("Clipboard_features_" + dataset_configs[selected_exp_index].dataset_Obj.name, JSON.stringify(subset))

    generatePopup("info", "Features Copied")
  }

  span_elem_cpyButton.append(cpy_button)



  div_newsubset_elem.append(span_elem_Text)
  div_newsubset_elem.append(span_elem_remButton)
  div_newsubset_elem.append(span_elem_cpyButton)
  parent_div.append(div_newsubset_elem)

  updateSubsetCnt(dataset_configs[selected_exp_index].subsets_list.length)
}

function generatePopup(popupType, message) {

  if(message.length > 200){
    message = message.substring(0, 200)+" ... "
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

function updateSubsetCnt(cnt) {
  document.getElementById("subsets_cnt").innerHTML = "<label id = 'subsets_cnt'>" + cnt +
    " subsets selected: <a class = 'cursor' onclick = 'clearAllSubsets()'>clear all</a></label>"
}

function clearAllSubsets() {

  for (var subs of dataset_configs[dataset_configs.findIndex(selectedConfig)].subsets_list) {
    document.getElementById(subs.id).remove()
  }
  dataset_configs[dataset_configs.findIndex(selectedConfig)].subsets_list = []
  updateSubsetCnt(0)
}

function featureClicked() {
  var features_checkboxes = document.querySelectorAll(".cbox")
  var selected_features_cnt = 0
  for (var feature of features_checkboxes) {
    if (feature.checked) {
      selected_features_cnt++
    }
  }
  document.getElementById("features_selected").innerHTML = selected_features_cnt + " features selected:&nbsp"
}

function clearAllFeatures() {
  var features_checkboxes = document.querySelectorAll(".cbox")
  for (var feature of features_checkboxes) {
    feature.checked = false
  }
  featureClicked()
}

function selectAllFeatures() {
  var features_checkboxes = document.querySelectorAll(".cbox")
  for (var feature of features_checkboxes) {
    feature.checked = true
  }
  featureClicked()
}

//Function to generate all feature checkbox elements from the dataset's structure
function createFeatureElements(features_list) {

  var features_panel = document.getElementById("features_platform")
  features_panel.innerHTML = ""
  for (feature of features_list) {
    var new_feature_div = document.createElement("div")
    new_feature_div.className = "item"

    var checkbox_div = document.createElement("div")
    checkbox_div.className = "checkbox-rect"

    var checkbox = document.createElement("input")
    checkbox.type = 'checkbox'
    checkbox.id = feature
    checkbox.className = 'cbox'
    checkbox.value = feature
    checkbox.onclick = function () {
      featureClicked()
    }

    var checkbox_label = document.createElement("label")

    checkbox_label.htmlFor = feature
    checkbox_label.className = "feat_label"
    checkbox_label.innerHTML = feature

    checkbox_div.append(checkbox)
    checkbox_div.append(checkbox_label)

    new_feature_div.append(checkbox_div)
    features_panel.append(new_feature_div)
  }

}


//For Model Tab:
function addModelToExperiment(type) {

  var ml_algorithm = document.getElementById("algorithmDropDown").options[document.getElementById("algorithmDropDown").selectedIndex].innerHTML
  var ml_algorithm_abr = document.getElementById("algorithmDropDown").options[document.getElementById("algorithmDropDown").selectedIndex].value
  var k_fold = document.getElementById("kfoldDropDown").options[document.getElementById("kfoldDropDown").selectedIndex].value

  selected_exp_index = dataset_configs.findIndex(selectedConfig)

  for (let alg of algorithms) {
    if (alg.name == ml_algorithm) {
      //passing alg.hyper_parameters by value using this json trick 
      model_Obj = new Model(ml_algorithm, ml_algorithm_abr, k_fold, JSON.parse(JSON.stringify(alg.hyper_parameters)))
    }
  }

  if (dataset_configs[selected_exp_index].models_list.findIndex(model => { return model.string_text == model_Obj.string_text }) > -1) {
    generatePopup("error", "Model: " + model_Obj.string_text + " is already in the list");
    return
  }

  dataset_configs[selected_exp_index].models_list.push(model_Obj)

  loadModel(model_Obj, type)

  generatePopup("info", "Algorithm " + ml_algorithm + " with k = " + k_fold + " for k-fold cross validation is added to the experiment")

}

function addHyperParamModelToExperiment(type) {

  var ml_algorithm = document.getElementById("algorithmDropDown").options[document.getElementById("algorithmDropDown").selectedIndex].innerHTML
  var ml_algorithm_abr = document.getElementById("algorithmDropDown").options[document.getElementById("algorithmDropDown").selectedIndex].value
  var k_fold = document.getElementById("kfoldDropDown").options[document.getElementById("kfoldDropDown").selectedIndex].value

  selected_exp_index = dataset_configs.findIndex(selectedConfig)

  for (alg of algorithms) {
    //passing alg.hyper_parameters by value using this json trick 
    if (alg.name == ml_algorithm) {
      model_Obj = new HyperParamModel(ml_algorithm, ml_algorithm_abr, k_fold, JSON.parse(JSON.stringify(alg.hyper_parameters)))
    }
  }


  if (dataset_configs[selected_exp_index].hyperparam_models_list.findIndex(model => { return model.string_text == model_Obj.string_text }) > -1) {
    generatePopup("error", "Model: " + model_Obj.string_text + " is already in the list");
    return
  }

  dataset_configs[selected_exp_index].hyperparam_models_list.push(model_Obj)

  loadModel(model_Obj, type)
  generatePopup("info", "Algorithm " + ml_algorithm + " with k = " + k_fold + " for k-fold cross validation is added to the experiment")


}

function addCorrelationModelToExperiment(type) {

  var algorithm = document.getElementById("algorithmDropDown").options[document.getElementById("algorithmDropDown").selectedIndex].value
  var threshold = document.getElementById("kfoldDropDown").options[document.getElementById("kfoldDropDown").selectedIndex].value

  selected_exp_index = dataset_configs.findIndex(selectedConfig)

  model_Obj = new CorrelationModel(algorithm, threshold)

  if (dataset_configs[selected_exp_index].corr_models_list.findIndex(model => { return model.string_text == model_Obj.string_text }) > -1) {
    generatePopup("error", "Model: " + model_Obj.string_text + " is already in the list");
    return
  }

  dataset_configs[selected_exp_index].corr_models_list.push(model_Obj)

  loadModel(model_Obj, type)
  generatePopup("info", "Algorithm " + algorithm + " with threshold = " + threshold + " is added to the experiment")

}

function addKBestModelToExperiment(type) {

  var algorithm = document.getElementById("algorithmDropDown").options[document.getElementById("algorithmDropDown").selectedIndex].value
  var k = document.getElementById("kfoldDropDown").options[document.getElementById("kfoldDropDown").selectedIndex].value

  selected_exp_index = dataset_configs.findIndex(selectedConfig)

  model_Obj = new KBestModel(algorithm, k)

  if (dataset_configs[selected_exp_index].kbest_models_list.findIndex(model => { return model.string_text == model_Obj.string_text }) > -1) {
    generatePopup("error", "Model: " + model_Obj.string_text + " is already in the list");
    return
  }

  dataset_configs[selected_exp_index].kbest_models_list.push(model_Obj)

  loadModel(model_Obj, type)
  generatePopup("info", "Algorithm " + algorithm + " with k = " + k + " for k-fold cross validation is added to the experiment")


}

//function to add a model to experiment 
function addToExperiment() {
  var type = document.getElementById("dropDownMenu").options[document.getElementById("dropDownMenu").selectedIndex].value
  if (type == 'Model Training') {
    addModelToExperiment(type)
  }
  else if (type == "Hyperparameters Tuning") {
    addHyperParamModelToExperiment(type)
  }
  else if (type == 'Correlated Features Selection') {
    addCorrelationModelToExperiment(type)
  }
  else if (type == 'K-best Features Selection') {
    addKBestModelToExperiment(type)
  }


}


// code for the slider
//sos identation mattters for childNodes
function createRangeSlider(id, min, max, slider_incr, selected_min, selected_max, model_Obj_string_text, hyper_param_index) {

  var left_perc = (100 / (parseFloat(max) - parseFloat(min))) * parseFloat(selected_min) - (100 / (parseFloat(max) - parseFloat(min))) * parseFloat(min);
  var right_perc = (100 / (parseFloat(max) - parseFloat(min))) * parseFloat(selected_max) - (100 / (parseFloat(max) - parseFloat(min))) * parseFloat(min);
  var right_perc_inverse = 100 - right_perc;

  return '<br><div style = "float: left;margin-top:41px;font-weight:bold">Range </div><div slider style = "border = solid; margin-left:56px;">' +
    '     <div>' +
    '        <div inverse-left style="width:' + left_perc + '%;"></div>' +
    '        <div inverse-right style="width:' + right_perc_inverse + '%;"></div>' +
    '        <div range style="left:' + left_perc + '%;right:' + right_perc_inverse + '%;"></div>' +
    '        <span thumb style="left:' + left_perc + '%;"></span>' +
    '        <span thumb style="left:' + right_perc + '%;"></span>' +
    '       <div sign style="left:' + left_perc + '%;">' +
    '            <span >' + selected_min + '</span>' +
    '        </div>' +
    '        <div sign style="left:' + right_perc + '%;">' +
    '            <span>' + selected_max + '</span>' +
    '        </div>' +
    '    </div>' +
    '    <input id = "range_start_' + id + '" type="range" tabindex="0" value="' + selected_min + '" max="' + max + '" min="' + min + '" step="' + slider_incr + '" oninput="' +
    '    this.value=Math.min(this.value, this.parentNode.childNodes[5].value-' + slider_incr + ');' +
    '    var value=(100/(parseFloat(this.max)-parseFloat(this.min)))*parseFloat(this.value)-(100/(parseFloat(this.max)-parseFloat(this.min)))*parseFloat(this.min);' +
    '   var children = this.parentNode.childNodes[1].childNodes;' +
    "    children[1].style.width=value+'%';" +
    "    children[5].style.left=value+'%';" +
    "    children[7].style.left=value+'%';children[11].style.left=value+'%';" +
    '    children[11].childNodes[1].innerHTML=this.value; updateExecutionsCnt(' + id + ', ' + "'" + model_Obj_string_text + "'" + ' , ' + hyper_param_index + ');" />' +

    '    <input id = "range_stop_' + id + '" type="range" tabindex="0" value="' + selected_max + '" max="' + max + '" min="' + min + '" step="' + slider_incr + '" oninput="' +
    '    this.value=Math.max(this.value,this.parentNode.childNodes[3].value-(-' + slider_incr + '));' +
    '    var value=(100/(parseFloat(this.max)-parseFloat(this.min)))*parseFloat(this.value)-(100/(parseFloat(this.max)-parseFloat(this.min)))*parseFloat(this.min);' +
    '    var children = this.parentNode.childNodes[1].childNodes;' +
    "    children[3].style.width=(100-value)+'%';" +
    "    children[5].style.right=(100-value)+'%';" +
    "    children[9].style.left=value+'%';children[13].style.left=value+'%';" +
    '    children[13].childNodes[1].innerHTML=this.value; updateExecutionsCnt(' + id + ', ' + "'" + model_Obj_string_text + "'" + ' , ' + hyper_param_index + ');" />' +
    '</div>'
}


function createIncreament(id, start, stop, slider_incr, incr, model_Obj_string_text, hyper_param_index) {
  if (isDecimal(incr)) {
    incr = (Number(incr)).toFixed(2);
  }
  else {
    incr = parseInt(incr);
  }
  // '<div style = "float: left;margin-top:41px;font-weight:bold">Increament </div>' +
  return "<div style = 'float: left;margin-top:10px;font-weight:bold'>Increament </div><div class='input-group-hpt-tuning'>" +
    "<button class='btn' onclick ='decrClicked(" + id + ", " + start + ", " + stop + ", " + slider_incr + ", " + '"' + model_Obj_string_text + '"' + ", " + hyper_param_index + ", true)'>-</button>" +
    "<input id='incr_input_" + id + "' class='incr_input' value='" + incr + "' onfocusout='incrSet(" + id + ", " + start + ", " + stop + ", " + slider_incr + ", " + '"' + model_Obj_string_text + '"' + ", " + hyper_param_index + ", true)'>" +
    "<button class='btn' onclick= 'incrClicked(" + id + ", " + start + ", " + stop + ", " + slider_incr + ", " + '"' + model_Obj_string_text + '"' + ", " + hyper_param_index + ", true)'>+</button>" +
    "</div>"
}
function incrClicked(id, start, stop, slider_incr, model_Obj_string_text, hyper_param_index, hyper_ranges) {

  numberInput = document.getElementById('incr_input_' + id);

  if (!hyper_ranges && numberInput.disabled == true) return;


  if (hyper_ranges) {
    if ((Number(numberInput.value) + slider_incr <= stop)) {
      if (isDecimal(numberInput.value)) {
        numberInput.value = (Number(numberInput.value) + slider_incr).toFixed(2);
      }
      else {
        numberInput.value = parseInt(numberInput.value) + slider_incr;
      }

      updateExecutionsCnt(id, model_Obj_string_text, hyper_param_index)

    }
    else {
      numberInput.value = start;
      generatePopup("error", "Value must be within " + 0 + " and " + stop);
    }
  }
  else {
    if ((Number(numberInput.value) + slider_incr <= stop)) {
      if (isDecimal(numberInput.value)) {
        numberInput.value = (Number(numberInput.value) + slider_incr).toFixed(2);
      }
      else {
        numberInput.value = parseInt(numberInput.value) + slider_incr;
      }

    }
    else {
      generatePopup("error", "Value must be within " + start + " and " + stop);
    }
  }

}

function decrClicked(id, start, stop, slider_incr, model_Obj_string_text, hyper_param_index, hyper_ranges) {
  numberInput = document.getElementById('incr_input_' + id);

  if (!hyper_ranges && numberInput.disabled == true) return;

  if (hyper_ranges) {
    if ((Number(numberInput.value) - slider_incr > 0)) {
      if (isDecimal(numberInput.value)) {
        numberInput.value = (Number(numberInput.value) - slider_incr).toFixed(2);
      }
      else {
        numberInput.value = parseInt(numberInput.value) - slider_incr;
      }

      updateExecutionsCnt(id, model_Obj_string_text, hyper_param_index)

    }
    else {
      numberInput.value = start;
      generatePopup("error", "Value must be within " + 0 + " and " + stop);
    }
  }
  else {
    if ((Number(numberInput.value) - slider_incr >= start)) {
      if (isDecimal(numberInput.value)) {
        numberInput.value = (Number(numberInput.value) - slider_incr).toFixed(2);
      }
      else {
        numberInput.value = parseInt(numberInput.value) - slider_incr;
      }

    }
    else {
      generatePopup("error", "Value must be within " + start + " and " + stop);
    }
  }

}

function incrSet(id, start, stop, slider_incr, model_Obj_string_text, hyper_param_index, hyper_ranges) {

  numberInput = document.getElementById('incr_input_' + id);

  if (!hyper_ranges && numberInput.disabled == true) return;

  if (hyper_ranges) {
    if (Number(numberInput.value) >= 0 && Number(numberInput.value) <= stop) {
      if (isDecimal(numberInput.value)) {
        numberInput.value = (Number(numberInput.value)).toFixed(2);
      }
      else {
        numberInput.value = parseInt(numberInput.value);
      }

      updateExecutionsCnt(id, model_Obj_string_text, hyper_param_index)

    }
    else {
      numberInput.value = start;
      generatePopup("error", "Value must be within " + 0 + " and " + stop);
    }
  }
  else {
    if (Number(numberInput.value) >= start && Number(numberInput.value) <= stop) {
      if (isDecimal(numberInput.value)) {
        numberInput.value = (Number(numberInput.value)).toFixed(2);
      }
      else {
        numberInput.value = parseInt(numberInput.value);
      }

    }
    else {
      numberInput.value = start
      generatePopup("error", "Value must be within " + start + " and " + stop);
    }
  }
}

function isNumeric(str) {
  if (typeof str != "string") return false // we only process strings!  
  return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
    !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}

//funciton to save the user changes in the hyper parameters panel 
function saveHyperParameterRanges(id, model_Obj_string_text, hyper_param_index) {

  //update the experiment structure with the current hyper parameter update
  selected_exp_index = dataset_configs.findIndex(selectedConfig)

  model_index = dataset_configs[selected_exp_index].hyperparam_models_list.findIndex(model => { return model.string_text == model_Obj_string_text })

  //for num range hyper param:
  if (dataset_configs[selected_exp_index].hyperparam_models_list[model_index].hyper_parameters[hyper_param_index].type == "num_range") {
    //reads increament
    numberInput = document.getElementById('incr_input_' + id);

    //input not a number
    if (!isNumeric(numberInput.value)) {
      generatePopup("error", "Increament " + numberInput.value + " is not a number " + (typeof (numberInput.value)));
      numberInput.value = step;

    }

    incr = numberInput.value
    //reads start
    start = document.getElementById('range_start_' + id).value;

    //reads stop
    end = document.getElementById('range_stop_' + id).value;

    var exec_cnt = Math.floor((end - start) / incr) + 1

    //updating the experiments hyper parameter settings according to the user's new input
    dataset_configs[selected_exp_index].hyperparam_models_list[model_index].hyper_parameters[hyper_param_index].selected_start = Number(start)
    dataset_configs[selected_exp_index].hyperparam_models_list[model_index].hyper_parameters[hyper_param_index].selected_stop = Number(start) + (exec_cnt - 1) * Number(incr)
    dataset_configs[selected_exp_index].hyperparam_models_list[model_index].hyper_parameters[hyper_param_index].selected_incr = Number(incr)
  }
  else if (dataset_configs[selected_exp_index].hyperparam_models_list[model_index].hyper_parameters[hyper_param_index].type == "class_range" ||
    dataset_configs[selected_exp_index].hyperparam_models_list[model_index].hyper_parameters[hyper_param_index].type == "boolean") {
    var hpt_classes_checkboxes = document.querySelectorAll(".cbox_" + id)
    var hpt_classes_names = []

    for (var hpt_class of hpt_classes_checkboxes) {
      if (hpt_class.checked) {
        hpt_classes_names.push(hpt_class.value)
      }

    }
    if (hpt_classes_names.length == 0) {
      hpt_classes_names.push(dataset_configs[selected_exp_index].hyperparam_models_list[model_index].hyper_parameters[hyper_param_index].default_value)
      for (var hpt_class of hpt_classes_checkboxes) {
        if (hpt_class.value == dataset_configs[selected_exp_index].hyperparam_models_list[model_index].hyper_parameters[hyper_param_index].default_value) {
          hpt_class.checked = "checked"
        }

      }
    }


    dataset_configs[selected_exp_index].hyperparam_models_list[model_index].hyper_parameters[hyper_param_index].selected_value_range = hpt_classes_names

    document.getElementById('executions_cnt_' + id).value = hpt_classes_names.length
  }

  generatePopup("info", "Hyperparameters ranges saved succesfully");

}

function saveHyperParameters(id, model_Obj_string_text, hyper_param_index) {
  //update the experiment structure with the current hyper parameter update
  selected_exp_index = dataset_configs.findIndex(selectedConfig)

  model_index = dataset_configs[selected_exp_index].models_list.findIndex(model => { return model.string_text == model_Obj_string_text })

  if (document.getElementById(id + "_default_").checked) {
    dataset_configs[selected_exp_index].models_list[model_index].hyper_parameters[hyper_param_index].selected_value =
      dataset_configs[selected_exp_index].models_list[model_index].hyper_parameters[hyper_param_index].default_value
    return;
  }

  //for num range hyper param:
  if (dataset_configs[selected_exp_index].models_list[model_index].hyper_parameters[hyper_param_index].type == "num_range") {
    //reads increament
    numberInput = document.getElementById('incr_input_' + id);

    //input not a number
    if (!isNumeric(numberInput.value)) {
      generatePopup("error", "Increament " + numberInput.value + " is not a number " + (typeof (numberInput.value)));
      numberInput.value = step;

    }

    val = numberInput.value

    //updating the experiments hyper parameter settings according to the user's new input
    dataset_configs[selected_exp_index].models_list[model_index].hyper_parameters[hyper_param_index].selected_value = Number(val)
  }
  else if (dataset_configs[selected_exp_index].models_list[model_index].hyper_parameters[hyper_param_index].type == "class_range" ||
    dataset_configs[selected_exp_index].models_list[model_index].hyper_parameters[hyper_param_index].type == "boolean") {
    var hpt_classes_checkboxes = document.querySelectorAll(".cbox_" + id)

    var hpt_class_name

    for (var hpt_class of hpt_classes_checkboxes) {
      if (hpt_class.checked) {
        hpt_class_name = hpt_class.value
      }

    }
    if (hpt_class_name == undefined) {
      hpt_class_name == (dataset_configs[selected_exp_index].models_list[model_index].hyper_parameters[hyper_param_index].default_value)
      for (var hpt_class of hpt_classes_checkboxes) {
        if (hpt_class.value == dataset_configs[selected_exp_index].models_list[model_index].hyper_parameters[hyper_param_index].default_value) {
          hpt_class.checked = "checked"
        }

      }
    }


    dataset_configs[selected_exp_index].models_list[model_index].hyper_parameters[hyper_param_index].selected_value = hpt_class_name

  }

  generatePopup("info", "Hyperparameters saved succesfully");
}

//function to update whenever the user changes something in the hyper parameters panel 
function updateExecutionsCnt(id, model_Obj_string_text, hyper_param_index) {
  //update the experiment structure with the current hyper parameter update
  selected_exp_index = dataset_configs.findIndex(selectedConfig)

  model_index = dataset_configs[selected_exp_index].hyperparam_models_list.findIndex(model => { return model.string_text == model_Obj_string_text })
  //for num range hyper param:
  if (dataset_configs[selected_exp_index].hyperparam_models_list[model_index].hyper_parameters[hyper_param_index].type == "num_range") {
    //reads increament
    numberInput = document.getElementById('incr_input_' + id);

    //input not a number
    if (!isNumeric(numberInput.value)) {
      generatePopup("error", "Increament " + numberInput.value + " is not a number " + (typeof (numberInput.value)));
      numberInput.value = step;

    }

    incr = numberInput.value
    //reads start
    start = document.getElementById('range_start_' + id).value;

    //reads stop
    end = document.getElementById('range_stop_' + id).value;

    var exec_cnt = Math.floor((end - start) / incr) + 1
    document.getElementById('executions_cnt_' + id).value = exec_cnt
  }

  else if (dataset_configs[selected_exp_index].hyperparam_models_list[model_index].hyper_parameters[hyper_param_index].type == "class_range" ||
    dataset_configs[selected_exp_index].hyperparam_models_list[model_index].hyper_parameters[hyper_param_index].type == "boolean") {
    var hpt_classes_checkboxes = document.querySelectorAll(".cbox_" + id)
    var hpt_classes_names = []

    for (var hpt_class of hpt_classes_checkboxes) {
      if (hpt_class.checked) {
        hpt_classes_names.push(hpt_class.value)
      }

    }
    if (hpt_classes_names.length == 0) {
      hpt_classes_names.push(dataset_configs[selected_exp_index].hyperparam_models_list[model_index].hyper_parameters[hyper_param_index].default_value)
      for (var hpt_class of hpt_classes_checkboxes) {
        if (hpt_class.value == dataset_configs[selected_exp_index].hyperparam_models_list[model_index].hyper_parameters[hyper_param_index].default_value) {
          hpt_class.checked = "checked"
        }

      }
    }
    document.getElementById('executions_cnt_' + id).value = hpt_classes_names.length
  }

}

//function to update whenever the user changes something in the hyper parameters panel 
function updateClassInput(id, model_Obj_string_text, hyper_param_index, cbox_clicked) {
  //update the experiment structure with the current hyper parameter update
  selected_exp_index = dataset_configs.findIndex(selectedConfig)

  model_index = dataset_configs[selected_exp_index].hyperparam_models_list.findIndex(model => { return model.string_text == model_Obj_string_text })

  var hpt_classes_checkboxes = document.getElementById("features_platform_" + id).querySelectorAll(".cbox_" + id)
  var hpt_classes_names = []

  for (var hpt_class of hpt_classes_checkboxes) {
    if (hpt_class.value == cbox_clicked.value) {
      hpt_class.checked = "checked"
    }
    else {
      hpt_class.checked = ""
    }

  }

}

function createInfoBtn(popup_text) {
  return "<span class='badge tag-func tooltip'><span class='tooltiptextHPT'>" + popup_text + "</span>" +
    "<i class='fa fa-info-circle' ></i>" +
    "</span>"
}

function createExecCounter(id, initial_val) {
  // '<div style = "float: left;margin-top:41px;font-weight:bold">Increament </div>' +
  return "<div style = 'float: left;margin-top:11px;font-weight:bold'>Executions </div><div class='input-group-hpt-tuning'>" +
    "<input id='executions_cnt_" + id + "' value='" + initial_val + "' style='margin: 5px; width:50px;' disabled>" +
    "</div>"
}

function createClassSelector(id, class_list, selected_class_list, model_Obj_string_text, hyper_param_index) {
  var classes = ""
  for (hpt_class of class_list) {
    if (selected_class_list.includes(hpt_class)) {
      classes += '<div class="item"><div class="checkbox-rect"><input type="checkbox" id="' + id + '_hpt_class_' + hpt_class + '" class="cbox_' + id + '" value="' + hpt_class + '" checked = "checked" onchange = "updateExecutionsCnt(' + id + ', ' + "'" + model_Obj_string_text + "'" + ' , ' + hyper_param_index + ');">' +
        '<label for="' + id + '_hpt_class_' + hpt_class + '" class="feat_label" >' + hpt_class + ' </label></div></div>'
    }
    else {
      classes += '<div class="item"><div class="checkbox-rect"><input type="checkbox" id="' + id + '_hpt_class_' + hpt_class + '" class="cbox_' + id + '" value="' + hpt_class + '" onchange = "updateExecutionsCnt(' + id + ', ' + "'" + model_Obj_string_text + "'" + ' , ' + hyper_param_index + ');">' +
        '<label for="' + id + '_hpt_class_' + hpt_class + '" class="feat_label" >' + hpt_class + ' </label></div></div>'
    }

  }
  return '<div class="feat_container" id="features_platform_' + id + '">' + classes + '</div>'
}

function createClassInput(id, class_list, selected_class, model_Obj_string_text, hyper_param_index) {
  var classes = ""
  for (hpt_class of class_list) {
    if (selected_class == hpt_class) {
      classes += '<div class="item"><div class="checkbox-rect"><input type="checkbox" id="' + id + '_hpt_class_' + hpt_class + '" class="cbox_' + id + '" value="' + hpt_class + '" checked = "checked" onchange = "updateClassInput(' + id + ', ' + "'" + model_Obj_string_text + "'" + ' , ' + hyper_param_index + ', this);">' +
        '<label for="' + id + '_hpt_class_' + hpt_class + '" class="feat_label" >' + hpt_class + ' </label></div></div>'
    }
    else {
      classes += '<div class="item"><div class="checkbox-rect"><input type="checkbox" id="' + id + '_hpt_class_' + hpt_class + '" class="cbox_' + id + '" value="' + hpt_class + '" onchange = "updateClassInput(' + id + ', ' + "'" + model_Obj_string_text + "'" + ' , ' + hyper_param_index + ', this);">' +
        '<label for="' + id + '_hpt_class_' + hpt_class + '" class="feat_label" >' + hpt_class + ' </label></div></div>'
    }

  }
  return '<div class="feat_container" id="features_platform_' + id + '">' + classes + '</div>'
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

//function to return if the given num is decimal
function isDecimal(num) {
  return (num % 1);
}


function loadModel(model_Obj, type) {
  selected_exp_index = dataset_configs.findIndex(selectedConfig)
  let model_text = model_Obj.string_text

  let div_elem = document.createElement('div')
  div_elem.id = model_Obj.string_text
  div_elem.className = "mt-rem035"
  let parent_elem = document.getElementById('models_platform')

  let span_elem_Text = document.createElement('span')
  span_elem_Text.className = "badge badge-info"
  span_elem_Text.id = "platform_" + model_Obj.string_text
  span_elem_Text.innerHTML = model_text

  div_elem.append(span_elem_Text)


  let div_elem_buttons_container = document.createElement('div')

  if (type == "Hyperparameters Tuning") {

    let hyper_param_menu_popup = document.createElement("div")
    hyper_param_menu_popup.id = "hpt_" + model_text
    hyper_param_menu_popup.className = 'hpt_popup resizable'

    let h5_title = document.createElement("h5")
    h5_title.id = "hpt_dragger" + model_text
    h5_title.className = "dragger"
    h5_title.innerHTML = "Enter the hyper-parameter ranges for " + model_Obj.algorithm + " | k = " + model_Obj.k
    hyper_param_menu_popup.append(h5_title)


    //add the save button
    let save_button = document.createElement("span")
    save_button.className = "btn btn-save-hpt"
    save_button.innerHTML = "Save "

    let save_icon = document.createElement("i")
    save_icon.className = "fas fa-save"
    save_button.append(save_icon)


    save_button.onclick = function () {
      //update the structure with the update user input on the hpt panel when save button is clicked

      for (var i = 0; i < model_Obj.hyper_parameters.length; i++) {
        let hyper_parameter_id = hyper_param_menu_popup.id + "_" + model_Obj.hyper_parameters[i].name
        hyper_parameter_id = stringToHash(hyper_parameter_id.replaceAll(' ', ''))
        saveHyperParameterRanges(hyper_parameter_id, model_Obj.string_text, i)
      }
      document.getElementById("platform_" + model_Obj.string_text).innerHTML = model_Obj.string_text
    }

    hyper_param_menu_popup.append(save_button)


    let ul_hyperparams_list = document.createElement("ol")

    //adding all the hyper params on the popup menu
    for (var i = 0; i < model_Obj.hyper_parameters.length; i++) {

      let hyper_param_li = document.createElement("li")
      let hyper_parameter_id = hyper_param_menu_popup.id + "_" + model_Obj.hyper_parameters[i].name
      hyper_parameter_id = stringToHash(hyper_parameter_id.replaceAll(' ', ''))

      // for num range types of hyperparameters:
      if (model_Obj.hyper_parameters[i].type == "num_range") {

        //adding the dual slider 
        hyper_param_li.innerHTML = '<span class = "pad">' + model_Obj.hyper_parameters[i].name + " (default value = " + model_Obj.hyper_parameters[i].default_value + ")</span>"

        //addign the info button
        hyper_param_li.innerHTML += createInfoBtn(model_Obj.hyper_parameters[i].description)

        //adding the range slider
        hyper_param_li.innerHTML += createRangeSlider(hyper_parameter_id,
          model_Obj.hyper_parameters[i].start, model_Obj.hyper_parameters[i].stop,
          model_Obj.hyper_parameters[i].slider_incr, model_Obj.hyper_parameters[i].selected_start, model_Obj.hyper_parameters[i].selected_stop, model_Obj.string_text, i)

        //adding the increament buttons
        hyper_param_li.innerHTML += createIncreament(hyper_parameter_id, model_Obj.hyper_parameters[i].start,
          model_Obj.hyper_parameters[i].stop, model_Obj.hyper_parameters[i].slider_incr,
          model_Obj.hyper_parameters[i].selected_incr, model_Obj.string_text, i)

        //adding the exec counter
        hyper_param_li.innerHTML += createExecCounter(hyper_parameter_id, 1 + Math.floor((model_Obj.hyper_parameters[i].selected_stop - model_Obj.hyper_parameters[i].selected_start)
          / model_Obj.hyper_parameters[i].selected_incr, model_Obj.string_text, i))

        //addign a line seperator
        hyper_param_li.innerHTML += '<hr style="border-top: 2px solid #ddd; margin:15px;"></hr>'
        ul_hyperparams_list.append(hyper_param_li)
      }

      //for class range types of hyperparams:
      else if (model_Obj.hyper_parameters[i].type == "class_range" || model_Obj.hyper_parameters[i].type == "boolean") {
        hyper_param_li.innerHTML = '<span class = "pad">' + model_Obj.hyper_parameters[i].name + " (default value = " + model_Obj.hyper_parameters[i].default_value + ")</span>" + createClassSelector(hyper_parameter_id,
          model_Obj.hyper_parameters[i].values, model_Obj.hyper_parameters[i].selected_value_range, model_Obj.string_text, i)

        //adding the exec counter
        hyper_param_li.innerHTML += createExecCounter(hyper_parameter_id, model_Obj.hyper_parameters[i].selected_value_range.length, model_Obj.string_text, i)

        //addign a line seperator
        hyper_param_li.innerHTML += '<hr style="border-top: 2px solid #ddd; margin:15px;"></hr>'
        ul_hyperparams_list.append(hyper_param_li)
      }

    }

    hyper_param_menu_popup.append(ul_hyperparams_list)

    //add sliders icon and button if the type is for hyperparameters tuning
    let span_elem_hptButton = document.createElement('span')
    span_elem_hptButton.className = "tooltip popup badge tag-func cursor "

    let tooltip_elem = document.createElement("span")
    tooltip_elem.className = "tooltiptext"
    tooltip_elem.innerHTML = "Set hyperparameter ranges"
    tooltip_elem.style.bottom = "122%"


    span_elem_hptButton.append(tooltip_elem)

    let hpt_button = document.createElement("span")
    hpt_button.className = "fa fa-sliders"
    hpt_button.id = "b_hpt_" + model_Obj.string_text
    hpt_button.style.fontSize = "15px";



    div_elem.append(hyper_param_menu_popup)

    span_elem_hptButton.append(hpt_button)
    div_elem_buttons_container.append(span_elem_hptButton)

    // Make the hpt_popup element draggable:
    dragElement(hyper_param_menu_popup, h5_title);

  }
  else if (type == "Model Training") {

    let hyper_param_menu_popup = document.createElement("div")
    hyper_param_menu_popup.id = "hpt_" + model_text
    hyper_param_menu_popup.className = 'hpt_popup resizable'


    let h5_title = document.createElement("h5")
    h5_title.id = "hpt_dragger" + model_text
    h5_title.className = "dragger"
    h5_title.innerHTML = "Enter the hyper-parameters for " + model_Obj.algorithm + " | k = " + model_Obj.k
    hyper_param_menu_popup.append(h5_title)


    //add the save button
    let save_button = document.createElement("span")
    save_button.className = "btn btn-save-hpt"
    save_button.innerHTML = "Save "

    let save_icon = document.createElement("i")
    save_icon.className = "fas fa-save"
    save_button.append(save_icon)


    save_button.onclick = function () {
      //update the structure with the update user input on the hpt panel when save button is clicked
      for (var i = 0; i < model_Obj.hyper_parameters.length; i++) {
        let hyper_parameter_id = hyper_param_menu_popup.id + "_" + model_Obj.hyper_parameters[i].name
        hyper_parameter_id = stringToHash(hyper_parameter_id.replaceAll(' ', ''))
        saveHyperParameters(hyper_parameter_id, model_Obj.string_text, i)
      }
      document.getElementById("platform_" + model_Obj.string_text).innerHTML = model_Obj.string_text
    }

    hyper_param_menu_popup.append(save_button)


    let ul_hyperparams_list = document.createElement("ol")

    //adding all the hyper params on the popup menu
    for (var i = 0; i < model_Obj.hyper_parameters.length; i++) {

      let hyper_param_li = document.createElement("li")
      let hyper_parameter_id = hyper_param_menu_popup.id + "_" + model_Obj.hyper_parameters[i].name
      hyper_parameter_id = stringToHash(hyper_parameter_id.replaceAll(' ', ''))


      // for num range types of hyperparameters:
      if (model_Obj.hyper_parameters[i].type == "num_range") {
        //adding the dual slider 
        hyper_param_li.innerHTML = '<span class = "pad">' + model_Obj.hyper_parameters[i].name + " (default value = " + model_Obj.hyper_parameters[i].default_value + ")</span>"

        //addign the info button
        hyper_param_li.innerHTML += createInfoBtn(model_Obj.hyper_parameters[i].description)

        //adding the range slider
        hyper_param_li.innerHTML += createNumInput(hyper_parameter_id, model_Obj.hyper_parameters[i].start,
          model_Obj.hyper_parameters[i].stop, model_Obj.hyper_parameters[i].slider_incr,
          model_Obj.hyper_parameters[i].selected_value, model_Obj.string_text, i)

        //adding the default value checkbox
        hyper_param_li.innerHTML += createDefaultNumInput(hyper_parameter_id)

        ul_hyperparams_list.append(hyper_param_li)
      }

      //for class range types of hyperparams:
      else if (model_Obj.hyper_parameters[i].type == "class_range" || model_Obj.hyper_parameters[i].type == "boolean") {
        hyper_param_li.innerHTML = '<span class = "pad">' + model_Obj.hyper_parameters[i].name + " (default value = " + model_Obj.hyper_parameters[i].default_value + ")</span>" + createClassInput(hyper_parameter_id,
          model_Obj.hyper_parameters[i].values, model_Obj.hyper_parameters[i].selected_value, model_Obj.string_text, i)

        //adding the default value checkbox
        hyper_param_li.innerHTML += createDefaultClassInput(hyper_parameter_id)

        //addign a line seperator
        hyper_param_li.innerHTML += '<hr style="border-top: 2px solid #ddd; margin:15px;"></hr>'
        ul_hyperparams_list.append(hyper_param_li)
      }

    }

    hyper_param_menu_popup.append(ul_hyperparams_list)

    //add sliders icon and button if the type is for hyperparameters tuning
    let span_elem_hptButton = document.createElement('span')
    span_elem_hptButton.className = "tooltip popup badge tag-func cursor"

    let tooltip_elem = document.createElement("span")
    tooltip_elem.className = "tooltiptext"
    tooltip_elem.innerHTML = "Set hyperparameters"
    tooltip_elem.style.bottom = "125%"

    span_elem_hptButton.append(tooltip_elem)

    let hpt_button = document.createElement("span")
    hpt_button.className = "fa fa-sliders"
    hpt_button.id = "b_hpt_" + model_Obj.string_text
    hpt_button.style.fontSize = "15px";

    div_elem.append(hyper_param_menu_popup)

    span_elem_hptButton.append(hpt_button)
    div_elem_buttons_container.append(span_elem_hptButton)

    // Make the hpt_popup element draggable:
    dragElement(hyper_param_menu_popup, h5_title);
  }

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

    if (type == "Model Training") {
      var index = dataset_configs[selected_exp_index].models_list.findIndex(model => { return model.string_text == model_Obj.string_text });
      if (index > -1) { // only splice array when item is found
        dataset_configs[selected_exp_index].models_list.splice(index, 1); // 2nd parameter means remove one item only
      }
      //rebuild element displaying amount of datasets on the screen
      updateModelsCnt(dataset_configs[selected_exp_index].models_list.length)
    }
    else if (type == "Hyperparameters Tuning") {
      var index = dataset_configs[selected_exp_index].hyperparam_models_list.findIndex(model => { return model.string_text == model_Obj.string_text });
      if (index > -1) { // only splice array when item is found
        dataset_configs[selected_exp_index].hyperparam_models_list.splice(index, 1); // 2nd parameter means remove one item only
      }
      //rebuild element displaying amount of datasets on the screen
      updateModelsCnt(dataset_configs[selected_exp_index].hyperparam_models_list.length)
    }
    if (type == "Correlated Features Selection") {
      var index = dataset_configs[selected_exp_index].corr_models_list.findIndex(model => { return model.string_text == model_Obj.string_text });
      if (index > -1) { // only splice array when item is found
        dataset_configs[selected_exp_index].corr_models_list.splice(index, 1); // 2nd parameter means remove one item only
      }
      //rebuild element displaying amount of datasets on the screen
      updateModelsCnt(dataset_configs[selected_exp_index].corr_models_list.length)
    }
    if (type == "K-best Features Selection") {
      var index = dataset_configs[selected_exp_index].kbest_models_list.findIndex(model => { return model.string_text == model_Obj.string_text });
      if (index > -1) { // only splice array when item is found
        dataset_configs[selected_exp_index].kbest_models_list.splice(index, 1); // 2nd parameter means remove one item only
      }
      //rebuild element displaying amount of datasets on the screen
      updateModelsCnt(dataset_configs[selected_exp_index].kbest_models_list.length)
    }

    //remove element
    document.getElementById(model_Obj.string_text).remove()

  }

  span_elem_remButton.append(rem_button)
  div_elem_buttons_container.append(span_elem_remButton)

  div_elem.append(div_elem_buttons_container)

  parent_elem.append(div_elem)

  if (type == "Model Training") {
    updateModelsCnt(dataset_configs[selected_exp_index].models_list.length)
  }
  else if (type == "Hyperparameters Tuning") {
    updateModelsCnt(dataset_configs[selected_exp_index].hyperparam_models_list.length)
  }
  if (type == "Correlated Features Selection") {
    updateModelsCnt(dataset_configs[selected_exp_index].corr_models_list.length)
  }
  if (type == "K-best Features Selection") {
    updateModelsCnt(dataset_configs[selected_exp_index].kbest_models_list.length)
  }

}

function updateModelsCnt(cnt) {
  //rebuild element displaying amount of models on the screen
  document.getElementById("models_cnt").innerHTML = "<label id = 'models_cnt'>" + cnt +
    " models selected: <a class = 'cursor' onclick = 'clearAllModels()'>clear all</a></label>"
}

function clearAllModels() {
  var type = document.getElementById("dropDownMenu").options[document.getElementById("dropDownMenu").selectedIndex].value
  if (type == 'Model Training') {
    for (var model of dataset_configs[dataset_configs.findIndex(selectedConfig)].models_list) {
      document.getElementById(model.string_text).remove()
    }
    dataset_configs[dataset_configs.findIndex(selectedConfig)].models_list = []
  }
  else if (type == "Hyperparameters Tuning") {
    for (var model of dataset_configs[dataset_configs.findIndex(selectedConfig)].hyperparam_models_list) {
      document.getElementById(model.string_text).remove()
    }
    dataset_configs[dataset_configs.findIndex(selectedConfig)].hyperparam_models_list = []
  }
  else if (type == 'Correlated Features Selection') {
    for (var model of dataset_configs[dataset_configs.findIndex(selectedConfig)].corr_models_list) {
      document.getElementById(model.string_text).remove()
    }
    dataset_configs[dataset_configs.findIndex(selectedConfig)].corr_models_list = []
  }
  else if (type == 'K-best Features Selection') {
    for (var model of dataset_configs[dataset_configs.findIndex(selectedConfig)].kbest_models_list) {
      document.getElementById(model.string_text).remove()
    }
    dataset_configs[dataset_configs.findIndex(selectedConfig)].kbest_models_list = []
  }

  updateModelsCnt(0)
}

function createNumInput(id, start, stop, slider_incr, val, model_Obj_string_text, hyper_param_index) {

  if (typeof val == "string") {
    val = start
  }

  if (isDecimal(val)) {
    val = (Number(val)).toFixed(2);
  }
  else {
    val = parseInt(val);
  }
  // '<div style = "float: left;margin-top:41px;font-weight:bold">Increament </div>' +
  return "<div class='input-group'>" +
    "<button class='btn' onclick ='decrClicked(" + id + ", " + start + ", " + stop + ", " + slider_incr + ", " + '"' + model_Obj_string_text + '"' + ", " + hyper_param_index + ", false)'>-</button>" +
    "<input id='incr_input_" + id + "' class='incr_input' value='" + val + "' onfocusout='incrSet(" + id + ", " + start + ", " + stop + ", " + slider_incr + ", " + '"' + model_Obj_string_text + '"' + ", " + hyper_param_index + ", false)'>" +
    "<button class='btn' onclick= 'incrClicked(" + id + ", " + start + ", " + stop + ", " + slider_incr + ", " + '"' + model_Obj_string_text + '"' + ", " + hyper_param_index + ", false)'>+</button>" +
    "</div>"
}

function createDefaultNumInput(id) {

  default_value = "Use Default Value"
  return '<div class="item"><div class="checkbox-rect"><input type="checkbox" id="' + id + '_default_' + '" class="cbox_' + id + '" value="' + default_value + '" oninput="defaultNumInputChanged(' + id + ')">' +
    '<label for="' + id + '_default_' + '"style="padding-top:3px;" class="feat_label" >' + default_value + ' </label></div></div>'


}
function defaultNumInputChanged(id) {
  incr_input = document.getElementById("incr_input_" + id)
  if (incr_input.disabled) {
    incr_input.disabled = ""
  }
  else {
    incr_input.disabled = "disabled"
  }

}

function createDefaultClassInput(id) {

  default_value = "Use Default Value"
  return '<div class="item"><div class="checkbox-rect"><input type="checkbox" id="' + id + '_default_' + '" class="cbox_' + id + '" value="' + default_value + '" oninput="defaultClassInputChanged(' + id + ')">' +
    '<label for="' + id + '_default_' + '"style="padding-top:3px;" class="feat_label" >' + default_value + ' </label></div></div>'

}

function defaultClassInputChanged(id) {
  let classes_checkboxes = document.getElementById("features_platform_" + id)

  if (document.getElementById(id + "_default_").checked) {

    // Disable the div
    classes_checkboxes.style.display = "none";

    // Disable all child elements
    const childElements = classes_checkboxes.getElementsByTagName('*');
    for (let i = 0; i < childElements.length; i++) {
      childElements[i].disabled = true;
    }
  }
  else {

    // Disable the div
    classes_checkboxes.style.display = "block";

    // Disable all child elements
    const childElements = classes_checkboxes.getElementsByTagName('*');
    for (let i = 0; i < childElements.length; i++) {
      childElements[i].disabled = false;
    }
  }

}

//Dropdown menus filling with servers JSON response
//creates a dataset entry on the dataset dropdown based on the server's retrieved dataset json
function createDatasetEntry(dataset_obj, selected) {
  //dataset name 
  var dataset_dropdown = document.getElementById("datasetDropDown")
  var new_dataset_option = document.createElement("option")
  new_dataset_option.value = exp_cnt
  new_dataset_option.text = dataset_obj.name

  exp = new Experiment(exp_cnt, "", "Model Training", dataset_obj, [], [], [true, true, true], [], [], [], [], "", "0.00%", "0.00%", "")
  dataset_configs.push(exp)
  exp_cnt++


  if (selected == true) {
    new_dataset_option.selected = "selected"
    loadConfig(exp)

  }
  dataset_dropdown.add(new_dataset_option)

}

//function to load a draft experiment requested to be re-configured using the edit button
function createDraftedExpEntry(exp_obj) {

  //dataset name 
  var dataset_dropdown = document.getElementById("datasetDropDown")
  var new_dataset_option = document.createElement("option")
  new_dataset_option.value = exp_obj.id
  new_dataset_option.text = exp_obj.dataset_Obj.name

  dataset_dropdown.replaceChild(new_dataset_option, dataset_dropdown.options[Array.from(dataset_dropdown.options).findIndex( opt => {return opt.innerHTML == exp_obj.dataset_Obj.name})] )

  dataset_configs[dataset_configs.findIndex(exp => {
    return exp.dataset_Obj.name == exp_obj.dataset_Obj.name
  })] = exp_obj

  exp_cnt++


  new_dataset_option.selected = "selected"
  loadConfig(exp)

}

//function to save an experiment as draft
function saveDraftExperiment() {

  var selected_experiment_index = dataset_configs.findIndex(selectedConfig)

  var name = document.getElementById("exp_name").value
  var nameValid = checkName(name)
  if (nameValid[0] != true) {
    generatePopup("error", nameValid[1]);
    return
  }
  dataset_configs[selected_experiment_index].name = name

  var type = document.getElementById("dropDownMenu").value

  dataset_configs[selected_experiment_index].type = type

  dataset_configs[selected_experiment_index].date = new Date()

  if (dataset_configs[selected_experiment_index].status == "Draft") {
    dataset_configs[selected_experiment_index].status = "DraftToDraft"
  }
  else {
    dataset_configs[selected_experiment_index].status = "Draft"
  }



  sendExperiment(dataset_configs[selected_experiment_index])


}

//function to submit an experiment for processing on the server
function submitExperiment() {

  var selected_experiment_index = dataset_configs.findIndex(selectedConfig)


  var name = document.getElementById("exp_name").value
  var nameValid = checkName(name)
  if (nameValid[0] != true) {
    generatePopup("error", nameValid[1]);
    return
  }
  dataset_configs[selected_experiment_index].name = name

  var type = document.getElementById("dropDownMenu").value

  dataset_configs[selected_experiment_index].type = type

  //checking configurations
  if (dataset_configs[selected_experiment_index].configurations_list.length <= 0) {
    generatePopup("error", "No Configuration specified. Please specify how many samples(quantity) to be used for the experiment for each of the target classes.");
    return
  }

  //checking features subsets
  if (dataset_configs[selected_experiment_index].subsets_list.length <= 0) {
    generatePopup("error", "No feature subsets specified. Please specify the features subsets to be used for the experiment.");
    return
  }

  //checking models list

  if (type == "Model Training") {
    if (dataset_configs[selected_experiment_index].models_list.length <= 0) {
      generatePopup("error", "No models specified. Please specify the ML algorithms and k for cross validation to be used for the experiment.");
      return
    }
  }
  else if (type == "Correlated Features Selection") {
    if (dataset_configs[selected_experiment_index].corr_models_list.length <= 0) {
      generatePopup("error", "No models specified. Please specify the algorithms and correlation threshold to be used.");
      return
    }
  }
  else if (type == "K-best Features Selection") {
    if (dataset_configs[selected_experiment_index].kbest_models_list.length <= 0) {
      generatePopup("error", "No models specified. Please specify the algorithms and k for k-best features to be used.");
      return
    }
  }

  dataset_configs[selected_experiment_index].date = new Date()

  if (dataset_configs[selected_experiment_index].status == "Draft") {
    dataset_configs[selected_experiment_index].status = "DraftToQueued"
  }
  else {
    dataset_configs[selected_experiment_index].status = "Queued"
  }


  sendExperiment(dataset_configs[selected_experiment_index])


}

//validates the defined name of the experiment
function checkName(name) {
  if (name.length < 1) {
    return [false, "Invalid name. Name cannot be empty"]
  }
  if (name.length > 40) {
    return [false, "Invalid name. Name cannot contain > 40 characters"]
  }
  for (var char of name) {
    if (!(char >= 'a' && char <= 'z' || char >= 'A' && char <= 'Z' || char >= '0' && char <= '9' || char == '_')) {
      return [false, "Invalid name. Character " + char + " is not valid."]
    }
  }
  return [true]
}


//function to load the clicked tab's contents
function openConfig(name) {

  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent")

  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none"
  }

  tablinks = document.getElementsByClassName("tablinks")

  for (i = 0; i < tablinks.length; i++) {
    if (tablinks[i].id == name + "Tab") {
      tablinks[i].classList.add("active")
    }
    else {
      tablinks[i].className = tablinks[i].className.replace(" active", "")
    }


  }

  document.getElementById(name).style.display = "block"

}

//function to get the datasets from the server
function requestDatasets(field, ascending) {

  var empty_object = [];
  var xhr = new XMLHttpRequest();

  xhr.open("POST", "php/get_datasets.php");
  xhr.setRequestHeader("Content-Type", "application/json");
  document.getElementById("loading").classList.add("show")
  xhr.send(JSON.stringify({ field: field, ascending: ascending }));

  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4 && xhr.status >= 200 && xhr.status < 300) {

      loadDatasets(JSON.parse(xhr.responseText))
      document.getElementById("loading").classList.remove("show")

      processParameters()
      dropDownChange()
    };
  };


}

function requestAlgorithms() {

  var empty_object = [];
  var xhr = new XMLHttpRequest();

  xhr.open("POST", "php/get_algorithms.php");
  xhr.setRequestHeader("Content-Type", "application/json");

  document.getElementById("loading").classList.add("show")
  xhr.send(JSON.stringify(empty_object));

  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4 && xhr.status >= 200 && xhr.status < 300) {
      algorithms = JSON.parse(xhr.responseText)
      document.getElementById("loading").classList.remove("show")
    };
  };


}

//function to process the html's parameters (to load an experiment with the id in the url)
function processParameters() {
  var parameters = location.search.replaceAll("%20", " ")
  var splitted = parameters.substring(1).split('=')

  if (splitted[0].trim() != 'id' || localStorage.getItem(splitted[1]) == null) {
    return
  }

  exp = JSON.parse(localStorage.getItem(splitted[1]))

  createDraftedExpEntry(exp)

}

//loading the datasets received in JSON format from the server-php
function loadDatasets(datasets_JSON) {

  for (const i in datasets_JSON) {
    if(datasets_JSON[i].status != "Completed")continue;

    var id = datasets_JSON[i].id
    var name = datasets_JSON[i].name
    var filenames = datasets_JSON[i].filenames
    var targets = datasets_JSON[i].targets
    var features = datasets_JSON[i].features
    var target = datasets_JSON[i].target
    const dataset_obj = new Dataset(id, name, filenames, targets, features, target)
    datasets_Obj.push(dataset_obj)

    if (i == 0) {
      createDatasetEntry(dataset_obj, true)
    }
    else {
      createDatasetEntry(dataset_obj, false)
    }
  }

}

//copies the current feature selection to the clipboard(local cache)
function copySelection() {
  var features_checkboxes = document.querySelectorAll(".cbox")
  selected_exp_index = dataset_configs.findIndex(selectedConfig)
  var subset = []

  //Gather all selected feature checkboxes
  for (var feature of features_checkboxes) {
    if (feature.checked) {
      subset.push(feature.value)
    }
  }
  if (subset.length == 0) {
    generatePopup("error", "No features selected!");
    return
  }

  localStorage.setItem("Clipboard_features_" + dataset_configs[selected_exp_index].dataset_Obj.name, JSON.stringify(subset))
  if (subset.length > 1) {
    generatePopup("info", subset.length + " features copied!")
  }
  else {
    generatePopup("info", subset.length + " feature copied!")
  }

}

function pasteSelection() {
  var features_checkboxes = Array.prototype.slice.call(document.querySelectorAll(".cbox"))
  selected_exp_index = dataset_configs.findIndex(selectedConfig)

  clipboard = JSON.parse(localStorage.getItem("Clipboard_features_" + dataset_configs[selected_exp_index].dataset_Obj.name))

  if (!clipboard) {
    generatePopup("error", "No copied features on the clipboard");
    return;
  }

  for (var feature_elem of features_checkboxes) {
    if (clipboard.findIndex(feature => { return feature_elem.value == feature }) > -1)
      feature_elem.checked = "checked"
    else {
      feature_elem.checked = ""
    }
  }
  featureClicked()
  if (clipboard.length > 1) {
    generatePopup("info", clipboard.length + " features pasted!")
  }
  else {
    generatePopup("info", clipboard.length + " feature pasted!")
  }
}

function reverseSelection() {
  var features_checkboxes = document.querySelectorAll(".cbox")
  for (var feature of features_checkboxes) {
    feature.checked = !feature.checked
  }
  featureClicked()
}

function selectClipboard() {
  var features_checkboxes = Array.prototype.slice.call(document.querySelectorAll(".cbox"))
  selected_exp_index = dataset_configs.findIndex(selectedConfig)

  clipboard = JSON.parse(localStorage.getItem("Clipboard_features_" + dataset_configs[selected_exp_index].dataset_Obj.name))

  if (!clipboard) {
    generatePopup("error", "No copied features on the clipboard");
    return;
  }

  for (var feature_elem of features_checkboxes) {
    if (clipboard.findIndex(feature => { return feature_elem.value == feature }) > -1) {
      feature_elem.checked = "checked"
    }

  }
  featureClicked()
  if (clipboard.length > 1) {
    generatePopup("info", clipboard.length + " features selected!")
  }
  else {
    generatePopup("info", clipboard.length + " feature selected!")
  }
}

function unselectClipboard() {
  var features_checkboxes = Array.prototype.slice.call(document.querySelectorAll(".cbox"))
  selected_exp_index = dataset_configs.findIndex(selectedConfig)

  clipboard = JSON.parse(localStorage.getItem("Clipboard_features_" + dataset_configs[selected_exp_index].dataset_Obj.name))


  if (!clipboard) {
    generatePopup("error", "No copied features on the clipboard");
    return;
  }

  for (var feature_elem of features_checkboxes) {
    if (clipboard.findIndex(feature => { return feature_elem.value == feature }) > -1) {
      feature_elem.checked = ""
    }
  }
  featureClicked()

  if (clipboard.length > 1) {
    generatePopup("info", clipboard.length + " features unselected!")
  }
  else {
    generatePopup("info", clipboard.length + " feature unselected!")
  }
}

//Sending the experiment object in JSON format to the server
function sendExperiment(experiment_Obj) {

  //cleaning some fields that might have been written by previous executions of the same exp object
  delete experiment_Obj["duration"]
  delete experiment_Obj["pid"]
  delete experiment_Obj["dataset_info"]
  delete experiment_Obj["constant_features_results"]

  for (model of experiment_Obj["models_list"]) {
    delete model["model_results"]
  }
  for (model of experiment_Obj["corr_models_list"]) {
    delete model["model_results"]
  }
  for (model of experiment_Obj["kbest_models_list"]) {
    delete model["model_results"]
  }
  for (model of experiment_Obj["hyperparam_models_list"]) {
    delete model["model_results"]
  }


  if (experiment_Obj.status == "DraftToQueued" || experiment_Obj.status == "DraftToDraft") {
    experiment_Obj.status = experiment_Obj.status.substring(7)

    let xhr_replace = new XMLHttpRequest()

    xhr_replace.open("POST", "php/replace_exp.php")
    xhr_replace.setRequestHeader("Content-Type", "application/json")

    document.getElementById("loading").classList.add("show")
    xhr_replace.send(JSON.stringify(experiment_Obj));

    xhr_replace.onreadystatechange = function () {

      if ((xhr_replace.readyState == 4 && xhr_replace.status >= 400)) {
        generatePopup("error", xhr_replace.responseText);
      }

    };

    setTimeout(function () {
      document.getElementById("loading").classList.remove("show")
      if (experiment_Obj.status == "Draft") {
        localStorage.setItem("pop", "Experiment " + experiment_Obj["name"] + " saved succesfully!")
      }
      else if (experiment_Obj.status == "Queued") {
        localStorage.setItem("pop", "Experiment " + experiment_Obj["name"] + " submitted for execution!")
      }
      location.replace("index.html")
      

    }, 100)

  }
  else {
    let xhr = new XMLHttpRequest();

    xhr.open("POST", "php/submit.php");
    xhr.setRequestHeader("Content-Type", "application/json");

    document.getElementById("loading").classList.add("show")
    xhr.send(JSON.stringify(experiment_Obj));

    xhr.onreadystatechange = function () {

      if (xhr.readyState == 4 && xhr.status >= 400) {
        generatePopup("error", xhr.responseText);
      }


    };
    setTimeout(function () {
      document.getElementById("loading").classList.remove("show")
      if (experiment_Obj.status == "Draft") {
        localStorage.setItem("pop", "Experiment " + experiment_Obj["name"] + " saved succesfully!")
      }
      else if (experiment_Obj.status == "Queued") {
        localStorage.setItem("pop", "Experiment " + experiment_Obj["name"] + " submitted for execution!")
      }

      location.replace("index.html")
    }, 500)
  }

}


function dragElement(elmnt, dragger) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  if (dragger) {
    // if present, the header is where you move the DIV from:
    dragger.onmousedown = dragMouseDown;
  }
  // else {
  //   // otherwise, move the DIV from anywhere inside the DIV:
  //   elmnt.onmousedown = dragMouseDown;
  // }

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
  }
}


//function to run when Next button is clicked on the experiment tab
function experimentNext() {

  var selected_experiment_index = dataset_configs.findIndex(selectedConfig)

  var name = document.getElementById("exp_name").value
  var nameValid = checkName(name)
  if (nameValid[0] != true) {
    generatePopup("error", nameValid[1]);
    return
  }
  dataset_configs[selected_experiment_index].name = name
  dataset_configs[selected_experiment_index].type = document.getElementById("dropDownMenu").value

  openConfig("Dataset")

}

function datasetNext() {

  var selected_experiment_index = dataset_configs.findIndex(selectedConfig)

  //checking configurations
  if (dataset_configs[selected_experiment_index].configurations_list.length <= 0) {
    generatePopup("error", "No Configuration specified. Please specify how many samples(quantity) to be used for the experiment for each of the target classes.");
    return
  }

  openConfig("Features")

}

function featuresNext() {
  var selected_experiment_index = dataset_configs.findIndex(selectedConfig)

  //checking features subsets
  if (dataset_configs[selected_experiment_index].subsets_list.length <= 0) {
    generatePopup("error", "No feature subsets specified. Please specify the features subsets to be used for the experiment.");
    return
  }

  openConfig("Preprocessing")

}

function preprocessingNext() {

  openConfig("Model")

}