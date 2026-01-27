from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models.tables_models import User
from core.exceptions import EntityConflict

async def get_user(db: AsyncSession, username: str):
    query = (select(User).where(User.username == username))
    user = await db.execute(query)
    await db.commit()

    return user.scalars().first()