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

@router.websocket("/ws")
async def ws(session: dependencies.session, websocket: WebSocket):
	token = websocket.cookies.get("access_token")

	await websocket.accept()
	if not token:
		await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
		return
	payload = jwt.decode(token, dependencies.jwt_secret, algorithms=[dependencies.jwt_algorithm])
	username = payload.get("sub")
	if username is None:
		await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
		return
	await dependencies.ws_manager.connect(username, websocket)
	try:
		while True:
			await websocket.receive_text()
	except WebSocketDisconnect:
		print("Client disconnected")
