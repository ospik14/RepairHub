from pydantic import BaseModel, Field

class PartCreate(BaseModel):
    part_id: int
    quantity: int = Field(gt=0)