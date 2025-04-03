from fastapi import APIRouter, Depends, HTTPException
from classes.apirequests import RegistryLoginRequest, PushCheckpointContainerRequest
from flows.registry.login_to_registry import login_to_registry
from flows.registry.create_and_push_checkpoint_container import create_and_push_checkpoint_container
from middleware.verify_token import verify_token

# Registry Routes
router = APIRouter()

@router.post("/login")
async def login_endpoint(request: RegistryLoginRequest):
    return await login_to_registry(
       request.registry_config_name
    )

@router.post("/create_and_push_checkpoint_container")
async def create_and_push_checkpoint_container_endpoint(request: PushCheckpointContainerRequest, username: str = Depends(verify_token)):
    return await create_and_push_checkpoint_container(
        container_name=request.checkpoint_name,
        username=request.username,
        pod_name=request.pod_name,
        checkpoint_config_name=request.checkpoint_config_name,
        loggeduser=username
    )
