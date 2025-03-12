from fastapi import Depends, HTTPException, status
from typing import Tuple

from app.models.user import UserOrm

from app.dependencies.auth import get_current_user
from app.dependencies.services import get_server_service, get_container_service
from app.schemas.container import ContainerOut
from app.schemas.server import ServerOut

from app.services.container_service import ContainerService
from app.services.server_service import ServerService


async def validate_server_ownership(
    server_id: int,
    user: UserOrm = Depends(get_current_user),
    server_service: ServerService = Depends(get_server_service)
) -> ServerOut:
    server = await server_service.get_by_id(server_id)
    if not server or server.owner_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Server not found."
        )
    return server

async def validate_container_ownership(
    container_id: int,
    server: ServerOut = Depends(validate_server_ownership),
    container_service: ContainerService = Depends(get_container_service)
) -> ContainerOut:
    container = await container_service.get_by_id(container_id)
    if not container or container.server_id != server.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Container not found."
        )
    return container

async def validate_container_with_server(
    container_id: int,
    server: ServerOut = Depends(validate_server_ownership),
    container_service: ContainerService = Depends(get_container_service)
) -> Tuple[ServerOut, ContainerOut]:
    container = await container_service.get_by_id(container_id)
    if not container or container.server_id != server.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Container not found."
        )
    return server, container