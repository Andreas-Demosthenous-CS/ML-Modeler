import os
import numpy as np
import pandas as pd
import json
import psutil
import vaex
from sklearn.preprocessing import LabelEncoder

pd.options.mode.use_inf_as_na = True  ## so that inf is also treated as NA value
pd.options.mode.chained_assignment = None  # default='warn'

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

#extracts the configs formatting them on the desired format config = [traffic class, quantity]
def extract_Configurations(configs_List):
    configs = []
    for config in configs_List:
        if(config['quantity'] == 'all'):
            configs.append([config['target_class'], -1])
        else:
            configs.append([config['target_class'], int(config['quantity'])])
    return configs

#returns the dataset after getting the required sample quantity per target class(config) by searching all dataset files
def load_dataset(configs, dataset_path, target_class_name, preprocessing_options):
    dataset = pd.DataFrame()

    for dataset_file in os.listdir(dataset_path):
        print("Reading: "+dataset_file+"\n")
        #1gb chunk
        chunksize = 10 ** 6
        with pd.read_csv(dataset_path+'/'+dataset_file, chunksize = chunksize, low_memory = False) as reader:
            for partial_dataset in reader:
                print("1 GB chunk processing\n")
                partial_dataset = preprocess(partial_dataset, preprocessing_options)
                partial_dataset, configs = get_sample(partial_dataset, configs, target_class_name)
                dataset = pd.concat([dataset, partial_dataset], ignore_index=True, axis=0)

    return dataset

#returns the dataset after applying the specified configuration(basically keeping the specified amount of samples per target class)
def get_sample(dataset, configs, target_class_name):
    reduced_dataset = pd.DataFrame()
    for i in range(0, len(configs)):
        # 0 means no more samples needed so moving to the next target class/iteration
        if(configs[i][1] == 0):
            continue

        target_class_sample = dataset[dataset[target_class_name] == configs[i][0]]

        if(target_class_sample.shape[0] == 0):
            continue

        #-1 means all sample has to be included
        if(configs[i][1] == -1):
            reduced_dataset = pd.concat([reduced_dataset, target_class_sample], ignore_index=True, axis=0)
        #if the target class has less samples than we need then we add all of it and update the new needed amount
        elif(configs[i][1] > target_class_sample.shape[0]):
            reduced_dataset = pd.concat([reduced_dataset, target_class_sample], ignore_index=True, axis=0)
            configs[i][1] -= target_class_sample.shape[0];
        #otherwise if the target class sample has more samples than we need we get a random sample of it and make the new amount 0
        else:
            reduced_target_sample = target_class_sample.sample(n = configs[i][1], replace = False)
            configs[i][1] = 0
            reduced_dataset = pd.concat([reduced_dataset, reduced_target_sample], ignore_index=True, axis=0)

    return reduced_dataset, configs

#returns the dataframe after applying the preprocessing parameters specified
def preprocess(dataset, options):

    # replacing negative values with 0 for integer columns
    if(options[0] == True):
        for index in range(0, len(dataset.dtypes)):
            #ensuring the column we are about to test is of numeric type
            if(np.issubdtype(dataset.dtypes[index], np.number)):
                #replacing negative values with 0 (lt -> less than)
                dataset[dataset.columns[index]] = dataset[dataset.columns[index]].mask(dataset[dataset.columns[index]].lt(0), 0)

    #remove rows with at least one empty-null/nan value
    if (options[1] == True):
        dataset.dropna(inplace=True)
    return dataset

#reads dataframe from hard drive
def readfile(filename):
    print("Reading file "+ filename + " from filesystem.")
    df = pd.read_csv(filename, low_memory=False)
    print("Loaded file shape: "+ str(df.shape)+"\n")
    return df

#saves dataframe on hard drive
def savefile(df, filename):
    print("Saving file "+ filename + " from filesystem.")
    df.to_csv(filename, index=False)
    print("file saved.")

def read_JSON_Experiments_File(filename):
    # open text file in read mode
    json_file = open(filename, "r")

    # read whole file to a string
    experiments_json_decoded = json.load(json_file)

    # close file
    json_file.close()
    return experiments_json_decoded

def write_JSON_Experiment_File(filename, experiment):

    # open text file in write mode
    json_file = open(filename, "w")
    json_file.write(json.dumps(experiment))

    # close file
    json_file.close()

def encode_string_cols(dataset):
    encoder = LabelEncoder()
    for index in range(0, len(dataset.dtypes)):
        # ensuring the column we are about to test is not of numeric type
        if not (np.issubdtype(dataset.dtypes[index], np.number)):
            print("\n Encoding feature: "+list(dataset.columns.values)[index])
            dataset[dataset.columns[index]] = encoder.fit_transform(dataset[dataset.columns[index]].astype(str))

    return dataset

def pid_exists(pid):
    if pid < 0: return False #NOTE: pid == 0 returns True
    try:
        os.kill(pid, 0)
    except ProcessLookupError: # errno.ESRCH
        return False # No such process
    except PermissionError: # errno.EPERM
        return True # Operation not permitted (i.e., process exists)
    else:
        # if(is_zombie(pid)):
        #     return False;
        return True # no error, we can send a signal to the process


def is_zombie(pid):
    try:
        process = psutil.Process(pid)
        if(process is None):
            return False
        return process.status() == psutil.STATUS_ZOMBIE
    except psutil.NoSuchProcess:
        return False


def kill(proc_pid):
    process = psutil.Process(proc_pid)
    for proc in process.children(recursive=True):
        proc.kill()
    process.kill()

def readFile(filename):
    # open text file in read mode
    file = open(filename, "r")

    # read whole file to a string
    data = file.readlines()

    # close file
    file.close()
    return data

def writeFile(filename, str):
    # open text file in read mode
    file = open(filename, "a")

    # read whole file to a string
    file.write(str)

    # close file
    file.close()
    return

def memory_usage_psutil(pid):
    # return the memory usage in percentage
    try:
        process = psutil.Process(pid)
        mem = None
        if (process.is_running()):
            mem = process.memory_percent()
    except:
        mem = None

    return mem

def cpu_usage_psutil(pid):
    # return the cpu usage in percentage
    try:
        process = psutil.Process(pid)
        cpu = None
        if(process.is_running()):
            cpu = process.cpu_percent(interval=0.4) / psutil.cpu_count()
    except:
        cpu = None

    return cpu


