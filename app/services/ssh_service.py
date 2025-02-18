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
