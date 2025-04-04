from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from typing import Annotated

from app.models import UserOrm
from app.schemas.user import UserOut, UserCreate, UserUpdate
from app.dependencies.services import get_user_service
from app.dependencies.auth import get_current_user, is_user_active

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
        is_active: bool = Depends(is_user_active),
):
    if is_active:
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
async def login_for_user_access_token(
        form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
        user_service: UserService = Depends(get_user_service),
        is_active: bool = Depends(is_user_active)
):
    if is_active:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User is already authenticated")

    user = await user_service.authenticate_user(form_data.username, form_data.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )

    access_token = await user_service.create_user_token(user)

    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )

    return {"access_token": access_token, "token_type": "bearer"}