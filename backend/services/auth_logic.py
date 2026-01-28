from datetime import timedelta, datetime, timezone

from repositories.auth_repo import get_user, create_refresh_token, get_token_data
from core.security import verify_password, create_token
from core.exceptions import InvalidCredentialsError
from models.tables_models import RefreshToken


async def authenticate_user(db, user_form):
    current_user = await get_user(db, user_form.username)
    if not current_user \
    or not await verify_password(user_form.password, current_user.hashed_password):
        raise InvalidCredentialsError("Хибне ім'я або пароль!")
    
    payload = {
        'sub': str(current_user.id),
        'role': current_user.role.value,
        'type': 'access'
    }

    access_token = create_token(payload, timedelta(minutes=20))

    payload.pop('role')
    payload.update({'type': 'refresh'})

    refresh_token = create_token(payload, timedelta(days=30))
    await create_refresh_token(db, RefreshToken(**refresh_token.model_dump()))


    return {
        'access_token': access_token.token,
        'refresh_token': refresh_token.token
    }
    
async def token_update(db, token: str):
    token_data = await get_token_data(db, token)
    if not token_data or token_data.expires_at < datetime.now(timezone.utc):
        raise InvalidCredentialsError('Refresh токен не дійсний')
    
    
    payload = {
        'sub': str(token_data.user_id),
        'role': token_data.role.value,
        'type': 'access'
    }

    access_token = create_token(payload, timedelta(minutes=20))

    return {
        'access_token': access_token.token,
        'token_type': 'bearer'
    }
    