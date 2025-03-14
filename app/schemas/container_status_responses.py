from pydantic import BaseModel


class ContainerResponse(BaseModel):
    container_id: int
    status: str
    message: str


class ContainerResponses:
    @staticmethod
    def starting(container_id: int) -> ContainerResponse:
        return ContainerResponse(
            container_id=container_id,
            status="starting",
            message="Container is starting. Please check the status later."
        )

    @staticmethod
    def stopping(container_id: int) -> ContainerResponse:
        return ContainerResponse(
            container_id=container_id,
            status="stopping",
            message="Container is stopping. Please check the status later."
        )

    @staticmethod
    def restarting(container_id: int) -> ContainerResponse:
        return ContainerResponse(
            container_id=container_id,
            status="restarting",
            message="Container is restarting. Please check the status later."
        )

    @staticmethod
    def creating(container_id: int) -> ContainerResponse:
        return ContainerResponse(
            container_id=container_id,
            status="creating",
            message="Container is creating. Please check the status later."
        )

    @staticmethod
    def recreating(container_id: int) -> ContainerResponse:
        return ContainerResponse(
            container_id=container_id,
            status="recreating",
            message="Container is recreating. Please check the status later."
        )

    @staticmethod
    def deleting(container_id: int) -> ContainerResponse:
        return ContainerResponse(
            container_id=container_id,
            status="deleting",
            message="Container is deleting. Please check the status later."
        )