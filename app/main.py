from fastapi import FastAPI
from contextlib import asynccontextmanager


from app.core.database import create_db


@asynccontextmanager
async def lifespan(_: FastAPI):
    # await create_db()
    yield

app = FastAPI(lifespan=lifespan)