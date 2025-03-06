from pydantic import BaseModel, constr, ConfigDict
from datetime import datetime
from typing import Optional


class ContainerBase(BaseModel):
    name: constr(min_length=1, max_length=100, strip_whitespace=True)
    docker_id: constr(min_length=1, max_length=255, strip_whitespace=True)
    status: constr(min_length=1, max_length=50, strip_whitespace=True)
    image: constr(min_length=1, max_length=255, strip_whitespace=True)
    ports: Optional[constr(min_length=0, max_length=255, strip_whitespace=True)] = None
    is_active: bool = True


class ContainerCreate(ContainerBase):
    server_id: int


class ContainerUpdate(BaseModel):
    name: Optional[constr(min_length=1, max_length=100, strip_whitespace=True)] = None
    docker_id: Optional[constr(min_length=1, max_length=255, strip_whitespace=True)] = None
    status: Optional[constr(min_length=1, max_length=50, strip_whitespace=True)] = None
    image: Optional[constr(min_length=1, max_length=255, strip_whitespace=True)] = None
    ports: Optional[constr(min_length=0, max_length=255, strip_whitespace=True)] = None
    is_active: Optional[bool] = None


class ContainerOut(ContainerBase):
    id: int
    server_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    is_active: bool

    model_config = ConfigDict(from_attributes=True)
