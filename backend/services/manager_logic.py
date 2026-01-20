from repositories import manager_repo
from models.tables_models import Client
from schemas.client import ClientResponse

async def new_client(db, client_request):
    client = Client(
        first_name = client_request.first_name,
        last_name = client_request.last_name,
        phone = client_request.phone,
        telegram_id = 11223,
        notes = client_request.notes
    )
    new_client = await manager_repo.new_client(db, client)

    return ClientResponse.model_validate(new_client)

async def get_client(db, client_request):
    client_phone = client_request.phone
    client = await manager_repo.get_client(db, client_phone)

    if not client:
        return None
    return ClientResponse.model_validate(client)
