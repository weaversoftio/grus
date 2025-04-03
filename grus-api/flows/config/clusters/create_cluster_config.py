from pydantic import BaseModel
from classes.clusterconfig import ClusterConfig, ClusterConfigDetails
import os
import json
import base64
import re

class ClusterConfigRequest(BaseModel):
    kube_api_url: str
    kube_username: str
    kube_password: str
    nodes_username: str
    name: str

class ClusterConfigResponse(BaseModel):
    success: bool
    message: str

async def create_cluster_config(request: ClusterConfigRequest):

    # TODO: Implement the logic to create the cluster config
    # check if the config file exists under the config folder within the config directory
    # if it does, return an error
    path = f"config/clusters/{request.name}.json"
    if os.path.exists(path):
        return ClusterConfigResponse(
            success=False,
            message=f"Cluster config file {request.name} already exists"
        )

    config = ClusterConfig(    
        cluster_config_details=ClusterConfigDetails(
            kube_api_url=request.kube_api_url,
            kube_username=request.kube_username,
            kube_password=request.kube_password,
            nodes_username=request.nodes_username
        ),
        name=request.name
    )
    # if it doesn't, create the config
    # save the config to the config folder in the config file
    with open(path, "w") as f:
        json.dump(config.to_dict(), f, indent=4)

    return ClusterConfigResponse(
        success=True,
        message=f"Cluster config file {request.name} created successfully"
    )
