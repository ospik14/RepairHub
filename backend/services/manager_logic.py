from repositories import manager_repo
from models.tables_models import Client, Device, Order
from schemas.client import ClientResponse, ClientCreate
from schemas.device import DeviceResponse, DeviceCreate
from schemas.order import OrderResponse, OrderCreate

async def new_client(db, client_request: ClientCreate):
    client = Client(**client_request.model_dump())
    new_client = await manager_repo.new_client(db, client)

    return ClientResponse.model_validate(new_client)

async def get_client(db, client_request):
    client_phone = client_request.phone
    client = await manager_repo.get_client(db, client_phone)

    if not client:
        return None
    return ClientResponse.model_validate(client)


async def new_device(db, device_request: DeviceCreate):
    device = Device(**device_request.model_dump())
    new_device = await manager_repo.new_device(db, device)

    return DeviceResponse.model_validate(new_device)
    
async def get_devices(db, client_id):
    current_client = client_id
    devices = await manager_repo.get_device(db, current_client)

    if not devices:
        return []
    return [
        DeviceResponse.model_validate(device)
        for device in devices
    ]

async def new_order(db, order_request: OrderCreate):
    order = Order(**order_request.model_dump())
    new_order = await manager_repo.new_order(db, order)

    return OrderResponse.model_validate(new_order)