from datetime import datetime
from typing import Optional
from pydantic import BaseModel, constr, ConfigDict


class UserBase(BaseModel):
    username: constr(min_length=5, max_length=16, strip_whitespace=True)
    email: str


class UserCreate(UserBase):
    password: constr(min_length=5, max_length=16)


class UserOut(UserBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class UserUpdate(UserBase):
    username: constr(min_length=5, max_length=16, strip_whitespace=True) | None = None
    email: str | None = None
    password: constr(min_length=5, max_length=16) | None = None