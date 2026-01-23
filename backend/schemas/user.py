from pydantic import BaseModel
from models.tables_models import UserRole

class UserBase(BaseModel):
    id: int
    username: str
    role: UserRole