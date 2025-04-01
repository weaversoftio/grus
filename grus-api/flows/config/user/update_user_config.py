from classes.userconfig import UserConfig, UserConfigDetails
from pydantic import BaseModel
import os
import json
class UserConfigRequest(BaseModel):
    username: str
    password: str
    name: str
    role: str
class UserConfigResponse(BaseModel):
    success: bool
    message: str

async def update_user_config(request: UserConfigRequest):
    # Check if user config file exists
    path = f"config/security/users/{request.username}.json"
    if not os.path.exists(path):
        return UserConfigResponse(
            success=False,
            message=f"User config file {request.username} does not exist"
        )
        
    user_config = UserConfig(
        userdetails=UserConfigDetails(
            username=request.username,
            password=request.password,
            name=request.name,
            role=request.role
        ),
        name=request.username
    )
    with open(path, "w") as f:
        json.dump(user_config.model_dump(), f)
    return UserConfigResponse(
        success=True,
        message=f"User config file {request.username} updated successfully"
    )
