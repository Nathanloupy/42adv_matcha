import os
from sqlalchemy import text
from sqlmodel import Field, Session, SQLModel, create_engine, select

DATABASE_URL = f"sqlite:///includes/database.db"
CONNECT_ARGS = {"check_same_thread": False}
ENGINE = create_engine(DATABASE_URL, connect_args=CONNECT_ARGS)

def initiliaze_database() -> None:
	with Session(ENGINE) as session:
		session.execute(text("""
			CREATE TABLE IF NOT EXISTS "users" (
				"id" INTEGER NOT NULL UNIQUE,
				"username" TEXT UNIQUE,
				"password" TEXT,
				"email" TEXT UNIQUE,
				"firstname" TEXT,
				"surname" TEXT,
				"verified" BOOLEAN DEFAULT 0,
				"age" INTEGER DEFAULT 3,
				"gender" BOOLEAN,
				"sexual_preference" INTEGER DEFAULT 2,
				"biography" VARCHAR(256),
				"gps" TEXT,
				"fame" INTEGER DEFAULT 0,
				"last_connection" DATETIME,
				"completed" BOOLEAN DEFAULT 0,
				PRIMARY KEY("id"),
				FOREIGN KEY ("id") REFERENCES "users_tags"("user_id")
				ON UPDATE NO ACTION ON DELETE NO ACTION,
				FOREIGN KEY ("id") REFERENCES "users_views"("user_id")
				ON UPDATE NO ACTION ON DELETE NO ACTION,
				FOREIGN KEY ("id") REFERENCES "users_likes"("user_id")
				ON UPDATE NO ACTION ON DELETE NO ACTION,
				FOREIGN KEY ("id") REFERENCES "users_blocks"("user_id")
				ON UPDATE NO ACTION ON DELETE NO ACTION,
				FOREIGN KEY ("id") REFERENCES "users_chats"("user_id")
				ON UPDATE NO ACTION ON DELETE NO ACTION,
				FOREIGN KEY ("id") REFERENCES "users_connected"("user_id")
				ON UPDATE NO ACTION ON DELETE NO ACTION,
				FOREIGN KEY ("id") REFERENCES "users_blocks"("other_id")
				ON UPDATE NO ACTION ON DELETE NO ACTION,
				FOREIGN KEY ("id") REFERENCES "users_views"("other_id")
				ON UPDATE NO ACTION ON DELETE NO ACTION,
				FOREIGN KEY ("id") REFERENCES "users_likes"("other_id")
				ON UPDATE NO ACTION ON DELETE NO ACTION,
				FOREIGN KEY ("id") REFERENCES "users_connected"("other_id")
				ON UPDATE NO ACTION ON DELETE NO ACTION,
				FOREIGN KEY ("id") REFERENCES "users_chats"("other_id")
				ON UPDATE NO ACTION ON DELETE NO ACTION,
				FOREIGN KEY ("id") REFERENCES "users_images"("user_id")
				ON UPDATE NO ACTION ON DELETE NO ACTION
			);
		"""))
		session.execute(text("""
			CREATE TABLE IF NOT EXISTS "users_tags" (
				"id" INTEGER NOT NULL UNIQUE,
				"user_id" INTEGER NOT NULL,
				"tag" TEXT NOT NULL,
				UNIQUE("user_id", "tag"),
				PRIMARY KEY("id")
			);
		"""))
		session.execute(text("""
			CREATE TABLE IF NOT EXISTS "users_views" (
				"id" INTEGER NOT NULL UNIQUE,
				"user_id" INTEGER NOT NULL,
				"other_id" INTEGER NOT NULL,
				PRIMARY KEY("id")
			);
		"""))
		session.execute(text("""
			CREATE TABLE IF NOT EXISTS "users_likes" (
				"id" INTEGER NOT NULL UNIQUE,
				"user_id" INTEGER NOT NULL,
				"other_id" INTEGER NOT NULL,
				PRIMARY KEY("id")
			);
		"""))
		session.execute(text("""
			CREATE TABLE IF NOT EXISTS "users_blocks" (
				"id" INTEGER NOT NULL UNIQUE,
				"user_id" INTEGER NOT NULL,
				"other_id" INTEGER NOT NULL,
				PRIMARY KEY("id")
			);
		"""))
		session.execute(text("""
			CREATE TABLE IF NOT EXISTS "users_connected" (
				"id" INTEGER NOT NULL UNIQUE,
				"user_id" INTEGER NOT NULL,
				"other_id" INTEGER NOT NULL,
				PRIMARY KEY("id")
			);
		"""))
		session.execute(text("""
			CREATE TABLE IF NOT EXISTS "users_chats" (
				"id" INTEGER NOT NULL UNIQUE,
				"user_id" INTEGER NOT NULL,
				"other_id" INTEGER NOT NULL,
				"time" TIMESTAMP NOT NULL,
				"value" TEXT NOT NULL,
				PRIMARY KEY("id")
			);
		"""))
		session.execute(text("""
			CREATE TABLE IF NOT EXISTS "users_images" (
				"id" INTEGER NOT NULL UNIQUE,
				"user_id" INTEGER NOT NULL,
				"filename" INTEGER NOT NULL,
				PRIMARY KEY("id")
			);
		"""))
		session.commit()
		os.makedirs("uploads", exist_ok=True)

def get_database_session():
	with Session(ENGINE) as session:
		yield session
