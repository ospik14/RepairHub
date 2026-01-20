from fastapi import APIRouter

from dependencies import db_dep
from schemas.client import ClientCreate
from services.manager_logic import new_client

router = APIRouter(
    prefix='/manager',
    tags=['manager']
)

@router.post('/client')
async def create_client(db: db_dep, client: ClientCreate):
    return await new_client(db, client)