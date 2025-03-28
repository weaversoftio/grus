from pydantic import BaseModel
import os
import json

class DeleteSecretRequest(BaseModel):
    name: str

class SecretResponse(BaseModel):
    success: bool
    message: str

async def delete_secret(request: DeleteSecretRequest):

    # check if the secret file exists under the config folder within the secrets directory
    # if it does, return an error
    path = f"config/security/secrets/{request.name}.json"
    if not os.path.exists(path):
        return SecretResponse(
            success=False,
            message=f"Secret file {request.name} does not exist"
        )   
    
    # delete the secret file
    try:
         os.remove(path)
    except Exception as error:
        error_message = f"An unexpected error occurred: {error}, Failed to delete secret file {request.name}"
        print(error_message)
        return SecretResponse(
            success=False,
            message=error_message
        )
    
    # return a success message
    print(f"Secret file {request.name} deleted successfully")    
    return SecretResponse(
        success=True,
        message=f"Secret file {request.name} deleted successfully"
    )

    
    