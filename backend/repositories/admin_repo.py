from datetime import datetime, timedelta
from sqlalchemy import select, delete, update, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from models.tables_models import User, Part, Order, Status
from core.exceptions import EntityConflict
from schemas.user import CreateUser
from schemas.part import PartUpdate

async def create_user(db: AsyncSession, user: User):
    db.add(user)
    try:
        await db.commit()
    except IntegrityError:
        raise EntityConflict('Такий користувач вже існує!')
    await db.refresh(user)

    return user

async def get_users(db: AsyncSession):
    query = (select(User))
    users = await db.execute(query)
    await db.commit()

    return users.scalars().all()

async def delete_user(db: AsyncSession, user_id: int):
    stmt = (delete(User).where(User.id == user_id))
    result = await db.execute(stmt)

    if result.rowcount == 0:
        raise EntityConflict('Даного користувача не існує')
    
    await db.commit()

async def update_user(db: AsyncSession, user_id: int, data: CreateUser):
    stmt = (
        update(User)
        .where(User.id == user_id)
        .values(**data)
        .returning(User)
    )
    result = await db.execute(stmt)
    await db.commit()

    user = result.scalar_one_or_none()
    if user is None:
        raise EntityConflict('Даного користувача не існує')  

    return user

async def create_part(db: AsyncSession, part: Part):
    db.add(part)
    await db.commit()
    await db.refresh(part)

    return part

async def get_parts(db: AsyncSession):
    query = (select(Part))
    parts = await db.execute(query)
    await db.commit()

    return parts.scalars().all()

async def update_part(db: AsyncSession, part_id: int, data: PartUpdate):
    stmt = (
        update(Part)
        .where(Part.id == part_id)
        .values(**data)
        .returning(Part)
    )
    result = await db.execute(stmt)
    await db.commit()

    part = result.scalar_one_or_none()
    if part is None:
        raise EntityConflict('Такої запчастини не існує')  

    return part

async def get_orders(db: AsyncSession):
    query = (
        select(Order)
        .where(
            Order.status == Status.COMPLETED,
            func.date_trunc('month', Order.completed_at)
            == func.date_trunc('month', func.now())
        )
    )
    orders = await db.execute(query)

    return orders.scalars().all()