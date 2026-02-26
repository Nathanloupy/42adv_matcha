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
import io
from PIL import Image
import uuid

from .. import dependencies
from . import auth

router: APIRouter = APIRouter()

UPLOAD_PATH = "users_images/"
MAX_UPLOAD_SIZE = 10485760

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

TAGS = [
	"Adventure seeker",
	"Foodie",
	"Travel lover",
	"Dog person",
	"Gym lover",
	"Homebody",
	"Music addict",
	"Bookworm",
	"Hopeless romantic",
	"Night owl",
]

@router.get(
	"/users/me",
	response_model=dependencies.User,
	response_model_exclude={"password"},
	tags=["users"],
)
async def me(session: dependencies.session, user: dependencies.user):
	return user

@router.get(
		"/users/me/views_me",
		tags=["users"],
		)
async def views_me(session: dependencies.session, user: dependencies.user):
	query: str = """
		SELECT users.id, users.firstname, users_images.uuid FROM users
		LEFT JOIN users_views ON users.id = users_views.user_id
		LEFT JOIN users_images ON users.id = users_images.user_id
		WHERE users_views.other_id = :user_id
		GROUP BY users.id
	"""
	params: dict = {"user_id": user.id}
	query_result: None | object = None

	try:
		if user.completed == 0:
			raise HTTPException(status_code=400, detail="user profile is not completed")
		query_result = session.execute(text(query), params)
		result = query_result.fetchall()
		if result is None:
			raise HTTPException(status_code=404)
		result = [dict(x._mapping) for x in result]
		for index, item in enumerate(result):
			with open(UPLOAD_PATH + item["uuid"] + ".jpg", "rb") as file:
				result[index]["image"] = base64.b64encode(file.read()).decode()
		return result
	except HTTPException:
		raise
	except Exception as exception:
		raise HTTPException(status_code=400, detail=str(exception))

@router.get(
	"/users/me/me_likes",
	tags=["users"],
)
async def me_likes(session: dependencies.session, user: dependencies.user):
	query: str = """
		SELECT users.id, users.username, users.firstname, users_images.uuid FROM users
		LEFT JOIN users_likes ON users.id = users_likes.other_id
		LEFT JOIN users_images ON users.id = users_images.user_id
		WHERE users_likes.user_id = :user_id
		GROUP BY users.id
	"""
	params: dict = {"user_id": user.id}
	query_result: None | object = None

	try:
		if user.completed == 0:
			raise HTTPException(status_code=400, detail="user profile is not completed")
		query_result = session.execute(text(query), params)
		result = query_result.fetchall()
		if result is None:
			raise HTTPException(status_code=404)
		result = [dict(x._mapping) for x in result]
		for index, item in enumerate(result):
			with open(UPLOAD_PATH + item["uuid"] + ".jpg", "rb") as file:
				result[index]["image"] = base64.b64encode(file.read()).decode()
		return result
	except HTTPException:
		raise
	except Exception as exception:
		raise HTTPException(status_code=400, detail=str(exception))

@router.get(
	"/users/me/likes_me",
	tags=["users"],
)
async def likes_me(session: dependencies.session, user: dependencies.user):
	query: str = """
		SELECT users.id, users.firstname, users_images.uuid FROM users
		LEFT JOIN users_likes ON users.id = users_likes.user_id
		LEFT JOIN users_images ON users.id = users_images.user_id
		WHERE users_likes.other_id = :user_id
		GROUP BY users.id
	"""
	params: dict = {"user_id": user.id}
	query_result: None | object = None

	try:
		if user.completed == 0:
			raise HTTPException(status_code=400, detail="user profile is not completed")
		query_result = session.execute(text(query), params)
		result = query_result.fetchall()
		if result is None:
			raise HTTPException(status_code=404)
		result = [dict(x._mapping) for x in result]
		for index, item in enumerate(result):
			with open(UPLOAD_PATH + item["uuid"] + ".jpg", "rb") as file:
				result[index]["image"] = base64.b64encode(file.read()).decode()
		return result
	except HTTPException:
		raise
	except Exception as exception:
		raise HTTPException(status_code=400, detail=str(exception))

@router.get(
	"/users/me_connect",
	tags=["users"],
)
async def me_connected(session: dependencies.session, user: dependencies.user):
	query: str = """
		SELECT users.id, users.username, users_images.uuid FROM users
		LEFT JOIN users_connected ON users.id = users_connected.other_id
		LEFT JOIN users_images ON users.id = users_images.user_id
		WHERE users_connected.user_id = :user_id
	"""
	params: dict = {"user_id": user.id}
	query_result: None | object = None

	try:
		if user.completed == 0:
			raise HTTPException(status_code=400, detail="user profile is not completed")
		query_result = session.execute(text(query), params)
		result = query_result.fetchall()
		if result is None:
			raise HTTPException(status_code=404)
		result = [dict(x._mapping) for x in result]
		for index, item in enumerate(result):
			with open(UPLOAD_PATH + item["uuid"] + ".jpg", "rb") as file:
				result[index]["image"] = base64.b64encode(file.read()).decode()
		return result
	except HTTPException:
		raise
	except Exception as exception:
		raise HTTPException(status_code=400, detail=str(exception))

@router.post(
	"/users/report",
	tags=["users"],
)
async def report(session: dependencies.session, user: dependencies.user, id: int):
	try:
		if user.completed == 0:
			raise HTTPException(status_code=400, detail="user profile is not completed")
		await auth.send_email(os.getenv("BACKEND_MAIL_USERNAME", ""), f"{user.username} reported a user", f"{user.username} think this user id '{id}' need to be checked")
		return {"message": "ok"}
	except HTTPException:
		raise
	except Exception as exception:
		raise HTTPException(status_code=400, detail=str(exception))

@router.patch("/users/me", tags=["users"])
async def me_patch(
	session: dependencies.session,
	user: dependencies.user,
	update_profile: UpdateProfile,
):
	query_completed: TextClause = text(
		"SELECT gender, sexual_preference, biography, gps FROM users WHERE username = :username"
	)
	query_set_completed: TextClause = text(
		"UPDATE users FROM users WHERE username = :username"
	)
	query_get_images: TextClause = text(
		"SELECT * FROM users_images WHERE user_id = :user_id"
	)

	try:
		profile_dict: dict = dict(update_profile)
		for key, value in profile_dict.items():
			if value is None:
				continue
			elif key == "age" and update_profile.age is not None:
				if value < 3 or value > 100:
					raise HTTPException(status_code=400)
			elif key == "sexual_preference":
				if value not in [0, 1, 2]:
					raise HTTPException(status_code=400)
			new_query: TextClause = text(
				f"UPDATE users SET {key} = :{key} WHERE username = :username"
			)
			session.execute(new_query, {key: value, "username": user.username})
		result = session.execute(query_completed, {"username": user.username})
		user_completed = result.fetchone()
		if user_completed is None:
			raise HTTPException(status_code=404)
		is_completed: bool = True
		for item in user_completed:
			if item is None or item == "":
				is_completed = False
				break
		result = session.execute(query_get_images, {"user_id": user.id})
		user_image = result.fetchone()
		if user_image is None:
			is_completed = False
		if is_completed is True:
			new_query = text(
				f"UPDATE users SET completed = 1 WHERE username = :username"
			)
		else:
			new_query = text(
				f"UPDATE users SET completed = 0 WHERE username = :username"
			)
		session.execute(new_query, {"username": user.username})
		session.commit()
	except HTTPException:
		raise
	except Exception:
		session.rollback()
		raise HTTPException(status_code=400)
	return {"message": "ok"}

@router.get("/users/tags", tags=["users"])
async def tags(session: dependencies.session, user: dependencies.user):
	return TAGS

@router.get("/users/me/tags", tags=["users"])
async def me_tags(session: dependencies.session, user: dependencies.user):
	query: TextClause = text("SELECT * FROM users WHERE username = :username")
	query_tags: TextClause = text("SELECT * FROM users_tags WHERE user_id = :user_id")

	try:
		result = session.execute(query_tags, {"user_id": user.id})
		user_tags = result.fetchall()
		return [tag[2] for tag in user_tags]
	except HTTPException:
		raise
	except Exception:
		raise HTTPException(status_code=400)

@router.post("/users/me/tag", tags=["users"])
async def me_add_tag(session: dependencies.session, user: dependencies.user, tag: str):
	query_tag: TextClause = text(
		"INSERT INTO users_tags (user_id, tag) VALUES (:user_id, :tag)"
	)

	try:
		tag = tag.capitalize()
		if tag not in TAGS:
			raise HTTPException(status_code=404, detail="tag not valid")
		session.execute(query_tag, {"user_id": user.id, "tag": tag})
		session.commit()
	except HTTPException:
		raise
	except Exception:
		raise HTTPException(status_code=400)
	return {"message": "ok"}

@router.delete("/users/me/tag", tags=["users"])
async def me_delete_tag(
	session: dependencies.session, user: dependencies.user, tag: str
):
	query_tag: TextClause = text(
		"DELETE FROM users_tags WHERE user_id = :user_id AND tag = :tag"
	)

	try:
		session.execute(query_tag, {"user_id": user.id, "tag": tag.capitalize()})
		session.commit()
	except Exception:
		raise HTTPException(status_code=400)
	return {"message": "ok"}

@router.get("/users/me/images", tags=["users"])
async def me_get_image(session: dependencies.session, user: dependencies.user):
	query_get_images: TextClause = text(
		"SELECT * FROM users_images WHERE user_id = :user_id"
	)

	try:
		result = session.execute(query_get_images, {"user_id": user.id})
		images = result.fetchall()
		images_data: list[tuple[int, str]] = []
		for image in images:
			image_uuid: str = image[2]
			with open(UPLOAD_PATH + image_uuid + ".jpg", "rb") as file:
				images_data.append((image_uuid, base64.b64encode(file.read()).decode()))
		return {"message": images_data}
	except HTTPException:
		raise
	except Exception:
		raise HTTPException(status_code=400)

@router.post("/users/me/image", tags=["users"])
async def me_add_image(
	session: dependencies.session, user: dependencies.user, image: UploadFile
):
	query_count_image: TextClause = text(
		"SELECT COUNT(*) FROM users_images WHERE user_id = :user_id"
	)
	query_add_image: TextClause = text(
		"INSERT INTO users_images (user_id, uuid) VALUES (:user_id, :uuid)"
	)

	try:
		result = session.execute(query_count_image, {"user_id": user.id})
		count: int = 0
		count += result.fetchone()[0]
		image_bytes = await image.read()
		if count >= 5:
			raise HTTPException(status_code=403, detail="too much images uploaded")
		elif image.filename.split(".")[-1] != "jpg":
			raise HTTPException(status_code=400, detail="image format must ne jpg")
		elif len(image_bytes) > MAX_UPLOAD_SIZE:
			raise HTTPException(status_code=400, detail="image too big, max is 10 MB")
		Image.open(io.BytesIO(image_bytes))
		image_uuid: str = str(uuid.uuid4())
		path = f"{UPLOAD_PATH}{image_uuid}.jpg"
		async with aiofiles.open(path, "wb") as file:
			await file.write(image_bytes)
		session.execute(query_add_image, {"user_id": user.id, "uuid": image_uuid})
		if user.gender and user.biography and user.gps:
			session.execute(
				text(f"UPDATE users SET completed = 1 WHERE username = :username"),
				{"username": user.username},
			)
		session.commit()
	except HTTPException:
		raise
	except Exception:
		raise HTTPException(status_code=400)
	return {"message": "ok"}

@router.delete("/users/me/image", tags=["users"])
async def me_delete_image(
	session: dependencies.session, user: dependencies.user, image_uuid: str
):
	query_get_image: TextClause = text(
		"SELECT * FROM users_images WHERE user_id = :user_id AND uuid = :uuid"
	)
	query_delete_image: TextClause = text(
		"DELETE FROM users_images WHERE user_id = :user_id AND uuid = :uuid"
	)
	query_get_nb_image: TextClause = text(
		"SELECT COUNT(*) FROM users_images WHERE user_id = :user_id"
	)

	try:
		result = session.execute(
			query_get_image, {"user_id": user.id, "uuid": image_uuid}
		)
		image = result.fetchone()
		if image is None:
			raise HTTPException(status_code=404)
		session.execute(query_delete_image, {"user_id": user.id, "uuid": image_uuid})
		result = session.execute(query_get_nb_image, {"user_id": user.id})
		nb_images: int = result.fetchone()
		if nb_images is None or nb_images[0] == 0:
			session.execute(
				text(f"UPDATE users SET completed = 0 WHERE username = :username"),
				{"username": user.username},
			)
		session.commit()
		os.remove(UPLOAD_PATH + image[2] + ".jpg")
	except HTTPException:
		raise
	except Exception:
		raise HTTPException(status_code=400)
	return {"message": "ok"}
