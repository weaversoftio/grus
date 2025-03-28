# Grus - OpenShift Container Checkpoint Automation

Grus is a FastAPI-based service that automates the process of checkpointing and restoring containers within OpenShift environments. It provides a streamlined way to create container checkpoints and push them as images for later use, significantly reducing application startup times.

## Features

- Container checkpoint creation using both Kubelet and CRI-O methods
- Automatic checkpoint image creation and registry pushing
- Registry authentication management
- Container and pod listing capabilities
- Checkpoint listing and management
- Full automation workflow for checkpoint-to-image process

## API Endpoints

### Registry Operations
- `POST /registry/login` - Authenticate with a container registry
- `POST /registry/create_and_push_checkpoint_container` - Create and push a checkpoint container image

### Checkpoint Operations
- `POST /checkpoint/kubelet/checkpoint` - Create checkpoint using Kubelet API
- `POST /checkpoint/crictl/checkpoint` - Create checkpoint using CRI-O
- `GET /checkpoints/list` - List all available checkpoints
- `GET /checkpoints/{checkpoint_id}` - Get specific checkpoint details

### Container Operations
- `GET /images/list` - List all container images
- `GET /pod/list` - List all pods

### Automation
- `POST /automation/trigger` - Trigger full checkpoint automation workflow

## Prerequisites

- OpenShift cluster with checkpoint capabilities enabled
- CRI-O runtime configured for checkpointing
- Buildah installed for container image operations
- Access to a container registry
- Appropriate RBAC permissions for Kubelet API access

## Usage Example

To trigger a full checkpoint automation workflow:

This will:
1. Login to the specified registry
2. Create a checkpoint of the specified pod/container
3. Package the checkpoint into a container image
4. Push the image to the registry