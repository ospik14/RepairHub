from typing import Annotated
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from core.database import get_session
from schemas.user import CurrentUser
from core.security import decode_token
from core.exceptions import InvalidCredentialsError

oauth_bearer = OAuth2PasswordBearer(tokenUrl='auth/token')

def get_current_user(token: Annotated[str, Depends(oauth_bearer)]):
    payload = decode_token(token)
    
    if payload.type != 'access':
        raise InvalidCredentialsError('Невірний тип токену')
    
    return payload

db_dep = Annotated[AsyncSession, Depends(get_session)]
user_dep = Annotated[CurrentUser, Depends(get_current_user)]
form_dep = Annotated[OAuth2PasswordRequestForm, Depends()]

def require_role(role: str):
    def checker(user: user_dep):
        if user.role.value != role:
            raise HTTPException(status_code=403, detail="Forbidden")
        return user
    return checker