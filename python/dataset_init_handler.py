import signal
import subprocess
import sys
import time
import psutil

from pymongo import MongoClient

from utils import  *

def start_dataset_init_process(dataset_JSON):
    proc = subprocess.Popen(['python', 'DatasetInitializer.py', str(dataset_JSON["id"])], stderr = subprocess.PIPE)
    return proc

if(len(sys.argv) < 2):
    print("No dataset ID specified")
    exit()
ds_id = sys.argv[1];

client = MongoClient("mongodb://localhost:27017/")
db = client['MLWebsite']
ds_collection = db['Datasets']

query = {"id": ds_id}
JSON_ds = ds_collection.find_one(query)

proc = start_dataset_init_process(JSON_ds)

update = {"$set": {"pid": proc.pid}}
ds_collection.update_one(query, update)

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
    dataset_JSON = ds_collection.find_one(query)
    if(dataset_JSON["status"] == "Terminated"):
        try:
           kill(pid)
        except:
           pass

    # Get the memory usage of the child process
    memory_usage = memory_usage_psutil(pid)
    if(not memory_usage is None):
        update = {"$set": {"memUsage": str("{:.2f}".format(memory_usage)+"%")}}
        ds_collection.update_one(query, update)

    # Get the CPU usage of the child process
    cpu_usage = cpu_usage_psutil(pid)
    if(not cpu_usage is None):
        update = {"$set": {"cpuUsage": str("{:.2f}".format(cpu_usage)+"%")}}
        ds_collection.update_one(query, update)

    # Wait for 1 second before checking the usage again
    time.sleep(1)

if(proc.returncode != 0):
    err = proc.stderr.readlines()
    update = {"$set": {"status": "Terminated", "error": str(err)}}
    ds_collection.update_one(query, update)
    print("terminated "+str(err))

update = {"$set": {"memUsage": "0.00%"}}
ds_collection.update_one(query, update)
update = {"$set": {"cpuUsage": "0.00%"}}
ds_collection.update_one(query, update)

#
# while running == True:
#     dataset_JSON = ds_collection.find_one(query)
#
#     if not pid_exists(pid):
#
#         # Process terminated unexpectedly
#         if (dataset_JSON["pid"] == pid and
#             dataset_JSON["status"] == "Running" or dataset_JSON["status"] == "Queued"):
#             print("Subprocess terminated unexpectedly");
#
#             update = {"$set": {"status": "Terminated"}}
#             ds_collection.update_one(query, update)
#
#             running = False
#             print("Subprocess terminated unexpectedly");
#
#          # process terminated because completed execution normally
#         elif (dataset_JSON["pid"] == pid):
#             running = False
#             print("Subprocess completed execution normally");
#     #process not running
#     else:
#         memUsage = memory_usage_psutil(pid)
#         cpuUsage = cpu_usage_psutil(pid)
#         if(not memUsage is None):
#             update = {"$set": {"memUsage": str("{:.2f}".format(memUsage)+"%")}}
#             ds_collection.update_one(query, update)
#
#         if(not cpuUsage is None):
#             update = {"$set": {"cpuUsage": str("{:.2f}".format(cpuUsage)+"%")}}
#             ds_collection.update_one(query, update)
#
#         #process running in the system but its status = terminated or completed => kill the process
#         dataset_JSON = ds_collection.find_one(query)
#         if (dataset_JSON["pid"] == pid and
#                 dataset_JSON["status"] == "Terminated" or dataset_JSON["status"] == "Completed" and pid_exists(pid)):
#
#             try:
#                 time.sleep(2)
#             except:
#                 pass
#             if (dataset_JSON["pid"] == pid and dataset_JSON["status"] == "Terminated" or dataset_JSON["status"] == "Completed" and pid_exists(pid)):
#                 print("Subprocess status == Terminated => terminating");
#                 #terminates process
#                 try:
#                     kill(pid)
#                 except:
#                     pass
#             running = False
#     try:
#         time.sleep(2)
#     except:
#         pass
#
# update = {"$set": {"memUsage": "0.00%"}}
# ds_collection.update_one(query, update)
# update = {"$set": {"cpuUsage": "0.00%"}}
# ds_collection.update_one(query, update)
#
# # writeFile(stdout_filename, str(proc.stdout.readlines()))
# # writeFile(stderr_filename, str(proc.stderr.readlines()))
