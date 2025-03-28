from fastapi import APIRouter
from classes.apirequests import ClusterLoginRequest
from flows.cluster.k8s_cluster_operations import kubectl_cluster_login

router = APIRouter()

@router.post("/login")
async def kubectl_login(request: ClusterLoginRequest):
    return await kubectl_cluster_login(
       request.cluster_config_name
    )
