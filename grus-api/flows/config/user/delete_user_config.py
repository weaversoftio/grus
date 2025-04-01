from pydantic import BaseModel
import os   
from .create_user_config import UserConfigResponse

class DeleteUserConfigRequest(BaseModel):
    username: str

async def delete_user_config(request: DeleteUserConfigRequest):
    # Delete the user config from the File System
    path = f"config/security/users/{request.username}.json"
    if os.path.exists(path):
        os.remove(path)
    return UserConfigResponse(
        success=True,
        message=f"User config file {request.username} deleted successfully"
    )