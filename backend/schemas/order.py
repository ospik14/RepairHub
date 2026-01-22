from pydantic import BaseModel, Field
from datetime import datetime
from models.tables_models import Status

class OrderBase(BaseModel):
    device_id: int
    master_id: int | None = Field(default=None)
    status: Status = Field(default=Status.NEW)
    description: str = Field(max_length=255)
    total_price: float = Field(default=0.0)
    
class OrderCreate(OrderBase):
    pass

class OrderResponse(OrderBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
