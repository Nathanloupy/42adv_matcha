from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordBearer
from typing import Annotated
from pydantic import BaseModel
from sqlalchemy import text
from sqlmodel import Session

from ..database import get_database_session

router: APIRouter = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
token_dep = Annotated[str, Depends(oauth2_scheme)]
session_dep = Annotated[Session, Depends(get_database_session)]

class Signup(BaseModel):
	username: str
	password: str
	email: str
	surname: str
	firstname: str

@router.post("/signup/", tags=["auth"])
async def signup(session: session_dep, signup: Signup):
	query: object = text("""
		INSERT INTO users (username, password, email, surname, firstname) VALUES (
			:username,
			:password,
			:email,
			:surname,
			:firstname
		)
	""")
	session.execute(query, {
		"username": signup.username,
		"password": signup.username,
		"email": signup.username,
		"surname": signup.username,
		"firstname": signup.username
	})
	session.commit()
	return {"signup": signup}

@router.get("/login/", tags=["auth"])
async def login(session: session_dep):
	value: object = text("SELECT * FROM users")
	result = session.execute(value)
	users = result.fetchall()
	if not users:
		return {"error": "not found"}
	columns = result.keys()
	return [dict(zip(columns, user)) for user in users]
