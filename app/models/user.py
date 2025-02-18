from __future__ import annotations

from app.core.database import Base
from sqlalchemy import String, Boolean, Integer, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime


class UserOrm(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String, index=True, unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_superuser: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime | None] = mapped_column(onupdate=func.now())
    deleted: Mapped[bool] = mapped_column(Boolean, default=False)

    servers: Mapped[list["ServerOrm"]] = relationship("ServerOrm", back_populates="owner")