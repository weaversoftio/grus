import logging
import time
from fastapi import APIRouter, HTTPException
from classes.apirequests import AutomationRequest, PodCheckpointRequest
from flows.registry.login_to_registry import login_to_registry
from flows.checkpoint_container_kubelet import checkpoint_container_kubelet

router = APIRouter()
logger = logging.getLogger("automation_api")

@router.post("/trigger")
async def automation_trigger(request: AutomationRequest):
    logger.debug(f"Received registry: {request.registry}")
    try:
        logger.debug("Starting automation process.")
        # Step 1: Login to registry
        logger.debug(f"Logging in to registry: {request.registry} with username: {request.username}")
        login_response = login_to_registry(
            registry=request.registry,
            username=request.username,
            password=request.password
        )
        logger.debug(f"Registry login successful: {login_response}")

        # Step 2: Trigger checkpoint creation
        logger.debug(f"Creating checkpoint for pod: {request.pod_name}")
        checkpoint_response = await checkpoint_container_kubelet(
            PodCheckpointRequest(
                pod_id=request.pod_name,
                namespace=request.namespace,
                node_name=request.node_name,
                container_name=request.container_name
            )
        )
        logger.debug(f"Checkpoint creation response: {checkpoint_response}")
        time.sleep(10)

        pod_id = checkpoint_response.pod_id
        container_ids = checkpoint_response.container_ids

        if not pod_id or not container_ids:
            logger.error("Failed to extract pod_id or container_ids from checkpoint response.")
            raise HTTPException(status_code=500, detail="Failed to extract pod_id or container_ids")

        logger.debug(f"Using pod_id: {pod_id} and container_ids: {container_ids}")
        
        image_tags = []
        for container_id in container_ids:
            image_repo = f"{request.username}/{pod_id[:6]}-{container_id[:6]}"
            image_tag = f"{image_repo}:latest"
            image_tags.append({"container_id": container_id, "image_repo": image_repo, "tag": "latest"})
            logger.debug(f"Generated image tag for container {container_id}: {image_tag}")

        logger.debug("Automation process completed successfully.")
        return {"image_tags": image_tags}

    except HTTPException as http_err:
        logger.error(f"HTTP error occurred: {http_err.detail}")
        raise http_err
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")
