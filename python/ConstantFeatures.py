import sys
import atexit
import time

from sklearn.feature_selection import VarianceThreshold
from utils import *

from pymongo import MongoClient

def exit_handler():
    if (not normal_exit):
        update = {"$set": {"status": "Terminated"}}
        exp_collection.update_one(query, update)
        sys.stderr.write("Unexpected termination")

def get_Constant_Features_Main(exp_collection, experiment):

    print("Extracting dataset target configurations\n")
    configs = extract_Configurations(experiment['configurations_list'])

    print("Loading Dataset with specified configurations\n")
    dataset = load_dataset(configs, "datasets/"+experiment['dataset_Obj']['name']+"/", experiment['dataset_Obj']['target'], experiment['preprocessing_list'])

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

    dataset = dataset[experiment['dataset_Obj']['features']]

    subsets_list = experiment['subsets_list']

    constant_features_results = []
    for feature_subset_index in range(len(subsets_list)):

        print("Running feature subset " + str(feature_subset_index) + "\n")

        subset_results = {"features_susbet": subsets_list[feature_subset_index]['features'],
                          "features_susbet_index": feature_subset_index}
        current_subset_features = dataset[subsets_list[feature_subset_index]['features']]

        print("Encoding not numerical features\n")
        current_subset_features = encode_string_cols(current_subset_features)

        print("Starting Constant Features calculation\n")
        subset_results.update({"constant_features": get_constant_features(current_subset_features, 0)})
        print("Constant Features calculation completed\n")

        constant_features_results.append(subset_results)

        experiment.update({"constant_features_results": constant_features_results})

        # updating the db with the model results
        update = {"$set": {"constant_features_results": constant_features_results}}
        exp_collection.update_one(query, update)

    return experiment

def get_constant_features(dataset, threshold):
    var_threshold = VarianceThreshold(threshold=threshold)  # threshold = 0 for constant

    var_threshold.fit(dataset)

    # getting a bool list True-> keep feature, false->remove feature
    features_to_remove_results = var_threshold.get_support()

    # list to keep the name of features to remove
    features_to_remove = []
    feature_names = list(dataset.columns.values)[:]

    for bool, feature in zip(features_to_remove_results, feature_names):
        if bool == False:
            features_to_remove.append(feature)
    return features_to_remove


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
get_Constant_Features_Main(exp_collection, experiment_JSON)
end = time.time()

elapsed_time = (end - start) * 1000

print("Model Training Completed\n")
update = {"$set": {"status": "Completed", "duration":elapsed_time}}
exp_collection.update_one(query, update)

normal_exit = True
