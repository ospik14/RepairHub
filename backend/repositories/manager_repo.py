from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from models.tables_models import Client, Device, Order
from core.exceptions import EntityConflict

async def create_client(db: AsyncSession, client: Client):
    db.add(client)
    try:
        await db.commit()
    except IntegrityError:
        raise EntityConflict('Такий клієнт вже існує!')
    await db.refresh(client)

    return client

async def get_client_by_phone(db: AsyncSession, phone: str):
    query = select(Client).filter(Client.phone == phone)
    client = await db.execute(query)

    return client.scalars().first()

async def create_device(db: AsyncSession, device: Device):
    db.add(device)
    await db.commit()
    await db.refresh(device)

    return device

async def get_device_by_user_id(db: AsyncSession, client_id: str):
    query = select(Device).filter(Device.client_id == client_id)
    client = await db.execute(query)

    return client.scalars().all()

async def create_order(db: AsyncSession, order: Order):
    db.add(order)
    await db.commit()
    await db.refresh(order)

    return order