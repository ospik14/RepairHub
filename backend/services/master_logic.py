from repositories import master_repo
from schemas.order import OrderResponse

async def get_orders(db):
    orders = await master_repo.get_orders(db)

    return [
        OrderResponse.model_validate(order)
        for order in orders
    ]