from typing import Annotated
from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordBearer

router: APIRouter = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
token_dep = Annotated[str, Depends(oauth2_scheme)]

@router.get("/users/", tags=["users"])
async def read_users():
    return [{"username": "Rick"}, {"username": "Morty"}]
