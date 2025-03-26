from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
# from starlette_exporter import PrometheusMiddleware, handle_metrics

from app.api.user import router as user_router
from app.api.servers import router as server_router
from app.api.container import router as container_router
# from app.core.database import create_db, delete_db
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

origins = [
    "http://127.0.0.1:5173",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# app.add_middleware(PrometheusMiddleware)
# app.add_route("/metrics", handle_metrics)

app.include_router(user_router)
app.include_router(server_router)
app.include_router(container_router)