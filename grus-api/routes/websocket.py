from fastapi import FastAPI, APIRouter, WebSocket, WebSocketDisconnect
import asyncio
from typing import Dict
from datetime import datetime, timedelta

active_connections: dict[str, WebSocket] = {}

async def connect(username: str, websocket: WebSocket):
    """Accepts and stores a new WebSocket connection using username as the key."""
    await websocket.accept()
    active_connections[username] = websocket
    print(f"User {username} connected.") 
    asyncio.create_task(ping_pong(username, websocket))


async def disconnect(username: str):
    if username in active_connections:
        del active_connections[username]
        # print(f"User {username} disconnected.")

async def send_message(username: str, message: dict):
    """Send message updates to a specific user."""
    websocket = active_connections.get(username)
    # print(f"websocket send message username {username}", str(message))
    if websocket:
        try:
            await active_connections[username].send_json(message)
        except RuntimeError:
            await disconnect(username)

async def ping_pong(username: str, websocket: WebSocket):
    """Periodically send a ping to keep the connection alive."""
    try:
        while True:
            await websocket.send_json({"type": "ping"})
            await asyncio.sleep(30)  # Send a ping every 30 seconds
    except Exception:
        await disconnect(username)  # Remove the user on failure


router = APIRouter()

@router.websocket("/progress/{username}")
async def websocket_endpoint(websocket: WebSocket, username: str):
    """Handles WebSocket connection and listens for pings."""
    await connect(username, websocket)
    try:
        while True:
            data = await websocket.receive_json()
            # if data.get("type") == "pong":
            #     print(f"Pong received from {username}")
    except WebSocketDisconnect as e:
        print("Websocketdisconnected", e)
        await disconnect(username)
        print(f"WebSocket disconnected for {username}")

@router.get("/progress/{username}")
async def start_progress(username: str):
    """Simulate sending progress updates over WebSocket."""
    try:
        for i in range(0, 101, 10):
            if not active_connections:  # Stop if no active connections
                break
            await send_message(username, i)
            await asyncio.sleep(1)
    except WebSocketDisconnect:
        print("WebSocket disconnected while sending progress")