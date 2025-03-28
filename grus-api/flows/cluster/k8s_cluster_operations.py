from flows.proccess_utils import run
from fastapi import HTTPException
import os
from classes.clusterconfig import ClusterConfig
import base64
# This function is used to login to a kubernetes cluster using kubectl with the given credentials   
async def kubectl_cluster_login(cluster_config_name: str):

    # Get the cluster config details from the config folder
    path = f"config/clusters/{cluster_config_name}.json"
    #check if the file exists
    if not os.path.exists(path):
        return {"success": False, "message": "Cluster config not found"}
    
    try:
        with open(path, "r") as f:
            cluster_config = ClusterConfig.model_validate_json(f.read())
    except Exception as e:
        return {"success": False, "message": f"Error validating cluster config: {str(e)}"}
    
    # Run oc login with the given credentials
    kube_api_url = cluster_config.cluster_config_details.kube_api_url
    kube_username = cluster_config.cluster_config_details.kube_username
    kube_password = cluster_config.cluster_config_details.kube_password
    # ssh_key = base64.b64decode(cluster_config.cluster_config_details.ssh_key).decode()
    
    print(f"Logging in to the kubernetes cluster with the given credentials: {kube_api_url}, {kube_username}, {kube_password}")
    # await run(["oc", "login", kube_api_url, "--token", ssh_key, "--insecure-skip-tls-verify=true"])
    await run(["oc", "login", kube_api_url, "--username", kube_username, "--password", kube_password, "--insecure-skip-tls-verify=true"])       
    print("Logged in to the kubernetes cluster")

    # Get the current context   
    context = (await run(["oc", "config", "current-context"])).stdout.strip()
    print(f"Current context: {context}")
    # Get the current user
    user = (await run(["oc", "whoami"])).stdout.strip()
    print(f"Current user: {user}")

    return {"success": True, "message": "Logged in to the kubernetes cluster"}
