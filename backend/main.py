from fastapi import FastAPI
from routers import manager, master

app = FastAPI()

app.include_router(router=manager.router)
app.include_router(router=master.router)