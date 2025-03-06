from typing import Optional
from fastapi import Depends
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
        return None

    payload = await auth_service.verify_token(token)
    if payload.get("role") != "user":
        return None

    return await user_service.get_by_username_orm(payload.get("sub"))