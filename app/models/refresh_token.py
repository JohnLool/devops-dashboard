from __future__ import annotations

from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.core.database import Base


class RefreshTokenOrm(Base):
    __tablename__ = "refresh_tokens"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    token: Mapped[str] = mapped_column(String, unique=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    created_at: Mapped[datetime] = Column(DateTime(timezone=True), default=func.now())
    expires_at: Mapped[datetime] = Column(DateTime(timezone=True))
    deleted: Mapped[bool] = Column(Boolean, default=False)

    user: Mapped["UserOrm"] = relationship("UserOrm", back_populates="refresh_tokens")
