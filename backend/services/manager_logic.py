from repositories import manager_repo
from models.tables_models import Client, Device, Order, Status
from schemas.client import ClientResponse, ClientCreate
from schemas.device import DeviceResponse, DeviceCreate
from schemas.order import OrderResponse, OrderCreate

async def register_client(db, client_request: ClientCreate):
    client = Client(**client_request.model_dump())
    new_client = await manager_repo.create_client(db, client)

    return ClientResponse.model_validate(new_client)

async def find_client(db, client_request):
    client_phone = client_request.phone
    client = await manager_repo.get_client_by_phone(db, client_phone)

    if not client:
        return None
    return ClientResponse.model_validate(client)


async def add_device(db, device_request: DeviceCreate):
    device = Device(**device_request.model_dump())
    new_device = await manager_repo.create_device(db, device)

    return DeviceResponse.model_validate(new_device)
    
async def find_devices(db, client_id):
    devices = await manager_repo.get_device_by_user_id(db, client_id)

    return [
        DeviceResponse.model_validate(device)
        for device in devices
    ]

async def new_order(db, order_request: OrderCreate):
    order = Order(**order_request.model_dump(), 
                  master_id=None, 
                  status=Status.NEW
            )
    new_order = await manager_repo.create_order(db, order)

    return OrderResponse.model_validate(new_order)