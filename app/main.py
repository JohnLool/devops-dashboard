from fastapi import FastAPI
from contextlib import asynccontextmanager

from app.api.user import router as user_router
from app.core.database import create_db


@asynccontextmanager
async def lifespan(_: FastAPI):
    # await create_db()
    yield

app = FastAPI(lifespan=lifespan)

app.include_router(user_router)