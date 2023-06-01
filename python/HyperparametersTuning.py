import threading
import time

import bson
from sklearn.discriminant_analysis import LinearDiscriminantAnalysis
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import make_scorer, f1_score, recall_score, precision_score, accuracy_score
from sklearn.model_selection import cross_validate, GridSearchCV
from sklearn.naive_bayes import GaussianNB
from sklearn.neighbors import KNeighborsClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.pipeline import make_pipeline, Pipeline
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.tree import DecisionTreeClassifier
from xgboost import XGBClassifier
from pymongo import MongoClient

from utils import *
import sys
import atexit

def exit_handler():
    if (not normal_exit):
        update = {"$set": {"status": "Terminated"}}
        exp_collection.update_one(query, update)
        sys.stderr.write("Unexpected termination")


def hyperparam_tuning(X, y, algorithm, hyperparams_config, k_fold):

    # Define the hyperparameters to tune
    hyperparameters = {}

    pipeline = Pipeline([
        ('standardscaler', StandardScaler(with_mean=False)),
        ('', algorithm)
    ])

    for hyperparameter in hyperparams_config:
        if(hyperparameter["type"] == "num_range"):
            start = hyperparameter["selected_start"]
            stop = hyperparameter["selected_stop"]
            incr = hyperparameter["selected_incr"]
            if isinstance(start, float) or isinstance(stop, float) or isinstance(incr, float):
                hyperparameters['__'+hyperparameter["name"]] = np.arange(start, stop+0.0001, incr)
            else:
                hyperparameters['__'+hyperparameter["name"]] = np.arange(start, stop+incr , incr)

        elif(hyperparameter["type"] == "class_range"):
            hyperparameters['__'+hyperparameter["name"]] = hyperparameter["selected_value_range"]

        elif(hyperparameter["type"] == "boolean"):
            arr = []
            if("true" in hyperparameter["selected_value_range"]): arr.append(True)
            if("false" in hyperparameter["selected_value_range"]): arr.append(False)
            hyperparameters['__'+hyperparameter["name"]] = arr

    print("hyperparameters: " + str(hyperparameters))

    # Create the grid search object
    clf = GridSearchCV(pipeline, hyperparameters, cv = k_fold, return_train_score=True, n_jobs = -1)

    # Fit the grid search to the training data
    clf.fit(X, y)

    # Print the best hyperparameters
    print('Best hyperparameters:', clf.best_params_)
    return clf.cv_results_

def run_Hyperparameter_Tuning_Experiment(exp_collection, experiment):

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


    #updating the db
    update = {"$set": {"dataset_info": experiment['dataset_info']}}
    exp_collection.update_one(query, update)


    print("Encoding target classes\n")

    #encoding target string label to be fed into the algorithms
    encoder = LabelEncoder()
    dataset[experiment['dataset_Obj']['target']] = encoder.fit_transform(dataset[experiment['dataset_Obj']['target']])

    #dataset[dataset.Label > 0] = 1

    dataset_target = dataset[experiment['dataset_Obj']['target']]
    dataset_features = dataset[experiment['dataset_Obj']['features']]

    #loading the different execution configurations
    hyperparam_models_list = experiment['hyperparam_models_list']
    subsets_list = experiment['subsets_list']

    for model_config_index in range(len(hyperparam_models_list)):
        model_results = []
        print("Running model "+str(model_config_index)+" -> "+str(hyperparam_models_list[model_config_index])+"\n")

        for feature_subset_index in range(len(subsets_list)):
            print("Running feature subset "+str(feature_subset_index)+"\n")

            subset_results = {"features_susbet" : subsets_list[feature_subset_index]['features'], "features_susbet_index" : feature_subset_index}
            current_subset_features = dataset_features[subsets_list[feature_subset_index]['features']]

            print("Encoding non numerical features\n")
            current_subset_features = encode_string_cols(current_subset_features)

            algorithm_abr = hyperparam_models_list[model_config_index]['algorithm_abr']
            kfold_k = int(hyperparam_models_list[model_config_index]['k'])
            hyperparams_config = hyperparam_models_list[model_config_index]['hyper_parameters']

            if (algorithm_abr == "RFC"):
                model = RandomForestClassifier()

            elif (algorithm_abr == "DTC"):
                model = DecisionTreeClassifier()

            elif (algorithm_abr == "KNN"):
                model = KNeighborsClassifier()

            elif (algorithm_abr == "XGBC"):
                model = XGBClassifier()

            elif (algorithm_abr == "GNB"):
                model = GaussianNB()

            elif (algorithm_abr == "MLPC"):
                model = MLPClassifier()

            elif (algorithm_abr == "LR"):
                model = LogisticRegression()

            elif (algorithm_abr == "LDA"):
                model = LinearDiscriminantAnalysis()
            else:
                subset_results.update({"results": "Error unrecognized algorithm"})
                model_results.append(subset_results)
                continue;

            print("Starting hyperparameter tuning\n")
            results = hyperparam_tuning(current_subset_features, dataset_target, model, hyperparams_config, kfold_k)
            results = json.loads(pd.DataFrame(results).to_json(orient='records'))


            # # fixing the np.int32 values that are not serializable
            # for attr, val in results.items():
            #     if(isinstance(val, np.int32)): results[attr] = int(val)

            subset_results.update({"results": results})


            print("Hyperparameter tuning completed\n")

            model_results.append(subset_results)

            experiment['hyperparam_models_list'][model_config_index].update({"model_results": model_results})

            #updating the db with the model results
            update = {"$set": {"hyperparam_models_list": experiment['hyperparam_models_list']}}

            exp_collection.update_one(query, update)

    return

#start

exp_id = sys.argv[1];
client = MongoClient("mongodb://localhost:27017/")

db = client['MLWebsite']
exp_collection = db['Experiments']

query = {"id": exp_id}
experiment_JSON = exp_collection.find_one(query)

normal_exit = False
atexit.register(exit_handler)


print("Running hyperparameter tuning\n")
update = {"$set": {"status": "Running"}}
exp_collection.update_one(query, update)

# get starting time in s
start = time.time()
run_Hyperparameter_Tuning_Experiment(exp_collection, experiment_JSON)

# get ending time in s
end = time.time()

elapsed_time = (end - start) * 1000

print("Hyperparameter tuning Completed\n")
update = {"$set": {"status": "Completed", "duration":elapsed_time}}
exp_collection.update_one(query, update)

normal_exit = True
