import os
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from utils.bd_client import BDClient  # Importa o cliente da API

# Import custom utility modules
from utils.logging import logging  # Logging utilities
from utils import utilities  # General utilities

# Importing the User model from the models module
from models.user import User
from models.userlogin import UserLogin

from config import USERS_COLLECTION

# Import environment variable loader
from dotenv import load_dotenv

# Call the GET method
import asyncio

# Load environment variables from the .env file at startup
# This allows sensitive information (e.g., database credentials) to be stored securely
load_dotenv()

# Create a new router for authentication-related endpoints
auth_router = APIRouter()

bdUrl = os.getenv("BD_BASE_URL") 

# Instanciar o cliente da API
api_client = BDClient(bdUrl)

# Create a new user
@auth_router.post("/register")
async def register(request: Request):
    """
    Endpoint to create a new user.

    Args:
        request (Request): The incoming HTTP request containing user details.

    Returns:
        JSONResponse: A response indicating success or failure.
    
    Possible Status Codes:
        - 201: User registered successfully.
        - 400: Invalid input or user already exists.
        - 500: Internal server error.
    """
    try:
        # Parse the JSON body from the request
        body = await request.json()

        # Prepare the payload for the REST API
        params = {
            "collection": USERS_COLLECTION,
            "query": {"email": body.get("email")}  # Query to check if the user exists
        }

        # Check if the user already exists in the database via the REST API
        response = await api_client.post(endpoint="find", data=params)

        # If the user exists, return a 400 response
        if response.get("documents"):
            result = "User already exists!!!"
            # Log the duplicate registration attempt
            # utilities.add_log_to_db("register_user()", f"{result}={body.get('email')}")
            return JSONResponse(status_code=400, content={"message": result})

        # Encrypt the user's password before storing it
        hashed_password = utilities.hash_password(body.get("password"))

        # Prepare the new user object
        new_user = {
            "name": body.get("name"),
            "email": body.get("email"),
            "password": hashed_password,
            "role": body.get("role")
        }

        # Insert the new user into the database via the REST API
        insert_params = {
            "collection": USERS_COLLECTION,
            "data": new_user
        }

        insert_response = await api_client.post(endpoint="insert", data=insert_params)

        # Extract the created user ID from the response
        created_user = insert_response.get("id", "unknown")

        # Log the successful user registration
        # utilities.add_log_to_db("register_user()", f"created_user={created_user}")

        return JSONResponse(
            content={"message": "User registered successfully", "user": created_user},
            status_code=201
        )

    except Exception as e:
        # Log any errors that occur during registration
        # utilities.add_log_to_db("register_user()", f"Registration error: {e}", True)

        return JSONResponse(status_code=500, content={"message": "Internal server error"})

# Login a user and return a token
@auth_router.post("/login", response_model=UserLogin)
async def login(request: Request):
    """
    Endpoint for logging in a user.

    This function validates the user's input (username and password), checks if the user exists in the database, 
    and verifies the password. If everything is correct, it generates a JWT token for the user and returns it. 
    If there are any issues (invalid input, incorrect password, etc.), appropriate error messages are returned.

    Args:
        user (UserLogin): The user object containing the username and password provided in the login request.

    Returns:
        JSONResponse: A response containing either a JWT token (if login is successful) 
        or an error message (if there are issues with the login).
    """
    try:
        # Parse the JSON body from the request
        body = await request.json()

        # Prepare the payload for the REST API
        params = {
            "collection": USERS_COLLECTION,
            "query": {"email": body.get("email")}  # Query to check if the user exists
        }

        # Check if the user already exists in the database via the REST API
        response = await api_client.post(endpoint="find", data=params)

        # If the user exists, return a 400 response
        if not response.get("documents"):
            result = "User doesn't exists!!!"
            # Log the duplicate registration attempt
            # utilities.add_log_to_db("register_user()", f"{result}={body.get('email')}")
            return JSONResponse(status_code=400, content={"message": result})

        # user password
        # created_user = response.get("documents", {}).get("password", "unknown")
        user_password = response.get("documents", [{}])[0].get("password", "unknown")

        # Check if the provided password matches the stored password
        passwordMatch = utilities.validate_password(user_password, body.get("password"))

        # Log the result of the password validation (true/false)
        # database.add_log("login()", f"passwordMatch={passwordMatch}")
        
        # If the passwords don't match, return a 400 response with an "Incorrect password" message
        if not passwordMatch:
            return JSONResponse(status_code=400, content="Incorrect password")

        user_id = response.get("documents", [{}])[0].get("_id", "unknown")

        # If the password matches, generate a JWT token for the user
        token = utilities.create_token(user_id, body.get("email"))
        
        # Return the generated token in a successful response
        return JSONResponse(content={"token": token}, status_code=200)
    
    except Exception as e:
        # In case of any error (e.g., database issues or unexpected errors), log the error
        # database.add_log("login_user()", f"Login user error: {e}", True)

        # Return a 500 Internal Server Error response with a generic error message
        return JSONResponse(status_code=500, content="Internal server error")

# Endpoint: Get all users
@auth_router.get("/list")
async def get_users(request: Request):
    """
    Retrieve all users from the database.

    This endpoint fetches all users from the database. If users are found, it returns
    a list of user details (name and role). If no users are found or an error occurs,
    it returns an appropriate error message.

    Returns:
        JSONResponse: A response containing the list of users or an error message.
    """
    try:
        # Parse the JSON body from the request
        # body = await request.json()

        # Prepare the payload for the REST API
        params = {
            "collection": USERS_COLLECTION,
            "query": {}  # Query to check if the user exists
        }

        # Check if the user already exists in the database via the REST API
        response = await api_client.post(endpoint="find", data=params)

        # If the user exists, return a 400 response
        if not response.get("documents"):
            result = "Doesn't exist any users!!!"
            # Log the duplicate registration attempt
            # utilities.add_log_to_db("register_user()", f"{result}={body.get('email')}")
            return JSONResponse(status_code=400, content={"message": []})
        
        # Return the list of users as a JSON response with a 200 OK status code
        return JSONResponse(content={"users": response.get("documents")}, status_code=200)

    except Exception as e:
        # Log the error and raise an HTTPException with a 500 status code
        # utilities.add_log_to_db("get_users()", f"Get users error: {e}", True)
        return JSONResponse(status_code=500, content="Internal server error")