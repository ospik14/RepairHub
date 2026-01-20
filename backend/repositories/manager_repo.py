from sqlalchemy.ext.asyncio import AsyncSession

from schemas.client import ClientBase

async def new_client(db: AsyncSession, client: ClientBase):
    db.add(client)
    await db.commit()
    await db.refresh(client)

    return client