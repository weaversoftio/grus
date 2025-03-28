from fastapi import HTTPException
import asyncio
import re
import os
from typing import List, Dict, Optional
from pydantic import BaseModel
from flows.proccess_utils import run
from routes.websocket import send_message

class CheckClusterResponse(BaseModel):
    success: bool
    message: str
    details: Dict[str, List[str]] = {}
    output: str = ""

class VerifyCheckpointRequest(BaseModel):
    clusterName: str

BASE_DIR = ""  

async def verify_checkpointing(request: VerifyCheckpointRequest, username: str):
    """
    Verifies applied changes on all cluster nodes.
    """
    try:
        await send_message(username, {"type": "progress", "name": "Cluster Verification", "message": f"Cluster verification initiated with clusterName: {request.clusterName}"})
        print("************************************************************\n")
        print(f"Received clusterName: {request.clusterName}")
        inventory_file = os.path.join('config', 'nodeStore', f'{request.clusterName}', f'{request.clusterName}.json')
        playbook_path = os.path.join('playbook','checkCluster.yaml')

        if not os.path.exists(playbook_path):
            raise HTTPException(status_code=500, detail=f"Playbook '{playbook_path}' not found.")

        if not os.path.exists(inventory_file):
            raise HTTPException(status_code=500, detail=f"Inventory file '{inventory_file}' not found.")

        
        key_path = f"/app/config/nodeStore/{request.clusterName}/{request.clusterName}"
        os.environ["ANSIBLE_PRIVATE_KEY_FILE"] = key_path
        os.environ["ANSIBLE_HOST_KEY_CHECKING"] = "False"
        # await send_message(username, {"type": "progress", "name": "Cluster Verification", "message": f"ANSIBLE_PRIVATE_KEY_FILE set to {key_path} for this session."})

        print(f"ANSIBLE_PRIVATE_KEY_FILE set to {key_path} for this session.")
    
        # Log the command
        # await send_message(username, {"type": "progress", "name": "Cluster Verification", "message": f"Running: ansible-playbook -i {inventory_file} {playbook_path}"})
        print(f"Running: ansible-playbook -i {inventory_file} {playbook_path}")

        # Run the Ansible playbook
        process = await asyncio.create_subprocess_exec(
            "ansible-playbook", "-i", inventory_file, playbook_path,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        stdout, stderr = await process.communicate()

        print(f"STDOUT: {stdout.decode()}")
        print(f"STDERR: {stderr.decode()}")
        print(f"Return Code: {process.returncode}")

        if process.returncode != 0:
            raise HTTPException(status_code=500, detail=f"Failed: {stdout.decode()}")

        output = stdout.decode()

        # Initialize dictionaries to hold task names for each status
        task_statuses = {
            "unreachable": [],
            "failed": [],
            "rescued": [],
            "changed": [],
            "skipped": [],
            "ignored": []
        }

        # Regular expressions to match task names and their statuses
        task_name_pattern = re.compile(r'TASK \[(.*?)\]')
        status_patterns = {
            "unreachable": re.compile(r'UNREACHABLE! =>'),
            "failed": re.compile(r'FAILED! =>'),
            "rescued": re.compile(r'rescued: \[.*?\]'),
            "changed": re.compile(r'changed: \[.*?\]'),
            "skipped": re.compile(r'skipping: \[.*?\]'),
            "ignored": re.compile(r'ignored: \[.*?\]')
        }

        # Split output into lines for processing
        lines = output.splitlines()
        current_task = None

        for line in lines:
            # Check for task name
            task_match = task_name_pattern.search(line)
            if task_match:
                current_task = task_match.group(1)
                continue

            # Check for each status
            for status, pattern in status_patterns.items():
                if pattern.search(line):
                    if current_task:
                        task_statuses[status].append(current_task)
                    current_task = None
                    break

        # Prepare details for the response
        details = {status: tasks for status, tasks in task_statuses.items() if tasks}

        # Determine the message based on the presence of issues
        if any(details.values()):
            await send_message(username, {"type": "progress", "name": "Cluster Verification", "message": details})
            return CheckClusterResponse(
                success = False,
                message = "Issues found",
                details=details,
                output=output
                )
        else:
            await send_message(username, {"type": "progress", "name": "Cluster Verification", "message": output})
            return CheckClusterResponse(
                success=True,
                message="Cluster verification successful",
                output=output
                )



    except Exception as e:
        await send_message(username, {"type": "progress", "name": "Cluster Verification", "message": f"Cluster Verification failed: {str(e)}"})
        raise HTTPException(status_code=500, detail=f"Cluster Verification failed: {str(e)}")
    
    

