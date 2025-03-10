from typing import Annotated
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.services.auth_service import AuthService
from app.services.container_service import ContainerService
from app.services.server_service import ServerService
from app.services.ssh_service import SSHService
from app.services.user_service import UserService


async def get_auth_service() -> AuthService:
    return AuthService()

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
        ssh_service: Annotated[SSHService, Depends(get_ssh_service)]
) -> ContainerService:
    return ContainerService(db, ssh_service)