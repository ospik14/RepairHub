from fastapi import APIRouter, Depends
from schemas.user import CreateUser, UserPassUpdate
from schemas.part import PartCreate, PartUpdate
from dependencies import db_dep, require_role
from services.admin_logic import assign_user, view_all_users, release_user, \
change_password, add_new_part, view_all_parts, change_part_data, orders_monthly_statistics

router = APIRouter(
    prefix='/admin',
    tags=['admin'],
    dependencies=[Depends(require_role('admin'))]
)

@router.post('/users')
async def create_user(db: db_dep, user: CreateUser):
    return await assign_user(db, user)

@router.get('/users/all')
async def get_all_users(db: db_dep):
    return await view_all_users(db)

@router.delete('/users/{user_id}/delete', status_code=204)
async def delete_user(db: db_dep, user_id: int):
    await release_user(db, user_id)

@router.post('/user/{user_id}/update')
async def update_user(db: db_dep, user_id: int, password: UserPassUpdate):
    return await change_password(db, user_id, password)

@router.post('/parts')
async def create_part(db: db_dep, part: PartCreate):
    return await add_new_part(db, part)

@router.get('/parts/all')
async def get_all_parts(db: db_dep):
    return await view_all_parts(db)

@router.post('/parts/{part_id}/update')
async def update_part(db: db_dep, part_id: int, data: PartUpdate):
    return await change_part_data(db, part_id, data)

@router.get('/orders/stat')
async def get_monthly_stat(db: db_dep):
    return await orders_monthly_statistics(db)