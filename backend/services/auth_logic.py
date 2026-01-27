from datetime import timedelta

from repositories.auth_repo import get_user
from core.security import verify_password, create_access_token
from core.exceptions import InvalidCredentialsError


async def authenticate_user(db, user_form):
    current_user = await get_user(db, user_form.username)
    if not current_user \
    or not await verify_password(user_form.password, current_user.hashed_password):
        raise InvalidCredentialsError("Хибне ім'я або пароль!")
    token = create_access_token(current_user, timedelta(minutes=20))

    return {
        'access_token': token,
        'token_type': 'bearer'
    }
    
    