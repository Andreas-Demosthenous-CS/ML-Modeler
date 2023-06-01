import signal
import subprocess
import sys
import time
import psutil

from pymongo import MongoClient

from utils import  *

def start_Queued_Experiments(experiment_JSON):
    # if(experiment_JSON["status"] == "Queued"):
    proc = start_Experiment_Process(experiment_JSON)
    # else:
    #     sys.exit(0)
    return proc

def start_Experiment_Process(experiment_JSON):

    if (experiment_JSON["status"] != "Queued"):
        sys.exit(0)

    if (experiment_JSON["type"] == "Constant Features Selection"):
        proc = subprocess.Popen(['python', 'ConstantFeatures.py', str(experiment_JSON["id"])], stderr = subprocess.PIPE)

    elif (experiment_JSON["type"] == "Correlated Features Selection"):
        proc = subprocess.Popen(['python', 'HighlyCorrelatedFeatures.py', str(experiment_JSON["id"])], stderr = subprocess.PIPE)

    elif (experiment_JSON["type"] == "K-best Features Selection"):
        proc = subprocess.Popen(['python', 'KBestFeatures.py', str(experiment_JSON["id"])], stderr = subprocess.PIPE)

    elif (experiment_JSON["type"] == "Model Training"):
        proc = subprocess.Popen(['python', 'ModelTraining.py', str(experiment_JSON["id"])], stderr = subprocess.PIPE)

    elif (experiment_JSON["type"] == "Hyperparameters Tuning"):
        proc = subprocess.Popen(['python', 'HyperparametersTuning.py', str(experiment_JSON["id"])], stderr = subprocess.PIPE)

    return proc

if(len(sys.argv) < 2):
    print("No experiment ID specified")
exp_id = sys.argv[1];

client = MongoClient("mongodb://localhost:27017/")
db = client['MLWebsite']
exp_collection = db['Experiments']

query = {"id": exp_id}
JSON_exp = exp_collection.find_one(query)

proc = start_Queued_Experiments(JSON_exp)

update = {"$set": {"pid": proc.pid}}
exp_collection.update_one(query, update)

#start monitoring child process

running = True

pid = proc.pid

if(pid is None):
    running = False

try:
    time.sleep(2)
except:
    pass

# Loop until the child process terminates
while proc.poll() is None:

    #check whether termination command is given
    experiment_JSON = exp_collection.find_one(query)
    if(experiment_JSON["status"] == "Terminated"):
        try:
           kill(pid)
        except:
           pass

    # Get the memory usage of the child process
    memory_usage = memory_usage_psutil(pid)
    if(not memory_usage is None):
        update = {"$set": {"memUsage": str("{:.2f}".format(memory_usage)+"%")}}
        exp_collection.update_one(query, update)

    # Get the CPU usage of the child process
    cpu_usage = cpu_usage_psutil(pid)
    if(not cpu_usage is None):
        update = {"$set": {"cpuUsage": str("{:.2f}".format(cpu_usage)+"%")}}
        exp_collection.update_one(query, update)

    # Wait for 1 second before checking the usage again
    time.sleep(1)

if(proc.returncode != 0):
    err = proc.stderr.readlines()
    update = {"$set": {"status": "Terminated", "error": str(err)}}
    exp_collection.update_one(query, update)
    print("terminated " + str(err))

update = {"$set": {"memUsage": "0.00%"}}
exp_collection.update_one(query, update)
update = {"$set": {"cpuUsage": "0.00%"}}
exp_collection.update_one(query, update)

#
# while running == True:
#     experiment_JSON = exp_collection.find_one(query)
#
#     if not pid_exists(pid):
#
#         # Process terminated unexpectedly
#         if (experiment_JSON["pid"] == pid and
#             experiment_JSON["status"] == "Running" or experiment_JSON["status"] == "Queued"):
#             print("Subprocess terminated unexpectedly");
#
#             update = {"$set": {"status": "Terminated"}}
#             exp_collection.update_one(query, update)
#
#             running = False
#             print("Subprocess terminated unexpectedly");
#
#          # process terminated because completed execution normally
#         elif (experiment_JSON["pid"] == pid):
#             running = False
#             print("Subprocess completed execution normally");
#     #process not running
#     else:
#         memUsage = memory_usage_psutil(pid)
#         cpuUsage = cpu_usage_psutil(pid)
#         if(not memUsage is None):
#             update = {"$set": {"memUsage": str("{:.2f}".format(memUsage)+"%")}}
#             exp_collection.update_one(query, update)
#
#         if(not cpuUsage is None):
#             update = {"$set": {"cpuUsage": str("{:.2f}".format(cpuUsage)+"%")}}
#             exp_collection.update_one(query, update)
#
#         #process running in the system but its status = terminated or completed => kill the process
#         experiment_JSON = exp_collection.find_one(query)
#         if (experiment_JSON["pid"] == pid and
#                 experiment_JSON["status"] == "Terminated" or experiment_JSON["status"] == "Completed" and pid_exists(pid)):
#             #print("Subprocess status == Terminated => terminating");
#             #terminates process
#             try:
#              kill(pid)
#             except:
#                 pass
#             running = False
#
#     try:
#         time.sleep(2)
#     except:
#         pass
#
# update = {"$set": {"memUsage": "0.00%"}}
# exp_collection.update_one(query, update)
# update = {"$set": {"cpuUsage": "0.00%"}}
# exp_collection.update_one(query, update)

# writeFile(stdout_filename, str(proc.stdout.readlines()))
# writeFile(stderr_filename, str(proc.stderr.readlines()))
