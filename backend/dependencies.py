from typing import Annotated
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends
from core.database import get_session

db_dep = Annotated[AsyncSession, Depends(get_session)]