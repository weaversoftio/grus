from fastapi import HTTPException
from flows.proccess_utils import run
import uuid
import os
from flows.registry.login_to_registry import login_to_registry
from flows.checkpoint.checkpoint_config import CheckpointConfig
from flows.config.configLoder import load_config

async def create_and_push_checkpoint_container(container_name: str, username: str, pod_name: str, checkpoint_config_name: str):
    try:
        await login_to_registry(checkpoint_config_name)
        
        # Get the checkpoint config details from the config folder
        checkpoint_config = load_config(f"checkpoint/{checkpoint_config_name}")
        if not checkpoint_config:
            return {"success": False, "message": "Checkpoint config not found"}

        # Create new container from scratch
        newcontainer = (await run(["buildah", "from", "scratch"])).stdout.strip()

        # Add checkpoint tar to container
        await run(["buildah", "add", newcontainer, f"./checkpoints/{pod_name}/{container_name}", "/"])

        # Configure container annotation
        await run([
            "buildah", "config",
            f"--annotation=io.kubernetes.cri-o.annotations.checkpoint.name={container_name}",
            newcontainer
        ])

        # Generate a short UUID for the image tag
        short_uid = str(uuid.uuid4())[:8]
        # Commit the container image with the pod_id and a unique identifier
        image_tag = f"{username}/{pod_name[:6]}-{container_name[:6]}:{short_uid}"
        print(f"Image tag: {image_tag}")
        await run(["buildah", "commit", newcontainer, image_tag])

        # Clean up the temporary container
        await run(["buildah", "rm", newcontainer], capture_output=False)

        # Push the image to the registry
        await run(["buildah", "push", image_tag], capture_output=True, text=True, check=True)

        return {"message": "Checkpoint image successfully committed and pushed", "image_tag": image_tag}

    except RuntimeError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error during checkpoint container operation: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error: {str(e)}"
        )
