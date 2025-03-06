from sqlalchemy.ext.asyncio import AsyncSession

from app.models.server import ServerOrm
from app.repositories.base_repo import BaseRepository


class ServerRepository(BaseRepository[ServerOrm]):
    def __init__(self, session: AsyncSession):
        super().__init__(ServerOrm, session)