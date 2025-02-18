from pydantic import BaseModel, constr

from app.schemas.server import ServerGet


class UserBase(BaseModel):
    username: constr(min_length=5, max_length=16, strip_whitespace=True)
    email: str


class UserCreate(UserBase):
    password: constr(min_length=5, max_length=16)


class UserGet(UserBase):
    id: int
    server: ServerGet


class UserUpdate(UserBase):
    username: constr(min_length=5, max_length=16, strip_whitespace=True) | None = None
    email: str | None = None
    password: constr(min_length=5, max_length=16) | None = None