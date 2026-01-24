from fastapi import APIRouter
from dependencies import db_dep, user_dep
from services.master_logic import get_orders, assign_master, assign_parts
from schemas.part import PartCreate

router = APIRouter(
    prefix='/master',
    tags=['master']
)

@router.get('/orders/available')
async def get_available_orders(db: db_dep):
    return await get_orders(db)

@router.get('/orders/{order_id}/take')
async def take_order(db: db_dep, order_id: int, master: user_dep):
    await assign_master(db, order_id, master)

@router.post('/orders/{order_id}/parts')
async def add_parts_to_order(db: db_dep, order_id: int, master: user_dep, parts: PartCreate):
    await assign_parts(db, order_id, master, parts)