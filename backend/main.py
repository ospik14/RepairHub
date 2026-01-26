from fastapi import FastAPI
from fastapi.responses import JSONResponse
from routers import manager, master, admin
from core.exceptions import EntityConflict

app = FastAPI()

app.include_router(router=manager.router)
app.include_router(router=master.router)
app.include_router(router=admin.router)

@app.exception_handler(EntityConflict)
async def parts_out_of_stock_handler(request, exc):
    return JSONResponse(status_code=409, content={'detail': str(exc)})