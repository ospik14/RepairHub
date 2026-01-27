from fastapi import FastAPI
from fastapi.responses import JSONResponse
from routers import manager, master, admin, auth
from core.exceptions import EntityConflict, InvalidCredentialsError

app = FastAPI()

app.include_router(router=manager.router)
app.include_router(router=master.router)
app.include_router(router=admin.router)
app.include_router(router=auth.router)

@app.exception_handler(EntityConflict)
async def conflict_handler(request, exc):
    return JSONResponse(status_code=409, content={'detail': str(exc)})

@app.exception_handler(InvalidCredentialsError)
async def authentication_failed(request, exc):
    return JSONResponse(status_code=401, content={'detail': str(exc)})