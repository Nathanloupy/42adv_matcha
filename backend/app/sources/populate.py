import os
import sqlite3
import uuid
import requests
from datetime import datetime, timedelta
import random

DB_PATH = "./includes/database.db"
IMAGES_DIR = "./users_images"
API_URL = f"https://api.thecatapi.com/v1/images/search?limit=10&api_key={os.getenv("CATAPI")}"

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
	"Allen",
	"King",
	"Wright",
	"Scott",
	"Torres",
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

def fetch_cat_images():
	try:
		response = requests.get(API_URL, timeout=30)
		if response.status_code == 200:
			data = response.json()
			return [img["url"] for img in data]
	except Exception as e:
		print(f"Failed to fetch cat images: {e}")
	return []

def populate(population: int = 50):
	print("Fetching cat images...")
	cat_urls = fetch_cat_images()
	print(f"Got {len(cat_urls)} cat images")

	conn = sqlite3.connect(DB_PATH)
	cursor = conn.cursor()
	cursor.execute("SELECT MAX(id) FROM users")
	max_user_id = cursor.fetchone()[0] or 0
	cursor.execute("SELECT MAX(id) FROM users_images")
	max_img_id = cursor.fetchone()[0] or 0
	cursor.execute("SELECT MAX(id) FROM users_tags")
	max_tag_id = cursor.fetchone()[0] or 0

	for i in range(1, population + 1):
		user_id = max_user_id + i
		first_name = random.choice(FIRST_NAMES)
		last_name = random.choice(LAST_NAMES)
		username = f"{first_name.lower()}{last_name.lower()}{random.randint(0, 9999)}"
		email = f"{username}@example.com"
		password = str(random.randint(1000, 11000))
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

		cursor.execute(
			"""INSERT OR IGNORE INTO users 
			(id, username, password, email, firstname, surname, verified, age, gender, sexual_preference, biography, gps, fame, last_connection, completed) 
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
			(
				user_id,
				username,
				password,
				email,
				first_name,
				last_name,
				verified,
				age,
				gender,
				sexual_pref,
				bio,
				gps,
				fame,
				last_conn,
				completed,
			),
		)

		num_images = random.randint(1, 4)
		for j in range(num_images):
			img_id = max_img_id + (i * 10 + j)
			img_uuid = str(uuid.uuid4())
			img_url = random.choice(cat_urls) if cat_urls else None

			if img_url:
				try:
					img_response = requests.get(img_url, timeout=10)
					if img_response.status_code == 200:
						img_path = os.path.join(IMAGES_DIR, f"{img_uuid}.jpg")
						with open(img_path, "wb") as f:
							f.write(img_response.content)
				except Exception as e:
					print(f"Failed to download image: {e}")

			cursor.execute(
				"INSERT OR IGNORE INTO users_images (id, user_id, uuid) VALUES (?, ?, ?)",
				(img_id, user_id, img_uuid),
			)

		num_tags = random.randint(1, 5)
		used_tags = set()
		for _ in range(num_tags):
			tag = random.choice(AVAILABLE_TAGS)
			if tag in used_tags:
				continue
			used_tags.add(tag)
			max_tag_id += 1
			cursor.execute(
				"INSERT OR IGNORE INTO users_tags (id, user_id, tag) VALUES (?, ?, ?)",
				(max_tag_id, user_id, tag),
			)

		print(f"Created user: {username}")

	conn.commit()
	conn.close()
	print(f"Done! Created {population} users with images and tags.")

if __name__ == "__main__":
	populate()
