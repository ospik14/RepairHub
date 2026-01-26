from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from models.tables_models import User
from core.exceptions import EntityConflict

async def create_user(db: AsyncSession, user: User):
    db.add(user)
    try:
        await db.commit()
    except IntegrityError:
        raise EntityConflict('Такий користувач вже існує!')
    await db.refresh(user)

    return user