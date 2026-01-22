from fastapi import APIRouter

from dependencies import db_dep
from schemas.client import ClientCreate, ClientSearch
from schemas.device import DeviceCreate
from schemas.order import OrderCreate
from services.manager_logic import register_client, find_client, add_device, find_devices, new_order

router = APIRouter(
    prefix='/manager',
    tags=['manager']
)

@router.post('/clients')
async def create_client(db: db_dep, client: ClientCreate):
    return await register_client(db, client)

@router.post('/clients/search')
async def search_client(db: db_dep, client: ClientSearch):
    return await find_client(db, client)

@router.post('/devices')
async def create_device(db: db_dep, device: DeviceCreate):
    return await add_device(db, device)

@router.get('/devices/')
async def search_devices(db: db_dep, client_id: int):
    return await find_devices(db, client_id)

@router.post('/orders')
async def create_order(db: db_dep, order: OrderCreate):
    return await new_order(db, order)