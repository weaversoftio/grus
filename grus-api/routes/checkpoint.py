import os
import json
import logging
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Query
import shutil
from classes.apirequests import PodCheckpointRequest, CheckpointctlRequest

from flows.checkpoint_container_kubelet import checkpoint_container_kubelet
from flows.checkpoint_pod_containers_crictl import checkpoint_pod_containers_crictl

from flows.proccess_utils import run
from flows.upload_checkpoint import upload_checkpoint
from flows.analytics.checkpoint_insights import CheckpointInsightsUseCase, CheckpointInsightsRequest
from flows.analytics.analyze_checkpoint_volatility import analyze_checkpoint_volatility, VolatilityRequest, checkpoint_volatility_analysis

router = APIRouter()
logger = logging.getLogger("automation_api")

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
checkpoint_path = os.path.join(BASE_DIR, 'checkpoints')

@router.post("/kubelet/checkpoint")
async def create_checkpoint_kubelet(request: PodCheckpointRequest):
    return await checkpoint_container_kubelet(request)

@router.post("/crictl/checkpoint")
async def create_checkpoint_crictl(request: PodCheckpointRequest):
    return await checkpoint_pod_containers_crictl(request)

@router.get("/list")
async def checkpoints_list():
    checkpoint_dir = checkpoint_path
    try:
        if os.path.exists(checkpoint_dir):
            pod_container_mapping = []
            for pod in os.listdir(checkpoint_dir):
                pod_path = os.path.join(checkpoint_dir, pod)
                if os.path.isdir(pod_path):
                    containers = os.listdir(pod_path)
                    logger.info(containers)
                    for container in containers:
                        if container.endswith(".tar"):
                            volatility_analysis_file = os.path.join(pod_path, f"{container.replace('.tar', '')}_volatility_analysis.txt")
                            analysis_result = f"{container.replace('.tar', '')}.json"
                            analysis_result_path = os.path.join(pod_path, analysis_result)
                            pod_container_mapping.append({
                                "pod_name": pod,
                                "checkpoint_name": container,
                                "analysis_result": analysis_result if os.path.exists(analysis_result_path) else None,
                                "scan_result": os.path.exists(volatility_analysis_file)
                            })

                        
            return {"checkpoints": pod_container_mapping}
        else:
            return {"checkpoints": [], "message": "Checkpoint directory does not exist"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading checkpoint directory: {str(e)}")

@router.post("/upload/{pod_name}")
async def upload_checkpoint_route(pod_name: str, file: UploadFile = File(...)):
    try:
        # Extract filename from the Content-Disposition header
        content_disposition = file.headers.get("content-disposition", "")
        filename = None
        if "filename=" in content_disposition:
            filename = content_disposition.split("filename=")[1].strip('"')
        
        if not filename:
            raise HTTPException(status_code=400, detail="No filename found in upload")
            
        print(f"Extracted filename: {filename}")
        result = upload_checkpoint(file.file, checkpoint_path, pod_name, filename)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload file: {str(e)}")

@router.post("/checkpointctl")
async def checkpointctl(request: CheckpointctlRequest):
    try:
        pod_name = request.pod_name
        checkpoint_name = request.checkpoint_name
        checkpoint_dir = os.path.join(checkpoint_path, pod_name)
        checkpoint_file_path = os.path.join(checkpoint_dir, f"{checkpoint_name}.tar")
        print(f"checkpointctl {checkpoint_file_path}")
        logger.info(f"path: {checkpoint_file_path}")
        # Run the `checkpointctl` command
        inspect_output = await run(['checkpointctl', 'inspect', checkpoint_file_path, '--all', '--format', 'json'], True, True, True)

        # Save the output in the same folder as the checkpoint file
        output_file_path = os.path.join(checkpoint_dir, f"{checkpoint_name}.json")
        with open(output_file_path, 'w') as file:
            file.write(inspect_output.stdout)

        # Get the insights
        # CheckpointInsightsresponse = await CheckpointInsightsUseCase(CheckpointInsightsRequest(checkpoint_info_path=output_file_path, openai_api_key_secret_name="openai-api-key"))

        return {"output": output_file_path}
        # return {"output": output_file_path, "insights": CheckpointInsightsresponse.insights}
    except Exception as e:
        logger.error(f"Failed to run checkpointctl: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to run checkpointctl: {str(e)}")

@router.get("/checkpointctl/information")
async def checkpointctl_information(params: CheckpointctlRequest = Depends()):
    pod_name = params.pod_name  # Assuming pod_id is provided in the request
    checkpoint_name = params.checkpoint_name
    checkpoint_dir = os.path.join(checkpoint_path, pod_name)  # Include pod_id in the directory path
    checkpoint_file_path = os.path.join(checkpoint_dir, f"{checkpoint_name}.json")
    # Check if the checkpoint file exists
    if not os.path.exists(checkpoint_file_path):
        raise HTTPException(status_code=404, detail=f"Checkpoint file not found: {checkpoint_file_path}")
    try:
        with open(checkpoint_file_path, 'r') as file:
            content = json.load(file)  # Parse JSON content from the file
            return {"logs": content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

@router.post("/analyze/volatility")
async def analyze_volatility(request: VolatilityRequest):
    return await analyze_checkpoint_volatility(request)

@router.get("/analyze/volatility/results")
async def return_checkpoint_volatility_analysis(params: VolatilityRequest = Depends()):
    pod_name = params.pod_name  # Assuming pod_id is provided in the request
    checkpoint_name = params.checkpoint_name
    request = VolatilityRequest(pod_name=pod_name, checkpoint_name=checkpoint_name)
    return await checkpoint_volatility_analysis(request)