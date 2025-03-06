from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.user_repo import UserRepository
from app.schemas.user import UserOut, UserCreate
from app.services.auth_service import AuthService
from app.services.base_service import BaseService


class UserService(BaseService[UserRepository]):
    def __init__(self, db: AsyncSession, auth_service: AuthService):
        super().__init__(UserRepository(db), UserOut)
        self.auth_service = auth_service

    async def create(self, user_data: UserCreate) -> Optional[UserOut]:
        data = user_data.model_dump()
        if "password" in data and data["password"]:
            data["hashed_password"] = await self.auth_service.hash_password(user_data.password)
            del data["password"]
        return await super().create(data)

    async def get_by_username(self, username: str) -> Optional[UserOut]:
        record = await self.repository.get_by_username(username)
        if not record:
            return None
        return UserOut.model_validate(record)

    async def get_by_username_orm(self, username: str) -> Optional[UserOut]:
        record = await self.repository.get_by_username(username)
        return record

    async def authenticate_user(self, username: str, password: str):
        user = await self.repository.get_by_username(username)
        if not user or not self.auth_service.verify_password(password, user.hashed_password):
            return None
        return user

    async def create_user_token(self, user) -> Optional[str]:
        if not user:
            return None
        token_data = {"sub": user.username, "role": "user", "id": user.id}
        return await self.auth_service.create_access_token(token_data)