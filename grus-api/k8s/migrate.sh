#!/bin/bash

# This script is used to migrate the pods from one node to another and optionally update its image
# Usage: ./migrate.sh <pod-name> <target-node> <new-image>

# Determine which CLI tool to use
if command -v oc &>/dev/null; then
    CLI_TOOL="oc"
elif command -v kubectl &>/dev/null; then
    CLI_TOOL="kubectl"
else
    echo "Error: Neither 'oc' nor 'kubectl' found. Please install one of them."
    exit 1
fi

# Check if yq is installed
if ! command -v yq &>/dev/null; then
    echo "Error: 'yq' is not installed. Please install it first."
    echo "Linux: curl -L https://github.com/mikefarah/yq/releases/latest/download/yq_linux_amd64 -o /usr/bin/yq && chmod +x /usr/bin/yq"
    echo "Windows: curl -L https://github.com/mikefarah/yq/releases/latest/download/yq_windows_amd64.exe -o yq.exe"
    exit 1
fi

if [ $# -ne 3 ]; then
    echo "Error: Pod name, target node, and new image are required"
    echo "Usage: $0 <pod-name> <target-node> <new-image>"
    exit 1
fi

POD_NAME=$1
TARGET_NODE=$2
NEW_IMAGE=$3
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Verify target node exists
if ! $CLI_TOOL get node "$TARGET_NODE" &>/dev/null; then
    echo "Error: Node $TARGET_NODE not found"
    exit 1
fi

# Verify pod exists and get namespace if not specified
POD_NAMESPACE=$($CLI_TOOL get pod "$POD_NAME" -o jsonpath='{.metadata.namespace}' 2>/dev/null)
if [ -z "$POD_NAMESPACE" ]; then
    echo "Error: Pod $POD_NAME not found"
    exit 1
fi

# Find the ReplicaSet that owns this pod
REPLICASET_NAME=$($CLI_TOOL get pod "$POD_NAME" -n "$POD_NAMESPACE" -o jsonpath='{.metadata.ownerReferences[?(@.kind=="ReplicaSet")].name}')
if [ -z "$REPLICASET_NAME" ]; then
    echo "Error: Pod $POD_NAME is not managed by a ReplicaSet"
    exit 1
fi

# Find the Deployment that owns the ReplicaSet
DEPLOYMENT_NAME=$($CLI_TOOL get rs "$REPLICASET_NAME" -n "$POD_NAMESPACE" -o jsonpath='{.metadata.ownerReferences[?(@.kind=="Deployment")].name}')
if [ -z "$DEPLOYMENT_NAME" ]; then
    echo "Error: ReplicaSet $REPLICASET_NAME is not managed by a Deployment"
    exit 1
fi

echo "Using CLI tool: $CLI_TOOL"
echo "Found controlling objects:"
echo "- Pod: $POD_NAME"
echo "- ReplicaSet: $REPLICASET_NAME"
echo "- Deployment: $DEPLOYMENT_NAME"
echo "- Namespace: $POD_NAMESPACE"
echo "- Target Node: $TARGET_NODE"
echo "- New Image: $NEW_IMAGE"

# Save deployment YAML
echo "Saving deployment YAML..."
$CLI_TOOL get deployment "$DEPLOYMENT_NAME" -n "$POD_NAMESPACE" -o yaml > deployment_${TIMESTAMP}.yaml

# Get pod YAML, remove system fields, add node selector, and update image
echo "Saving pod YAML..."
$CLI_TOOL get pod "$POD_NAME" -n "$POD_NAMESPACE" -o yaml | \
    yq e 'del(.metadata.ownerReferences) | 
          del(.metadata.resourceVersion) | 
          del(.metadata.uid) | 
          del(.status) |
          .spec.nodeName = "'"$TARGET_NODE"'" |
          .spec.containers[0].image = "'"$NEW_IMAGE"'"' - > pod_${TIMESTAMP}.yaml

# Delete deployment with cascade=orphan
echo "Deleting deployment..."
$CLI_TOOL delete deployment "$DEPLOYMENT_NAME" -n "$POD_NAMESPACE" --cascade=orphan
$CLI_TOOL delete rs "$REPLICASET_NAME" -n "$POD_NAMESPACE" --cascade=orphan

# Wait for ReplicaSet deletion
if [ -n "$REPLICASET_NAME" ]; then
    echo "Waiting for ReplicaSet $REPLICASET_NAME to be deleted..."
    while $CLI_TOOL get rs "$REPLICASET_NAME" -n "$POD_NAMESPACE" &>/dev/null; do
        echo "ReplicaSet still exists, waiting..."
        sleep 2
    done
    echo "ReplicaSet deleted successfully"
fi

# Delete the original pod
echo "Deleting original pod..."
$CLI_TOOL delete pod "$POD_NAME" -n "$POD_NAMESPACE"

# Wait for pod deletion
echo "Waiting for pod deletion..."
while $CLI_TOOL get pod "$POD_NAME" -n "$POD_NAMESPACE" &>/dev/null; do
    echo "Pod still exists, waiting..."
    sleep 2
done

# Apply the saved pod
echo "Applying saved pod..."
$CLI_TOOL apply -f pod_${TIMESTAMP}.yaml

# Wait for pod to be running
echo "Waiting for pod to be running on $TARGET_NODE..."
while true; do
    POD_STATUS=$($CLI_TOOL get pod "$POD_NAME" -n "$POD_NAMESPACE" -o jsonpath='{.status.phase}' 2>/dev/null)
    if [ "$POD_STATUS" = "Running" ]; then
        break
    fi
    echo "Pod status: $POD_STATUS"
    sleep 2
done

# Reapply the deployment
echo "Reapplying deployment..."
$CLI_TOOL apply -f deployment_${TIMESTAMP}.yaml

echo "Migration completed successfully. Pod is now running on $TARGET_NODE with image $NEW_IMAGE"
echo "Backup files saved as:"
echo "- deployment_${TIMESTAMP}.yaml"
echo "- pod_${TIMESTAMP}.yaml"