#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DB_PATH="$SCRIPT_DIR/app/includes/database.db"
IMAGES_DIR="$SCRIPT_DIR/app/users_images"
API_URL="https://api.thecatapi.com/v1/images/search?limit=100&api_key=live_CHt8ZR3NZatm3sCD2zM3YmM0cHmTeBYDSjrAv1c5cpsssRSzC5Z4FCkABGIGgJvY"

FIRST_NAMES=("Emma" "Liam" "Olivia" "Noah" "Ava" "Ethan" "Sophia" "Mason" "Isabella" "William" "Mia" "James" "Charlotte" "Benjamin" "Amelia" "Lucas" "Harper" "Henry" "Evelyn" "Alexander" "Abigail" "Michael" "Emily" "Daniel" "Elizabeth" "Jacob" "Sofia" "Logan" "Avery" "Jackson" "Ella" "Sebastian" "Scarlett" "Aiden" "Grace" "Matthew" "Chloe" "Samuel" "Victoria" "David" "Riley" "Joseph" "Aria" "Carter" "Lily" "Owen" "Aurora" "Wyatt" "Zoey" "John" "Penelope" "Jack" "Layla" "Luke" "Nora" "Jayden" "Camila" "Dylan" "Hannah" "Gabriel" "Lillian" "Anthony" "Addison" "Isaac" "Aubrey" "Grayson" "Ellie" "Julian" "Stella" "Lincoln" "Natalie" "Mateo" "Zoe" "David" "Leah" "Joseph" "Hazel" "Charles" "Violet" "Caleb" "Aurora" "Christopher" "Savannah" "Josiah" "Audrey" "Isaiah" "Brooklyn" "Joshua" "Bella" "Andrew" "Claire" "Ezra" "Skylar" "Landon" "Paisley" "Jonathan" "Everly")
LAST_NAMES=("Smith" "Johnson" "Williams" "Brown" "Jones" "Garcia" "Miller" "Davis" "Rodriguez" "Martinez" "Hernandez" "Lopez" "Gonzalez" "Wilson" "Anderson" "Thomas" "Taylor" "Moore" "Jackson" "Martin" "Lee" "Perez" "Thompson" "White" "Harris" "Sanchez" "Clark" "Ramirez" "Lewis" "Robinson" "Walker" "Young" "Allen" "King" "Wright" "Scott" "Torres" "Nguyen" "Hill" "Flores" "Green" "Adams" "Nelson" "Baker" "Hall" "Rivera" "Campbell" "Mitchell" "Carter" "Roberts" "Gomez" "Phillips" "Evans" "Turner" "Diaz" "Parker" "Cruz" "Edwards" "Collins" "Reyes" "Stewart" "Morris" "Morales" "Murphy" "Cook" "Rogers" "Gutierrez" "Ortiz" "Morgan" "Cooper" "Peterson" "Bailey" "Reed" "Kelly" "Howard" "Ramos" "Kim" "Cox" "Ward" "Richardson" "Watson" "Brooks" "Chavez" "Wood" "James" "Bennett" "Gray" "Mendoza" "Ruiz" "Hughes" "Price" "Alvarez" "Castillo" "Sanders" "Patel" "Myers" "Long" "Ross" "Foster" "Jimenez")
BIOGRAPHIES=(
	"Just here to meet new people and see where it goes!"
	"Cat lover, coffee addict, and adventure seeker."
	"Looking for someone to go on hikes with."
	"Foodie exploring new restaurants every week."
	"Music is my life. Let's share playlists!"
	"Travel enthusiast with a bucket list a mile long."
	"Bookworm looking for my reading buddy."
	"Dog person (don't tell my cat)."
	"Tech geek by day, gamer by night."
	"Believer in fate and spontaneous road trips."
	"Yoga and meditation enthusiast."
	"Movie marathons are my cardio."
	"Working on my startup dream."
	"Food lover who can't cook to save my life."
	"Looking for my partner in crime."
	"Adventure awaits! Join me?"
	"Coffee, cats, and good vibes."
	"Living life one pun at a time."
	"Sarcasm is my love language."
	"Looking for someone to cuddle with my cat."
)

mkdir -p "$IMAGES_DIR"
echo "Fetching cat images..."
CAT_JSON=$(curl -s "$API_URL")
if [ -z "$CAT_JSON" ] || [ "$CAT_JSON" = "[]" ]; then
    echo "Failed to fetch cat images. Using placeholder."
    CAT_URLS=()
else
    CAT_URLS=$(echo "$CAT_JSON" | grep -oP '"url":"\K[^"]+')
fi

echo "Generating random users..."

for i in $(seq 1 50); do
    FIRST_NAME="${FIRST_NAMES[$((RANDOM % ${#FIRST_NAMES[@]}))]}"
    LAST_NAME="${LAST_NAMES[$((RANDOM % ${#LAST_NAMES[@]}))]}"
    USERNAME="${FIRST_NAME,,}${LAST_NAME,,}$((RANDOM % 9999))"
    EMAIL="${USERNAME}@example.com"
    PASSWORD="$((RANDOM % 10000 + 1000))"
    AGE=$((RANDOM % 10 + 3))
    GENDER=$((RANDOM % 2))
    SEXUAL_PREF=$((RANDOM % 3))
    BIO="${BIOGRAPHIES[$((RANDOM % ${#BIOGRAPHIES[@]}))]}"
    BIO="${BIO//\'/\'\'}"
    FAME=$((RANDOM % 1000))
    COMPLETED=1
    VERIFIED=1
    GPS_LAT=$(echo "scale=6; $(shuf -i 4000-5500 -n 1) / 100" | bc)
    GPS_LON=$(echo "scale=6; -$(shuf -i 1000-1500 -n 1) / 100" | bc)
    GPS="${GPS_LAT},${GPS_LON}"
    LAST_CONN=$(date -d "$((RANDOM % 30)) days ago" "+%Y-%m-%d %H:%M:%S")

    sqlite3 "$DB_PATH" "INSERT OR IGNORE INTO users (id, username, password, email, firstname, surname, verified, age, gender, sexual_preference, biography, gps, fame, last_connection, completed) VALUES ($i, '$USERNAME', '$PASSWORD', '$EMAIL', '$FIRST_NAME', '$LAST_NAME', $VERIFIED, $AGE, $GENDER, $SEXUAL_PREF, '$BIO', '$GPS', $FAME, '$LAST_CONN', $COMPLETED);"

    NUM_IMAGES=$((RANDOM % 4 + 1))
    for j in $(seq 1 $NUM_IMAGES); do
        IMG_ID=$((i * 10 + j))
        UUID=$(cat /proc/sys/kernel/random/uuid)
        
        IMG_URL=""
        if [ ${#CAT_URLS[@]} -gt 0 ]; then
            IMG_URL="${CAT_URLS[$((RANDOM % ${#CAT_URLS[@]}))]}"
        fi
        
        if [ -n "$IMG_URL" ]; then
            curl -s -o "$IMAGES_DIR/$UUID.jpg" "$IMG_URL" || true
        fi

        sqlite3 "$DB_PATH" "INSERT OR IGNORE INTO users_images (id, user_id, uuid) VALUES ($IMG_ID, $i, '$UUID.jpg');"
    done

    NUM_TAGS=$((RANDOM % 5 + 1))
    AVAILABLE_TAGS=("cat" "coffee" "travel" "music" "food" "hiking" "gaming" "reading" "yoga" "movies" "tech" "art" "sports" "cooking" "photography")
    USED_TAGS=""
    for k in $(seq 1 $NUM_TAGS); do
        TAG="${AVAILABLE_TAGS[$((RANDOM % ${#AVAILABLE_TAGS[@]}))]}"
        if ! echo "$USED_TAGS" | grep -q "$TAG"; then
            TAG_ID=$((i * 10 + k + 1000))
            sqlite3 "$DB_PATH" "INSERT OR IGNORE INTO users_tags (id, user_id, tag) VALUES ($TAG_ID, $i, '$TAG');"
            USED_TAGS="$USED_TAGS,$TAG"
        fi
    done

    echo "Created user: $USERNAME"
done

echo "Done! Created 50 random users with images and tags."
