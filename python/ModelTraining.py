import time

from sklearn.discriminant_analysis import LinearDiscriminantAnalysis
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import make_scorer, f1_score, recall_score, precision_score, accuracy_score
from sklearn.model_selection import cross_validate
from sklearn.naive_bayes import GaussianNB
from sklearn.neighbors import KNeighborsClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.tree import DecisionTreeClassifier
from vaex.ml.sklearn import Predictor
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


def getHyperparams(hyperparams):
    params = {}
    for param in hyperparams:
        #skip when default values are used
        if (param["selected_value"] == param["default_value"]):
            continue;

        if(param["type"] == "boolean"):
            if(param["selected_value"] == "false"):
                params[param["name"]] = False
            elif(param["selected_value"] == "true"):
                params[param["name"]] = True
            continue
        params[param["name"]] = param["selected_value"]
    print("Hyperparams: "+ str(params))
    return params


def run_Model_Training_Experiment(exp_collection, experiment):

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

    dataset_target = dataset[experiment['dataset_Obj']['target']]
    dataset_features = dataset[experiment['dataset_Obj']['features']]

    #loading the different execution configurations
    models_list = experiment['models_list']
    subsets_list = experiment['subsets_list']

    for model_config_index in range(len(models_list)):
        model_results = []
        print("Running model "+str(model_config_index)+" -> "+str(models_list[model_config_index])+"\n")

        for feature_subset_index in range(len(subsets_list)):
            print("Running feature subset "+str(feature_subset_index)+"\n")

            subset_results = {"features_susbet" : subsets_list[feature_subset_index]['features'], "features_susbet_index" : feature_subset_index}
            current_subset_features = dataset_features[subsets_list[feature_subset_index]['features']]

            print("Encoding non numerical features\n")
            current_subset_features = encode_string_cols(current_subset_features)

            algorithm_abr = models_list[model_config_index]['algorithm_abr']
            kfold_k = int(models_list[model_config_index]['k'])

            hyperparams = getHyperparams(models_list[model_config_index]['hyper_parameters'])

            if(algorithm_abr == "RFC"):
                model = RandomForestClassifier(**hyperparams)
            elif(algorithm_abr == "DTC"):
                model = DecisionTreeClassifier(**hyperparams)
            elif (algorithm_abr == "KNN"):
                model = KNeighborsClassifier(**hyperparams)
            elif (algorithm_abr == "XGBC"):
                model = XGBClassifier(**hyperparams)
            elif (algorithm_abr == "GNB"):
                model = GaussianNB(**hyperparams)
            elif (algorithm_abr == "MLPC"):
                model = MLPClassifier(**hyperparams)
            elif (algorithm_abr == "LR"):
                model = LogisticRegression(**hyperparams)
            elif (algorithm_abr == "LDA"):
                model = LinearDiscriminantAnalysis(**hyperparams)
            else:
                subset_results.update({"results": "Error unrecognized algorithm"})
                model_results.append(subset_results)
                continue;

            print("Starting model training\n")
            subset_results.update({"results": train_Model(model, current_subset_features, dataset_target, kfold_k)})

            print("Model training completed\n")

            model_results.append(subset_results)

            experiment['models_list'][model_config_index].update({"model_results": model_results})

            #updating the db with the model results
            update = {"$set": {"models_list": experiment['models_list']}}
            exp_collection.update_one(query, update)

    return experiment

def cross_validation(model, _X, _y, _cv=5):

    #setting the scoring parameters to be measuring (weighted as we use multilabel classification, no binary)
    _scoring = {'recall':make_scorer(recall_score, average='weighted'),
                'f1':make_scorer(f1_score, average='weighted'),
                'accuracy': make_scorer(accuracy_score),
               'precision': make_scorer(precision_score, average='weighted')}

    results = cross_validate(estimator=model,
                             X=_X,
                             y=_y,
                             cv=_cv,
                             scoring=_scoring,
                             return_train_score=True)

    return {"Training Accuracy scores": list(results['train_accuracy']),
              "Mean Training Accuracy": results['train_accuracy'].mean()*100,
              "Training Precision scores": list(results['train_precision']),
              "Mean Training Precision": results['train_precision'].mean(),
              "Training Recall scores": list(results['train_recall']),
              "Mean Training Recall": results['train_recall'].mean(),
              "Training F1 scores": list(results['train_f1']),
              "Mean Training F1 Score": results['train_f1'].mean(),
              "Validation Accuracy scores": list(results['test_accuracy']),
              "Mean Validation Accuracy": results['test_accuracy'].mean()*100,
              "Validation Precision scores": list(results['test_precision']),
              "Mean Validation Precision": results['test_precision'].mean(),
              "Validation Recall scores": list(results['test_recall']),
              "Mean Validation Recall": results['test_recall'].mean(),
              "Validation F1 scores": list(results['test_f1']),
              "Mean Validation F1 Score": results['test_f1'].mean()
              }

def train_Model(model, X_train, y_train, kfold_k):

    algorithm_pipeline = make_pipeline(StandardScaler(), model)
    start_time = time.time()

    model_results = cross_validation(algorithm_pipeline, X_train, y_train, kfold_k)


    elapsed_time = time.time() - start_time

    model_results.update({'Total Duration': elapsed_time})

    return model_results


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
run_Model_Training_Experiment(exp_collection, experiment_JSON)
# get ending time in s
end = time.time()

elapsed_time = (end - start) * 1000

print("Model Training Completed\n")
update = {"$set": {"status": "Completed", "duration":elapsed_time}}
exp_collection.update_one(query, update)

normal_exit = True
