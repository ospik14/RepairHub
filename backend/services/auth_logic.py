from repositories.auth_repo import get_user
from core.security import verify_password

async def authenticate_user(db, user_form):
    current_user = await get_user(db, user_form.username)
    if not current_user \
    or not verify_password(user_form.password, current_user.hashed_password):
        raise
    