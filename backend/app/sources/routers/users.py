from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from sqlalchemy import text, TextClause
from sqlmodel import Session
import jwt

from .. import dependencies

router: APIRouter = APIRouter()

class TokenData(BaseModel):
    username: str | None = None

@router.get("/users/me", tags=["users"])
async def me(session: dependencies.session, token: dependencies.token):
	query: TextClause = text("SELECT * FROM users WHERE username = :username")

	try:
		payload = jwt.decode(token, dependencies.jwt_secret, algorithms=[dependencies.jwt_algorithm])
		username = payload.get("sub")
		if username is None:
			raise ValueError
		token_data = TokenData(username=username)
		result = session.execute(query, {"username": token_data.username})
		user = result.fetchone()
		return {"username": user.username, "verified": user.verified}
	except ValueError:
		raise HTTPException(status_code=401)
	except Exception:
		raise HTTPException(status_code=400)
	
