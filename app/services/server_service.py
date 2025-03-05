from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.server_repo import ServerRepository
from app.schemas.server import ServerOut
from app.services.base_service import BaseService


class ServerService(BaseService[ServerRepository]):
    def __init__(self, db: AsyncSession):
        super().__init__(ServerRepository(db), ServerOut)