from fastapi import APIRouter, status, Depends, HTTPException
from typing import List


from app.dependencies.auth import get_current_user
from app.dependencies.services import get_container_service, get_server_service
from app.models import UserOrm
from app.schemas.container import ContainerOut, ContainerCreate, ContainerUpdate
from app.schemas.container_status_responses import ContainerResponses
from app.services.container_service import ContainerService
from app.services.server_service import ServerService

router = APIRouter(prefix="/servers/{server_id}/containers", tags=["containers"])


@router.post("/")
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
    container = await container_service.create_with_server(server, container_data)
    if not container:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Container creation failed."
        )
    return ContainerResponses.creating(container.id)


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

    await container_service.sync_containers(server)
    return await container_service.get_all_by_server(server_id)


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
    await container_service.sync_containers(server)
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
    try:
        deleted_container = await container_service.remove_container(container, server)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    return deleted_container


@router.post("/{container_id}/stop")
async def stop_container(
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
    await container_service.stop_container(container, server)
    return ContainerResponses.stopping(container_id)


@router.post("/{container_id}/start")
async def start_container(
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
    await container_service.start_container(container, server)
    return ContainerResponses.starting(container_id)


@router.post("/{container_id}/restart")
async def restart_container(
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
    await container_service.restart_container(container, server)
    return ContainerResponses.restarting(container_id)