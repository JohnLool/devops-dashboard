from typing import TypeVar, Generic, Type, Optional, List, Any, Sequence
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.abstract_repo import AbstractRepository
from app.utils.logger import logger
from app.exceptions import UniqueConstraintException


Model = TypeVar("Model")

class BaseRepository(AbstractRepository[Model], Generic[Model]):
    def __init__(self, model: Type[Model], session: AsyncSession, default_options: Sequence = ()):
        self.model = model
        self.session = session
        self.default_options = default_options

    def _apply_options(self, stmt, options: Optional[Sequence] = None):
        opts = options or self.default_options
        return stmt.options(*opts)

    async def create(self, data: dict) -> Optional[Model]:
        logger.info(f"Creating {self.model.__name__} with data: {data}")
        item = self.model(**data)
        try:
            self.session.add(item)
            await self.session.commit()
            await self.session.refresh(item)
            return item
        except IntegrityError as e:
            logger.error(f"IntegrityError creating {self.model.__name__}: {e}")
            await self.session.rollback()
            error_str = str(e.orig).lower() if e.orig else ""
            if "ix_users_email" in error_str:
                fields = {"email": data.get("email")}
                raise UniqueConstraintException(fields, f"User with email '{data.get('email')}' already exists.")
            elif "ix_users_username" in error_str:
                fields = {"username": data.get("username")}
                raise UniqueConstraintException(fields, f"User with username '{data.get('username')}' already exists.")
            else:
                raise UniqueConstraintException({}, "Unique constraint violation, please check the fields.")
        except SQLAlchemyError as e:
            logger.error(f"Error creating {self.model.__name__}: {e}")
            await self.session.rollback()
            raise

    async def get_by_field(self, field: str, value: Any, *filters, options: Optional[Sequence] = None) -> Optional[Model]:
        if not hasattr(self.model, field):
            raise ValueError(f"Field {field} not found in model")

        base_filters = [self.model.deleted.is_(False)]
        if filters:
            base_filters.extend(filters)

        stmt = select(self.model).where(getattr(self.model, field) == value)
        stmt = stmt.where(*base_filters)
        stmt = self._apply_options(stmt, options)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_all(self, *filters, options: Optional[Sequence] = None) -> List[Model]:
        base_filters = [self.model.deleted.is_(False)]
        if filters:
            base_filters.extend(filters)
        stmt = select(self.model).where(*base_filters).distinct()
        stmt = self._apply_options(stmt, options)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_by_id(self, item_id: int, *filters, options: Optional[Sequence] = None) -> Optional[Model]:
        base_filters = [self.model.id == item_id, self.model.deleted.is_(False)]
        if filters:
            base_filters.extend(filters)
        stmt = select(self.model).where(*base_filters)
        stmt = self._apply_options(stmt, options)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def update(self, item_id: int, item_data: dict) -> Optional[Model]:
        item = await self.get_by_id(item_id)
        if not item:
            return None
        logger.info(f"Updating {self.model.__name__} with id {item_id}")
        for key, value in item_data.items():
            setattr(item, key, value)
        try:
            await self.session.commit()
            await self.session.refresh(item)
            return item
        except IntegrityError as e:
            logger.error(f"IntegrityError updating {self.model.__name__} with id {item_id}: {e}")
            await self.session.rollback()
            error_str = str(e.orig).lower() if e.orig else ""
            if "ix_users_email" in error_str:
                fields = {"email": item_data.get("email")}
                raise UniqueConstraintException(fields, f"User with email '{item_data.get('email')}' already exists.")
            elif "ix_users_username" in error_str:
                fields = {"username": item_data.get("username")}
                raise UniqueConstraintException(fields, f"User with username '{item_data.get('username')}' already exists.")
            else:
                raise UniqueConstraintException({}, "Unique constraint violation, please check the fields.")
        except SQLAlchemyError as e:
            logger.error(f"Error updating {self.model.__name__} with id {item_id}: {e}")
            await self.session.rollback()
            raise

    async def delete(self, item_id: int) -> Optional[Model]:
        item = await self.get_by_id(item_id)
        if not item:
            return None

        logger.info(f"Deleting {self.model.__name__} with id {item_id}")

        try:
            item.deleted = True
            await self.session.commit()
            await self.session.refresh(item)
            return item
        except SQLAlchemyError as e:
            logger.error(f"Error deleting {self.model.__name__} with id {item_id}: {e}")
            await self.session.rollback()
            raise
