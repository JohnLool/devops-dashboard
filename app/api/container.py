from fastapi import APIRouter, status, Depends, HTTPException
from typing import List

from app.dependencies.auth import get_current_user
from app.dependencies.services import get_container_service, get_server_service
from app.models import UserOrm
from app.schemas.container import ContainerOut, ContainerCreate, ContainerUpdate
from app.services.container_service import ContainerService
from app.services.server_service import ServerService

router = APIRouter(prefix="/servers/{server_id}/containers", tags=["containers"])


@router.post("/", response_model=ContainerOut)
async def create_container(
        server_id: int,
        container_data: ContainerCreate,
        current_user: UserOrm = Depends(get_current_user),
        container_service: ContainerService = Depends(get_container_service),
        server_service: ServerService = Depends(get_server_service)
):
    server = await server_service.get_by_id(server_id)
    if not server or server.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Server not found."
        )
    container = await container_service.create_with_server_id(server_id, container_data)
    if not container:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Container creation failed."
        )
    return container


@router.get("/", response_model=List[ContainerOut])
async def get_server_containers(
        server_id: int,
        current_user: UserOrm = Depends(get_current_user),
        container_service: ContainerService = Depends(get_container_service),
        server_service: ServerService = Depends(get_server_service)
):
    server = await server_service.get_by_id(server_id)
    if not server or server.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Server not found."
        )
    containers = await container_service.get_all_by_server(server_id)
    return containers


@router.get("/{container_id}", response_model=ContainerOut)
async def get_container(
        container_id: int,
        server_id: int,
        current_user: UserOrm = Depends(get_current_user),
        server_service: ServerService = Depends(get_server_service),
        container_service: ContainerService = Depends(get_container_service)
):
    server = await server_service.get_by_id(server_id)
    if not server or server.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Server not found."
        )
    container = await container_service.get_by_id(container_id)
    if not container or container.server_id != server_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Container not found."
        )
    return container


@router.put("/{container_id}", response_model=ContainerOut)
async def update_container(
        container_id: int,
        server_id: int,
        container_data: ContainerUpdate,
        current_user: UserOrm = Depends(get_current_user),
        container_service: ContainerService = Depends(get_container_service),
        server_service: ServerService = Depends(get_server_service)
):
    server = await server_service.get_by_id(server_id)
    if not server or server.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Server not found."
        )
    container = await container_service.get_by_id(container_id)
    if not container or container.server_id != server_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Container not found."
        )
    container = await container_service.update(container_id, container_data)
    if not container:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Container update failed."
        )
    return container


@router.delete("/{container_id}", response_model=ContainerOut)
async def delete_container(
        container_id: int,
        server_id: int,
        current_user: UserOrm = Depends(get_current_user),
        server_service: ServerService = Depends(get_server_service),
        container_service: ContainerService = Depends(get_container_service)
):
    server = await server_service.get_by_id(server_id)
    if not server or server.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Server not found."
        )
    container = await container_service.get_by_id(container_id)
    if not container or container.server_id != server_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Container not found."
        )
    deleted_container = await container_service.delete(container_id)
    if not deleted_container:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Deletion failed."
        )
    return deleted_container

