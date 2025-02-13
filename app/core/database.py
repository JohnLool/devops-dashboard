from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.ext.declarative import declarative_base

from app.core.config import settings


Base = declarative_base()


engine = create_async_engine(
    url=settings.database_url,
    echo=True
)

AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


async def get_session() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session


async def create_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def delete_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)