from sqlalchemy import text
from sqlmodel import Field, Session, SQLModel, create_engine, select

DATABASE_URL = f"sqlite:///includes/database.db"
CONNECT_ARGS = {"check_same_thread": False}
ENGINE = create_engine(DATABASE_URL, connect_args=CONNECT_ARGS)

def initiliaze_database() -> None:
	with Session(ENGINE) as session:
		session.execute(text("""
			CREATE TABLE IF NOT EXISTS users (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				username TEXT UNIQUE NOT NULL,
				password TEXT NOT NULL,
				email TEXT UNIQUE NOT NULL,
				surname TEXT NOT NULL,
				firstname TEXT NOT NULL,
				verified BOOLEAN DEFAULT 0
			);
		"""))
		session.commit()

def get_database_session():
	with Session(ENGINE) as session:
		yield session
