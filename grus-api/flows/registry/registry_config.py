from pydantic import BaseModel

class RegistryConfig(BaseModel):
    registry_url: str
    registry_username: str
    registry_password: str 