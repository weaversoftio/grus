import os
import json
from classes.userconfig import VerifyUserConfigRequest
import jwt
from datetime import datetime, timedelta
from typing import Optional

# Load the RSA keys
with open("config/security/private.pem", "rb") as f:
    PRIVATE_KEY = f.read()
with open("config/security/public.pem", "rb") as f:
    PUBLIC_KEY = f.read()

ALGORITHM = "RS256"  # Changed to RSA algorithm

def verify_user_config(token: str):
    username = verify_token(token)
    path = f"config/security/users/{username}.json"
    
    if username is None or not os.path.exists(path):
        return {"success": False, "message": "Invalid token"}

    with open(path, "r") as f:
        user_config = json.load(f)

    user_data = {
        "username": user_config["userdetails"]["username"],
        "name": user_config["userdetails"]["name"],
        "role": user_config["userdetails"]["role"]
    }

    return {"success": True, "user": user_data}

def verify_token(token: str):
    try:
        payload = jwt.decode(token, PUBLIC_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("username")
        if username is None:
            return None
        return username
    except Exception as e:
        return None