from repositories import master_repo
from schemas.order import OrderResponse
from schemas.user import UserBase
from schemas.part import PartCreate
from models.tables_models import OrderParts, Order

async def get_orders(db):
    orders = await master_repo.get_orders(db)

    return [
        OrderResponse.model_validate(order)
        for order in orders
    ]

async def assign_master(db, order_id: int, master: UserBase):
    update_data = {
        'master_id': master.id,
        'status': 'IN_PROGRESS'
    }
    await master_repo.claim_new_order(db, order_id, update_data)

async def assign_parts(db, order_id: int, master: UserBase, parts: PartCreate):
    part_price = await master_repo.update_part_quantity(db, parts.part_id, parts.quantity)
    
    new_order_parts = OrderParts(
        **parts.model_dump(),
        order_id = order_id,
        price = part_price
    )
    update_data = {
        'total_price': part_price * parts.quantity + Order.total_price
    }
    await master_repo.update_order(db, order_id, master.id, update_data)
    await master_repo.create_order_parts(db, new_order_parts)
    