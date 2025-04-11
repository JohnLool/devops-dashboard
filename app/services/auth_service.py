from datetime import datetime, timedelta, timezone
import jwt
from jwt import PyJWTError
from passlib.context import CryptContext

from typing import Optional

from app.core.config import settings
import asyncio

from app.repositories.auth_token_repo import AuthTokenRepository
from app.schemas.token import Token

pwd_context = CryptContext(schemes=["bcrypt"])


class AuthService:
    def __init__(self, auth_token_repo: AuthTokenRepository):
        self.auth_token_repo = auth_token_repo

    @staticmethod
    async def create_access_token(data: dict) -> Optional[Token]:
        access_data = data.copy()
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_data.update({"exp": expire})
        access_token = await asyncio.to_thread(
            jwt.encode, access_data, settings.SECRET_KEY, algorithm=settings.ALGORITHM
        )

        token = {
            "token": access_token,
            "token_type": "bearer",
        }

        return Token.model_validate(token)

    async def create_refresh_token(self, data: dict) -> Optional[Token]:
        refresh_data = data.copy()
        refresh_expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        refresh_data.update({"exp": refresh_expire})
        refresh_token = await asyncio.to_thread(
            jwt.encode, refresh_data, settings.SECRET_KEY, algorithm=settings.ALGORITHM
        )

        refresh_token_to_db = {
            "token": refresh_token,
            "user_id": refresh_data["id"],
            "expires_at": refresh_expire,
        }

        await self.auth_token_repo.upsert_refresh_token(refresh_token_to_db)

        token_obj = {
            "token": refresh_token,
            "token_type": "X-Refresh-Token",
        }

        return Token.model_validate(token_obj)

    async def delete_refresh_token_in_db(self, user_id: int) -> None:
        return await self.auth_token_repo.delete_by_user_id(user_id)

    @staticmethod
    async def verify_access_token(token: str):
        try:
            payload = await asyncio.to_thread(
                jwt.decode, token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
            )
            return payload
        except PyJWTError:
            return None

    async def verify_refresh_token(self, token: str):
        try:
            payload = await asyncio.to_thread(
                jwt.decode, token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
            )
            token_in_db = await self.auth_token_repo.get_by_user_id(payload.get("id"))
            if token_in_db is not None and token_in_db.deleted is False:
                return payload
        except PyJWTError:
            return None

    @staticmethod
    async def hash_password(password: str) -> str:
        return await asyncio.to_thread(pwd_context.hash, password)

    @staticmethod
    async def verify_password(plain_password: str, hashed_password: str) -> bool:
        result = await asyncio.to_thread(pwd_context.verify, plain_password, hashed_password)
        return result