from pydantic import BaseModel, constr, ConfigDict
from datetime import datetime
from typing import Optional, Dict


class ContainerBase(BaseModel):
    name: constr(min_length=1, max_length=100, strip_whitespace=True)
    image: constr(min_length=1, max_length=255, strip_whitespace=True)
    ports: Optional[constr(min_length=0, max_length=255, strip_whitespace=True)] = None


class ContainerCreate(ContainerBase):
    env: Optional[Dict[str, str]] = None
    extra_args: Optional[str] = None


class ContainerUpdate(BaseModel):
    name: Optional[constr(min_length=1, max_length=100, strip_whitespace=True)] = None
    image: Optional[constr(min_length=1, max_length=255, strip_whitespace=True)] = None
    ports: Optional[constr(min_length=0, max_length=255, strip_whitespace=True)] = None
    env: Optional[Dict[str, str]] = None
    extra_args: Optional[str] = None
    is_active: Optional[bool] = None


class ContainerOut(ContainerBase):
    id: int
    docker_id: Optional[str] = None
    status: Optional[str] = None
    server_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    is_active: bool

    model_config = ConfigDict(from_attributes=True)
