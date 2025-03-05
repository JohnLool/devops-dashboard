from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.server import ServerOrm
from app.repositories.base_repo import BaseRepository


class ServerRepository(BaseRepository[ServerOrm]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, ServerOrm)

    async def get_by_owner(self, owner_id: str) -> Optional[ServerOrm]:
        return await super().get_by_field('owner_id', owner_id)