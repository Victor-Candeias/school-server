# Import environment variable loader
import os
from dotenv import load_dotenv

# Load environment variables from the .env file at startup
# This allows sensitive information (e.g., database credentials) to be stored securely
load_dotenv()

# MongoDB collection names
USERS_COLLECTION: str = "users"
# MongoDB connection string

ENCRYPTION_KEY: str = os.getenv("ENCRYPTION_KEY")
BD_BASE_URL: str = os.getenv("BD_BASE_URL")