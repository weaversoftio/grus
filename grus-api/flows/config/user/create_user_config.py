from classes.userconfig import UserConfig, UserConfigDetails
from pydantic import BaseModel
import os
import json
class UserConfigRequest(BaseModel):
    name: str
    role: str
    username: str
    password: str
class UserConfigResponse(BaseModel):
    success: bool
    message: str

async def create_user_config(request: UserConfigRequest):
    # check if the config folder exists or create the user config folder
    path = f"config/security/users"
    if not os.path.exists(path):
        os.makedirs(path)
    # Save the user config to the File System
    path = f"config/security/users/{request.username}.json"
    if os.path.exists(path):
        return UserConfigResponse(
            success=False,
            message=f"User config file {request.username} already exists"
        )
        
    user_config = UserConfig(
        userdetails=UserConfigDetails(
            name=request.name,
            role=request.role,
            username=request.username,
            password=request.password
        ),
        name=request.username
    )
    with open(path, "w") as f:
        json.dump(user_config.model_dump(), f)
    return UserConfigResponse(
        success=True,
        message=f"User config file {request.name} created successfully"
    )
