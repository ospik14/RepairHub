from fastapi import APIRouter
from schemas.user import CreateUser
from dependencies import db_dep
from services.admin_logic import assign_user

router = APIRouter(
    prefix='/admin',
    tags=['admin']
)

@router.post('/users')
async def create_user(db: db_dep, user: CreateUser):
    return await assign_user(db, user)