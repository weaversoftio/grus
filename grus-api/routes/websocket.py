from fastapi import FastAPI, APIRouter, WebSocket, WebSocketDisconnect
import asyncio
from typing import Dict
from datetime import datetime, timedelta

active_connections: Dict[str, WebSocket] = {}

router = APIRouter()

@router.websocket("/progress/{username}")
async def websocket_endpoint(websocket: WebSocket, username: str):
    """Handles WebSocket connection and listens for pings."""
    await websocket.accept()
    active_connections[username] = websocket
    print(f"User {username} connected")

    try:
        while True:
            data = await websocket.receive_json()
            if data.get("type") == "ping":
                print(f"Received Ping from {username}")

                await websocket.send_json({"type": "pong"})
            else:
                print(f"Received from {username}: {data}")

    except WebSocketDisconnect as e:
        print(f"User {username} got disconnected")
    finally:
        active_connections.pop(username, None)

async def disconnect(username: str):
    try:
        active_connections.pop(username, None)
    except Exception as e:
        print("error disconnecting", str(e))

        # print(f"User {username} disconnected.")

async def send_message(username: str, message: dict):
    """Send a message to a specific user if they are connected."""
    if username in active_connections:
    # print(f"websocket send message username {username}", str(message))
        if username in active_connections:
            try:
                await active_connections[username].send_json(message)
                return {"status": "success", "message": f"Sent to {username}"}
            except Exception as e:
                active_connections.pop(username, None)  # Remove disconnected users
                return {"status": "error", "message": f"Failed to send to {username}: {str(e)}"}
        return {"status": "error", "message": f"User {username} not connected"}

    print(f"Websocket {username} not found")

