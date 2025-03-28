import jwt  # PyJWT library
from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.middleware.base import RequestResponseEndpoint
from flows.config.user.verify_user_config import verify_user_config
from typing import Callable
import os

def verify_token(request: Request):
    token = request.headers.get("Authorization")
    if token and token.startswith("Bearer "):
        token = token.replace("Bearer ", "")
        result = verify_user_config(token)
        if (result.get("success") == False):
            raise HTTPException(status_code=401, detail="Invalid or Expired token")

        username = result["user"]["username"]
        
    else:
        return None

    return username
