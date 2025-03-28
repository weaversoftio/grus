import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
import json
import os
import sys
import subprocess

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app import app

client = TestClient(app)
# Test pods list endpoint
def test_list_pods_success():
    with patch('subprocess.run') as mock_run:
        mock_run.return_value = MagicMock(
            returncode=0
        )
        response = client.get("/pod/list")
        assert response.status_code == 200
        assert "pods" in response.json()

def test_list_pods_failure():
    with patch('subprocess.run') as mock_run:
        mock_run.side_effect = subprocess.CalledProcessError(1, 'cmd')
        response = client.get("/pod/list")
        assert response.status_code == 500
        assert "Error executing crictl command" in response.json()["detail"]

def test_list_images_success():
    with patch('subprocess.run') as mock_run:
        mock_run.return_value = MagicMock(
            returncode=0,
            stdout='{"images": []}'
        )
        response = client.get("/images/list")
        assert response.status_code == 200
        assert "images" in response.json()

# test create registry config endpoint
def test_create_registry_config_success():
    response = client.post("/config/registry", json={"registry": "https://demoregistry.azurecr.io", "username": "demouser", "password": "demopassword", "name": "democonfig"})
    assert response.status_code == 200
    assert "Registry config created successfully" in response.json()["message"]

def test_create_registry_config_failure():
    response = client.post("/config/registry", json={"registry": "https://demoregistry.azurecr.io", "username": "demouser", "password": "demopassword", "name": "democonfig"})
    assert response.status_code == 400
    assert "Registry config already exists" in response.json()["message"]

# test list registry config endpoint
def test_list_registry_config_success():
    response = client.get("/config/registry")
    assert response.status_code == 200
    assert "Registry configs listed successfully" in response.json()["message"]

# test delete registry config endpoint
def test_delete_registry_config_success():
    response = client.delete("/config/registry", json={"name": "democonfig"})
    assert response.status_code == 200
    assert "Registry config deleted successfully" in response.json()["message"]

def test_delete_registry_config_failure():
    response = client.delete("/config/registry", json={"name": "democonfig"})
    assert response.status_code == 404
    assert "Registry config not found" in response.json()["message"]

# test create cluster config endpoint
def test_create_cluster_config_success():
    response = client.post("/config/cluster", json={"name": "democonfig", "cluster_config_details": {"kube_api_url": "https://democluster.azurecr.io", "kube_username": "demouser", "kube_password": "demopassword"}})
    assert response.status_code == 200
    assert "Cluster config created successfully" in response.json()["message"]

def test_create_cluster_config_failure():
    response = client.post("/config/cluster", json={"name": "democonfig", "cluster_config_details": {"kube_api_url": "https://democluster.azurecr.io", "kube_username": "demouser", "kube_password": "demopassword"}})
    assert response.status_code == 400
    assert "Cluster config already exists" in response.json()["message"]

# test list cluster config endpoint
def test_list_cluster_config_success():
    response = client.get("/config/cluster")
    assert response.status_code == 200
    assert "Cluster configs listed successfully" in response.json()["message"]

# test delete cluster config endpoint
def test_delete_cluster_config_success():
    response = client.delete("/config/cluster", json={"name": "democonfig"})
    assert response.status_code == 200
    assert "Cluster config deleted successfully" in response.json()["message"]

def test_delete_cluster_config_failure():
    response = client.delete("/config/cluster", json={"name": "democonfig"})
    assert response.status_code == 404
    assert "Cluster config not found" in response.json()["message"]

# test create user config endpoint
def test_create_user_config_success():
    response = client.post("/config/user/create", json={"username": "demouser", "password": "demopassword", "name": "democonfig"})
    assert response.status_code == 200
    assert "User config created successfully" in response.json()["message"]

def test_create_user_config_failure():
    response = client.post("/config/user/create", json={"username": "demouser", "password": "demopassword", "name": "democonfig"})
    assert response.status_code == 400
    assert "User config already exists" in response.json()["message"]

# test list user config endpoint
def test_list_user_config_success():
    response = client.get("/config/user/list")
    assert response.status_code == 200
    assert "User configs listed successfully" in response.json()["message"]

# test delete user config endpoint
def test_delete_user_config_success():
    response = client.delete("/config/user/delete", json={"user_config_name": "democonfig"})
    assert response.status_code == 200
    assert "User config deleted successfully" in response.json()["message"]

def test_delete_user_config_failure():
    response = client.delete("/config/user/delete", json={"user_config_name": "democonfig"})
    assert response.status_code == 404
    assert "User config not found" in response.json()["message"]