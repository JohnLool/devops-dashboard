from typing import Optional

from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.refresh_token import RefreshTokenOrm
from app.repositories.base_repo import BaseRepository
from app.utils.logger import logger


class AuthTokenRepository(BaseRepository[RefreshTokenOrm]):
    def __init__(self, session: AsyncSession):
        super().__init__(RefreshTokenOrm, session)

    async def get_by_user_id(self, user_id: int, *filters, options=None) -> Optional[RefreshTokenOrm]:
        return await super().get_by_field('user_id', user_id, *filters, options=options)

    async def delete_by_user_id(self, user_id: int, *filters, options=None) -> None:
        token = await super().get_by_field('user_id', user_id, *filters, options=options)
        if token is None:
            return None

        try:
            token.deleted = True
            await self.session.commit()
            await self.session.refresh(token)
            return None
        except SQLAlchemyError as e:
            logger.error(f"Error deleting {self.model.__name__} with id {token.id}: {e}")
            await self.session.rollback()
            raise

    # Renews refresh token if there is a record for this user_id,
    # or inserts a new one if it is not.
    async def upsert_refresh_token(self, token_data: dict):
        try:
            stmt = insert(RefreshTokenOrm).values(**token_data)
            stmt = stmt.on_conflict_do_update(
                index_elements=["user_id"],
                set_={
                    "token": token_data["token"],
                    "expires_at": token_data["expires_at"],
                    "deleted": False
                }
            )
            await self.session.execute(stmt)
            await self.session.commit()
        except SQLAlchemyError as e:
            logger.error(f"Error updating/inserting {self.model.__name__}: {e}")
            await self.session.rollback()
            raise
