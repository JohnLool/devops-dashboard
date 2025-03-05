from fastapi import APIRouter
from typing import List

from app.schemas.user import UserOut

router = APIRouter(prefix="/user", tags=["user"])


@router.get("/", response_model=List[UserOut])
async def get_user():
    pass