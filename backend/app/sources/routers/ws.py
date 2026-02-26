import os
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, Query, WebSocket, WebSocketDisconnect, status
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

@router.get("/ws", tags=["chat"])
async def ws(session: dependencies.session, websocket: WebSocket):
	token = websocket.cookies.get("access_token")

	if not token:
		await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
		return

	payload = verify_token(token)

	if payload is None:
		await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
		return

	# If valid → accept connection
	await websocket.accept()

	try:
		while True:
			data = await websocket.receive_text()
			await websocket.send_text(f"Hello {payload['sub']}, you said: {data}")

	except WebSocketDisconnect:
		print("Client disconnected")

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
