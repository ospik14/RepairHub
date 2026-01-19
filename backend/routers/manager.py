from fastapi import APIRouter

from dependencies import db_dep
from schemas.client import ClientRequests

router = APIRouter(
    prefix='/manager',
    tags=['manager']
)

@router.post('/client')
async def create_client(db: db_dep, client: ClientRequests):
    return 