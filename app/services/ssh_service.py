import asyncssh


class SSHService:
    @staticmethod
    async def execute_command(host: str, ssh_private_key: str, command: str) -> str:
        try:
            async with asyncssh.connect(host, client_keys=[ssh_private_key]) as conn:
                result = await conn.run(command, check=True)
                return result.stdout
        except Exception as e:
            return f"Error: {e}"

    @staticmethod
    async def get_containers(host: str, ssh_private_key: str) -> str:
        return await SSHService.execute_command(host, ssh_private_key, "docker ps --format '{{.Names}} {{.Status}}'")

    @staticmethod
    async def start_container(host: str, ssh_private_key: str, container_name: str) -> str:
        return await SSHService.execute_command(host, ssh_private_key, f"docker start {container_name}")

    @staticmethod
    async def stop_container(host: str, ssh_private_key: str, container_name: str) -> str:
        return await SSHService.execute_command(host, ssh_private_key, f"docker stop {container_name}")

    @staticmethod
    async def restart_container(host: str, ssh_private_key: str, container_name: str) -> str:
        return await SSHService.execute_command(host, ssh_private_key, f"docker restart {container_name}")
