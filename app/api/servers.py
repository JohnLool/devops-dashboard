from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from app.schemas.server import ServerOut, ServerCreate, ServerUpdate
from app.dependencies.services import get_server_service
from app.dependencies.auth import get_current_user
from app.services.server_service import ServerService
from app.models.server import ServerOrm
from app.models.user import UserOrm


router = APIRouter(prefix="/servers", tags=["servers"])


@router.get("", response_model=List[ServerOut])
async def get_user_servers(
        current_user: UserOrm = Depends(get_current_user),
        server_service: ServerService = Depends(get_server_service)
):
    servers = await server_service.get_all_by_owner(current_user.id)
    return servers

@router.post("", response_model=ServerOut)
async def create_server(
        server_data: ServerCreate,
        current_user: UserOrm = Depends(get_current_user),
        server_service: ServerService = Depends(get_server_service)
):
    server = await server_service.create_with_owner(server_data, current_user.id)
    if not server:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Server creation failed."
        )
    return server

@router.get("/{server_id}", response_model=ServerOut)
async def get_server(
        server_id: int,
        current_user: UserOrm = Depends(get_current_user),
        server_service: ServerService = Depends(get_server_service)
):
    server = await server_service.get_by_id(server_id)
    if not server or server.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Server not found."
        )
    return server

@router.put("/{server_id}", response_model=ServerOut)
async def update_server(
        server_id: int,
        server_update: ServerUpdate,
        current_user: UserOrm = Depends(get_current_user),
        server_service: ServerService = Depends(get_server_service)
):
    server = await server_service.get_by_id(server_id)
    if not server or server.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Server not found."
        )
    updated_server = await server_service.update(server_id, server_update)
    if not updated_server:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Update failed."
        )
    return updated_server

@router.delete("/{server_id}", response_model=ServerOut)
async def delete_server(
        server_id: int,
        current_user: UserOrm = Depends(get_current_user),
        server_service: ServerService = Depends(get_server_service)
):
    server = await server_service.get_by_id(server_id)
    if not server or server.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Server not found."
        )
    deleted_server = await server_service.delete(server_id)
    if not deleted_server:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Deletion failed."
        )
    return deleted_server
