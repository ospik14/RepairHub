from pydantic import BaseModel, Field
from typing import Optional

class ClientRequests(BaseModel):
    first_name: str = Field(min_length=3, max_length=50)
    first_name: str = Field(min_length=3, max_length=50)
    phone: str = Field(min_length=10, max_length=20)
    notes: Optional[str] = Field(max_length=255, default=None)