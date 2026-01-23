from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from models.tables_models import Order, Status, Part

async def get_orders(db: AsyncSession):
    query = (
        select(Order)
        .where(Order.master_id.is_(None))
        .where(Order.status == Status.NEW)
    )
    orders = await db.execute(query)

    return orders.scalars().all()

async def update_order(db: AsyncSession, order_id: int, data: dict):
    stmt = (
        update(Order)
        .where(Order.id == order_id, Order.status == Status.NEW)
        .values(**data)
        .execution_options(synchronize_session='fetch')
    )
    result = await db.execute(stmt)
    await db.commit()

    if result.rowcount == 0:
        return 'Замовлення вже зайнято іншим майстром!'
    
    return 'Замовлення прийнято'

async def update_part_quantity(db: AsyncSession, part_id):
    stmt = (
        update(Part)
        .where(Part.id == part_id, Part.quantity > 0)
        .values(quantity = Part.quantity - 1)
        .execution_options(synchronize_session='fetch')
        .returning(Part.sell_price)
    )
    result = await db.execute(stmt)
    price = result.scalars().first()
    await db.commit()

    if price is None:
        return 'Запчастини немає в наявності!'
    
    return price