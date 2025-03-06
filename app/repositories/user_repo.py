from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List

from app.repositories.base_repo import BaseRepository
from app.models.user import UserOrm


class UserRepository(BaseRepository[UserOrm]):
    def __init__(self, session: AsyncSession):
        super().__init__(UserOrm, session)

    async def get_by_email(self, email: str, *filters, options=None) -> Optional[UserOrm]:
        return await super().get_by_field('email', email, *filters, options=options)

    async def get_by_username(self, username: str, *filters, options=None) -> Optional[UserOrm]:
        return await super().get_by_field('username', username, *filters, options=options)