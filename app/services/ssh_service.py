import os
import tempfile
import asyncssh
from typing import Optional, Dict
from app.utils.logger import logger


class SSHService:
    @staticmethod
    async def execute_command(host: str, username: str, ssh_private_key: str, command: str) -> str:
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
                    result = await conn.run(command, check=True)
                    return result.stdout.strip()
        except Exception as e:
            logger.error(f"SSH connection error: {str(e)}")
            return f"Error: {str(e)}"

    @staticmethod
    async def get_containers(host: str, username: str, ssh_private_key: str) -> str:
        # Returns each container as one JSON line.
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

    @staticmethod
    async def remove_container(host: str, username: str, ssh_private_key: str, container_name: str) -> str:
        # First stop (suppress error if already stopped), then remove.
        command = f"docker stop {container_name} || true; docker rm {container_name}"
        return await SSHService.execute_command(host, username, ssh_private_key, command)

    @staticmethod
    async def create_container(
            host: str,
            username: str,
            ssh_private_key: str,
            container_name: str,
            image: str,
            ports: Optional[str] = None,
            env: Optional[Dict[str, str]] = None,
            extra_args: Optional[str] = None
    ) -> str:
        """
        Creates a Docker container on a remote server using SSH.

        :param host: IP address or hostname of the server.
        :param username: SSH username.
        :param ssh_private_key: Private SSH key.
        :param container_name: Name of the container.
        :param image: Docker image to use.
        :param ports: (Optional) Port mappings in the format "80:80" or "80:80,443:443".
        :param env: (Optional) Dictionary of environment variables, e.g., {"ENV_VAR": "value"}.
        :param extra_args: (Optional) Additional arguments for the `docker run` command.
        :return: The output of the command (expected to be the container ID) or an error message.
        """
        command = f"docker run -d --name {container_name}"
        if ports:
            # Add port mappings (-p flag) for each mapping separated by commas.
            for port_mapping in ports.split(","):
                command += f" -p {port_mapping.strip()}"
        if env:
            # Add environment variables (-e flag) for each.
            for key, value in env.items():
                command += f" -e {key}={value}"
        if extra_args:
            command += f" {extra_args}"
        command += f" {image}"
        logger.info(f"Executing command: {command}")
        return await SSHService.execute_command(host, username, ssh_private_key, command)
