from repositories import master_repo
from schemas.order import OrderResponse
from schemas.user import UserBase
from schemas.part import PartCreate
from models.tables_models import OrderParts

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
    return await master_repo.update_order(db, order_id, update_data)

async def assign_parts(db, order_id: int, parts: PartCreate):
    part = await master_repo.update_part_quantity(db, parts.part_id)
    print(part)

    #new_part = OrderParts()