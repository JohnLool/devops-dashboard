from pydantic import BaseModel, constr, ConfigDict
from datetime import datetime
from typing import Optional



class ServerBase(BaseModel):
    name: constr(min_length=5, max_length=16, strip_whitespace=True)
    description: constr(min_length=0, max_length=160, strip_whitespace=True) = None


class ServerCreate(ServerBase):
    host: str
    port: int
    ssh_user: str
    ssh_private_key: str


class ServerUpdate(ServerBase):
    name: constr(min_length=5, max_length=16, strip_whitespace=True) | None = None
    description: constr(min_length=0, max_length=160, strip_whitespace=True) | None = None
    host: str| None = None
    port: int | None = None
    ssh_user: str | None = None
    ssh_private_key: str | None = None


class ServerOut(ServerBase):
    id: int
    host: str
    port: int
    owner_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
