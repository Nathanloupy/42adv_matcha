from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from sqlalchemy import text, TextClause
from sqlmodel import Session
import jwt

from .. import dependencies

router: APIRouter = APIRouter()

class TokenData(BaseModel):
	username: str | None = None

class UpdateProfile(BaseModel):
	email: str
	firstname: str
	surname: str
	age: int
	gender: bool
	sexual_preference: int
	biography: str
	gps: str

@router.get("/users/me", tags=["users"])
async def me(session: dependencies.session, request: Request):
	query: TextClause = text("SELECT * FROM users WHERE username = :username")

	token = request.cookies.get("access_token")
	if token is None:
		raise HTTPException(status_code=401)
	try:
		payload = jwt.decode(token, dependencies.jwt_secret, algorithms=[dependencies.jwt_algorithm])
		username = payload.get("sub")
		if username is None:
			raise HTTPException(status_code=404)
		result = session.execute(query, {"username": username})
		user = result.fetchone()
		if user is None:
			raise HTTPException(status_code=404)
		user = dict(user._mapping)
		user.pop("password", None)
		return user
	except HTTPException:
		raise
	except Exception as exception:
		raise HTTPException(status_code=400)

@router.patch("/users/me", tags=["users"])
async def me_patch(session: dependencies.session, request: Request, update_profile: UpdateProfile):
	query: TextClause = text("SELECT * FROM users WHERE username = :username")
	query_tag: TextClause = text("UPDATE users SET email = :email, age = :age, firstname = :firstname, surname = :surname, gender = :gender, sexual_preference = :sexual_preference, biography = :biography, gps = :gps WHERE username = :username")

	token = request.cookies.get("access_token")
	if token is None:
		raise HTTPException(status_code=401)
	try:
		payload = jwt.decode(token, dependencies.jwt_secret, algorithms=[dependencies.jwt_algorithm])
		username = payload.get("sub")
		if username is None:
			raise HTTPException(status_code=404)
		result = session.execute(query, {"username": username})
		user = result.fetchone()
		if user is None:
			raise HTTPException(status_code=404)
		if update_profile.age < 3 or update_profile.age > 100:
			raise HTTPException(status_code=400)
		if update_profile.sexual_preference not in [0, 1, 2]:
			raise HTTPException(status_code=400)
		session.execute(query_tag, {
			"email": update_profile.email,
			"firstname": update_profile.firstname,
			"age": update_profile.age,
			"surname": update_profile.surname,
			"gender": update_profile.gender,
			"sexual_preference": update_profile.sexual_preference,
			"biography": update_profile.biography,
			"gps": update_profile.gps,
			"username": user.username
		})
		session.commit()
	except HTTPException:
		raise
	except Exception as exception:
		session.rollback()
		raise HTTPException(status_code=400, detail=str(exception))
	return {"message": "ok"}

@router.get("/users/me/tags", tags=["users"])
async def me_tags(session: dependencies.session, request: Request):
	query: TextClause = text("SELECT * FROM users WHERE username = :username")
	query_tags: TextClause = text("SELECT * FROM users_tags WHERE user_id = :user_id")

	token = request.cookies.get("access_token")
	if token is None:
		raise HTTPException(status_code=401)
	try:
		payload = jwt.decode(token, dependencies.jwt_secret, algorithms=[dependencies.jwt_algorithm])
		username = payload.get("sub")
		if username is None:
			raise HTTPException(status_code=404)
		result = session.execute(query, {"username": username})
		user = result.fetchone()
		if user is None:
			raise HTTPException(status_code=404)
		result = session.execute(query_tags, {"user_id": user.id})
		user_tags = result.fetchall()
		return [tag[2] for tag in user_tags]
	except HTTPException:
		raise
	except Exception as exception:
		raise HTTPException(status_code=400)


@router.post("/users/me/tag", tags=["users"])
async def me_add_tag(session: dependencies.session, request: Request, tag: str):
	query: TextClause = text("SELECT * FROM users WHERE username = :username")
	query_tag: TextClause = text("INSERT INTO users_tags (user_id, tag) VALUES (:user_id, :tag)")

	token = request.cookies.get("access_token")
	if token is None:
		raise HTTPException(status_code=401)
	try:
		payload = jwt.decode(token, dependencies.jwt_secret, algorithms=[dependencies.jwt_algorithm])
		username = payload.get("sub")
		if username is None:
			raise HTTPException(status_code=404)
		result = session.execute(query, {"username": username})
		user = result.fetchone()
		if user is None:
			raise HTTPException(status_code=404)
		session.execute(query_tag, {"user_id": user.id, "tag": tag})
		session.commit()
	except HTTPException:
		raise
	except Exception as exception:
		raise HTTPException(status_code=400)
	return {"message": "ok"}

@router.delete("/users/me/tag", tags=["users"])
async def me_delete_tag(session: dependencies.session, request: Request, tag: str):
	query: TextClause = text("SELECT * FROM users WHERE username = :username")
	query_tag: TextClause = text("DELETE FROM users_tags WHERE user_id = :user_id AND tag = :tag")

	token = request.cookies.get("access_token")
	if token is None:
		raise HTTPException(status_code=401)
	try:
		payload = jwt.decode(token, dependencies.jwt_secret, algorithms=[dependencies.jwt_algorithm])
		username = payload.get("sub")
		if username is None:
			raise HTTPException(status_code=404)
		result = session.execute(query, {"username": username})
		user = result.fetchone()
		if user is None:
			raise HTTPException(status_code=404)
		session.execute(query_tag, {"user_id": user.id, "tag": tag})
		session.commit()
	except HTTPException:
		raise
	except Exception as exception:
		raise HTTPException(status_code=400)
	return {"message": "ok"}
