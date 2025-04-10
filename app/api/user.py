from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.security import OAuth2PasswordRequestForm
from typing import Annotated

from app.models import UserOrm
from app.schemas.user import UserOut, UserCreate, UserUpdate
from app.dependencies.services import get_user_service
from app.dependencies.auth import get_current_user, is_access_token_alive, get_refresh_token_payload

from app.services.user_service import UserService
from app.schemas.token import Token


router = APIRouter(prefix="/users", tags=["users"])


@router.get("/profile", response_model=UserOut)
async def get_user_profile(current_user: UserOrm = Depends(get_current_user)):
    if current_user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    return current_user

@router.post("", response_model=UserOut)
async def create_user(
        user: UserCreate,
        user_service: UserService = Depends(get_user_service),
        is_alive: bool = Depends(is_access_token_alive),
):
    if is_alive:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User is already authenticated")

    return await user_service.create(user)

@router.put("", response_model=UserOut)
async def update_user(
        user_data: UserUpdate,
        user_service: UserService = Depends(get_user_service),
        current_user: UserOrm = Depends(get_current_user),
):
    if current_user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    return await user_service.update(current_user.id, user_data)

@router.delete("", response_model=UserOut)
async def delete_user(
        current_user: UserOrm = Depends(get_current_user),
        user_service: UserService = Depends(get_user_service)
):
    if current_user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    return await user_service.delete(current_user.id)

@router.post("/login", response_model=Token)
async def login_for_user_tokens(
        response: Response,
        form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
        user_service: UserService = Depends(get_user_service),
        is_alive: bool = Depends(is_access_token_alive)
):
    if is_alive:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User is already authenticated")

    user = await user_service.authenticate_user(form_data.username, form_data.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )

    access_token = await user_service.create_user_access_token(user)
    refresh_token = await user_service.create_user_refresh_token(user)

    if not access_token or not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Error with token creation happened",
        )
    response.headers[refresh_token.token_type] = refresh_token.token

    return access_token

@router.post("/refresh", response_model=Token)
async def refresh(
        response: Response,
        user_service: UserService = Depends(get_user_service),
        payload: dict = Depends(get_refresh_token_payload),
):
    user = await user_service.get_by_username_orm(payload.get("sub"))
    access_token = await user_service.create_user_access_token(user)
    refresh_token = await user_service.create_user_refresh_token(user)

    if not access_token or not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Error with token creation happened",
        )

    response.headers[refresh_token.token_type] = refresh_token.token

    return access_token