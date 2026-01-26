
from schemas.user import CreateUser, UserResponse
from models.tables_models import User
from repositories.admin_repo import create_user

async def assign_user(db, user: CreateUser):
    new_user = User(
        username = user.username,
        hashed_password = user.password,
        role = user.role
    )
    current_user = await create_user(db, new_user)

    return UserResponse.model_validate(current_user)