import os
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, Query, WebSocket
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, Field
from sqlalchemy import text, TextClause
from sqlmodel import Session
from datetime import datetime
import jwt
import random
import base64

from .. import dependencies

router: APIRouter = APIRouter()

"""
"id" INTEGER NOT NULL UNIQUE,
"user_id" INTEGER NOT NULL,
"other_id" INTEGER NOT NULL,
"time" TIMESTAMP NOT NULL,
"value" TEXT NOT NULL,
"""

@router.get("/chat", tags=["chat"])
async def chat(session: dependencies.session, user: dependencies.user, id: int):
	query: str = """
		SELECT user_id, value, time FROM users_chats
		WHERE (user_id = :user_id AND other_id = :other_id)
		OR (user_id = :other_id AND other_id = :user_id)
		ORDER BY time
	"""
	query_check: str = "SELECT COUNT(*) FROM users_connected WHERE user_id = :user_id AND other_id = :other_id"
	params: dict = {"user_id": user.id, "other_id": id}

	try:
		result = session.execute(text(query_check), params)
		c_result = result.fetchone()[0]
		if c_result == 0:
			raise HTTPException(status_code=400, detail="users are not connected")
		result = session.execute(text(query), params)
		m_result = result.fetchall()
		if m_result is None:
			raise HTTPException(status_code=400)
		return [dict(x._mapping) for x in m_result]
	except HTTPException:
		session.rollback()
		raise
	except Exception as exception:
		session.rollback()
		raise HTTPException(status_code=400, detail=str(exception))

@router.post("/chat", tags=["chat"])
async def chat(session: dependencies.session, user: dependencies.user, id: int, message: str):
	query: str = "INSERT INTO users_chats (user_id, other_id, time, value) VALUES (:user_id, :other_id, :time, :value)"
	query_check: str = "SELECT COUNT(*) FROM users_connected WHERE user_id = :user_id AND other_id = :other_id"
	params: dict = {"user_id": user.id, "other_id": id, "time": datetime.now(), "value": message}

	try:
		result = session.execute(text(query_check), params)
		c_result = result.fetchone()[0]
		if c_result == 0:
			raise HTTPException(status_code=400, detail="users are not connected")
		session.execute(text(query), params)
		session.commit()
		return {"message": "ok"}
	except HTTPException:
		raise
	except Exception as exception:
		session.rollback()
		raise HTTPException(status_code=400, detail=str(exception))
