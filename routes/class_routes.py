from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse

# Import custom utility modules
from utils.database import database  # Database handling utilities

# Importing the SchoolLevel model from the models module
from models.studentsclass import StudentsClass

# Create a new router for data-related endpoints
class_router = APIRouter()

# Endpoint: Get all users
@class_router.get("/class")
def get_classes():
    try:
        # Retrieve users from the database
        classes = database.get_classes()

        # If no users are found, raise an HTTPException with a 400 status code
        if not classes:
            raise HTTPException(status_code=400, detail="Classes not found")

        # Log the number of users found for tracking purposes
        database.add_log("get_classes()", f"Found {len(classes)} classes")

        # Return the list of users as a JSON response with a 200 OK status code
        return JSONResponse(content={"classes": classes}, status_code=200)
    
    except Exception as e:
        # Log the error and raise an HTTPException with a 500 status code
        database.add_log("get_classes()", f"Get classes error: {e}", True)
        raise HTTPException(status_code=500, detail="Internal server error")