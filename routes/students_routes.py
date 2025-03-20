from fastapi import APIRouter
from fastapi.responses import JSONResponse

# Import custom utility modules
from utils.database import database  # Database handling utilities
from utils.logging import logging  # Logging utilities
from utils import utilities  # General utilities

# Importing the SchoolLevel model from the models module
from models.studentsclass import StudentsClass

from config import STUDENTS_COLLECTION

# Create a new router for data-related endpoints
students_router = APIRouter()

# Endpoint: Get all users
@students_router.get("/list", response_model=StudentsClass)
def get_class_students(classId: int):
    try:
        # Retrieve students from the database
        students = database.find(STUDENTS_COLLECTION, {'id_Class': classId})

        # If no users are found, raise an HTTPException with a 400 status code
        if not students:
            return JSONResponse(status_code=400, content="Students not found!!!")

        # Log the number of users found for tracking purposes
        utilities.add_log_to_db("get_class_students()", f"Found {len(students)} students")

        # Return the list of users as a JSON response with a 200 OK status code
        return JSONResponse(content={"students": students}, status_code=200)
    
    except Exception as e:
        # Log the error and raise an HTTPException with a 500 status code
        utilities.add_log_to_db("get_class_students()", f"Get class students error: {e}", True)
        return JSONResponse(status_code=500, content="Internal server error")
    
# Create a new user
@students_router.post("/add", response_model=StudentsClass)
def add_class_student(studentClass: StudentsClass):
    try:
        # Validate input: Ensure all required fields are provided
        # Check if the student already exists in the database
        student_exists = database.find(
            STUDENTS_COLLECTION,
            {
                'id_Class': studentClass.id_Class,
                'email': studentClass.email
            }
        )
        if student_exists:
            result = "Student already exists!!!"

            # Log the duplicate registration attempt
            utilities.add_log_to_db("add_class_student()", f"{studentClass.email} already exists")

            return JSONResponse(status_code=400, content=result)

        # add student id
        studentClass.id = database.get_next_sequence_value(STUDENTS_COLLECTION)

        # Insert the new user into the database and store the generated user ID
        created_classStudent = str(database.insert(STUDENTS_COLLECTION, studentClass))

        # Log the successful user registration
        utilities.add_log_to_db("add_class_student()", f"created_class_student={created_classStudent}")

        return JSONResponse(
            content={"message": "Student class added successfully", "studentClass": created_classStudent},
            status_code=201
        )
    
    except Exception as e:
        # Log any errors that occur during registration
        utilities.add_log_to_db("add_class_student()", f"Registration error: {e}", True)

        return JSONResponse(status_code=500, content="Internal server error")