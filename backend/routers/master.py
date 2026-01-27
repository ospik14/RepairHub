from fastapi import APIRouter, Depends
from dependencies import db_dep, user_dep
from services.master_logic import get_orders, assign_master, assign_parts, place_an_order, view_my_orders
from schemas.part import PartCreate

router = APIRouter(
    prefix='/master',
    tags=['master']
)

@router.get('/orders/available')
async def get_available_orders(db: db_dep, master: user_dep):
    return await get_orders(db)

@router.get('/orders/{order_id}/take')
async def take_order(db: db_dep, order_id: int, master: user_dep):
    await assign_master(db, order_id, master)

@router.post('/orders/{order_id}/parts')
async def add_parts_to_order(db: db_dep, order_id: int, master: user_dep, parts: PartCreate):
    await assign_parts(db, order_id, master, parts)

@router.get('/orders/{order_id}/finish')
async def complete_the_order(db: db_dep, order_id: int, work_price: float, master: user_dep):
    return await place_an_order(db, order_id, work_price, master)

@router.get('/orders/my')
async def get_my_orders(db: db_dep, master: user_dep):
    return await view_my_orders(db, master)