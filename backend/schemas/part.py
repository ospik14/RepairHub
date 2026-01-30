from pydantic import BaseModel, Field

class PartCreate(BaseModel):
    part_id: int
    quantity: int = Field(gt=0)

class PartResponse(BaseModel):
    id: int
    name: str
    quantity: int
    buy_price: float
    sell_price:float

    class Config:
        from_attributes = True