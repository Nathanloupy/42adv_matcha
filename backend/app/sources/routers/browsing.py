import os
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, Field
from sqlalchemy import text, TextClause
from sqlmodel import Session
from datetime import datetime
import jwt
import random
from geopy.distance import geodesic

from .. import dependencies

router: APIRouter = APIRouter()

@router.get("/browse", tags=["browsing"])
async def browse(session: dependencies.session, request: Request):
	user_query: TextClause = text("SELECT * FROM users WHERE username = :username")
	query: TextClause = text("""
		SELECT users.id, username, firstname, surname, age, gender, biography, gps, fame, last_connection, COUNT(users_tags.id) as tag_count FROM users
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
		AND (gender == :gender OR gender == :gender2)
		GROUP BY users.id
		ORDER BY tag_count DESC, fame DESC
	""")

	token = request.cookies.get("access_token")
	if token is None:
		raise HTTPException(status_code=401)
	try:
		payload = jwt.decode(token, dependencies.jwt_secret, algorithms=[dependencies.jwt_algorithm])
		username = payload.get("sub")
		if username is None:
			raise HTTPException(status_code=400)
		result = session.execute(user_query, {"username": username})
		user = result.fetchone()
		if user is None:
			raise HTTPException(status_code=404)
		if user.completed == 0:
			raise HTTPException(status_code=400, detail="user profile is not completed")
		user_gps: tuple[float, float] = [float(item) for item in user.gps.split(",")]
		oposite_gender: int = 0 if user.gender == 1 else 1
		genders: list = [oposite_gender, oposite_gender]
		if user.sexual_preference == 2:
			genders[1] = user.gender
		result = session.execute(query, {
			"current_user_id": user.id,
			"username": user.username,
			"gender": genders[0],
			"gender2": genders[1]
		})
		users = result.fetchall()
		if users is None:
			raise HTTPException(status_code=404)
		result = [dict(user._mapping) for user in users]
		for item in result:
			item_coords: tuple[float, float] = [float(item) for item in item["gps"].split(",")]
			item["gps"] = round(geodesic(user_gps, item_coords).kilometers, 2)
		result = random.sample(result, 10) if len(result) >= 10 else result
		result.sort(key=lambda x: x["gps"])
		return result
	except HTTPException:
		raise
	except Exception as exception:
		raise HTTPException(status_code=400, detail=str(exception))

class SearchRequest(BaseModel):
	age_range: tuple[int,int]
	fame_range: tuple[int,int]
	tags: list[str]
	location: str

@router.get("/search", tags=["browsing"])
async def search(session: dependencies.session, request: Request, search_payload: SearchRequest):
	user_query: TextClause = text("SELECT * FROM users WHERE username = :username")
	query: TextClause = text("""
		SELECT username, firstname, surname, age, gender, biography, gps, fame, last_connection as tag_count FROM users
		LEFT JOIN users_tags ON users.id = users_tags.user_id
			AND users_tags.tag IN :search_tags
		LEFT JOIN users_likes ON users.id = users_likes.other_id
			AND users_likes.user_id != :current_user_id
		WHERE username != :username
		AND users_likes.id IS NULL
		AND completed == 1
		GROUP BY users.id
		ORDER BY username
	""")

	token = request.cookies.get("access_token")
	if token is None:
		raise HTTPException(status_code=401)
	try:
		payload = jwt.decode(token, dependencies.jwt_secret, algorithms=[dependencies.jwt_algorithm])
		username = payload.get("sub")
		if username is None:
			raise HTTPException(status_code=400)
		result = session.execute(user_query, {"username": username})
		user = result.fetchone()
		if user is None:
			raise HTTPException(status_code=404)
		if user.completed == 0:
			raise HTTPException(status_code=400, detail="user profile is not completed")
		result = session.execute(query, {
			"search_tags": ["Foodie"],
			"current_user_id": user.id,
			"username": user.username
		})
		return {"message": "route in building"}
	except HTTPException:
		raise
	except Exception as exception:
		raise HTTPException(status_code=400, detail=str(exception))
