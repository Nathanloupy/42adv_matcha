from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

import os
from typing import Annotated
from sqlmodel import Session
from pwdlib import PasswordHash

from . import database

jwt_secret: str						= os.getenv("JWT_SECRET", "changeme")
jwt_algorithm: str					= os.getenv("JWT_ALGORITHM", "HS256")
jwt_token_expire: int				= int(os.getenv("JWT_TOKEN_EXPIRE", "10"))
oauth2_scheme: OAuth2PasswordBearer	= OAuth2PasswordBearer(tokenUrl="login")
password_hash: PasswordHash			= PasswordHash.recommended()
token								= Annotated[str, Depends(oauth2_scheme)]
session								= Annotated[Session, Depends(database.get_database_session)]
oauth2_request_form					= Annotated[OAuth2PasswordRequestForm, Depends()]
