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

from vaex import *

from utils import *
import sys
import atexit

# saving dataset info
pd.set_option('display.max_columns', 100000)

def exit_handler():
    if (not normal_exit):
        update = {"$set": {"status": "Terminated"}}
        ds_collection.update_one(query, update)
        sys.stderr.write("Unexpected termination")

def load_vaex_dataset(dataset_path):
    # get a list of all Excel files in the folder
    excel_files = [os.path.join(dataset_path, f) for f in os.listdir(dataset_path) if f.endswith('.xlsx')]
    csv_files = [os.path.join(dataset_path, f) for f in os.listdir(dataset_path) if f.endswith('.csv')]

    #
    # # load each Excel file into a vaex DataFrame
    # df_list = []
    # for excel_file in excel_files:
    #     df_xlsx = vaex.from_excel(excel_file, low_memory=False)
    #     df_list.append(df_xlsx)
    # for csv_file in csv_files:
    #     df_csv = vaex.from_csv(csv_file)
    #     df_list.append(df_csv)
    #
    # # concatenate all vaex DataFrames into a single DataFrame
    # df_all = vaex.concat(df_list)

    return vaex.open_many(np.concatenate((csv_files, excel_files)))
# Define a function to check if a string is UTF-8 encoded
def is_utf8(s):
    try:
        s.encode('utf-8')
        return True
    except:
        return False

def run_dataset_initializer(ds_collection, dataset_JSON):

    print("Loading Dataset with vaex\n")
    # create a vaex DataFrame from an Excel file
    dataset = load_vaex_dataset("datasets/" + dataset_JSON['name'] + "/")

    target_index = int(dataset_JSON["target_index"])
    #Check if `target_index` represents a column index in the DataFrame
    if not(target_index >= -1 and target_index < dataset.column_count()):
        return

    # save the target column name
    target_col = dataset.get_column_names()[target_index]

    features = []
    #save feature names
    for feat_name in dataset.get_column_names():
        if feat_name != "" and not feat_name is None and len(feat_name) >0 and feat_name != dataset.get_column_names()[target_index]:
            features.append(feat_name)

    try:
        unique_values = dataset.unique(target_col)
    except KeyboardInterrupt:
        print("Script is interrupted")
        exit()

    if len(unique_values) > 50:
        #no classification
        return;

    #updating the db
    update = {"$set": {"targets": unique_values, "features": features, "target": target_col}}
    ds_collection.update_one(query, update)

    #
    # dataset['dataset_info'] = dict()
    #
    # samples =  len(dataset[dataset['dataset_Obj']['target']])
    # dataset['dataset_info'].update({"samples": str(samples)})
    #
    # description = dataset[dataset['dataset_Obj']['features']].describe()
    # description_json = json.loads(description.to_json(orient="split"))
    # dataset['dataset_info'].update({"description": description_json})
    #
    # targetclass_distribution = dataset.groupby(dataset['dataset_Obj']['target']).size()
    # targetclass_distribution_json = json.loads(targetclass_distribution.to_json(orient="split"))
    # dataset['dataset_info'].update({"target_distribution": targetclass_distribution_json})
    #
    #
    # #updating the db
    # update = {"$set": {"dataset_info": dataset['dataset_info']}}
    # ds_collection.update_one(query, update)

    return

#start
client = MongoClient("mongodb://localhost:27017/")

if(len(sys.argv) < 2):
    print("No dataset ID specified")
    exit()
ds_id = sys.argv[1];

db = client['MLWebsite']
ds_collection = db['Datasets']

query = {"id": ds_id}
dataset_JSON = ds_collection.find_one(query)

normal_exit = False
atexit.register(exit_handler)

print("Running dataset init\n")
update = {"$set": {"status": "Running"}}
ds_collection.update_one(query, update)

# get starting time in s
start = time.time()
run_dataset_initializer(ds_collection, dataset_JSON)

# get ending time in s
end = time.time()

elapsed_time = (end - start) * 1000

print("Dataset initialization Completed\n")
update = {"$set": {"status": "Completed", "duration":elapsed_time}}
ds_collection.update_one(query, update)

normal_exit = True
