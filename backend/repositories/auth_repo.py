from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models.tables_models import User, RefreshToken
from core.exceptions import EntityConflict

async def get_user(db: AsyncSession, username: str):
    query = (select(User).where(User.username == username))
    user = await db.execute(query)
    await db.commit()

    return user.scalars().first()

async def create_refresh_token(db: AsyncSession, token: RefreshToken):
    db.add(token)
    await db.commit()

async def get_token_data(db: AsyncSession, token: str):
    query = (
        select(RefreshToken)
        .where(RefreshToken.token == token)
    )
    token_data = await db.execute(query)
    await db.commit()

    return token_data.scalars().first()