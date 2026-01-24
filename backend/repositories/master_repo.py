from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from core.exceptions import EntityConflict
from models.tables_models import Order, Status, Part, OrderParts

async def get_orders(db: AsyncSession):
    query = (
        select(Order)
        .where(Order.master_id.is_(None))
        .where(Order.status == Status.NEW)
    )
    orders = await db.execute(query)

    return orders.scalars().all()

async def claim_new_order(db: AsyncSession, order_id: int, data: dict):
    stmt = (
        update(Order)
        .where(Order.id == order_id, Order.status == Status.NEW)
        .values(**data)
        .execution_options(synchronize_session='fetch')
    )
    result = await db.execute(stmt)
    await db.commit()

    if result.rowcount == 0:
        raise EntityConflict('Замовлення вже зайнято іншим майстром!')
    

async def update_part_quantity(db: AsyncSession, part_id, needed_quantity):
    stmt = (
        update(Part)
        .where(Part.id == part_id, Part.quantity >= needed_quantity)
        .values(quantity = Part.quantity - needed_quantity)
        .execution_options(synchronize_session='fetch')
        .returning(Part.sell_price)
    )
    result = await db.execute(stmt)
    price = result.scalars().first()
    await db.commit()

    if price is None:
        raise EntityConflict('Запчини немає в наявності!')
    
    return price

async def create_order_parts(db: AsyncSession, order_parts: OrderParts):
    db.add(order_parts)
    await db.commit()

async def update_order(db: AsyncSession, order_id: int, master_id: int, data: dict):
    stmt = (
        update(Order)
        .where(Order.id == order_id, Order.master_id == master_id)
        .values(**data)
        .execution_options(synchronize_session='fetch')
    )
    result = await db.execute(stmt)
    await db.commit()

    if result.rowcount == 0:
        raise EntityConflict('Це не ваше замовлення!')