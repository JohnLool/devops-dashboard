from typing import Optional

from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.server import ServerOrm
from app.repositories.base_repo import BaseRepository
from app.utils.logger import logger


class ServerRepository(BaseRepository[ServerOrm]):
    def __init__(self, session: AsyncSession):
        super().__init__(ServerOrm, session)

    async def soft_delete_with_containers(self, server_id: int) -> Optional[ServerOrm]:
        try:
            options = [selectinload(ServerOrm.containers)]
            server = await self.get_by_id(server_id, options=options)
            if not server:
                return None

            logger.info(f"Soft deleting server {server_id} and its containers")
            for container in server.containers:
                container.deleted = True

            server.deleted = True

            await self.session.commit()
            await self.session.refresh(server)
            return server
        except SQLAlchemyError as e:
            logger.error(f"Error soft cascade-deleting server {server_id}: {e}")
            await self.session.rollback()
            raise