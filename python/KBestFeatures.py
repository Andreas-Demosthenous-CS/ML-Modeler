import time

from sklearn.feature_selection import SelectKBest, mutual_info_classif, f_classif, chi2
from sklearn.preprocessing import StandardScaler
from utils import *
import sys
import atexit

from pymongo import MongoClient

def exit_handler():
    if (not normal_exit):
        update = {"$set": {"status": "Terminated"}}
        exp_collection.update_one(query, update)
        sys.stderr.write("Unexpected termination")


def run_KBest_Features_Experiment(exp_collection, experiment):

    #loading the dataset with the predefined parameters:
    print("Extracting dataset target configurations\n")
    configs = extract_Configurations(experiment['configurations_list'])

    print("Loading Dataset with specified configurations\n")
    dataset = load_dataset(configs, "datasets/" + experiment['dataset_Obj']['name'] + "/",
                           experiment['dataset_Obj']['target'], experiment['preprocessing_list'])

    #saving dataset info
    pd.set_option('display.max_columns', 100000)

    experiment['dataset_info'] = dict()

    samples =  len(dataset[experiment['dataset_Obj']['target']])
    experiment['dataset_info'].update({"samples": str(samples)})

    description = dataset[experiment['dataset_Obj']['features']].describe()
    description_json = json.loads(description.to_json(orient="split"))
    experiment['dataset_info'].update({"description": description_json})

    targetclass_distribution = dataset.groupby(experiment['dataset_Obj']['target']).size()
    targetclass_distribution_json = json.loads(targetclass_distribution.to_json(orient="split"))
    experiment['dataset_info'].update({"target_distribution": targetclass_distribution_json})


    # updating the db
    update = {"$set": {"dataset_info": experiment['dataset_info']}}
    exp_collection.update_one(query, update)


    dataset_target = dataset[experiment['dataset_Obj']['target']]
    dataset_features = dataset[experiment['dataset_Obj']['features']]




    #loading the different execution configurations
    kbest_models_list = experiment['kbest_models_list']
    subsets_list = experiment['subsets_list']

    for model_config_index in range(len(kbest_models_list)):
        model_results = []
        print("Running model "+str(model_config_index)+" -> "+ str(kbest_models_list[model_config_index])+"\n")

        for feature_subset_index in range(len(subsets_list)):
            print("Running features subset " + str(feature_subset_index) + "\n")

            subset_results = {"features_susbet" : subsets_list[feature_subset_index]['features'], "features_susbet_index" : feature_subset_index}
            current_subset_features = dataset_features[subsets_list[feature_subset_index]['features']]

            print("Encoding not numerical features\n")
            current_subset_features = encode_string_cols(current_subset_features)

            algorithm = kbest_models_list[model_config_index]['algorithm']
            k = int(kbest_models_list[model_config_index]['k'])

            if(algorithm != "Chi-2" and algorithm != "F-Test" and algorithm != "Mutual Information Test"):
                subset_results.update({"results": "Error unrecognized algorithm"})
                model_results.append(subset_results)
                continue;

            print("Starting K-Best features calculation\n")
            subset_results.update({"KBest_features": get_kbest_features(current_subset_features, dataset_target, algorithm, k)})
            print("K-Best features calculation completed\n")

            model_results.append(subset_results)

            experiment['kbest_models_list'][model_config_index].update({"model_results": model_results})

            # updating the db with the model results
            update = {"$set": {"kbest_models_list": experiment['kbest_models_list']}}
            exp_collection.update_one(query, update)

    return experiment

def get_kbest_features(dataset_features, dataset_target, algorithm_str, k):
    if (algorithm_str == "Chi-2"):
        algorithm = chi2
    elif (algorithm_str == "F-Test"):
        algorithm = f_classif
    elif (algorithm_str == "Mutual Information Test"):
        algorithm = mutual_info_classif

    results = get_KBestFeatures_Univariate_selection(dataset_features, dataset_target, algorithm, k)
    k_best = []
    for f in results:
        k_best.append(dataset_features.columns.values[f])
    return k_best

def get_KBestFeatures_Univariate_selection(dataset_features, dataset_target, algorithm, k):
    if(k>=len(dataset_features.columns)):
        k = 'all'
    model = SelectKBest(score_func=algorithm, k=k).fit(dataset_features, dataset_target)

    kbest_features = model.get_support()
    kBest = []

    for feature_index in range(len(kbest_features)):
        if (kbest_features[feature_index]):
            kBest.append(feature_index)
    return kBest


#start

exp_id = sys.argv[1];
client = MongoClient("mongodb://localhost:27017/")

db = client['MLWebsite']
exp_collection = db['Experiments']

query = {"id": exp_id}
experiment_JSON = exp_collection.find_one(query)

normal_exit = False
atexit.register(exit_handler)


print("Running Model Training\n")
update = {"$set": {"status": "Running"}}
exp_collection.update_one(query, update)

# get starting time in s
start = time.time()
run_KBest_Features_Experiment(exp_collection, experiment_JSON)
end = time.time()

elapsed_time = (end - start) * 1000

print("Model Training Completed\n")
update = {"$set": {"status": "Completed", "duration":elapsed_time}}
exp_collection.update_one(query, update)

normal_exit = True