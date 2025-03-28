from pydantic import BaseModel

class CheckpointConfig(BaseModel):
    registry_url: str
    registry_username: str
    registry_password: str 