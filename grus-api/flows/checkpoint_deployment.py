import os
import subprocess
import json
from classes.apirequests import PodCheckpointRequest, PodCheckpointResponse
from flows.proccess_utils import run
GRUS_API_URL = "http://192.168.33.216:8000"

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
checkpoint_path = os.path.join(BASE_DIR, 'checkpoints')
os.makedirs(checkpoint_path, exist_ok=True)

async def create_directory(checkpoint_path: str, directory_name: str) -> str:
    directory_path = f"{checkpoint_path}/{directory_name}"
    try:
        await run(["mkdir", "-p", directory_path])
        print(f"Directory {directory_path} created successfully.")
        return directory_path
    except subprocess.CalledProcessError as e:
        raise RuntimeError(f"Failed to create directory {directory_path}: {e}")

async def checkpoint_container_kubelet(request: PodCheckpointRequest) -> PodCheckpointResponse:
    try:
        pod_name = request.pod_name
        namespace = request.namespace
        node_name = request.node_name
        container_name = request.container_name
        kube_api_address = request.kube_api_address

        # Get service account token
        token = (await run(["oc", "whoami", "-t"])).stdout.strip()
        print(f"Token: {token}")
        # Use OpenShift API URL format for checkpoint
        kube_api_checkpoint_url = f"{kube_api_address}/api/v1/nodes/{node_name}/proxy/checkpoint/{namespace}/{pod_name}/{container_name}"
        print(f"Kube API URL: {kube_api_checkpoint_url}")
        checkpoint_cmd = [
            "curl", "-k", "-X", "POST",
            "--header", f"Authorization: Bearer {token}",
            kube_api_checkpoint_url
        ]
        print(f"Checkpoint command: {checkpoint_cmd}")
        output = await run(checkpoint_cmd)
        print(f"Output: {output}")

        # Parse the JSON response to get the checkpoint file path
        try:
            checkpoint_data = json.loads(output.stdout)
            if checkpoint_data.get("items") and len(checkpoint_data["items"]) > 0:
                checkpoint_file_path = checkpoint_data["items"][0]
            else:
                raise RuntimeError("No checkpoint file path found in response")
        except json.JSONDecodeError:
            raise RuntimeError("Failed to parse checkpoint response as JSON")
        
        # Upload the checkpoint file from the node
        checkpoint_filename = os.path.basename(checkpoint_file_path)
        debug_command = [
            "oc", "debug", f"node/{node_name}", "--",
            "chroot", "/host", "curl", "-X", "POST",
            f"{GRUS_API_URL}/checkpoint/upload/{pod_name}?filename={checkpoint_filename}",
            "-H", "accept: application/json",
            "-H", "Content-Type: multipart/form-data",
            "-F", f"file=@{checkpoint_file_path}"
        ]
        try:
            print(f"Executing debug command: {debug_command}")
            debug_output = await run(debug_command)
            print(f"Debug command stdout: {debug_output.stdout}")
            print(f"Debug command stderr: {debug_output.stderr}")
            if debug_output.returncode != 0:
                error_msg = f"Upload failed with return code {debug_output.returncode}. stderr: {debug_output.stderr}"
                print(error_msg)
                return PodCheckpointResponse(success=False, message=error_msg)
        except Exception as e:
            error_msg = f"Failed to upload checkpoint file: {str(e)}"
            print(error_msg)
            return PodCheckpointResponse(success=False, message=error_msg)

        return PodCheckpointResponse(
            success=True,
            message=f"All containers checkpointed successfully for pod: {pod_name}",
            checkpoint_path=checkpoint_file_path,
            pod_name=pod_name,  # Include pod_name in response
            container_ids=container_name  # Include container_ids in response
        )

    except RuntimeError as e:
        print(e)
        return PodCheckpointResponse(success=False, message=str(e))
