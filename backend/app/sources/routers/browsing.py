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
async def browse(session: dependencies.session, request: Request):
	user_query: TextClause = text("SELECT id FROM users WHERE username = :username")
	query: TextClause = text("""
		SELECT *, COUNT(users_tags.id) as tag_count FROM users
		LEFT JOIN users_tags ON users.id = users_tags.user_id
			AND users_tags IN (
				SELECT tag FROM users_tags WHERE user_id = :current_user_id
			)
		WHERE username != :username
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
		return {"ok": "ok"}
		user = result.fetchone()
		if user is None:
			raise HTTPException(status_code=404)
		result = session.execute(query, {"current_user_id": user.id, "username": user.username})
		users = result.fetchall()
		if users is None:
			raise HTTPException(status_code=404)
		users = dict(user._mapping)
		return users
	except HTTPException:
		raise
	except Exception as exception:
		raise HTTPException(status_code=400, detail=str(exception))
