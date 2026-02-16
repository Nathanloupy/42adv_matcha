from sqlalchemy import text
from sqlmodel import Field, Session, SQLModel, create_engine, select

DATABASE_URL = f"sqlite:///includes/database.db"
CONNECT_ARGS = {"check_same_thread": False}
ENGINE = create_engine(DATABASE_URL, connect_args=CONNECT_ARGS)

def initiliaze_database() -> None:
	with Session(ENGINE) as session:
		session.execute(text("""
			CREATE TABLE IF NOT EXISTS users (
				id SERIAL PRIMARY KEY,
				name VARCHAR(10) NOT NULL
			);
		"""))
		session.commit()

def get_database_session():
	with Session(ENGINE) as session:
		yield session
