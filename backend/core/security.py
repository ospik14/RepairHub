import os
from passlib.context import CryptContext
from fastapi.concurrency import run_in_threadpool
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from datetime import timedelta, datetime, timezone
from dotenv import load_dotenv

from models.tables_models import User
from core.exceptions import InvalidCredentialsError
from schemas.user import CurrentUser

load_dotenv()

SECRET_KEY = os.getenv('SECRET_KEY')
ALGORITHM = os.getenv('ALGORITHM')

bcrypt_context = CryptContext(schemes=['argon2'], deprecated='auto')

def hash_password_sync(password: str) -> str:
    return bcrypt_context.hash(password)

def verify_password_sync(password: str, hashed_password: str):
    return bcrypt_context.verify(password, hashed_password)

async def hash_password(password: str) -> str:
    return await run_in_threadpool(hash_password_sync, password)

async def verify_password(password: str, hashed_password: str):
    return await run_in_threadpool(verify_password_sync, password, hashed_password)

def create_access_token(user: User, expires_time: timedelta):
    encode = {
        'sub': user.username,
        'user_id': user.id,
        'role': user.role.value
    }
    expires = datetime.now(timezone.utc) + expires_time
    encode.update({'exp': expires})
    return jwt.encode(encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get('sub')
        user_id = payload.get('user_id')
        role = payload.get('role')

        if not role or not user_id or not username:
            raise JWTError
    
        return CurrentUser(id=user_id, username=username, role=role)
    
    except JWTError:
        raise InvalidCredentialsError('Не дійсний токен')
    