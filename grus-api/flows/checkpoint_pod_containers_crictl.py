import os
import subprocess
from classes.apirequests import PodCheckpointRequest, PodCheckpointResponse
from pydantic import BaseModel
from typing import List, Optional

class PodCheckpointResponse(BaseModel):
    success: bool
    message: str
    pod_id: Optional[str] = None  # Add pod_id as an optional field
    container_ids: Optional[List[str]] = None  # Add container_ids as an optional field

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
checkpoint_path = os.getenv('CHECKPOINT_PATH', os.path.join(BASE_DIR, 'checkpoints'))
os.makedirs(checkpoint_path, exist_ok=True)

async def run(command, check=True, capture_output=True, text=True):
    try:
        return await subprocess.run(
            command,
            check=check,
            stdout=subprocess.PIPE if capture_output else None,
            stderr=subprocess.PIPE if capture_output else None,
            text=text
        )
    except subprocess.CalledProcessError as e:
        raise RuntimeError(f"Command '{' '.join(command)}' failed with error: {e.stderr or e.output}")

async def create_directory(checkpoint_path: str, pod_id: str) -> str:
    directory_path = f"{checkpoint_path}/{pod_id}"
    try:
        await subprocess.run(["mkdir", "-p", directory_path], check=True)
        print(f"Directory {directory_path} created successfully.")
        return directory_path
    except subprocess.CalledProcessError as e:
        raise RuntimeError(f"Failed to create directory {directory_path}: {e}")

async def checkpoint_pod_containers_crictl(request: PodCheckpointRequest) -> PodCheckpointResponse:
    try:
        pod_id = request.pod_id

        # Verify crictl is installed
        await run(["which", "crictl"], check=True)

        # Fetch the pod sandbox ID
        print(f"Fetching pod sandbox ID for pod: {pod_id}")
        pod_sandbox_id = (await run(
            ["crictl", "pods", f"--id={pod_id}", "--quiet"]
        )).stdout.strip()

        if not pod_sandbox_id:
            print(f"Pod {pod_id} not found!")
            return PodCheckpointResponse(
                success=False,
                message=f"Pod {pod_id} not found!"
            )

        print(f"Pod sandbox ID: {pod_sandbox_id}")

        # Fetch container IDs for the pod
        print(f"Fetching container IDs for pod sandbox: {pod_sandbox_id}")
        container_ids = (await run(
            ["crictl", "ps", "--pod", pod_sandbox_id, "--quiet"]
        )).stdout.strip().splitlines()

        if not container_ids:
            print(f"No containers found in pod {pod_id}!")
            return PodCheckpointResponse(
                success=False,
                message=f"No containers found in pod {pod_id}!"
            )

        # Checkpoint each container
        for container_id in container_ids:
            print(f"Checkpointing container: {container_id}")
            await create_directory(os.path.join(BASE_DIR, 'checkpoints'), pod_sandbox_id)
            export_path = os.path.join(checkpoint_path, pod_sandbox_id, f"{container_id}.tar")

            try:
                await run(["crictl", "--timeout=600s", "checkpoint", f"--export={export_path}", container_id])
                print("Checkpointing successful.")

            except RuntimeError as e:
                print(f"Failed to create checkpoint image: {e}")
                return PodCheckpointResponse(
                    success=False,
                    message=f"Failed to create checkpoint image: {e}"
                )

        print(f"All containers checkpointed successfully for pod: {pod_id}")
        return PodCheckpointResponse(
            success=True,
            message=f"All containers checkpointed successfully for pod: {pod_id}",
            pod_id=pod_sandbox_id,  # Include pod_id in response
            container_ids=container_ids  # Include container_ids in response
        )

    except RuntimeError as e:
        print(e)
        return PodCheckpointResponse(success=False, message=str(e))
