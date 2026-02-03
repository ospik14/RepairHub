from schemas.user import CreateUser, UserResponse, UserPassUpdate
from schemas.part import PartCreate, PartResponse, PartUpdate
from schemas.order import OrderCreateResponse
from models.tables_models import User, Part
from repositories.admin_repo import create_user, get_users, delete_user, \
update_user, create_part, get_parts, update_part, get_orders
from core.security import hash_password

async def assign_user(db, user: CreateUser):
    new_user = User(
        username = user.username,
        hashed_password = await hash_password(user.password),
        role = user.role
    )
    current_user = await create_user(db, new_user)

    return UserResponse.model_validate(current_user)

async def view_all_users(db):
    users = await get_users(db)

    return [
        UserResponse.model_validate(user)
        for user in users
    ]

async def release_user(db, user_id: int):
    await delete_user(db, user_id)

async def change_password(db, user_id: int, password: UserPassUpdate):
    update_data = {
        'hashed_password': await hash_password(password.password)
    }
    user = await update_user(db, user_id, update_data)

    return UserResponse.model_validate(user)

async def add_new_part(db, part: PartCreate):
    new_part = Part(**part.model_dump())
    current_part = await create_part(db, new_part)

    return PartResponse.model_validate(current_part)

async def view_all_parts(db):
    parts = await get_parts(db)

    return [
        PartResponse.model_validate(part)
        for part in parts
    ]

async def change_part_data(db, part_id: int, part_update: PartUpdate):
    data = part_update.model_dump(exclude_unset=True)

    part = await update_part(db, part_id, data)

    return PartResponse.model_validate(part)

async def orders_monthly_statistics(db):
    result = await get_orders(db)
    orders = [OrderCreateResponse.model_validate(order) for order in result]

    earnings = 0
    for order in orders:
        earnings += order.total_price

    return {
        'earnings': earnings,
        'complete_orders': len(orders)
    }