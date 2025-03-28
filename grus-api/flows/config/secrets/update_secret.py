from pydantic import BaseModel
from classes.secret import Secret
import os
import json

class SecretRequest(BaseModel):
    api_key: dict[str, str]
    name: str

class SecretResponse(BaseModel):
    success: bool
    message: str

async def update_secret(request: SecretRequest):

    # check if the secret file exists under the config folder within the secrets directory
    # if it does, return an error
    path = f"config/security/secrets/{request.name}.json"
    if not os.path.exists(path):
        return SecretResponse(
            success=False,
            message=f"Secret file {request.name} does not exist"
        )

    config = Secret(    
        api_key=request.api_key,
        name=request.name
    )
    # save the secret to the config folder in the secrets file
    with open(path, "w") as f:
        json.dump(config.to_dict(), f, indent=4)

    return SecretResponse(
        success=True,
        message=f"Secret file {request.name} updated successfully"
    )
