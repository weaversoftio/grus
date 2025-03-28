from pydantic import BaseModel
from classes.secret import Secret
import os
import json
from flows.config.registry.create_registry_config import RegistryConfigRequest
from typing import List

class SecretResponse(BaseModel):    
    success: bool
    message: str
    secrets: List[Secret] # Changed to List[Secret] since we're returning Secret objects

async def list_secret():
    # get all the secrets from the config folder in the secrets directory
    path = f"config/security/secrets"
    secrets = []
    for file in os.listdir(path):
        if file.endswith(".json"):
            #Read the json file
            with open(os.path.join(path, file), "r") as f:
                try:
                    data = json.load(f)
                    print(data)
                    # Create Secret directly with the secret_details dictionary
                    config = Secret(
                        api_key=data["api_key"],
                        name=data["name"]
                    )
                    secrets.append(config)
                except Exception as e:
                    print(f"Error loading secret file {file}: {e}")

    return SecretResponse(
        success=True,
        message="Secrets listed successfully",
        secrets=secrets
    )
    