from datetime import datetime
from pydantic import BaseModel, Field
from models.tables_models import UserRole

class UserBase(BaseModel):
    role: UserRole

class CreateUser(UserBase):
    username: str
    password: str = Field(min_length=8, max_length=22)
    pass

class UserResponse(UserBase):
    id: int
    username: str
    created_at: datetime

    class Config:
        from_attributes = True

class CurrentUser(UserBase):
    id: int
    type: str