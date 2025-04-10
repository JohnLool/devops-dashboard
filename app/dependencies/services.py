from typing import Annotated
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from redis.asyncio import Redis

from app.core.database import get_session
from app.core.redis_client import get_redis
from app.repositories.auth_token_repo import AuthTokenRepository
from app.services.auth_service import AuthService
from app.services.container_service import ContainerService
from app.services.server_service import ServerService
from app.services.ssh_service import SSHService
from app.services.user_service import UserService


async def get_auth_token_repository(
    db: Annotated[AsyncSession, Depends(get_session)]
) -> AuthTokenRepository:
    return AuthTokenRepository(db)

async def get_auth_service(
    auth_token_repo: Annotated[AuthTokenRepository,
    Depends(get_auth_token_repository)]
) -> AuthService:
    return AuthService(auth_token_repo)

async def get_ssh_service() -> SSHService:
    return SSHService()

async def get_user_service(
    db: Annotated[AsyncSession, Depends(get_session)],
    auth_service: Annotated[AuthService, Depends(get_auth_service)]
) -> UserService:
    return UserService(db, auth_service)

async def get_server_service(
        db: Annotated[AsyncSession, Depends(get_session)]
) -> ServerService:
    return ServerService(db)

async def get_container_service(
    db: Annotated[AsyncSession, Depends(get_session)],
    ssh_service: Annotated[SSHService, Depends(get_ssh_service)],
    redis_client: Annotated[Redis, Depends(get_redis)]
) -> ContainerService:
    return ContainerService(db, ssh_service, redis_client)