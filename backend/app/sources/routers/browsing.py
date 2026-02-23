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
	query: TextClause = text("SELECT * FROM users WHERE username != :username ORDER BY fame")

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
