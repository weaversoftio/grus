import os
import json
from classes.userconfig import UserConfig, LoginUserConfigRequest
import jwt
from datetime import datetime, timedelta
from typing import Optional

# Load the keys
with open("config/security/private.pem", "rb") as f:
    PRIVATE_KEY = f.read()
with open("config/security/public.pem", "rb") as f:
    PUBLIC_KEY = f.read()

ALGORITHM = "RS256"  # Changed to RSA algorithm

async def login_user_config(request: LoginUserConfigRequest):
    path = f"config/security/users/{request.username}.json"

    if not os.path.exists(path):
        return {"success": False, "message": "Invalid credentials"}

    with open(os.path.join(path), "r") as f:
        user_data = json.load(f)

        if (user_data.get("userdetails", {}).get("username") == request.username and 
            user_data.get("userdetails", {}).get("password") == request.password):
            user_data = {
                "username": user_data["userdetails"]["username"],
                "name": user_data["userdetails"]["name"],
                "role": user_data["userdetails"]["role"]
            }
            return {
                "success": True,
                "user": user_data,
                "token": create_access_token(data={"username": request.username}, expires_delta=timedelta(days=1))
            }

                
    return {"success": False, "message": "Invalid credentials"}

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    print("create_access_token", data)
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, PRIVATE_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(token: str):
    try:
        payload = jwt.decode(token, PUBLIC_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("username")
        if username is None:
            return None
        return username
    except Exception as e:
        return None