from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError
from app.models.server import ServerOrm
from app.repositories.base_repo import BaseRepository


class ServerRepository(BaseRepository[ServerOrm]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, ServerOrm)

    async def create(self, data: dict) -> Optional[ServerOrm]:
        try:
            return await super().create(data)
        except SQLAlchemyError as e:
            await self.session.rollback()
            return None

    async def update(self, item_id: int, item_data: dict) -> Optional[ServerOrm]:
        try:
            return await super().update(item_id, item_data)
        except SQLAlchemyError as e:
            await self.session.rollback()
            return None

    async def get_by_owner(self, owner_id: str) -> Optional[ServerOrm]:
        return await super().get_by_field('owner_id', owner_id)