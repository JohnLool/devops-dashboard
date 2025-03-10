from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List


from app.models import ServerOrm
from app.repositories.server_repo import ServerRepository
from app.schemas.server import ServerOut, ServerCreate
from app.services.base_service import BaseService


class ServerService(BaseService[ServerRepository]):
    def __init__(self, db: AsyncSession):
        super().__init__(ServerRepository(db), ServerOut)

    async def create_with_owner(self, data: ServerCreate, owner_id: int) -> Optional[ServerOut]:
        data_dict = data.model_dump()
        data_dict["owner_id"] = owner_id
        return await super().create(data_dict)

    async def get_all_by_owner(self, owner_id: int) -> List[ServerOut]:
        filters = [ServerOrm.owner_id == owner_id]
        return await super().get_all(*filters)
