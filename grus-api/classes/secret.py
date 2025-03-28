from pydantic import BaseModel
from typing import List

class Secret(BaseModel):
    api_key: dict
    name: str

    def __init__(self, api_key: dict, name: str):
        super().__init__(api_key=api_key, name=name)
    
    def to_dict(self):
        return {
            "api_key": self.api_key,
            "name": self.name
        }
