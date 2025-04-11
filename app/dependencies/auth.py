from typing import Optional
from fastapi import Depends, HTTPException, status, Cookie
from fastapi.security import OAuth2PasswordBearer

from app.models.user import UserOrm
from app.services.auth_service import AuthService
from app.services.user_service import UserService
from app.dependencies.services import get_auth_service, get_user_service


oauth2_user_scheme = OAuth2PasswordBearer(tokenUrl="users/login", auto_error=False)


async def get_current_user(
    token: Optional[str] = Depends(oauth2_user_scheme),
    auth_service: AuthService = Depends(get_auth_service),
    user_service: UserService = Depends(get_user_service)
) -> Optional[UserOrm]:
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials or token expired",

        )

    payload = await auth_service.verify_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials or token expired",

        )


    return await user_service.get_by_username_orm(payload.get("sub"))

async def is_access_token_alive(
        token: Optional[str] = Depends(oauth2_user_scheme),
        auth_service: AuthService = Depends(get_auth_service),
) -> bool:
    if token and await auth_service.verify_access_token(token) is not None:
        return True
    else:
        return False

async def get_refresh_token(refresh_token: Optional[str] = Cookie(None)):
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token missing in cookie"
        )
    return refresh_token

async def get_refresh_token_payload(
    token: str = Depends(get_refresh_token),
    auth_service: AuthService = Depends(get_auth_service)
):
    payload = await auth_service.verify_refresh_token(token)
    if token and payload is not None:
        return payload
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials or token expired",

        )