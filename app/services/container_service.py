import json
import redis.asyncio as redis
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict
from app.schemas.server import ServerOut
from app.utils.logger import logger
from app.models import ContainerOrm
from app.repositories.container_repo import ContainerRepository
from app.schemas.container import ContainerOut, ContainerCreate, ContainerUpdate
from app.services.base_service import BaseService
from app.services.ssh_service import SSHService


class ContainerService(BaseService[ContainerRepository]):
    def __init__(self, db: AsyncSession, ssh_service: SSHService, redis_client: redis.Redis):
        super().__init__(ContainerRepository(db), ContainerOut)
        self.ssh_service = ssh_service
        self.redis = redis_client

    async def invalidate_cache(self, server: ServerOut):
        await self.sync_containers(server)
        cache_key = f"containers:{server.id}"
        await self.redis.delete(cache_key)
        logger.info("SYNC COMPLETE AND CACHE INVALIDATED")

    async def create_with_server(self, server: ServerOut, container: ContainerCreate) -> ContainerOut:
        docker_output = await self.ssh_service.create_container(
            server.host,
            server.ssh_user,
            server.ssh_private_key,
            container.name,
            container.image,
            container.ports,
            container.env,
            container.extra_args
        )
        docker_id = docker_output.strip()
        if not docker_id or docker_id.startswith("Error:"):
            raise Exception(f"Failed to create container on remote server: {docker_output}")

        data = container.model_dump()
        data['server_id'] = server.id
        data['docker_id'] = docker_id[:12]
        data['status'] = "running"
        data.pop("env", None)
        data.pop("extra_args", None)

        try:
            record = await super().create(data)
        except Exception as db_err:
            await self.ssh_service.remove_container(server.host, server.ssh_user, server.ssh_private_key,
                                                    container.name)
            raise Exception(f"DB error: {str(db_err)}. The container on the remote server has been removed.")

        await self.invalidate_cache(server)
        return record

    async def get_all_by_server(self, server_id: int) -> List[ContainerOut]:
        cache_key = f"containers:{server_id}"
        cached_data = await self.redis.get(cache_key)

        if cached_data:
            logger.info("RETURNED CACHED DATA")
            return [ContainerOut.model_validate(c) for c in json.loads(cached_data)]

        filters = [ContainerOrm.server_id == server_id]
        containers = await super().get_all(*filters)

        await self.redis.set(cache_key, json.dumps([c.model_dump() for c in containers], default=str), ex=300)
        logger.info("NEW CACHE ADDED")
        return containers

    async def start_container(self, container: ContainerOut, server: ServerOut) -> str:
        result = await self.ssh_service.start_container(server.host, server.ssh_user, server.ssh_private_key,
                                                        container.name)
        await self.invalidate_cache(server)
        return result

    async def restart_container(self, container: ContainerOut, server: ServerOut) -> str:
        result = await self.ssh_service.restart_container(server.host, server.ssh_user, server.ssh_private_key,
                                                          container.name)
        await self.invalidate_cache(server)
        return result

    async def stop_container(self, container: ContainerOut, server: ServerOut) -> str:
        result = await self.ssh_service.stop_container(server.host, server.ssh_user, server.ssh_private_key,
                                                       container.name)
        await self.invalidate_cache(server)
        return result

    async def remove_container(self, container: ContainerOut, server: ServerOut) -> ContainerOut:
        result = await self.ssh_service.remove_container(server.host, server.ssh_user, server.ssh_private_key,
                                                         container.name)
        if "Error" in result:
            raise Exception(f"Failed to remove container: {result}")

        deleted_container = await super().delete(container.id)
        await self.invalidate_cache(server)
        return deleted_container

    async def update_container_active_status(self, container: ContainerOut, server: ServerOut,
                                             container_data: ContainerUpdate) -> ContainerOut:
        updated_container = await super().update(container.id, container_data)
        await self.invalidate_cache(server)
        return updated_container

    async def create_record_from_docker_data(self, server: ServerOut, docker_data: Dict) -> None:
        data = {
            "name": docker_data.get("Names"),
            "docker_id": docker_data.get("ID")[:12] if docker_data.get("ID") else None,
            "status": docker_data.get("State").lower() if docker_data.get("State") else None,
            "image": docker_data.get("Image"),
            "ports": docker_data.get("Ports"),
            "is_active": True,
            "server_id": server.id
        }
        await super().create(data)

    async def update_container_records(self, server: ServerOut, docker_data: List[Dict]) -> None:
        existing = {c.docker_id: c for c in await self.get_all_by_server(server.id)}
        for container_data in docker_data:
            docker_id = container_data.get("ID")
            if not docker_id:
                continue
            docker_id_short = docker_id[:12]
            if docker_id_short in existing:
                await super().update(existing[docker_id_short].id, {
                    "status": container_data.get("State", "").lower(),
                    "ports": container_data.get("Ports"),
                    "image": container_data.get("Image")
                })
            else:
                await self.create_record_from_docker_data(server, container_data)

    async def sync_containers(self, server: ServerOut) -> None:
        try:
            output = await self.ssh_service.get_containers(server.host, server.ssh_user, server.ssh_private_key)
            containers_data = self.parse_docker_output(output)
            await self.update_container_records(server, containers_data)
        except Exception as e:
            logger.error(f"Sync failed for server {server.id}: {str(e)}")

    @staticmethod
    def parse_docker_output(output: str) -> List[Dict]:
        containers = []
        for line in output.splitlines():
            try:
                data = json.loads(line)
                containers.append(data)
            except (json.JSONDecodeError, KeyError) as e:
                logger.error(f"Error parsing line: {line} - {str(e)}")
        return containers
