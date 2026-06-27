import os
from dotenv import load_dotenv

load_dotenv()  # loaf enviroment variables from .env

MONGO_URI: str = os.getenv("MONGO_DB_CONNECTION_STRING", "mongodb://localhost:27017")  # MongoDB connection string
MONGO_DATABASE: str = os.getenv("DATABASE_NAME", "school")  # Database name
