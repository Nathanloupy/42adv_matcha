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

from . import users as users_route
from .. import dependencies

router: APIRouter = APIRouter()

@router.get(
	"/view",
	tags=["view"]
)
async def view(session: dependencies.session, user: dependencies.user, id: int):
	query: str = "SELECT * FROM users WHERE id = :id"
	query_update_view: str = "INSERT INTO users_views (user_id, other_id) VALUES (:user_id, :id)"
	params: dict = {"user_id": user.id, "id": id}
	query_result: None | object = None

	try:
		if user.completed == 0:
			raise HTTPException(status_code=400, detail="user profile is not completed")
		query_result = session.execute(text(query), params)
		user_profile = query_result.fetchone()
		if user_profile is None:
			raise HTTPException(status_code=404)
		result = dict(user_profile._mapping)
		result.pop("password")
		result.pop("email")
		query_result = session.execute(text(query_update_view), params)
		session.commit()
		return result
	except HTTPException:
		raise
	except Exception as exception:
		raise HTTPException(status_code=400, detail=str(exception))

@router.post(
	"/like",
	tags=["view"]
)
async def like(session: dependencies.session, user: dependencies.user, id: int):
	query: str = "INSERT INTO users_likes (user_id, other_id) VALUES (:user_id, :id)"
	params: dict = {"user_id": user.id, "id": id}

	try:
		if user.completed == 0:
			raise HTTPException(status_code=400, detail="user profile is not completed")
		session.execute(text(query), params)
		session.commit()
		return {"message": "ok"}
	except HTTPException:
		raise
	except Exception as exception:
		raise HTTPException(status_code=400, detail=str(exception))

@router.delete(
	"/unlike",
	tags=["view"]
)
async def unlike(session: dependencies.session, user: dependencies.user, id: int):
	query: str = "DELETE FROM users_likes WHERE user_id = :user_id AND other_id = :id"
	params: dict = {"user_id": user.id, "id": id}

	try:
		if user.completed == 0:
			raise HTTPException(status_code=400, detail="user profile is not completed")
		session.execute(text(query), params)
		session.commit()
		return {"message": "ok"}
	except HTTPException:
		raise
	except Exception as exception:
		raise HTTPException(status_code=400, detail=str(exception))
