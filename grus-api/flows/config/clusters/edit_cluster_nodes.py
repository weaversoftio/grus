from pydantic import BaseModel
import os
import json
from typing import  Optional, Dict

class EditClusterNodesRequest(BaseModel):
    cluster_name: str
    updated_config: Dict  # Accepts the full updated config as a dictionary

async def edit_cluster_nodes(request: EditClusterNodesRequest):
    """Edits the cluster configuration JSON file"""
    path = f"config/nodeStore/{request.cluster_name}/{request.cluster_name}.json"
    
    if not os.path.exists(path):
        return {"success": False, "message": f"Cluster config for {request.cluster_name} not found."}
    
    try:
        with open(path, "w") as f:
            json.dump(request.updated_config, f, indent=4)  # Write the new JSON data
            
        return {"success": True, "message": "Cluster config updated successfully"}
    except Exception as e:
        return {"success": False, "message": f"Error updating cluster config file: {e}"}