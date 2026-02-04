from typing import Annotated
from fastapi import APIRouter, Depends
from dependencies import db_dep, require_role, user_dep
from services.master_logic import get_orders, assign_master, assign_parts, \
place_an_order, view_my_orders, find_parts
from schemas.part import OrdersPartCreate
from schemas.user import CurrentUser

master_dep = Annotated[CurrentUser, Depends(require_role('master'))]
router = APIRouter(
    prefix='/master',
    tags=['master'],
    dependencies=[Depends(require_role('master'))]
)

@router.get('/orders/available')
async def get_available_orders(db: db_dep):
    return await get_orders(db)

@router.get('/orders/{order_id}/take', status_code=204)
async def take_order(db: db_dep, order_id: int, master: user_dep):
    await assign_master(db, order_id, master)

@router.post('/orders/{order_id}/parts', status_code=201)
async def add_parts_to_order(db: db_dep, order_id: int, master: user_dep, parts: OrdersPartCreate):
    await assign_parts(db, order_id, master, parts)

@router.get('/parts')
async def get_parts(db: db_dep):
    return await find_parts(db)

@router.patch('/orders/{order_id}/finish')
async def complete_the_order(db: db_dep, order_id: int, work_price: float, master: user_dep):
    return await place_an_order(db, order_id, work_price, master)

@router.get('/orders/my')
async def get_my_orders(db: db_dep, master: user_dep):
    return await view_my_orders(db, master)
