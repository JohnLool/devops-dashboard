from fastapi import APIRouter
from typing import List

from app.schemas.user import UserGet

router = APIRouter(prefix="/user", tags=["user"])


@router.get("/", response_model=List[UserGet])
async def get_user():
    pass