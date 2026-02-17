from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

from typing import Annotated
from sqlmodel import Session
from pwdlib import PasswordHash

from . import database

oauth2_scheme: OAuth2PasswordBearer	= OAuth2PasswordBearer(tokenUrl="token")
password_hash: PasswordHash			= PasswordHash.recommended()
token								= Annotated[str, Depends(oauth2_scheme)]
session								= Annotated[Session, Depends(database.get_database_session)]
oauth2_request_form					= Annotated[OAuth2PasswordRequestForm, Depends()]
