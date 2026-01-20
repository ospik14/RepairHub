from fastapi import APIRouter

from dependencies import db_dep
from schemas.client import ClientCreate, ClientSearch
from services.manager_logic import new_client, get_client

router = APIRouter(
    prefix='/manager',
    tags=['manager']
)

@router.post('/create_client')
async def create_client(db: db_dep, client: ClientCreate):
    return await new_client(db, client)

@router.post('/search_client')
async def search_client(db: db_dep, client: ClientSearch):
    return await get_client(db, client)