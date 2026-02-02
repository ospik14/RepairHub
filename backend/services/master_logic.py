from repositories import master_repo
from schemas.order import OrderCreateResponse, OrderResponse
from schemas.user import CurrentUser
from schemas.part import OrdersPartCreate, PartResponse
from models.tables_models import OrderParts, Order

async def get_orders(db):
    orders = await master_repo.get_orders(db)

    return [
        OrderResponse.model_validate(order)
        for order in orders
    ]

async def assign_master(db, order_id: int, master: CurrentUser):
    update_data = {
        'master_id': master.id,
        'status': 'IN_PROGRESS'
    }
    await master_repo.claim_new_order(db, order_id, update_data)

async def assign_parts(db, order_id: int, master: CurrentUser, parts: OrdersPartCreate):
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

async def place_an_order(db, order_id: int, work_price: int, master: CurrentUser):
    update_data = {
        'status': 'READY',
        'total_price': Order.total_price + work_price
    }
    final_order = await master_repo.update_order(db, order_id, master.id, update_data)

    return OrderCreateResponse.model_validate(final_order)
    
async def view_my_orders(db, master: CurrentUser):
    my_orders = await master_repo.get_my_orders(db, master.id)
    return [
        OrderResponse.model_validate(order)
        for order in my_orders
    ]

async def find_parts(db):
    parts = await master_repo.get_parts(db)

    return [
        PartResponse.model_validate(part)
        for part in parts
    ]