from pydantic import BaseModel, Field
from typing import Optional

class ClientBase(BaseModel):
    first_name: str = Field(min_length=2, max_length=50)
    last_name: str = Field(min_length=2, max_length=50)
    phone: str = Field(min_length=10, max_length=20)
    notes: Optional[str] = Field(max_length=255, default=None)

class ClientCreate(ClientBase):
    pass

class ClientResponse(ClientBase):
    id: int 
    telegram_id: Optional[int] = None

    class Config:
        from_attributes = True