#!/bin/bash

# Set namespaces and paths
NAMESPACE="grus"
POD_NAME="grus-api"
CHECKPOINTS_DIR="checkpoints"
COMPOSE_FILE="docker-compose.yaml"
K8S_MANIFEST="k8s/pod.yaml"

#Check if running under root
if [ "$EUID" -eq 0 ]; then
    echo "Please do not run as root"
    exit 1
fi


# Step 1: Delete the existing pod
echo "Deleting pod $POD_NAME in namespace $NAMESPACE..."
oc delete pod -n "$NAMESPACE" "$POD_NAME"

rm -rf $CHECKPOINTS_DIR/*

# Step 3: Build the Podman image using podman-compose
if [ -f "$COMPOSE_FILE" ]; then
    echo "Building the Podman images using $COMPOSE_FILE..."
    podman-compose build 
else
    echo "Compose file $COMPOSE_FILE not found. Exiting."
    exit 1
fi

# Step 4: Push the built image
echo "Pushing the Podman images..."
podman-compose push

# Step 5: Apply the Kubernetes manifest
if [ -f "$K8S_MANIFEST" ]; then
    echo "Applying the Kubernetes manifest $K8S_MANIFEST..."
    oc apply -f "$K8S_MANIFEST"
else
    echo "Kubernetes manifest $K8S_MANIFEST not found. Exiting."
    exit 1
fi

oc new-project "$NAMESPACE" --skip-config-write

# Step 6: Wait for the pod to be running and port-forward
echo "Waiting for pod $POD_NAME to be in Running state..."
while true; do
    STATUS=$(oc get pod -n "$NAMESPACE" "$POD_NAME" -o jsonpath='{.status.phase}')
    if [ "$STATUS" == "Running" ]; then
        echo "Pod $POD_NAME is running. Starting port-forward..."
        break
    fi
    echo "Current status: $STATUS. Retrying in 5 seconds..."
    sleep 5
done

oc port-forward -n "$NAMESPACE" "$POD_NAME" --address 0.0.0.0 8000:8000

echo "Script execution completed successfully."
