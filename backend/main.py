from fastapi import FastAPI
from routers import manager

app = FastAPI()

app.include_router(router=manager.router)