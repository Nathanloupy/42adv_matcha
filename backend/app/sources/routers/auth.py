from fastapi import APIRouter, Depends, HTTPException
from typing import Annotated
from pydantic import BaseModel
from datetime import datetime, timedelta, timezone
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session
from pwdlib import PasswordHash
import jwt
from jwt.exceptions import InvalidTokenError
import hashlib
import requests

from .. import dependencies

PWNEDPASSWORDS_URL = "https://api.pwnedpasswords.com/range/"

router: APIRouter = APIRouter()

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
	expire: datetime = datetime.now(timezone.utc) + timedelta(minutes=dependencies.jwt_token_expire)
	to_encode.update({"exp": expire})
	return jwt.encode(to_encode, dependencies.jwt_secret, algorithm=dependencies.jwt_algorithm)

@router.post("/signup", tags=["auth"])
async def signup(session: dependencies.session, signup: Signup):
	sha1_password: str = hashlib.sha1(signup.password.encode("utf-8")).hexdigest().upper()

	try:
		response = requests.get(PWNEDPASSWORDS_URL + sha1_password[:5])
		if response.status_code != 200:
			raise Exception("error fetching pwnedpassword API")
		if sha1_password[5:] in response.text or len(signup.password) < 8:
			raise Exception("password is too weak")
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
	except IntegrityError as exception:
		session.rollback()
		raise HTTPException(status_code=400, detail="account already exist")
	except Exception as exception:
		session.rollback()
		raise HTTPException(status_code=400, detail=str(exception))

@router.post("/login", tags=["auth"])
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
