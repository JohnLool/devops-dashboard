from typing import TypeVar, Generic, Type, Optional, List, Any
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError


Model = TypeVar("Model")


class BaseRepository(Generic[Model]):
    def __init__(self, model: Type[Model], session: AsyncSession):
        self.model = model
        self.session = session

    async def create(self, data: dict) -> Model:
        item = self.model(**data)
        try:
            self.session.add(item)
            await self.session.commit()
            await self.session.refresh(item)
        except SQLAlchemyError as e:
            await self.session.rollback()
            return None
        return item

    async def get_by_field(self, field: str, value: Any) -> Optional[Model]:
        if not hasattr(self.model, field):
            raise ValueError(f"Field {field} not found in model")

        stmt = select(self.model).where(getattr(self.model, field) == value)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_all(self, *filters) -> List[Model]:
        base_filters = [self.model.deleted.is_(False)]
        if filters:
            base_filters.extend(filters)

        stmt = select(self.model).where(*filters)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_by_id(self, item_id: int, *filters) -> Optional[Model]:
        base_filters = [self.model.id == item_id, self.model.deleted.is_(False)]
        if filters:
            base_filters.extend(filters)
        stmt = select(self.model).where(*base_filters)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def update(self, item_id: int, item_data: dict) -> Optional[Model]:
        item = await self.get_by_id(item_id)
        if not item:
            return None

        try:
            for key, value in item_data.items():
                setattr(item, key, value)
            await self.session.commit()
            await self.session.refresh(item)
            return item
        except SQLAlchemyError as e:
            await self.session.rollback()
            return None

    async def delete(self, item_id: int) -> Optional[Model]:
        item = await self.get_by_id(item_id)
        if not item:
            return None

        try:
            item.deleted = True
            await self.session.commit()
            return item
        except SQLAlchemyError as e:
            await self.session.rollback()
            return None
