from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app.models import ContainerOrm
from app.repositories.container_repo import ContainerRepository
from app.schemas.container import ContainerOut
from app.services.base_service import BaseService
from app.services.ssh_service import SSHService


class ContainerService(BaseService[ContainerRepository]):
    def __init__(self, db: AsyncSession, ssh_service: SSHService):
        super().__init__(ContainerRepository(db), ContainerOut)
        self.ssh_service = ssh_service

    async def get_all_by_server(self, server_id: int) -> List[ContainerOut]:
        filters = [ContainerOrm.server_id == server_id]
        return await super().get_all(*filters)

    async def update_container_status(self, container_id: int, new_status: str) -> Optional[ContainerOut]:
        update_data = {"status": new_status}
        return await super().update(container_id, update_data)

    @staticmethod
    async def start_container(self, container: ContainerOut, server_host: str, ssh_private_key: str) -> str:
        return await self.ssh_service.start_container(server_host, ssh_private_key, container.name)