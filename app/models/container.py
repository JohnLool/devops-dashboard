from __future__ import annotations

from datetime import datetime
from sqlalchemy import String, Integer, ForeignKey, Boolean, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.core.database import Base


class ContainerOrm(Base):
    __tablename__ = "containers"
    __table_args__ = (
        Index("uq_server_container_name", "server_id", "name", unique=True, postgresql_where="deleted = false"),
        Index("uq_server_docker", "server_id", "docker_id", unique=True, postgresql_where="deleted = false"),
    )
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    docker_id: Mapped[str] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(String(50), nullable=True)  # running, stopped, etc...
    image: Mapped[str] = mapped_column(String(255), nullable=False)
    ports: Mapped[str | None] = mapped_column(String(255))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    server_id: Mapped[int] = mapped_column(ForeignKey("servers.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime | None] = mapped_column(onupdate=func.now())
    deleted: Mapped[bool] = mapped_column(Boolean, default=False)

    server: Mapped["ServerOrm"] = relationship("ServerOrm", back_populates="containers")
