from pydantic import BaseModel

class ClusterConfigDetails(BaseModel):
    kube_api_url: str
    kube_username: str
    kube_password: str
    nodes_username: str

class ClusterConfig(BaseModel):
    cluster_config_details: ClusterConfigDetails
    name: str

    def __init__(self, cluster_config_details: ClusterConfigDetails, name: str):
        super().__init__(cluster_config_details=cluster_config_details, name=name)
    
    def to_dict(self):
        return {
            "cluster_config_details": self.cluster_config_details.model_dump(),
            "name": self.name
        }