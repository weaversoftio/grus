from pydantic import BaseModel
import subprocess
import time
from datetime import datetime
import yaml
import os
from flows.proccess_utils import run
from typing import Optional

class PodMigrationRequest(BaseModel):
    pod_name: str
    target_node: str
    new_image: str
    namespace: Optional[str] = None

class PodMigrationResponse(BaseModel):
    success: bool
    message: str
    backup_files: Optional[dict] = None

async def migrate_pod(request: PodMigrationRequest):
    # Determine CLI tool
    cli_tool = "kubectl"
    if (await run(["which", "oc"])).returncode == 0:
        cli_tool = "oc"

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_files = {
        "deployment": f"deployment_{timestamp}.yaml",
        "pod": f"pod_{timestamp}.yaml"
    }

    try:
        # Verify target node exists
        result = await run([cli_tool, "get", "node", request.target_node])
        if result.returncode != 0:
            return PodMigrationResponse(
                success=False,
                message=f"Node {request.target_node} not found"
            )

        # Get pod namespace if not specified
        if not request.namespace:
            result = await run([cli_tool, "get", "pod", request.pod_name, "-o", "jsonpath={.metadata.namespace}"])
            if result.returncode != 0:
                return PodMigrationResponse(
                    success=False,
                    message=f"Pod {request.pod_name} not found"
                )
            request.namespace = result.stdout.strip()

        # Verify pod exists and get ReplicaSet name with retries
        max_retries = 30  # Maximum number of retries
        retry_count = 0
        while retry_count < max_retries:
            result = await run([cli_tool, "get", "pod", request.pod_name, "-n", request.namespace])
            if result.returncode != 0:
                retry_count += 1
                time.sleep(2)
                continue
                
            # Check if pod is managed by a ReplicaSet
            rs_result = await run([cli_tool, "get", "pod", request.pod_name, "-n", request.namespace,
                 "-o", "jsonpath={.metadata.ownerReferences[?(@.kind==\"ReplicaSet\")].name}"])
            if rs_result.returncode == 0 and rs_result.stdout:
                replicaset_name = rs_result.stdout
                break
            
            # If pod exists but no ReplicaSet owns it, we can proceed with direct pod migration
            if rs_result.returncode == 0 and not rs_result.stdout:
                # Get and modify pod YAML directly
                print(f"Pod {request.pod_name} is not managed by a ReplicaSet, proceeding with direct pod migration")
                pod_yaml = await run([cli_tool, "get", "pod", request.pod_name, "-n", request.namespace, "-o", "yaml"])
                
                pod_dict = yaml.safe_load(pod_yaml.stdout)
                # Remove system fields
                pod_dict["metadata"].pop("ownerReferences", None)
                pod_dict["metadata"].pop("resourceVersion", None)
                pod_dict["metadata"].pop("uid", None)
                pod_dict.pop("status", None)
                # Update node and image
                pod_dict["spec"]["nodeName"] = request.target_node
                pod_dict["spec"]["containers"][0]["image"] = request.new_image

                with open(backup_files["pod"], "w") as f:
                    yaml.dump(pod_dict, f)

                # Delete original pod
                await run([cli_tool, "delete", "pod", request.pod_name, "-n", request.namespace])

                # Wait for pod deletion
                retry_count = 0
                while retry_count < max_retries:
                    result = await run([cli_tool, "get", "pod", request.pod_name, "-n", request.namespace])
                    if result.returncode != 0:  # Pod not found, which means it's deleted
                        break
                    time.sleep(2)
                    retry_count += 1

                # Apply saved pod
                await run([cli_tool, "apply", "-f", backup_files["pod"]])

                # Wait for pod to be running
                while True:
                    result = await run([cli_tool, "get", "pod", request.pod_name, "-n", request.namespace,
                         "-o", "jsonpath={.status.phase}"])
                    if result.stdout == "Running":
                        break
                    time.sleep(2)

                return PodMigrationResponse(
                    success=True,
                    message=f"Standalone pod {request.pod_name} successfully migrated to {request.target_node} with image {request.new_image}",
                    backup_files=backup_files
                )
            
            time.sleep(2)
            retry_count += 1

        if retry_count >= max_retries:
            return PodMigrationResponse(
                success=False,
                message=f"Pod {request.pod_name} not found or not ready"
            )

        # Verify ReplicaSet exists and get Deployment name with retries
        retry_count = 0
        while retry_count < max_retries:
            result = await run([cli_tool, "get", "rs", replicaset_name, "-n", request.namespace])
            if result.returncode == 0:
                # Get Deployment name
                deploy_result = await run([cli_tool, "get", "rs", replicaset_name, "-n", request.namespace,
                     "-o", "jsonpath={.metadata.ownerReferences[?(@.kind==\"Deployment\")].name}"])
                if deploy_result.returncode == 0 and deploy_result.stdout:
                    deployment_name = deploy_result.stdout
                    break
            time.sleep(2)
            retry_count += 1

        if retry_count >= max_retries:
            return PodMigrationResponse(
                success=False,
                message=f"ReplicaSet {replicaset_name} not found or not managed by a Deployment"
            )

        # Save deployment YAML
        result = await run([cli_tool, "get", "deployment", deployment_name, "-n", request.namespace, "-o", "yaml"])
        with open(backup_files["deployment"], "w") as f:
            f.write(result.stdout)

        # Delete deployment with cascade=orphan
        await run([cli_tool, "delete", "deployment", deployment_name, "-n", request.namespace, "--cascade=orphan"])
        await run([cli_tool, "delete", "rs", replicaset_name, "-n", request.namespace, "--cascade=orphan"])

        # Wait for ReplicaSet deletion (with error handling)
        max_retries = 30  # Maximum number of retries
        retry_count = 0
        while retry_count < max_retries:
            result = await run([cli_tool, "get", "rs", replicaset_name, "-n", request.namespace])
            if result.returncode != 0:  # ReplicaSet not found, which means it's deleted
                break
            time.sleep(2)
            retry_count += 1

        # Reapply deployment
        await run([cli_tool, "apply", "-f", backup_files["deployment"]])

        return PodMigrationResponse(
            success=True,
            message=f"Pod {request.pod_name} successfully migrated to {request.target_node} with image {request.new_image}",
            backup_files=backup_files
        )

    except Exception as e:
        return PodMigrationResponse(
            success=False,
            message=f"Migration failed: {str(e)}"
        ) 