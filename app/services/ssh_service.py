import os
import tempfile

import asyncssh

from app.utils.logger import logger


class SSHService:
    @staticmethod
    async def execute_command(host: str, username, ssh_private_key: str, command: str) -> str:
        try:
            with tempfile.NamedTemporaryFile(mode='w', suffix='.key') as key_file:
                key_file.write(ssh_private_key.strip())
                key_file.flush()

                os.chmod(key_file.name, 0o600)

                async with asyncssh.connect(
                        host=host,
                        username=username,
                        client_keys=[key_file.name],
                        known_hosts=None,
                        preferred_auth=('publickey',)
                ) as conn:
                    result = await conn.run(command)
                    return result.stdout
        except Exception as e:
            logger.error(f"SSH connection error: {str(e)}")
            return f"Error: {str(e)}"

    @staticmethod
    async def get_containers(host: str, username: str, ssh_private_key: str) -> str:
        return await SSHService.execute_command(host, username, ssh_private_key, "docker ps -a --format '{{json .}}'")

    @staticmethod
    async def start_container(host: str, username: str, ssh_private_key: str, container_name: str) -> str:
        return await SSHService.execute_command(host, username, ssh_private_key, f"docker start {container_name}")

    @staticmethod
    async def stop_container(host: str, username: str, ssh_private_key: str, container_name: str) -> str:
        return await SSHService.execute_command(host, username, ssh_private_key, f"docker stop {container_name}")

    @staticmethod
    async def restart_container(host: str, username: str, ssh_private_key: str, container_name: str) -> str:
        return await SSHService.execute_command(host, username, ssh_private_key, f"docker restart {container_name}")
