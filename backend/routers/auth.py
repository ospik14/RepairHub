from fastapi import APIRouter
from schemas.user import CreateUser
from dependencies import db_dep, form_dep
from services.auth_logic import authenticate_user

router = APIRouter(
    prefix='/auth',
    tags=['auth']
)

@router.post('/token')
async def login_user(db: db_dep, user_form: form_dep):
    return await authenticate_user(db, user_form)