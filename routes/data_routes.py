"""
data_routes.py

This module defines the routes for data-related operations in the FastAPI application.
It includes endpoints for retrieving users and school levels from the database.

Routes:
    - /users: Retrieves all users from the database.
    - /level: Retrieves all school levels from the database.

Dependencies:
    - FastAPI: For creating API routes and handling HTTP exceptions.
    - utils.database: For database operations.
    - utils.logging: For logging operations.
    - utils.utilities: For general utility functions.
    - models.schoollevel: For the SchoolLevel model.
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse

# Import custom utility modules
from utils.database import database  # Database handling utilities
from utils.logging import logging  # Logging utilities
from utils import utilities  # General utilities

# Importing the SchoolLevel model from the models module
from models.schoollevel import SchoolLevel
from models.user import User

from config import USERS_COLLECTION, DATA_LEVEL_COLLECTION

# Create a new router for data-related endpoints
data_router = APIRouter()

# Endpoint: Get all users
@data_router.get("/users", response_model=User)
def get_users():
    """
    Retrieve all users from the database.

    This endpoint fetches all users from the database. If users are found, it returns
    a list of user details (name and role). If no users are found or an error occurs,
    it returns an appropriate error message.

    Returns:
        JSONResponse: A response containing the list of users or an error message.
    """
    try:
        # Retrieve users from the database
        users = database.find(USERS_COLLECTION)

        # If no users are found, raise an HTTPException with a 400 status code
        if not users:
            return JSONResponse(status_code=400, content="Users not found")

        # Log the number of users found for tracking purposes
        utilities.add_log_to_db("get_users()", f"Found {len(users)} users")

        # Use list comprehension to create a simplified list of user data (name and role)
        result = [{"email": user['email'], "name": user['name'], "role": user['role']} for user in users]

        # Return the list of users as a JSON response with a 200 OK status code
        return JSONResponse(content={"users": result}, status_code=200)

    except Exception as e:
        # Log the error and raise an HTTPException with a 500 status code
        utilities.add_log_to_db("get_users()", f"Get users error: {e}", True)
        return JSONResponse(status_code=500, content="Internal server error")

# Endpoint: Get all school levels
@data_router.get("/level", response_model=SchoolLevel)
def get_levels():
    """
    Retrieve all school levels from the database.

    This endpoint fetches all school levels from the database. If levels are found, it
    returns a list of school levels. If no levels are found or an error occurs, it returns
    an appropriate error message.

    Returns:
        JSONResponse: A response containing the list of school levels or an error message.
    """
    try:
        # Retrieve school levels from the database
        levels = database.find(DATA_LEVEL_COLLECTION)

        # If no levels are found, raise an HTTPException with a 400 status code
        if not levels:
            return JSONResponse(status_code=400, content="Levels not found!!!")

        # Log the number of levels found for tracking purposes
        utilities.add_log_to_db("get_levels()", f"Found {len(levels)} levels")

        # Use list comprehension to create a simplified list of school level data
        result = [{"level": level['schoolYear']} for level in levels]

        # Return the list of school levels as a JSON response with a 200 OK status code
        return JSONResponse(content={"levels": result}, status_code=200)

    except Exception as e:
        # Log the error and raise an HTTPException with a 500 status code
        utilities.add_log_to_db("get_levels()", f"Get levels error: {e}", True)
        return JSONResponse(status_code=500, content="Internal server error")