from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.tables_models import Client

async def new_client(db: AsyncSession, client: Client):
    db.add(client)
    await db.commit()
    await db.refresh(client)

    return client

async def get_client(db: AsyncSession, phone: str):
    query = select(Client).filter(Client.phone == phone)
    client = await db.execute(query)

    return client.scalars().first()