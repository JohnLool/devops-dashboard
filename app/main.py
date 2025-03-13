from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.api.user import router as user_router
from app.api.servers import router as server_router
from app.api.container import router as container_router
from app.core.database import create_db, delete_db
from app.exceptions import UniqueConstraintException


@asynccontextmanager
async def lifespan(_: FastAPI):
    # await delete_db()
    yield
    # await create_db()

app = FastAPI(lifespan=lifespan, title="DevOps Dashboard")

@app.exception_handler(UniqueConstraintException)
async def unique_constraint_exception_handler(request: Request, exc: UniqueConstraintException):
    return JSONResponse(
        status_code=400,
        content={"detail": exc.message}
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user_router)
app.include_router(server_router)
app.include_router(container_router)