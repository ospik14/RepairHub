from fastapi import APIRouter
from schemas.user import CreateUser, UserPassUpdate
from schemas.part import PartCreate, PartUpdate
from dependencies import db_dep, user_dep
from services.admin_logic import assign_user, view_all_users, release_user, \
change_password, add_new_part, view_all_parts, change_part_data

router = APIRouter(
    prefix='/admin',
    tags=['admin']
)

@router.post('/users')
async def create_user(db: db_dep, user: CreateUser, admin: user_dep):
    return await assign_user(db, user)

@router.get('/users/all')
async def get_all_users(db: db_dep, admin: user_dep):
    return await view_all_users(db)

@router.delete('/users/{user_id}/delete')
async def delete_user(db: db_dep, user_id: int, admin: user_dep):
    await release_user(db, user_id)

@router.post('/user/{user_id}/update')
async def update_user(db: db_dep, user_id: int, password: UserPassUpdate, admin: user_dep):
    return await change_password(db, user_id, password)

@router.post('/parts')
async def create_part(db: db_dep, part: PartCreate, admin: user_dep):
    return await add_new_part(db, part)

@router.get('/parts/all')
async def get_all_parts(db: db_dep, admin: user_dep):
    return await view_all_parts(db)

@router.post('/parts/{part_id}/update')
async def update_part(db: db_dep, part_id: int, data: PartUpdate, admin: user_dep):
    return await change_part_data(db, part_id, data)