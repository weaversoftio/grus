# This file is used to load the config files for the flows

import os
from flows.registry.login_to_registry import RegistryLoginRequest
from flows.checkpoint.checkpoint_config import CheckpointConfig
from flows.registry.registry_config import RegistryConfig
def load_config(config_name: str):
    # Get the config details from the config folder
    base_path = "config"
    valid_paths = ["clusters", "registry", "security", "users"]
    
    # Split the config_name to get the path components
    path_parts = config_name.split('/')
    if path_parts[0] not in valid_paths:
        return {"success": False, "message": "Invalid config path"}
    
    path = os.path.join(base_path, f"{config_name}.json")
    if not os.path.exists(path):
        return {"success": False, "message": "Config not found"}
        
    try:
        with open(path, "r") as f:
            if "checkpoint" in config_name:
                config = CheckpointConfig.model_validate_json(f.read())
            elif "registry" in config_name:
                config = RegistryConfig.model_validate_json(f.read())
            else:
                return {"success": False, "message": "Unknown config type"}
    except Exception as e:
        return {"success": False, "message": f"Error validating config: {str(e)}"}
    return config
