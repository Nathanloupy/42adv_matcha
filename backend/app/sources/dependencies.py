from fastapi import Depends, Cookie, Request, HTTPException, WebSocket
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig

import os
import jwt
from typing import Annotated
from pydantic import BaseModel
from sqlalchemy import text, TextClause
from sqlmodel import Session
from pwdlib import PasswordHash
from datetime import datetime

from . import database

class User(BaseModel):
	id: int
	username: str
	password: str
	email: str
	firstname: str
	surname: str
	verified: bool
	age: int
	gender: None | bool
	sexual_preference: int
	biography: None | str
	gps: None | str
	fame: int
	last_connection: None | object
	completed: bool

jwt_secret: str = os.getenv("BACKEND_JWT_SECRET", "changeme")
jwt_algorithm: str = os.getenv("BACKEND_JWT_ALGORITHM", "HS256")
jwt_token_expire: int= int(os.getenv("BACKEND_JWT_TOKEN_EXPIRE", "10"))
oauth2_scheme: OAuth2PasswordBearer = OAuth2PasswordBearer(tokenUrl="signin")
password_hash: PasswordHash = PasswordHash.recommended()
session = Annotated[Session, Depends(database.get_database_session)]
oauth2_request_form = Annotated[OAuth2PasswordRequestForm, Depends()]
mail_config: ConnectionConfig = ConnectionConfig(
	MAIL_USERNAME=os.getenv("BACKEND_MAIL_USERNAME", "changeme@gmail.com"),
	MAIL_PASSWORD=os.getenv("BACKEND_MAIL_PASSWORD", "changeme"),
	MAIL_FROM=os.getenv("BACKEND_MAIL_FROM", "changeme@gmail.com"),
	MAIL_PORT=587,
	MAIL_SERVER="smtp.gmail.com",
	MAIL_STARTTLS=True,
	MAIL_SSL_TLS=False,
	USE_CREDENTIALS=True,
)
fast_mail: FastMail = FastMail(mail_config)
frontend_url: str = os.getenv("FONTEND_URL", "http://localhost:30001/")

def get_user(session: session, request: Request) -> None | User:
	token = request.cookies.get("access_token")
	query: TextClause				= text("SELECT * FROM users WHERE id = :user_id")
	query_connection: TextClause	= text("UPDATE users SET last_connection = :time WHERE username = :username")
	payload: dict | None			= None
	username: str | None			= None
	result: object | None			= None
	user: object | None				= None

	try:
		if token is None:
			raise HTTPException(status_code=401)
		payload = jwt.decode(token, jwt_secret, algorithms=[jwt_algorithm])
		user_id = payload.get("sub")
		if user_id is None:
			raise HTTPException(status_code=400, detail="a")
		result = session.execute(query, {"user_id": user_id})
		user = result.fetchone()
		if user is None:
			raise HTTPException(status_code=404)
		session.execute(query_connection, {"time": datetime.now(),"username": user.username})
		session.commit()
		return User(**user._mapping)
	except HTTPException:
		raise
	except jwt.PyJWTError:
		raise HTTPException(status_code=401)
	except Exception as e:
		raise HTTPException(status_code=400, detail=str(e))

user = Annotated[User, Depends(get_user)]

class ConnectionManager:
	def __init__(self):
		self.active_connections: dict[int, WebSocket] = {}

	async def connect(self, user_id: int, websocket: WebSocket):
		await websocket.accept()
		self.active_connections[user_id] = websocket

	def disconnect(self, user_id: int):
		self.active_connections.pop(user_id, None)

	async def send_to_user(self, user_id: int, message: str):
		websocket = self.active_connections.get(user_id)
		if websocket:
			await websocket.send_text(message)

ws_manager = ConnectionManager()
