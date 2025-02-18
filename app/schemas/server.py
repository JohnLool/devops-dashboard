from pydantic import BaseModel, constr
from datetime import datetime
from typing import Optional

from app.schemas.user import UserGet


class ServerBase(BaseModel):
    name: constr(min_length=5, max_length=16, strip_whitespace=True)


class ServerCreate(ServerBase):
    host: str
    port: int
    ssh_user: str
    ssh_private_key: str


class ServerUpdate(ServerBase):
    name: constr(min_length=5, max_length=16, strip_whitespace=True) | None = None
    host: str| None = None
    port: int | None = None
    ssh_user: str | None = None
    ssh_private_key: str | None = None


class ServerGet(ServerBase):
    id: int
    user: UserGet
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

