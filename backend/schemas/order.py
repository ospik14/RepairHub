from pydantic import BaseModel, Field
from datetime import datetime
from models.tables_models import Status

class ClientRef(BaseModel):
    first_name: str
    last_name: str
    phone: str

    class Config:
        from_attributes = True

class DeviceRef(BaseModel):
    id: int
    client_id: int
    model: str
    serial_number: str
    client: ClientRef | None = None

    class Config:
        from_attributes = True

class OrderBase(BaseModel):
    device_id: int
    
    description: str = Field(max_length=255)
    total_price: float = Field(default=0.0)
    
class OrderCreate(OrderBase):
    pass

class OrderCreateResponse(OrderBase):
    id: int
    created_at: datetime
    master_id: int | None 
    status: Status 

    class Config:
        from_attributes = True

class OrderResponse(OrderCreateResponse):
    device: DeviceRef | None = None

    class Config:
        from_attributes = True
