from fastapi import APIRouter

from dependencies import db_dep
from schemas.client import ClientCreate, ClientSearch
from schemas.device import DeviceCreate
from services.manager_logic import new_client, get_client, new_device, get_devices

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

@router.post('/add_device')
async def add_device(db: db_dep, device: DeviceCreate):
    return await new_device(db, device)

@router.post('/search_devices/')
async def search_devices(db: db_dep, client_id: int):
    return await get_devices(db, client_id)