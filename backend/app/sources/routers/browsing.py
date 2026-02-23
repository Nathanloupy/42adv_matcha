import os
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, Field
from sqlalchemy import text, TextClause
from sqlmodel import Session
from datetime import datetime
import jwt

from .. import dependencies

router: APIRouter = APIRouter()

@router.get("/browse", tags=["borwsing"])
async def browse(session: dependencies.session, request: Request, offset: int = 0):
	user_query: TextClause = text("SELECT * FROM users WHERE username = :username")
	query: TextClause = text("""
		SELECT username, firstname, surname, age, gender, biography, gps, fame, last_connection, COUNT(users_tags.id) as tag_count FROM users
		LEFT JOIN users_tags ON users.id = users_tags.user_id
			AND users_tags.tag IN (
				SELECT tag FROM users_tags WHERE user_id = :current_user_id
			)
		LEFT JOIN users_likes ON users.id = users_likes.other_id
			AND users_likes.user_id != :current_user_id
		WHERE username != :username
		AND users_likes.id IS NULL
		AND completed == 1
		AND (gender == :gender OR gender == :gender2)
		GROUP BY users.id
		ORDER BY tag_count DESC, fame DESC
		LIMIT 10 OFFSET :offset
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
		oposite_gender: int = 0 if user.gender == 1 else 1
		genders: list = [oposite_gender, oposite_gender]
		if user.sexual_preference == 2:
			genders[1] = user.gender
		result = session.execute(query, {
			"current_user_id": user.id,
			"username": user.username,
			"gender": genders[0],
			"gender2": genders[1],
			"offset": offset
		})
		users = result.fetchall()
		if users is None:
			raise HTTPException(status_code=404)
		return [dict(user._mapping) for user in users]
	except HTTPException:
		raise
	except Exception as exception:
		raise HTTPException(status_code=400, detail=str(exception))
