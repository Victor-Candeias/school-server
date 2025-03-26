# Import environment variable loader
import os
from dotenv import load_dotenv

# Load environment variables from the .env file at startup
# This allows sensitive information (e.g., database credentials) to be stored securely
load_dotenv()

# MongoDB collection names
CLASSES_COLLECTION = "classes"
STUDENTS_COLLECTION = "students"
TESTS_COLLECTION = "schooltestes"
STUDENT_TESTES_COLLECTION = "classtestes"
MOMENTS_COLLECTION = "testsmoments"
CLASS_MOMENTS_COLLECTION = "classtestsmoments"
# MongoDB connection string

BD_BASE_URL: str = os.getenv("BD_BASE_URL")
ENCRYPTION_KEY: str = os.getenv("ENCRYPTION_KEY")