from fastapi import APIRouter
from dependencies import db_dep
from services.master_logic import get_orders

router = APIRouter(
    prefix='/master',
    tags=['master']
)

@router.get('/orders/available')
async def get_available_orders(db: db_dep):
    return await get_orders(db)