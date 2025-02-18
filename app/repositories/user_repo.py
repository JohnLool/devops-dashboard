from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.repositories.base_repo import BaseRepository
from app.models.user import UserOrm


class UserRepository(BaseRepository[UserOrm]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, UserOrm)

    async def get_by_email(self, email: str) -> Optional[UserOrm]:
        return await super().get_by_field('email', email)

    async def get_by_username(self, username: str) -> Optional[UserOrm]:
        return await super().get_by_field('username', username)
