import os
import requests
import uuid
import random
import sqlite3
from sqlalchemy import text
from sqlmodel import Field, Session, SQLModel, create_engine, select
from datetime import datetime, timedelta
from pwdlib import PasswordHash


DATABASE_URL = f"sqlite:///includes/database.db"
CONNECT_ARGS = {"check_same_thread": False}
ENGINE = create_engine(DATABASE_URL, connect_args=CONNECT_ARGS)
IMAGES_DIR = "./users_images"

API_URL = (
	f"https://api.thecatapi.com/v1/images/search?api_key={os.getenv('CATAPI_TOKEN')}"
)

FIRST_NAMES = [
	"Emma",
	"Liam",
	"Olivia",
	"Noah",
	"Ava",
	"Ethan",
	"Sophia",
	"Mason",
	"Isabella",
	"William",
	"Mia",
	"James",
	"Charlotte",
	"Benjamin",
	"Amelia",
	"Lucas",
	"Harper",
	"Henry",
	"Evelyn",
	"Alexander",
	"Abigail",
	"Michael",
	"Emily",
	"Daniel",
	"Elizabeth",
	"Jacob",
	"Sofia",
	"Logan",
	"Avery",
	"Jackson",
	"Ella",
	"Sebastian",
	"Scarlett",
	"Aiden",
	"Grace",
	"Matthew",
	"Chloe",
	"Samuel",
	"Victoria",
	"David",
	"Riley",
	"Joseph",
	"Aria",
	"Carter",
	"Lily",
	"Owen",
	"Aurora",
	"Wyatt",
	"Zoey",
	"John",
	"Penelope",
	"Jack",
	"Layla",
	"Luke",
	"Nora",
	"Jayden",
	"Camila",
	"Dylan",
	"Hannah",
	"Gabriel",
	"Lillian",
	"Anthony",
	"Addison",
	"Isaac",
	"Aubrey",
	"Grayson",
	"Ellie",
	"Julian",
	"Stella",
	"Lincoln",
	"Natalie",
	"Mateo",
	"Zoe",
	"David",
	"Leah",
	"Joseph",
	"Hazel",
	"Charles",
	"Violet",
	"Caleb",
	"Aurora",
	"Christopher",
	"Savannah",
	"Josiah",
	"Audrey",
	"Isaiah",
	"Brooklyn",
	"Joshua",
	"Bella",
	"Andrew",
	"Claire",
	"Ezra",
	"Skylar",
	"Landon",
	"Paisley",
	"Jonathan",
	"Everly",
]
LAST_NAMES = [
	"Smith",
	"Johnson",
	"Williams",
	"Brown",
	"Jones",
	"Garcia",
	"Miller",
	"Davis",
	"Rodriguez",
	"Martinez",
	"Hernandez",
	"Lopez",
	"Gonzalez",
	"Wilson",
	"Anderson",
	"Thomas",
	"Taylor",
	"Moore",
	"Jackson",
	"Martin",
	"Lee",
	"Perez",
	"Thompson",
	"White",
	"Harris",
	"Sanchez",
	"Clark",
	"Ramirez",
	"Lewis",
	"Robinson",
	"Walker",
	"Young",
	"Allen",			# Extra safety: keep only .jpg URLs
	"Nguyen",
	"Hill",
	"Flores",
	"Green",
	"Adams",
	"Nelson",
	"Baker",
	"Hall",
	"Rivera",
	"Campbell",
	"Mitchell",
	"Carter",
	"Roberts",
	"Gomez",
	"Phillips",
	"Evans",
	"Turner",
	"Diaz",
	"Parker",
	"Cruz",
	"Edwards",
	"Collins",
	"Reyes",
	"Stewart",
	"Morris",
	"Morales",
	"Murphy",
	"Cook",
	"Rogers",
	"Gutierrez",
	"Ortiz",
	"Morgan",
	"Cooper",
	"Peterson",
	"Bailey",
	"Reed",
	"Kelly",
	"Howard",
	"Ramos",
	"Kim",
	"Cox",
	"Ward",
	"Richardson",
	"Watson",
	"Brooks",
	"Chavez",
	"Wood",
	"James",
	"Bennett",
	"Gray",
	"Mendoza",
	"Ruiz",
	"Hughes",
	"Price",
	"Alvarez",
	"Castillo",
	"Sanders",
	"Patel",
	"Myers",
	"Long",
	"Ross",
	"Foster",
	"Jimenez",
]
BIOGRAPHIES = [
	"Just here to meet new people and see where it goes!",
	"Cat lover, coffee addict, and adventure seeker.",
	"Looking for someone to go on hikes with.",
	"Foodie exploring new restaurants every week.",
	"Music is my life. Let's share playlists!",
	"Travel enthusiast with a bucket list a mile long.",
	"Bookworm looking for my reading buddy.",
	"Dog person (don't tell my cat).",
	"Tech geek by day, gamer by night.",
	"Believer in fate and spontaneous road trips.",
	"Yoga and meditation enthusiast.",
	"Movie marathons are my cardio.",
	"Working on my startup dream.",
	"Food lover who can't cook to save my life.",
	"Looking for my partner in crime.",
	"Adventure awaits! Join me?",
	"Coffee, cats, and good vibes.",
	"Living life one pun at a time.",
	"Sarcasm is my love language.",
	"Looking for someone to cuddle with my cat.",
]
AVAILABLE_TAGS = [
	"Adventure seeker",
	"Foodie",
	"Travel lover",
	"Dog person",
	"Gym lover",
	"Homebody",
	"Music addict",
	"Bookworm",
	"Hopeless romantic",
	"Night owl",
]


def initiliaze_database() -> None:
	with Session(ENGINE) as session:
		session.execute(
			text("""
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
				FOREIGN KEY ("id") REFERENCES "users_connected"("user_id")
				ON UPDATE NO ACTION ON DELETE NO ACTION
			);
		""")
		)
		session.execute(
			text("""
			CREATE TABLE IF NOT EXISTS "users_tags" (
				"id" INTEGER NOT NULL UNIQUE,
				"user_id" INTEGER NOT NULL,
				"tag" TEXT NOT NULL,
				UNIQUE("user_id", "tag"),
				PRIMARY KEY("id")
			);
		""")
		)
		session.execute(
			text("""
			CREATE TABLE IF NOT EXISTS "users_views" (
				"id" INTEGER NOT NULL UNIQUE,
				"user_id" INTEGER NOT NULL,
				"other_id" INTEGER NOT NULL,
				PRIMARY KEY("id")
			);
		""")
		)
		session.execute(
			text("""
			CREATE TABLE IF NOT EXISTS "users_likes" (
				"id" INTEGER NOT NULL UNIQUE,
				"user_id" INTEGER NOT NULL,
				"other_id" INTEGER NOT NULL,
				PRIMARY KEY("id")
			);
		""")
		)
		session.execute(
			text("""
			CREATE TABLE IF NOT EXISTS "users_blocks" (
				"id" INTEGER NOT NULL UNIQUE,
				"user_id" INTEGER NOT NULL,
				"other_id" INTEGER NOT NULL,
				PRIMARY KEY("id")
			);
		""")
		)
		session.execute(
			text("""
			CREATE TABLE IF NOT EXISTS "users_connected" (
				"id" INTEGER NOT NULL UNIQUE,
				"user_id" INTEGER NOT NULL,
				"other_id" INTEGER NOT NULL,
				PRIMARY KEY("id")
			);
		""")
		)
		session.execute(
			text("""
			CREATE TABLE IF NOT EXISTS "users_chats" (
				"id" INTEGER NOT NULL UNIQUE,
				"user_id" INTEGER NOT NULL,
				"other_id" INTEGER NOT NULL,
				"time" TIMESTAMP NOT NULL,
				"value" TEXT NOT NULL,
				PRIMARY KEY("id")
			);
		""")
		)
		session.execute(
			text("""
			CREATE TABLE IF NOT EXISTS "users_images" (
				"id" INTEGER NOT NULL UNIQUE,
				"user_id" INTEGER NOT NULL,
				"uuid" STRING NOT NULL,
				PRIMARY KEY("id")
			);
		""")
		)
		session.execute(
			text("""
			CREATE TABLE IF NOT EXISTS "users_connected" (
				"id" INTEGER NOT NULL UNIQUE,
				"user_id" INTEGER NOT NULL,
				"other_id" INTEGER NOT NULL,
				PRIMARY KEY("id")
			);
		""")
		)
		os.makedirs("users_images", exist_ok=True)
		populate(session, 500)
		session.commit()


def fetch_cat_images(limit: int = 100, page: int = 0) -> list[str]:
	"""
	Fetch cat image URLs from The Cat API.
	  limit  1-100  Number of images per page
	  page   0-n	Page index for pagination (requires API key for full effect)
	  order  ASC	Stable ordering so different pages return different images
	  mime_types jpg  Only return JPEG images (no GIFs or PNGs)
	"""
	params = {
		"limit": limit,
		"page": page,
		"order": "ASC",
		"mime_types": "jpg",
	}
	url = f"{API_URL}"
	for k, v in params.items():
		url += f"&{k}={v}"
	try:
		response = requests.get(url, timeout=30)
		if response.status_code == 200:
			data = response.json()
			return [
				img["url"]
				for img in data
				if img.get("url", "").lower().endswith(".jpg")
			]
	except Exception as e:
		print(f"Failed to fetch cat images (page {page}): {e}")
	return []


def fetch_unique_cat_images(needed: int) -> list[str]:
	"""
	Fetch at least `needed` unique cat image URLs by paginating through the API.
	Returns a deduplicated list; may return fewer than `needed` if the API
	runs out of results.
	"""
	seen: set[str] = set()
	urls: list[str] = []
	page = 0
	limit = 100

	while len(urls) < needed:
		batch = fetch_cat_images(limit=limit, page=page)
		if not batch:
			break
		for url in batch:
			if url not in seen:
				seen.add(url)
				urls.append(url)
				if len(urls) >= needed:
					break
		page += 1

	return urls


def populate(session: Session, population: int = 50):
	number_of_users = (
		session.execute(text("SELECT COUNT(*) FROM USERS")).fetchone()[0] or 0
	)
	if number_of_users > 10:
		print("Database already populated, skipping population...")
		return

	max_images_per_user = 4
	needed = population * max_images_per_user
	print(f"Fetching {needed} unique cat images...")
	cat_urls = fetch_unique_cat_images(needed)
	print(f"Got {len(cat_urls)} unique cat images")

	url_iter = iter(cat_urls)

	max_user_id = session.execute(text("SELECT MAX(id) FROM users")).fetchone()[0] or 0
	max_img_id = (
		session.execute(text("SELECT MAX(id) FROM users_images")).fetchone()[0] or 0
	)
	max_tag_id = (
		session.execute(text("SELECT MAX(id) FROM users_tags")).fetchone()[0] or 0
	)

	for i in range(1, population + 1):
		user_id = max_user_id + i
		first_name = random.choice(FIRST_NAMES)
		last_name = random.choice(LAST_NAMES)
		username = f"{first_name.lower()}{last_name.lower()}{random.randint(0, 9999)}"
		email = f"{username}@example.com"
		password = PasswordHash.recommended().hash(str(random.randint(1000, 11000)))
		age = random.randint(3, 13)
		gender = random.randint(0, 1)
		sexual_pref = random.randint(0, 2)
		bio = random.choice(BIOGRAPHIES).replace("'", "''")
		fame = random.randint(0, 1000)
		verified = 1
		completed = 1
		lat = round(random.uniform(40.00, 55.00), 6)
		lon = round(random.uniform(-15.00, -10.00), 6)
		gps = f"{lat},{lon}"
		last_conn = (datetime.now() - timedelta(days=random.randint(0, 30))).strftime(
			"%Y-%m-%d %H:%M:%S"
		)

		session.execute(
			text("""INSERT OR IGNORE INTO users 
			(id, username, password, email, firstname, surname, verified, age, gender, sexual_preference, biography, gps, fame, last_connection, completed) 
			VALUES (:id, :username, :password, :email, :firstname, :surname, :verified, :age, :gender, :sexual_pref, :bio, :gps, :fame, :last_conn, :completed)"""),
			{
				"id": user_id,
				"username": username,
				"password": password,
				"email": email,
				"firstname": first_name,
				"surname": last_name,
				"verified": verified,
				"age": age,
				"gender": gender,
				"sexual_pref": sexual_pref,
				"bio": bio,
				"gps": gps,
				"fame": fame,
				"last_conn": last_conn,
				"completed": completed,
			},
		)

		num_images = random.randint(1, max_images_per_user)
		for j in range(num_images):
			img_id = max_img_id + (i * max_images_per_user + j)
			img_uuid = str(uuid.uuid4())
			img_url = next(url_iter, None)

			if img_url:
				try:
					img_response = requests.get(img_url, timeout=10)
					if img_response.status_code == 200:
						img_path = os.path.join(IMAGES_DIR, f"{img_uuid}.jpg")
						with open(img_path, "wb") as f:
							f.write(img_response.content)
					else:
						print(
							f"Failed to download {img_url}: HTTP {img_response.status_code}"
						)
				except Exception as e:
					print(f"Failed to download image: {e}")

			session.execute(
				text(
					"INSERT OR IGNORE INTO users_images (id, user_id, uuid) VALUES (:id, :user_id, :uuid)"
				),
				{"id": img_id, "user_id": user_id, "uuid": img_uuid},
			)

		num_tags = random.randint(1, 5)
		used_tags = set()
		for _ in range(num_tags):
			tag = random.choice(AVAILABLE_TAGS)
			if tag in used_tags:
				continue
			used_tags.add(tag)
			max_tag_id += 1
			session.execute(
				text(
					"INSERT OR IGNORE INTO users_tags (id, user_id, tag) VALUES (:id, :user_id, :tag)"
				),
				{"id": max_tag_id, "user_id": user_id, "tag": tag},
			)

		print(f"Created user: {username}")

	print(f"Done! Created {population} users with images and tags.")


def get_database_session():
	with Session(ENGINE) as session:
		yield session
