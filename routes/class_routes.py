from fastapi import APIRouter
from fastapi.responses import JSONResponse

# Import custom utility modules
from utils.database import database  # Database handling utilities
from utils.logging import logging  # Logging utilities
from utils import utilities  # General utilities

# Importing the SchoolLevel model from the models module
from models.classes import Classes

from config import CLASSES_COLLECTION

# Create a new router for data-related endpoints
class_router = APIRouter()

# Endpoint: Get all users
@class_router.get("/list", response_model=Classes)
def get_classes():
    try:
        # Retrieve users from the database
        classes = database.find(CLASSES_COLLECTION)

        # If no users are found, raise an HTTPException with a 400 status code
        if not classes:
            return JSONResponse(status_code=400, content="Class not found!!!")

        # Log the number of users found for tracking purposes
        utilities.add_log_to_db("get_classes()", f"Found {len(classes)} classes!!!")

        # Return the list of users as a JSON response with a 200 OK status code
        return JSONResponse(content={"classes": classes}, status_code=200)
    
    except Exception as e:
        # Log the error and raise an HTTPException with a 500 status code
        utilities.add_log_to_db("get_classes()", f"Get classes error: {e}", True)
        return JSONResponse(status_code=500, content="Internal server error")
    
# Create a new user
@class_router.post("/add", response_model=Classes)
def add_class(classes: Classes):

    try:
        # Validate input: Ensure all required fields are provided
        # Check if the student already exists in the database
        class_exists = database.find(
            CLASSES_COLLECTION,
            {
                'level': classes.level,
                'className': classes.className
            }
        )

        if class_exists:
            result = f"{classes.className} with level {classes.level} already exists"

            # Log the duplicate registration attempt
            utilities.add_log_to_db("add_class()", result)

            return JSONResponse(status_code=400, content=result)

        classes.id = database.get_next_id(CLASSES_COLLECTION)

        # Insert the new user into the database and store the generated user ID
        created_class = str(database.insert(CLASSES_COLLECTION, classes.dict()))

        # Log the successful user registration
        utilities.add_log_to_db("add_class()", f"created_class={created_class}")

        return JSONResponse(
            content={"message": "Class added successfully", "Class": created_class},
            status_code=201
        )
    
    except Exception as e:
        # Log any errors that occur during registration
        utilities.add_log_to_db("add_class()", f"Registration error: {e}", True)

        return JSONResponse(status_code=500, content="Internal server error")