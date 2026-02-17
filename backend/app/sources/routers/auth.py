from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from typing import Annotated
from pydantic import BaseModel
from sqlalchemy import text
from sqlmodel import Session
from pwdlib import PasswordHash

from .. import dependencies

router: APIRouter = APIRouter()

class Signup(BaseModel):
	username: str
	password: str
	email: str
	surname: str
	firstname: str

class Login(BaseModel):
	username: str
	password: str

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
async def login(session: dependencies.session, login: Login):
	try:
		query = text("SELECT * FROM users WHERE username = :username")
		result = session.execute(query, {"username": login.username})
		user = result.fetchone()
		if not dependencies.password_hash.verify(login.password, user.password):
			raise ValueError()
		return {"access_token": user.username, "token_type": "bearer"}
	except ValueError:
		raise HTTPException(status_code=401)
	except Exception:
		raise HTTPException(status_code=400)
