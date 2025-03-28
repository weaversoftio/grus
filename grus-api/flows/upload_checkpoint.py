# upload checkpoint to local storage

import os
import shutil
from typing import IO, Optional, Union
import logging
from pathlib import Path

def upload_checkpoint(file: IO, checkpoint_path: Union[str, Path], pod_name: str, filename: Optional[str] = None) -> dict:
    """
    Upload a checkpoint file to local storage under a pod-specific directory.
    
    Args:
        file: File-like object containing the checkpoint data
        checkpoint_path: Base path for checkpoint storage
        pod_name: Name of the pod to store the checkpoint under
        filename: Optional filename of the uploaded file. If not provided, will be extracted from the file path
        
    Returns:
        dict: Information about the saved checkpoint
    """
    try:
        # Ensure paths are strings
        checkpoint_path = str(checkpoint_path)
        pod_name = str(pod_name)

        # Create pod-specific directory
        pod_dir = os.path.join(checkpoint_path, pod_name)
        os.makedirs(pod_dir, exist_ok=True)

        # If filename is not provided, try to get it from the UploadFile
        print(f"Initial filename: {filename}")
        if filename is None:
            filename = f"checkpoint_{pod_name}.tar"

        # Ensure filename has .tar extension if it doesn't already
        filename = str(filename)
        if not filename.endswith('.tar'):
            filename = f"{filename}.tar"
        # normalize the filename and remove any special characters
        # example name : checkpoint-spring-music-deployment-6c584545fc-xwszv_grus-spring-music-2025-02-06T16:37:19Z
        filename = filename.replace('-', '_').replace(':', '_').replace('+', '_')
        print(f"Final filename: {filename}")

        # Save file to pod directory
        file_path = os.path.join(pod_dir, filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file, buffer)

        return {
            "filename": filename,
            "pod_name": pod_name,
            "saved_path": file_path
        }
    except Exception as e:
        raise Exception(f"Failed to upload checkpoint: {str(e)}")
