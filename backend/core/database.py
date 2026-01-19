import os
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

SQLALCHEMY_DATABASE_URL = os.getenv(
    'DATABASE_URL', 
    'postgresql+asyncpg://postgres:password@localhost:5432/repair_hub'
)

engine = create_async_engine(SQLALCHEMY_DATABASE_URL, echo=True)

AsyncSessionLocal = async_sessionmaker(autoflush=False, expire_on_commit=False, class_=AsyncSession, bind=engine)

class Base(DeclarativeBase):
    pass

async def get_session():
    async with AsyncSessionLocal() as session:
        yield session