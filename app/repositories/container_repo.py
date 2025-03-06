from sqlalchemy.ext.asyncio import AsyncSession

from app.models.container import ContainerOrm
from app.repositories.base_repo import BaseRepository


class ContainerRepository(BaseRepository[ContainerOrm]):
    def __init__(self, session: AsyncSession):
        super().__init__(ContainerOrm, session)