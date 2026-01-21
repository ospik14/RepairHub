from pydantic import BaseModel, Field

class DeviceBase(BaseModel):
    client_id: int
    model: str = Field(max_length=50)
    type: str = Field(max_length=50)
    serial_number: str = Field(max_length=255)

class DeviceCreate(DeviceBase):
    pass

class DeviceResponse(DeviceBase):
    id: int

    class Config:
        from_attributes = True
