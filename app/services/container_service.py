import json
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional, Dict

from app.schemas.server import ServerOut
from app.utils.logger import logger
from app.models import ContainerOrm
from app.repositories.container_repo import ContainerRepository
from app.schemas.container import ContainerOut, ContainerCreate
from app.services.base_service import BaseService
from app.services.ssh_service import SSHService


class ContainerService(BaseService[ContainerRepository]):
    def __init__(self, db: AsyncSession, ssh_service: SSHService):
        super().__init__(ContainerRepository(db), ContainerOut)
        self.ssh_service = ssh_service

    async def create_with_server_id(self, server_id: int, container: ContainerCreate) -> ContainerOut:
        data = container.model_dump() if hasattr(container, "model_dump") else container
        data['server_id'] = server_id
        return await super().create(data)

    async def get_all_by_server(self, server_id: int) -> List[ContainerOut]:
        filters = [ContainerOrm.server_id == server_id]
        return await super().get_all(*filters)

    async def update_container_status(self, container_id: int, new_status: str) -> Optional[ContainerOut]:
        update_data = {"status": new_status}
        return await super().update(container_id, update_data)

    async def start_container(self, container: ContainerOut, server_host: str, ssh_private_key: str) -> str:
        return await self.ssh_service.start_container(server_host, ssh_private_key, container.name)

    async def update_container_records(self, server_id: int, docker_data: List[Dict]):
        existing = {c.docker_id: c for c in await self.get_all_by_server(server_id)}
        for container_data in docker_data:
            if container_data["docker_id"] in existing:
                await super().update(existing[container_data["docker_id"]].id, container_data)
            else:
                await self.create_with_server_id(server_id, container_data)

    async def sync_containers(self, server: ServerOut):
        try:
            output = await self.ssh_service.get_containers(server.host, server.ssh_user, server.ssh_private_key)
            containers_data = self.parse_docker_output(output)
            await self.update_container_records(server.id, containers_data)

        except Exception as e:
            logger.error(f"Sync failed for server {server.id}: {str(e)}")

    @staticmethod
    def parse_docker_output(output: str) -> List[Dict]:
        containers = []
        for line in output.splitlines():
            try:
                data = json.loads(line)
                containers.append({
                    "docker_id": data["ID"],
                    "name": data["Names"],
                    "status": data["State"].lower(),
                    "image": data["Image"],
                    "ports": data["Ports"],
                })
            except (json.JSONDecodeError, KeyError) as e:
                logger.error(f"Error parsing line: {line} - {str(e)}")
        return containers