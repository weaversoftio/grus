from fastapi import APIRouter, HTTPException
from flows.proccess_utils import run
from flows.k8s.migrate_pod import PodMigrationRequest, migrate_pod
import subprocess

router = APIRouter()

@router.get("/list")
async def list_pods():
    try:
        list_pods_cmd = ["kubectl", "get", "pods", "-A","--output", "json"]
        result = await run(list_pods_cmd)
        
        if result.returncode == 0:
            return {"pods": result.stdout}
        else:
            raise HTTPException(status_code=500, detail="Failed to list pods")
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"Error executing crictl command: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

@router.post("/migrate")
async def MigratePod(request: PodMigrationRequest):
    try:
        result = await migrate_pod(request)
        if not result.success:
            raise HTTPException(status_code=400, detail=result.message)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

