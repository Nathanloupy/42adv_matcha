from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from .database import initiliaze_database
from .routers import auth
from .routers import users
from .routers import browsing
from .routers import profile
from .routers import chat
from .routers import ws

@asynccontextmanager
async def lifespan(app: FastAPI):
	initiliaze_database()
	yield

app: object = FastAPI(lifespan=lifespan)
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(browsing.router)
app.include_router(profile.router)
app.include_router(chat.router)
app.include_router(ws.router)
origins = ["http://localhost:30001",
		   "http://k0r4p14:8000",
		   "http://k0r4p14:30001"] #TODO: change for prod

app.add_middleware(
	CORSMiddleware,
	allow_origins=origins,
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)

@app.get("/")
async def root():
	return {"message": "matcha api"}
