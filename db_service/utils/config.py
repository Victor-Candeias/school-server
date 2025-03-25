import os
from dotenv import load_dotenv

load_dotenv()  # loaf enviroment variables from .env

MONGO_URI: str = os.getenv("MONGO_DB_CONNECTION_STRING")  # MongoDB connection string
MONGO_DATABASE: str = os.getenv("DATABASE_NAME")  # Database name
