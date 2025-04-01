from pydantic import BaseModel
from classes.registryconfig import RegistryConfig, RegistryConfigDetails
import os
import json

class RegistryConfigRequest(BaseModel):
    registry: str
    username: str
    password: str
    name: str

class RegistryConfigResponse(BaseModel):
    success: bool
    message: str

async def update_registry_config(request: RegistryConfigRequest):

    # TODO: Implement the logic to create the registry config
    # check if the registry config file exists under the config folder within the registry config directory
    # if it does, return an error
    path = f"config/registry/{request.name}.json"
    if not os.path.exists(path):
        return RegistryConfigResponse(
            success=False,
            message=f"Registry config file {request.name} does not exist"
        )

    config = RegistryConfig(    
        registry_config_details=RegistryConfigDetails(
            registry=request.registry,
            username=request.username,
            password=request.password
        ),
        name=request.name
    )
    # if it doesn't, create the registry config
    # save the registry config to the config folder in the registry config file
    with open(path, "w") as f:
        json.dump(config.to_dict(), f, indent=4)

    return RegistryConfigResponse(
        success=True,
        message=f"Registry config file {request.name} updated successfully"
    )
