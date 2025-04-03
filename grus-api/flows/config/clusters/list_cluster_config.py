from pydantic import BaseModel
from classes.clusterconfig import ClusterConfig, ClusterConfigDetails
import os
import json
from flows.config.clusters.create_cluster_config import ClusterConfigRequest
from typing import List

class ClusterConfigResponse(BaseModel):
    success: bool
    message: str
    cluster_configs: List[ClusterConfig]

async def list_cluster_config():
    # get all the cluster configs from the config folder in the cluster config directory
    path = f"config/clusters"
    cluster_configs = []
    for file in os.listdir(path):
        if file.endswith(".json"):
            #Read the json file
            with open(os.path.join(path, file), "r") as f:
                try:
                    data = json.load(f)
                    # Create ClusterConfigDetails object first
                    cluster_details = ClusterConfigDetails(
                        kube_api_url=data["cluster_config_details"]["kube_api_url"],
                        kube_username=data["cluster_config_details"]["kube_username"],
                        kube_password=data["cluster_config_details"]["kube_password"],
                        nodes_username=data["cluster_config_details"]["nodes_username"],
                    )
                    # Create ClusterConfig with the details
                    config = ClusterConfig(
                        cluster_config_details=cluster_details,
                        name=data["name"]
                    )
                    cluster_configs.append(config)
                except Exception as e:
                    print(f"Error loading cluster config file {file}: {e}")

    return ClusterConfigResponse(
        success=True,
        message="Cluster configs listed successfully",
        cluster_configs=cluster_configs
    )
    