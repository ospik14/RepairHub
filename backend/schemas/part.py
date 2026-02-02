from pydantic import BaseModel, Field

class PartBase(BaseModel):
    name: str
    quantity: int
    buy_price: float
    sell_price:float

class OrdersPartCreate(BaseModel):
    part_id: int
    quantity: int = Field(gt=0)

class PartResponse(PartBase):
    id: int
    
    class Config:
        from_attributes = True

class PartCreate(PartBase):
    pass

class PartUpdate(BaseModel):
    quantity: int | None = None
    buy_price: float | None = None
    sell_price:float | None = None