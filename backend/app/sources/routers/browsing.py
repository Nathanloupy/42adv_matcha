import os
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, Query
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, Field
from sqlalchemy import text, TextClause
from sqlmodel import Session
from datetime import datetime
import jwt
import random
import base64
from geopy.distance import geodesic

from . import users as users_route
from .. import dependencies

router: APIRouter = APIRouter()

@router.get(
	"/browse",
    response_model_exclude={"password", "email"},
	tags=["browsing"]
)
async def browse(session: dependencies.session, user: dependencies.user):
	query: TextClause = text("""
		SELECT users.id, username, firstname, surname, age, gender, biography, gps, fame, last_connection, COUNT(users_tags.id) as common_tags_count FROM users
		LEFT JOIN users_tags ON users.id = users_tags.user_id
			AND users_tags.tag IN (
				SELECT tag FROM users_tags WHERE user_id = :current_user_id
			)
		LEFT JOIN users_likes ON users.id = users_likes.other_id
			AND users_likes.user_id = :current_user_id
		LEFT JOIN users_blocks ON users.id = users_blocks.other_id
			AND users_blocks.user_id = :current_user_id
		WHERE username != :username
		AND users_likes.id IS NULL
		AND users_blocks.id IS NULL
		AND completed == 1
		AND (gender = :gender1 OR gender = :gender2)
		GROUP BY users.id
		ORDER BY common_tags_count DESC, fame DESC
	""")
	params: dict = {"current_user_id": user.id, "username": user.username}

	try:
		if user.completed == 0:
			raise HTTPException(status_code=400, detail="user profile is not completed")
		user_gps = [float(item) for item in user.gps.split(",")]
		match user.sexual_preference:
			case 0:
				params["gender1"] = 0 if user.gender == 1 else 1
				params["gender2"] = 0 if user.gender == 1 else 1
			case 1:
				params["gender1"] = user.gender
				params["gender2"] = user.gender
			case 2:
				params["gender1"] = user.gender
				params["gender2"] = 0 if user.gender == 1 else 1
		result = session.execute(query, params)
		users = result.fetchall()
		if users is None:
			raise HTTPException(status_code=404)
		result = [dict(user._mapping) for user in users]
		all_images = session.exec(text("SELECT user_id, uuid FROM users_images")).all()
		images_by_users = {}
		for image in all_images:
			images_by_users.setdefault(image.user_id, []).append(image.uuid)
		for key, item in images_by_users.items():
			for index, i_uuid in enumerate(item):
				with open(users_route.UPLOAD_PATH + i_uuid + ".jpg", "rb") as file:
					images_by_users[key][index] = base64.b64encode(file.read()).decode()
		for item in result:
			item_coords = [float(item) for item in item["gps"].split(",")]
			item["gps"] = round(geodesic(user_gps, item_coords).kilometers, 2)
			item["images"] = images_by_users[item["id"]]
		result = random.sample(result, 10) if len(result) >= 10 else result
		result.sort(key=lambda x: x["gps"])
		return result
	except HTTPException:
		raise
	except Exception as exception:
		raise HTTPException(status_code=400)

@router.get("/search", tags=["browsing"])
async def search(
	session: dependencies.session,
	user: dependencies.user,
	age_min: int | None = None,
	age_max: int | None = None,
	fame_min: int | None = None,
	fame_max: int | None = None,
	location: str | None = None,
	tags: list[str] | None = Query(None),
):
	query: str = """
		SELECT * FROM users
		LEFT JOIN users_blocks ON users.id = users_blocks.other_id
			AND users_blocks.user_id = :current_user_id
		WHERE users.id != :id
		AND users_blocks.id IS NULL
		AND (gender = :gender1 OR gender = :gender2)
	"""
	query_tags: str = "SELECT tag FROM users_tags WHERE user_id = :user_id"
	result: None | object = None
	params: dict = {}

	try:
		if user.completed == 0:
			raise HTTPException(status_code=400, detail="user profile is not completed")
		params["id"] = user.id
		if age_min and age_max:
			query += " AND age >= :age_min AND age <= :age_max"
			params["age_min"] = age_min
			params["age_max"] = age_max
		if fame_min and fame_max:
			query += " AND fame >= :fame_min AND fame <= :fame_max"
			params["fame_min"] = fame_min
			params["fame_max"] = fame_max
		match user.sexual_preference:
			case 0:
				params["gender1"] = 0 if user.gender == 1 else 1
				params["gender2"] = 0 if user.gender == 1 else 1
			case 1:
				params["gender1"] = user.gender
				params["gender2"] = user.gender
			case 2:
				params["gender1"] = user.gender
				params["gender2"] = 0 if user.gender == 1 else 1
		result = session.execute(text(query), params)
		users = result.fetchall()
		if users is None:
			raise HTTPException(status_code=404)
		users: list = [dict(item._mapping) for item in users]
		if location:
			current_location = [float(item) for item in location.split(",")]
			for item in users:
				item_location = [float(x) for x in item["gps"].split(",")]
				item["distance"] = round(geodesic(current_location, item_location).kilometers, 2)
		if tags:
			filtered_users = []
			for item in users:
				result = session.execute(text(query_tags), {"user_id": item["id"]})
				user_tags = result.fetchall()
				if user_tags and sorted(tags) == sorted([tag[0] for tag in user_tags]):
					filtered_users.append(item)
			users = filtered_users
		result = session.execute(text(query_tags), {"user_id": user.id})
		me_tags = result.fetchall()
		for item in users:
			item["common_tags_count"] = 0
			result = session.execute(text(query_tags), {"user_id": item["id"]})
			other_tags = result.fetchall()
			if me_tags is None or other_tags is None:
				continue
			for i in me_tags:
				if i in other_tags:
					item["common_tags_count"] += 1
		all_images = session.exec(text("SELECT user_id, uuid FROM users_images")).all()
		images_by_users: dict = {}
		for image in all_images:
			images_by_users.setdefault(image.user_id, []).append(image.uuid)
		for key, item in images_by_users.items():
			for index, i_uuid in enumerate(item):
				with open(users_route.UPLOAD_PATH + i_uuid + ".jpg", "rb") as file:
					images_by_users[key][index] = base64.b64encode(file.read()).decode()
		for item in users:
			item["images"] = images_by_users[item["id"]]
			item.pop("password")
			item.pop("email")
		return users
	except HTTPException:
		raise
	except Exception as exception:
		raise HTTPException(status_code=400, detail=str(exception))
