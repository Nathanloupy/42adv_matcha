from fastapi import APIRouter, Depends, HTTPException
from typing import Annotated
from pydantic import BaseModel
from datetime import datetime, timedelta, timezone
from sqlalchemy import text
from sqlmodel import Session
from pwdlib import PasswordHash
import jwt
from jwt.exceptions import InvalidTokenError

from .. import dependencies

router: APIRouter = APIRouter()

# Todo: change secret key
SECRET_KEY = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
TOKEN_EXPIRE_MINUTES = 60
ALGORITHM = "HS256"

class Token(BaseModel):
	access_token: str
	token_type: str

class Signup(BaseModel):
	username: str
	password: str
	email: str
	surname: str
	firstname: str

def generate_token(data: dict) -> str:
	to_encode: dict = data
	expire: datetime = datetime.now(timezone.utc) + timedelta(minutes=TOKEN_EXPIRE_MINUTES)
	to_encode.update({"exp": expire})
	return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

@router.post("/signup/", tags=["auth"])
async def signup(session: dependencies.session, signup: Signup):
	try:
		query = text("""
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
			"password": dependencies.password_hash.hash(signup.password),
			"email": signup.email,
			"surname": signup.surname,
			"firstname": signup.firstname
		})
		session.commit()
	except Exception:
		session.rollback()
		raise HTTPException(status_code=400)

@router.post("/login/", tags=["auth"])
async def login(session: dependencies.session, login: dependencies.oauth2_request_form):
	try:
		query = text("SELECT * FROM users WHERE username = :username")
		result = session.execute(query, {"username": login.username})
		user = result.fetchone()
		if not dependencies.password_hash.verify(login.password, user.password):
			raise ValueError()
		token = generate_token({"sub": user.username})
		return Token(access_token=token, token_type="bearer")
	except ValueError:
		raise HTTPException(status_code=401)
	except Exception:
		raise HTTPException(status_code=400)
