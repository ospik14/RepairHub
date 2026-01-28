from fastapi import APIRouter, Request, Response
from schemas.user import CreateUser
from dependencies import db_dep, form_dep
from services.auth_logic import authenticate_user, token_update

router = APIRouter(
    prefix='/auth',
    tags=['auth']
)

@router.post('/token')
async def login_user(db: db_dep, user_form: form_dep, response: Response):
    tokens = await authenticate_user(db, user_form)

    response.set_cookie(
        key='refresh_token',
        value=tokens.get('refresh_token'),
        httponly=True,
        samesite='lax'
    )
    return {
        'access_token': tokens.get('access_token'),
        'token_type': 'bearer'
    }

@router.post('/refresh')
async def refresh(db: db_dep, request: Request):
    token = request.cookies.get('refresh_token')
    print(token)

    return await token_update(db, token)