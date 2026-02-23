import os
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, Field
from sqlalchemy import text, TextClause
from sqlmodel import Session
from datetime import datetime
import aiofiles
import base64
import jwt

from .. import dependencies

router: APIRouter = APIRouter()

class TokenData(BaseModel):
	username: str | None = None

class UpdateProfile(BaseModel):
	email: str | None = Field(default=None)
	firstname: str | None = Field(default=None)
	surname: str | None = Field(default=None)
	age: int | None = Field(default=None)
	gender: bool | None = Field(default=None)
	sexual_preference: int | None = Field(default=None)
	biography: str | None = Field(default=None)
	gps: str | None = Field(default=None)

TAGS = ["Adventure seeker", "Foodie", "Travel lover", "Dog person", "Gym lover", "Homebody", "Music addict", "Bookworm", "Hopeless romantic", "Night owl"]

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
	query_completed: TextClause = text("SELECT gender, sexual_preference, biography, gps FROM users WHERE username = :username")
	query_set_completed: TextClause = text("UPDATE users FROM users WHERE username = :username")

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
		profile_dict: dict = dict(update_profile)
		for key, value in profile_dict.items():
			if value is None:
				continue
			if key == "age" and update_profile.age is not None:
				if value < 3 or value > 100:
					raise HTTPException(status_code=400)
			elif key == "sexual_preference":
				if value not in [0, 1, 2]:
					raise HTTPException(status_code=400)
			new_query: TextClause = text(f"UPDATE users SET {key} = :{key} WHERE username = :username")
			session.execute(new_query, {key: value, "username": user.username})
		result = session.execute(query_completed, {"username": username})
		user_completed = result.fetchone()
		if user_completed is None:
			raise HTTPException(status_code=404)
		is_completed: bool = True
		for item in user_completed:
			if item is None or item == "":
				is_completed = False
				break
		if is_completed is True:
			new_query = text(f"UPDATE users SET completed = 1 WHERE username = :username")
		else:
			new_query = text(f"UPDATE users SET completed = 0 WHERE username = :username")
		session.execute(new_query, {"username": username})
		session.commit()
	except HTTPException:
		raise
	except Exception as exception:
		session.rollback()
		raise HTTPException(status_code=400, detail=str(exception))
	return {"message": "ok"}

@router.get("/users/tags", tags=["users"])
async def me_tags(session: dependencies.session, request: Request):
	return TAGS

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
		tag = tag.capitalize()
		if tag not in TAGS:
			raise HTTPException(status_code=404, detail="tag not valid")
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

@router.get("/users/me/images", tags=["users"])
async def me_get_image(session: dependencies.session, request: Request):
	query: TextClause = text("SELECT * FROM users WHERE username = :username")
	query_get_images: TextClause = text("SELECT * FROM users_images WHERE user_id = :user_id")

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
		result = session.execute(query_get_images, {"user_id": user.id})
		images = result.fetchall()
		images_data: list[tuple[int, str]] = []
		for image in images:
			path: str = image[2]
			with open(path, "rb") as file:
				images_data.append((int(image[0]), base64.b64encode(file.read()).decode()))
		return {"message": images_data}
	except HTTPException:
		raise
	except Exception as exception:
		raise HTTPException(status_code=400, detail=str(exception))

@router.post("/users/me/image", tags=["users"])
async def me_add_image(session: dependencies.session, request: Request, image: UploadFile):
	query: TextClause = text("SELECT * FROM users WHERE username = :username")
	query_count_image: TextClause = text("SELECT COUNT(*) FROM users_images WHERE user_id = :user_id")
	query_add_image: TextClause = text("INSERT INTO users_images (user_id, filename) VALUES (:user_id, :filename)")

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
		result = session.execute(query_count_image, {"user_id": user.id})
		count: int = 0
		count += result.fetchone()[0]
		if count >= 5:
			raise HTTPException(status_code=403, detail="too much images uploaded")
		elif image.filename.split(".")[-1] != "jpg":
			raise HTTPException(status_code=400, detail="image format must ne jpg")
		path = f"users_images/{user.id}-{count}.{image.filename.split(".")[-1]}"
		async with aiofiles.open(path, "wb") as file:
			await file.write(await image.read())
		session.execute(query_add_image, {"user_id": user.id, "filename": path})
		session.commit()
	except HTTPException:
		raise
	except Exception as exception:
		raise HTTPException(status_code=400, detail=str(exception))
	return {"message": "ok"}

@router.delete("/users/me/image", tags=["users"])
async def me_delete_image(session: dependencies.session, request: Request, id: int):
	query: TextClause = text("SELECT * FROM users WHERE username = :username")
	query_get_image: TextClause = text("SELECT * FROM users_images WHERE id = :id")
	query_delete_image: TextClause = text("DELETE FROM users_images WHERE id = :id")

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
		result = session.execute(query_get_image, {"id": id})
		image = result.fetchone()
		if image is None:
			raise HTTPException(status_code=404)
		image_path: str = image[2]
		session.execute(query_delete_image, {"user_id": user.id, "id": id})
		session.commit()
		os.remove(image_path)
	except HTTPException:
		raise
	except Exception as exception:
		raise HTTPException(status_code=400, detail=str(exception))
	return {"message": "ok"}
