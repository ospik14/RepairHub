from pydantic import BaseModel

class PartCreate(BaseModel):
    part_id: int
    quantity: int