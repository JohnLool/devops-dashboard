from fastapi import APIRouter, Depends, HTTPException, status
from typing import List

from app.dependencies.validate_ownership import validate_server_ownership
from app.schemas.server import ServerOut, ServerCreate, ServerUpdate
from app.dependencies.services import get_server_service
from app.dependencies.auth import get_current_user
from app.services.server_service import ServerService

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
        server: ServerOut = Depends(validate_server_ownership),
):
    return server

@router.put("/{server_id}", response_model=ServerOut)
async def update_server(
        server_update: ServerUpdate,
        server: ServerOut = Depends(validate_server_ownership),
        server_service: ServerService = Depends(get_server_service)
):
    updated_server = await server_service.update(server.id, server_update)
    if not updated_server:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Update failed."
        )
    return updated_server

@router.delete("/{server_id}", response_model=ServerOut)
async def delete_server(
        server: ServerOut = Depends(validate_server_ownership),
        server_service: ServerService = Depends(get_server_service)
):
    deleted_server = await server_service.delete(server.id)
    if not deleted_server:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Deletion failed."
        )
    return deleted_server
