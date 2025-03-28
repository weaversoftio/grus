from fastapi import APIRouter
from fastapi.responses import FileResponse
import os


router = APIRouter()

@router.get("/runc/{version}")
async def download_file(version: str):
    file_path = f"download/runc/{version}/runc.amd64" 
    if os.path.exists(file_path):
        return FileResponse(file_path, media_type='application/octet-stream', filename="runc.amd64")
    return {"error": "File not found"}