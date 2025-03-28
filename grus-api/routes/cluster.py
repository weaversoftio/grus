from fastapi import APIRouter, Depends
from classes.apirequests import ClusterLoginRequest
from flows.cluster.enable_checkpoint import enable_checkpointing, ClusterRequest
from flows.cluster.install_runc import install_runc, RunCRequest
from flows.cluster.verify_checkpointing import verify_checkpointing, CheckClusterResponse, VerifyCheckpointRequest
from flows.cluster.get_statistics import get_statistics
from middleware.verify_token import verify_token

router = APIRouter()

@router.post("/enable_checkpointing")
async def enable_checkpointing_endpoint(request: ClusterRequest, username: str = Depends(verify_token)):
    return await enable_checkpointing(request, username)

@router.post("/install_runc")
async def install_runc_endpoint(request: RunCRequest, username: str = Depends(verify_token)):
    return await install_runc(request, username)

@router.post("/verify_checkpointing", response_model=CheckClusterResponse)
async def verify_checkpointing_endpoint(request: VerifyCheckpointRequest, username: str = Depends(verify_token)):
    return await verify_checkpointing(request, username)

@router.get("/statistics")
async def statistics_endpoint():
    return await get_statistics()