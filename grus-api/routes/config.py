from fastapi import APIRouter, Request, UploadFile, File
from flows.config.registry.create_registry_config import create_registry_config , RegistryConfigRequest
from flows.config.registry.update_registry_config import update_registry_config , RegistryConfigRequest
from flows.config.registry.delete_registry_config import delete_registry_config , DeleteRegistryConfigRequest
from flows.config.registry.list_registry_config import list_registry_config , RegistryConfigRequest
from flows.config.clusters.create_cluster_config import create_cluster_config , ClusterConfigRequest
from flows.config.clusters.update_cluster_config import update_cluster_config , ClusterConfigRequest
from flows.config.clusters.list_cluster_config import list_cluster_config , ClusterConfigRequest
from flows.config.clusters.delete_cluster_config import delete_cluster_config , DeleteClusterConfigRequest
from flows.config.clusters.list_cluster_nodes import get_cluster_nodes 
from flows.config.clusters.edit_cluster_nodes import edit_cluster_nodes, EditClusterNodesRequest
from flows.config.clusters.upload_ssh_key import upload_ssh_key, list_ssh_keys
from flows.config.user.create_user_config import create_user_config , UserConfigRequest
from flows.config.user.update_user_config import update_user_config , UserConfigRequest
from flows.config.user.list_user_config import list_user_config
from flows.config.user.delete_user_config import delete_user_config , DeleteUserConfigRequest
from flows.config.user.login_user_config import login_user_config , LoginUserConfigRequest
from flows.config.user.verify_user_config import verify_user_config , VerifyUserConfigRequest
from flows.config.secrets.create_secret import create_secret , SecretRequest
from flows.config.secrets.update_secret import update_secret
from flows.config.secrets.list_secret import list_secret
from flows.config.secrets.delete_secret import delete_secret , DeleteSecretRequest

router = APIRouter()

# Registry Config Routes
@router.post("/registry/create")
async def create_registry_config_endpoint(request: RegistryConfigRequest):
    try:
        return await create_registry_config(request)
    except Exception as error:
        return {"success": False, "message": str(error)}

@router.put("/registry/update")
async def update_registry_config_endpoint(request: RegistryConfigRequest):
    try:
        return await update_registry_config(request)
    except Exception as error:
        return {"success": False, "message": str(error)}

@router.get("/registry/list")
async def list_registry_configs_endpoint():
    try:
        return await list_registry_config()
    except Exception as error:
        return {"success": False, "message": str(error)}

@router.delete("/registry/delete")
async def delete_registry_config_endpoint(request: DeleteRegistryConfigRequest):
    try:
        return await delete_registry_config(request)
    except Exception as error:
        return {"success": False, "message": str(error)}


# Cluster Config Routes

@router.post("/cluster/create")
async def create_cluster_config_endpoint(request: ClusterConfigRequest):
    try:
        return await create_cluster_config(request)
    except Exception as error:
        return {"success": False, "message": str(error)}

@router.put("/cluster/update")
async def update_cluster_config_endpoint(request: ClusterConfigRequest):
    try:
        return await update_cluster_config(request)
    except Exception as error:
        return {"success": False, "message": str(error)}
@router.get("/cluster/list")
async def list_cluster_configs_endpoint():
    try:
        return await list_cluster_config()
    except Exception as error:
        return {"success": False, "message": str(error)}

@router.delete("/cluster/delete")
async def delete_cluster_config_endpoint(request: DeleteClusterConfigRequest):
    try:
        return await delete_cluster_config(request)
    except Exception as error:
        return {"success": False, "message": str(error)}

@router.get("/cluster/nodes/list")
async def list_cluster_nodes_endpoint(cluster_name: str):  # Change to query parameter
    try:
        return await get_cluster_nodes(cluster_name)
    except Exception as error:
        return {"success": False, "message": str(error)}

@router.put("/cluster/nodes/edit")
async def edit_cluster_nodes_endpoint(request: EditClusterNodesRequest):
    try:
        return await edit_cluster_nodes(request)
    except Exception as error:
        return {"success": False, "message": str(error)}
    
@router.post("/cluster/nodes/upload-ssh-key")
async def upload_ssh_key_endpoint(cluster_name: str, file: UploadFile = File(...)):
    try:
        return await upload_ssh_key(cluster_name, file)
    except Exception as error:
        return {"success": False, "message": str(error)}


@router.get("/cluster/nodes/list-ssh-keys")
async def list_ssh_keys_endpoint(cluster_name: str):
    try:
        return await list_ssh_keys(cluster_name)
    except Exception as error:
        return {"success": False, "message": str(error)}


# User Config Routes

@router.post("/user/login")
async def login_user_config_endpoint(request: LoginUserConfigRequest):
    try:
        return await login_user_config(request)
    except Exception as error:
        return {"success": False, "message": str(error)}
@router.post("/user/verify")
async def verify_user_config_endpoint(request: Request):
    try:
        token = request.headers.get("Authorization")
        if token and token.startswith("Bearer "):
            token = token.replace("Bearer ", "")
            
        if not token:
            return {"success": False, "message": "No authorization token provided"}
        return verify_user_config(token)
    except Exception as error:
        return {"success": False, "message": str(error)}

@router.post("/user/create")
async def create_user_config_endpoint(request: UserConfigRequest):
    try:
        return await create_user_config(request)
    except Exception as error:
        return {"success": False, "message": str(error)}

@router.put("/user/update")
async def update_user_config_endpoint(request: UserConfigRequest):
    try:
        return await update_user_config(request)
    except Exception as error:
        return {"success": False, "message": str(error)}
@router.get("/user/list")
async def list_user_configs_endpoint():
    try:
        return await list_user_config()
    except Exception as error:
        return {"success": False, "message": str(error)}
    
@router.delete("/user/delete")
async def delete_user_config_endpoint(request: DeleteUserConfigRequest):
    try:
        return await delete_user_config(request)
    except Exception as error:
        return {"success": False, "message": str(error)}
    
# Secret Routes

@router.post("/secret/create")
async def create_secret_endpoint(request: SecretRequest):
    try:
        return await create_secret(request)
    except Exception as error:
        return {"success": False, "message": str(error)}
    
@router.put("/secret/update")
async def update_secret_endpoint(request: SecretRequest):
    try:
        return await update_secret(request)
    except Exception as error:
        return {"success": False, "message": str(error)}
    
@router.get("/secret/list")
async def list_secrets_endpoint():
    try:
        return await list_secret()
    except Exception as error:
        return {"success": False, "message": str(error)}
    
@router.delete("/secret/delete")
async def delete_secret_endpoint(request: DeleteSecretRequest):
    try:
        return await delete_secret(request)
    except Exception as error:
        return {"success": False, "message": str(error)}


