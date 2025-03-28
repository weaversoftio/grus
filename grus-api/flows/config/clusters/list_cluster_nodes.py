from pydantic import BaseModel
import os
import json
from typing import Optional

class ClusterNodesResponse(BaseModel):
    success: bool
    message: str
    cluster_config: Optional[dict]  # Change to dictionary to pass JSON as-is

class ClusterNodesRequest(BaseModel):
    cluster_name: str

async def get_cluster_nodes(cluster_name: str):
    path = f"config/nodeStore/{cluster_name}/{cluster_name}.json"
    
    if not os.path.exists(path):
        return ClusterNodesResponse(
            success=False,
            message=f"Cluster config for {cluster_name} not found.",
            cluster_config=None
        )
    
    try:
        with open(path, "r") as f:
            data = json.load(f)  # Load JSON as a dictionary
            
            return ClusterNodesResponse(
                success=True,
                message="Cluster config retrieved successfully",
                cluster_config=data  # Pass JSON data as-is
            )
    except Exception as e:
        return ClusterNodesResponse(
            success=False,
            message=f"Error loading cluster config file: {e}",
            cluster_config=None
        )
