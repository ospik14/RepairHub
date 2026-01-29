from datetime import datetime
from pydantic import BaseModel

class TokenBase(BaseModel):
    token: str
    expires_at: datetime