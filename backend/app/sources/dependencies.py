from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig

import os
from typing import Annotated
from sqlmodel import Session
from pwdlib import PasswordHash

from . import database

jwt_secret: str						= os.getenv("BACKEND_JWT_SECRET", "changeme")
jwt_algorithm: str					= os.getenv("BACKEND_JWT_ALGORITHM", "HS256")
jwt_token_expire: int				= int(os.getenv("BACKEND_JWT_TOKEN_EXPIRE", "10"))
oauth2_scheme: OAuth2PasswordBearer	= OAuth2PasswordBearer(tokenUrl="signin")
password_hash: PasswordHash			= PasswordHash.recommended()
token								= Annotated[str, Depends(oauth2_scheme)]
session								= Annotated[Session, Depends(database.get_database_session)]
oauth2_request_form					= Annotated[OAuth2PasswordRequestForm, Depends()]
mail_config: ConnectionConfig		= ConnectionConfig(
	MAIL_USERNAME=os.getenv("BACKEND_MAIL_USERNAME", "changeme@gmail.com"),
	MAIL_PASSWORD=os.getenv("BACKEND_MAIL_PASSWORD", "changeme"),
	MAIL_FROM=os.getenv("BACKEND_MAIL_FROM", "changeme@gmail.com"),
	MAIL_PORT=587,
	MAIL_SERVER="smtp.gmail.com",
	MAIL_STARTTLS=True,
	MAIL_SSL_TLS=False,
	USE_CREDENTIALS=True,
)
fast_mail: FastMail					= FastMail(mail_config)
frontend_url: str = os.getenv("FONTEND_URL", "http://localhost:30001/")
