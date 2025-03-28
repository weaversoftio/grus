from pydantic import BaseModel
import os
import json

class DeleteRegistryConfigRequest(BaseModel):
    name: str

class RegistryConfigResponse(BaseModel):
    success: bool
    message: str

async def delete_registry_config(request: DeleteRegistryConfigRequest):

    # TODO: Implement the logic to create the registry config
    # check if the registry config file exists under the config folder within the registry config directory
    # if it does, return an error
    path = f"config/registry/{request.name}.json"
    if not os.path.exists(path):
        return RegistryConfigResponse(
            success=False,
            message=f"Registry config file {request.name} does not exist"
        )   
    
    # delete the registry config file
    try:
         os.remove(path)
    except Exception as error:
        error_message = f"An unexpected error occurred: {error}, Failed to delete registry config file {request.name}"
        print(error_message)
        return RegistryConfigResponse(
            success=False,
            message=error_message
        )
    
    # return a success message
    print(f"Registry config file {request.name} deleted successfully")    
    return RegistryConfigResponse(
        success=True,
        message=f"Registry config file {request.name} deleted successfully"
    )

    
    