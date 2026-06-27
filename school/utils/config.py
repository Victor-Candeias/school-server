# Import environment variable loader
import os
from dotenv import load_dotenv

# Load environment variables from the .env file at startup
# This allows sensitive information (e.g., database credentials) to be stored securely
load_dotenv()

# MongoDB collection names
USERS_COLLECTION: str = "users"
SCHOOLS_COLLECTION: str = "schools"
YEARS_COLLECTION: str = "years"
CLASSES_COLLECTION: str = "classes"
STUDENTS_COLLECTION: str = "students"
TESTS_COLLECTION: str = "schooltestes"
STUDENT_TESTES_COLLECTION: str = "classtestes"
MOMENTS_COLLECTION: str = "testsmoments"
CLASS_MOMENTS_COLLECTION: str = "studentstestmoments"
SEMESTER_EVALUATIONS_COLLECTION: str = "semesterstudentsevaluations"
# MongoDB connection string

BD_BASE_URL: str = os.getenv("BD_BASE_URL", "http://127.0.0.1:8000/db-api")
ENCRYPTION_KEY: str = os.getenv("ENCRYPTION_KEY", "")