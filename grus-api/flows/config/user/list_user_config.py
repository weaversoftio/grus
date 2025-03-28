import os
import json
from classes.userconfig import UserConfig

async def list_user_config():
    # Get all the user configs from the config folder in the user config directory
    path = f"config/security/users"
    user_configs = []
    for file in os.listdir(path):
        if file.endswith(".json"):
            with open(os.path.join(path, file), "r") as f:
                user_configs.append(json.load(f))
    return user_configs