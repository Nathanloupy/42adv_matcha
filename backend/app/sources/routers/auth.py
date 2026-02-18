from fastapi import APIRouter, Depends, HTTPException
from fastapi_mail import MessageSchema
import os
from typing import Annotated
from pydantic import BaseModel
from datetime import datetime, timedelta, timezone
from sqlalchemy import text, TextClause
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

async def send_email(email: str, subject: str, body: str):
	message = MessageSchema(
		recipients=[email],
		subject=subject,
		body=body,
		subtype="plain"
	)
	await dependencies.fast_mail.send_message(message)
	return {"message": "sent"}

@router.post("/signup", tags=["auth"])
async def signup(session: dependencies.session, signup: Signup):
	sha1_password: str = hashlib.sha1(signup.password.encode("utf-8")).hexdigest().upper()
	query: TextClause = text("INSERT INTO users (username, password, email, surname, firstname) VALUES (:username, :password, :email, :surname, :firstname)")

	try:
		response = requests.get(PWNEDPASSWORDS_URL + sha1_password[:5])
		if response.status_code != 200:
			raise Exception("pwnedpassword API seems unreachable")
		if sha1_password[5:] in response.text or len(signup.password) < 8:
			raise Exception("password is too weak")
		signup.password = dependencies.password_hash.hash(signup.password)
		session.execute(query, signup.model_dump())
		session.commit()
		token = generate_token({"sub": signup.email})
		await send_email(signup.email, "matcha email confirmation", f"http://localhost:8000/verify?token={token}")
	except IntegrityError as exception:
		session.rollback()
		raise HTTPException(status_code=400, detail="account already exist")
	except Exception as exception:
		session.rollback()
		raise HTTPException(status_code=400, detail=str(exception))


@router.post("/signin", tags=["auth"])
async def signin(session: dependencies.session, login: dependencies.oauth2_request_form):
	query: TextClause = text("SELECT * FROM users WHERE username = :username")

	try:
		result = session.execute(query, {"username": login.username})
		user = result.fetchone()
		if not dependencies.password_hash.verify(login.password, user.password):
			raise Exception("password is does not match")
		if user.verified is False:
			raise Exception("user does not have a verified email, check your mail box")
		token = generate_token({"sub": user.username})
		return Token(access_token=token, token_type="bearer")
	except Exception as exception:
		raise HTTPException(status_code=400, detail=str(exception))

@router.get("/verify", tags=["auth"])
async def verify(session: dependencies.session, token: str):
	query: TextClause = text("UPDATE users SET verified = 1 WHERE email = :email")

	try:
		payload = jwt.decode(token, dependencies.jwt_secret, algorithms=[dependencies.jwt_algorithm])
		email = payload.get("sub")
		if email is None:
			raise ValueError
		session.execute(query, {"email": email})
		session.commit()
	except Exception as exception:
		session.rollback()
		raise HTTPException(status_code=400, detail=str(exception))
	return {"message": token}
