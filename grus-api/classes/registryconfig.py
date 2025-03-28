from pydantic import BaseModel

class RegistryConfigDetails(BaseModel):
    registry: str   
    username: str
    password: str

class RegistryConfig(BaseModel):
    registry_config_details: RegistryConfigDetails
    name: str

    def __init__(self, registry_config_details: RegistryConfigDetails, name: str):
        super().__init__(registry_config_details=registry_config_details, name=name)
    
    def to_dict(self):
        return {
            "registry_config_details": self.registry_config_details.model_dump(),
            "name": self.name
        }