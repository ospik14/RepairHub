from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.tables_models import Order, Status

async def get_orders(db: AsyncSession):
    query = (
        select(Order)
        .where(Order.master_id.is_(None))
        .where(Order.status == Status.NEW)
    )
    orders = await db.execute(query)

    return orders.scalars().all()