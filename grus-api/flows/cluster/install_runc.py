from fastapi import HTTPException
import asyncio
import re
import os
import config
from pydantic import BaseModel
import json
import socket
from typing import List, Dict
from routes.websocket import send_message
GRUS_API_URL = os.getenv("GRUS_API_URL", "http://192.168.33.216:8000")

class RunCResponse(BaseModel):
    success: bool
    message: str
    details: Dict[str, List[Dict[str, str]]] = {}
    output: str

class RunCRequest(BaseModel):
    clusterName: str
    fastapi_host: str = None

BASE_DIR = "/app/config"  


async def install_runc(request: RunCRequest, username: str):
    """
    Installing runc on nodes.
    """
    await send_message(username, {"type": "progress", "name": "Installing RunC", "message": f"Installing RunC initiated with clusterName: {request.clusterName}"})
    try:
        inventory_file = os.path.join(BASE_DIR, 'nodeStore' , f'{request.clusterName}', f'{request.clusterName}.json')
        playbook_path = os.path.join('playbook', 'upgradeRunc.yaml')

        if not os.path.exists(playbook_path):
            raise HTTPException(status_code=500, detail=f"Playbook '{playbook_path}' not found.")

        if not os.path.exists(inventory_file):
            raise HTTPException(status_code=500, detail=f"Inventory file '{inventory_file}' not found.")
        
        def set_ansible_private_key_env(cluster):
            key_path = f"/app/config/nodeStore/{cluster}/{cluster}"
            os.environ["ANSIBLE_PRIVATE_KEY_FILE"] = key_path
            
            # Verify that it's set correctly
            assert os.getenv("ANSIBLE_PRIVATE_KEY_FILE") == key_path, "Failed to set ANSIBLE_PRIVATE_KEY_FILE"
            print(f"ANSIBLE_PRIVATE_KEY_FILE correctly set to {key_path}")


        
        set_ansible_private_key_env(request.clusterName)
        fastapi_host = GRUS_API_URL
        try:
            # Run the Ansible playbook
            process = await asyncio.create_subprocess_exec(
                "ansible-playbook", "-i", inventory_file, playbook_path,"--extra-vars", f"fastapi_host={fastapi_host}",
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            stdout, stderr = await process.communicate()

            # Decode byte streams
            stdout = stdout.decode()
            stderr = stderr.decode()
            print(f"STDOUT: {stdout}")
            print(f"STDERR: {stderr}")

            if process.returncode != 0:
                # Parse the stdout to extract failed tasks and their error messages
                details = {"failed_tasks": []}
                task_name_pattern = re.compile(r'TASK \[(.*?)\]')
                error_pattern = re.compile(r'^(fatal: \[.*?\]): (.*?)$', re.MULTILINE)
                current_task = None

                for line in stdout.splitlines():
                    task_match = task_name_pattern.search(line)
                    if task_match:
                        current_task = task_match.group(1)
                    error_match = error_pattern.search(line)
                    if error_match and current_task:
                        details["failed_tasks"].append({
                            "task": current_task
                        })

                if not details:
                    message=f"Playbook execution failed with return code {process.returncode}. Error details: {stderr.strip() or 'No error details available.'}"
                    await send_message(username, {"type": "progress", "name": "Installing RunC", "message": message})
                    # If no specific failed tasks were found, provide general stderr output
                    return RunCResponse(
                        success=False,
                        message=message,
                        output=stdout
                    )

                await send_message(username, {"type": "progress", "name": "Installing RunC", "message": f"Runc installation failed: {stdout}"})
                return RunCResponse(
                    success=False,
                    message="Runc installation failed",
                    details=details,
                    output=stdout
                )

            await send_message(username, {"type": "progress", "name": "Installing RunC", "message": "Runc installation successful"})
            return RunCResponse(
                success=True,
                message="Runc installation successful",
                output=stdout
            )

        except Exception as e:
            await send_message(username, {"type": "progress", "name": "Installing RunC", "message": f"An error occurred: {str(e)}"})
            return RunCResponse(
                success=False,
                message=f"An error occurred: {str(e)}",
                output=stdout
            )
    except Exception as e:
        await send_message(username, {"type": "progress", "name": "Installing RunC", "message": f"An error occurred: {str(e)}"})
        return RunCResponse(
            success=False,
            message=f"An error occurred: {str(e)}",
            output=""
        )