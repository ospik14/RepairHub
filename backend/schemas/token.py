from datetime import datetime
from pydantic import BaseModel, Field
from models.tables_models import UserRole

class TokenBase(BaseModel):
    user_id: int
    token: str
    role: UserRole
    expires_at: datetime