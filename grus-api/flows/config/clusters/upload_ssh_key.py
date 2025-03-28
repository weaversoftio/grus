import os
from fastapi import UploadFile
from typing import List

async def upload_ssh_key(cluster_name: str, file: UploadFile):
    """Saves the uploaded SSH key in the correct cluster config directory."""
    dir_path = f"config/nodeStore/{cluster_name}"
    file_path = f"{dir_path}/{cluster_name}"

    # Ensure the directory exists
    os.makedirs(dir_path, exist_ok=True)

    try:
        # Write the file content
        with open(file_path, "wb") as f:
            f.write(await file.read())

        return {"success": True, "message": f"SSH key for '{cluster_name}' uploaded successfully."}
    except Exception as e:
        return {"success": False, "message": f"Error saving SSH key: {e}"}


async def list_ssh_keys(cluster_name: str):
    """Lists all SSH key files in the cluster's directory."""
    dir_path = f"config/nodeStore/{cluster_name}"

    # Check if the directory exists
    if not os.path.exists(dir_path):
        return {"success": False, "message": f"Cluster directory '{cluster_name}' not found.", "keys": []}

    try:
        # List all files in the directory
        files = [f for f in os.listdir(dir_path) if os.path.isfile(os.path.join(dir_path, f))]
        return {"success": True, "message": "SSH keys listed successfully.", "keys": files}
    except Exception as e:
        return {"success": False, "message": f"Error listing SSH keys: {e}", "keys": []}
