
class Experiment{

    constructor(id, name, type, dataset_Obj, configurations_list, subsets_list, preprocessing_list, models_list, hyperparam_models_list, corr_models_list, kbest_models_list, date, memUsage, cpuUsage, status){
        this.id = id
        this.name = name
        this.type = type
        this.dataset_Obj = dataset_Obj
        this.configurations_list = configurations_list
        this.subsets_list = subsets_list
        this.preprocessing_list = preprocessing_list
        this.models_list = models_list
        this.hyperparam_models_list = hyperparam_models_list
        this.corr_models_list = corr_models_list
        this.kbest_models_list = kbest_models_list 
        this.date = date
        this.memUsage = memUsage
        this.cpuUsage = cpuUsage
        this.status = status
    }



}
