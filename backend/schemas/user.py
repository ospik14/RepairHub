from datetime import datetime
from pydantic import BaseModel, Field
from models.tables_models import UserRole

class UserBase(BaseModel):
    username: str
    role: UserRole

class CreateUser(UserBase):
    password: str = Field(min_length=8, max_length=22)
    pass

class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True