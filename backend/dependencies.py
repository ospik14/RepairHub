from typing import Annotated
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends
from fastapi.security import OAuth2PasswordRequestForm
from core.database import get_session
from schemas.user import UserBase
from models.tables_models import UserRole

async def get_user_id():
    return UserBase(
        id=3,
        username='master1',
        role=UserRole.MASTER
    )

db_dep = Annotated[AsyncSession, Depends(get_session)]
user_dep = Annotated[UserBase, Depends(get_user_id)]
form_dep = Annotated[OAuth2PasswordRequestForm, Depends()]