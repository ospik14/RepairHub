import os
from passlib.context import CryptContext
from fastapi.concurrency import run_in_threadpool
from jose import jwt, JWTError
from datetime import timedelta, datetime, timezone
from dotenv import load_dotenv

from core.exceptions import InvalidCredentialsError
from schemas.user import CurrentUser
from schemas.token import TokenBase

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

def create_token(data: dict, expires_time: timedelta):
    encode = data.copy()
    expires = datetime.now(timezone.utc) + expires_time
    encode.update({'exp': expires})
    token = jwt.encode(encode, SECRET_KEY, algorithm=ALGORITHM)

    return TokenBase(user_id=data.get('sub'), token=token, expires_at=expires)

def decode_token(token: str):
    try:
        print(token)
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get('sub')
        role = payload.get('role')
        type = payload.get('type')

        if not role or not user_id or not type:
            raise JWTError
    
        return CurrentUser(id=user_id, role=role, type=type)
    
    except JWTError:
        raise InvalidCredentialsError('Не дійсний токен')
    