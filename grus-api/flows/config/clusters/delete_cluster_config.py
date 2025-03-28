from pydantic import BaseModel
import os
import json

class DeleteClusterConfigRequest(BaseModel):
    name: str

class ClusterConfigResponse(BaseModel):
    success: bool
    message: str

async def delete_cluster_config(request: DeleteClusterConfigRequest):

    # TODO: Implement the logic to create the cluster config
    # check if the cluster config file exists under the config folder within the cluster config directory
    # if it does, return an error
    path = f"config/clusters/{request.name}.json"
    if not os.path.exists(path):
        return ClusterConfigResponse(
            success=False,
            message=f"Cluster config file {request.name} does not exist"
        )   
    
    # delete the cluster config file
    try:
         os.remove(path)
    except Exception as error:
        error_message = f"An unexpected error occurred: {error}, Failed to delete cluster config file {request.name}"
        print(error_message)
        return ClusterConfigResponse(
            success=False,
            message=error_message
        )
    
    # return a success message
    print(f"Cluster config file {request.name} deleted successfully")    
    return ClusterConfigResponse(
        success=True,
        message=f"Cluster config file {request.name} deleted successfully"
    )

    
    