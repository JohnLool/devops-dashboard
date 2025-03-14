from fastapi import APIRouter, status, Depends, HTTPException
from typing import List, Tuple


from app.dependencies.services import get_container_service
from app.dependencies.validate_ownership import validate_server_ownership, validate_container_ownership, \
    validate_container_with_server

from app.schemas.container import ContainerOut, ContainerCreate, ContainerUpdate, ContainerAction
from app.schemas.container_status_responses import ContainerResponses
from app.schemas.server import ServerOut
from app.services.container_service import ContainerService


router = APIRouter(prefix="/servers/{server_id}/containers", tags=["containers"])


@router.post("")
async def create_container(
        container_data: ContainerCreate,
        server: ServerOut = Depends(validate_server_ownership),
        container_service: ContainerService = Depends(get_container_service)
):
    try:
        container = await container_service.create_with_server(server, container_data)
        return ContainerResponses.creating(container.id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("", response_model=List[ContainerOut])
async def get_server_containers(
        server: ServerOut = Depends(validate_server_ownership),
        container_service: ContainerService = Depends(get_container_service),
):
    await container_service.sync_containers(server)
    return await container_service.get_all_by_server(server.id)


@router.get("/{container_id}", response_model=ContainerOut)
async def get_container(
        container_with_server: Tuple[ServerOut, ContainerOut] = Depends(validate_container_with_server),
        container_service: ContainerService = Depends(get_container_service),
):
    server, container = container_with_server
    await container_service.sync_containers(server)
    return container


@router.post("/{container_id}")
async def recreate_container(
        container_data: ContainerCreate,
        container_with_server: Tuple[ServerOut, ContainerOut] = Depends(validate_container_with_server),
        container_service: ContainerService = Depends(get_container_service)
):
    server, container = container_with_server
    try:
        await container_service.remove_container(container, server)
        container = await container_service.create_with_server(server, container_data)
        return ContainerResponses.recreating(container.id)
        # docker do not support name, image or port updating in existing container
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.put("/{container_id}")
async def update_container_active_status(
        container_data: ContainerUpdate,
        container: ContainerOut = Depends(validate_container_ownership),
        container_service: ContainerService = Depends(get_container_service)
):
    try:
        updated_container = await container_service.update(container.id, container_data)
        return updated_container
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.delete("/{container_id}")
async def delete_container(
        container_with_server: Tuple[ServerOut, ContainerOut] = Depends(validate_container_with_server),
        container_service: ContainerService = Depends(get_container_service)
):
    server, container = container_with_server
    try:
        await container_service.remove_container(container, server)
        return ContainerResponses.deleting(container.id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/{container_id}/{action}")
async def control_container(
        action: ContainerAction,
        container_with_server: Tuple[ServerOut, ContainerOut] = Depends(validate_container_with_server),
        container_service: ContainerService = Depends(get_container_service)
):
    server, container = container_with_server
    if action == ContainerAction.start:
        await container_service.start_container(container, server)
        response = ContainerResponses.starting(container.id)
    elif action == ContainerAction.stop:
        await container_service.stop_container(container, server)
        response = ContainerResponses.stopping(container.id)
    elif action == ContainerAction.restart:
        await container_service.restart_container(container, server)
        response = ContainerResponses.restarting(container.id)
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid action.")

    return response