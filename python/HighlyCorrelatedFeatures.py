import time

from utils import *
import sys
import atexit
from pymongo import MongoClient

def exit_handler():
    if (not normal_exit):
        update = {"$set": {"status": "Terminated"}}
        exp_collection.update_one(query, update)
        sys.stderr.write("Unexpected termination")


def run_Correlated_Features_Experiment(exp_collection, experiment):

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

    dataset_features = dataset[experiment['dataset_Obj']['features']]

    # loading the different execution configurations
    corr_models_list = experiment['corr_models_list']
    subsets_list = experiment['subsets_list']

    for model_config_index in range(len(corr_models_list)):
        model_results = []
        print("Running model " + str(model_config_index) + " -> " + str(corr_models_list[model_config_index]) + "\n")

        for feature_subset_index in range(len(subsets_list)):
            print("Running feature subset " + str(feature_subset_index) + "\n")

            subset_results = {"features_susbet": subsets_list[feature_subset_index]['features'],
                              "features_susbet_index": feature_subset_index}

            current_subset_features = dataset_features[subsets_list[feature_subset_index]['features']]

            print("Encoding not numerical features\n")
            current_subset_features = encode_string_cols(current_subset_features)

            algorithm = corr_models_list[model_config_index]['algorithm']
            threshold = float(corr_models_list[model_config_index]['threshold'])

            if (algorithm == "Pearson"):
                algorithm = "pearson"
            elif(algorithm == "Spearman"):
                algorithm = "spearman"
            else:
                subset_results.update({"correlated_features": "Error unrecognized algorithm"})
                model_results.append(subset_results)
                continue;

            print("Starting Correlated Features calculation\n")
            subset_results.update({"correlated_features": get_highly_correlated_features(current_subset_features, algorithm, threshold)})
            print("Correlated Features calculation completed\n")

            model_results.append(subset_results)
            experiment['corr_models_list'][model_config_index].update({"model_results": model_results})

            # updating the db with the model results
            update = {"$set": {"corr_models_list": experiment['corr_models_list']}}
            exp_collection.update_one(query, update)

    return experiment

def get_highly_correlated_features(dataset_features, algorithm, correlation_threshold):
    highly_correlated_features = []

    correlation_matrix = dataset_features.corr(method=algorithm)
    cnt = 0
    # getting only the upper triangle(without diagonal as it is the correlation of target with it self) of the table as it is diagonally symmetrical and identical to the lower one
    # u -> upper triangle
    # m -> diagonal (nan as we chose the upper one)
    # d -> lower triangle (nan as we chose the upper one)
    # m u u u u u
    # d m u u u u
    # d d m u u u
    # d d d m u u
    # d d d d m u
    # d d d d d m
    #in order to get the parallel correlated features of every feature keep correlation matrix as it is without only the upper tri.
    upper_tri = correlation_matrix.where(np.triu(np.ones(correlation_matrix.shape), k=1).astype(bool))
    for row_index, row in upper_tri.iterrows():
        #somehow iterates through the 1st column instead of first riw that was intended but does same job as the array is symmetrical
        correlated_features = []
        for col_index in range(len(row)):
            if(str(upper_tri[row_index][col_index]) != 'nan' and abs(upper_tri[row_index][col_index]) > correlation_threshold):
                correlated_features.append(dataset_features.columns.values[col_index])
        highly_correlated_features.append(correlated_features)
    for i in range(len(highly_correlated_features)):
        print(list(dataset_features.columns.values)[i] + " --> " + str(highly_correlated_features[i]))

    return highly_correlated_features

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
run_Correlated_Features_Experiment(exp_collection, experiment_JSON)
end = time.time()

elapsed_time = (end - start) * 1000

print("Model Training Completed\n")
update = {"$set": {"status": "Completed", "duration":elapsed_time}}
exp_collection.update_one(query, update)

normal_exit = True
