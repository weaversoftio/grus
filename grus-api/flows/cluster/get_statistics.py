from fastapi import APIRouter, HTTPException
from flows.proccess_utils import run
import subprocess
import os

async def get_statistics():
    total_checkpoints = get_total_checkpoints()
    total_pods = await get_total_pods()
    return {
        "total_checkpoints": total_checkpoints,
        "total_pods": total_pods
    }

def get_total_checkpoints(): 
    checkpoint_dir = "checkpoints"
    checkpoint_count = 0
    if os.path.exists(checkpoint_dir):
        for pod in os.listdir(checkpoint_dir):
            pod_path = os.path.join(checkpoint_dir, pod)
            if os.path.isdir(pod_path):
                containers = os.listdir(pod_path)
                for container in containers:
                    if container.endswith(".tar"):
                        checkpoint_count += 1
        return checkpoint_count
    else:
        return 0


async def get_total_pods():
    try:
        list_pods_cmd = ["kubectl", "get", "pods", "-A","--no-headers"]
        result = await run(list_pods_cmd)
        
        if result.returncode == 0:
            pod_count = len(result.stdout.strip().split("\n")) if result.stdout.strip() else 0
            return pod_count
        else:
            return 0
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"Error executing kubectl command: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")