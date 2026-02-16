from typing import Annotated
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from sqlalchemy import text
from .database import *
from .routers import users

@asynccontextmanager
async def lifespan(app: FastAPI):
	initiliaze_database()
	yield

app: object = FastAPI(lifespan=lifespan)
app.include_router(users.router)
session_dep = Annotated[Session, Depends(get_database_session)]

@app.get("/")
async def root():
	return {"message": "matcha api"}

#@app.get("/get_user/{name}")
#async def get_user(session: session_dep, name: str):
#	value: object = text("SELECT * FROM users WHERE name = :name")
#	result = session.execute(value, {"name": name})
#	user = result.fetchone()
#	if not user:
#		return {"error": "not found"}
#	return {"id": user.id, "name": user.name}
#
#@app.post("/add_user")
#async def add_user(session: session_dep, name: str):
#	value: object = text("INSERT INTO users (name) VALUES (:name)")
#	session.execute(value, {"name": name})
#	session.commit()
#	return {"name": name}
