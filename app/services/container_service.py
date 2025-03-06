from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.container_repo import ContainerRepository
from app.schemas.container import ContainerOut
from app.services.base_service import BaseService


class ContainerService(BaseService[ContainerRepository]):
    def __init__(self, db: AsyncSession):
        super().__init__(ContainerRepository(db), ContainerOut)