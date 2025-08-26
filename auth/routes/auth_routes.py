"""
auth_routes.py

This file contains the routes for authentication-related operations, such as user registration,
login, and retrieving user information. These routes interact with the database via a REST API.

Endpoints:
    - /auth/register: Register a new user.
    - /auth/login: Authenticate a user and return a JWT token.
    - /auth/list: Retrieve a list of users or specific user details.

Dependencies:
    - FastAPI: Framework for building APIs.
    - httpx: For making REST API calls to the database.
    - dotenv: For loading environment variables.
    - Utilities: Custom utility functions for logging, password hashing, and token generation.
"""

import json
import os
from fastapi import APIRouter, Request, Response
from fastapi.responses import JSONResponse
from utils.bd_client import BDClient  # API client for database interactions

# Import custom utility modules
from utils import utilities  # General utilities

# Importing the User model from the models module
from models.user import User
from models.userlogin import UserLogin

from utils.config import USERS_COLLECTION, BD_BASE_URL

# Create a new router for authentication-related endpoints
auth_router = APIRouter()

# Instantiate the API client
api_client = BDClient(BD_BASE_URL)

# -------------------------------
# Endpoint: Register a new user
# -------------------------------
@auth_router.post("/register")
async def register(request: Request):
    """
    Endpoint to create a new user.

    This endpoint handles user registration by checking if the user already exists,
    encrypting the password, and inserting the new user into the database.

    Args:
        request (Request): The incoming HTTP request containing user details.

    Returns:
        JSONResponse: A response indicating success or failure.
    
    Possible Status Codes:
        - 201: User registered successfully.
        - 400: User already exists or invalid input.
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

        # log the request
        await utilities.add_log_to_db(api_client=api_client, source="auth_routes", method="register", message=json.dumps(params))

        # Check if the user already exists in the database via the REST API
        response = await api_client.find(endpoint="find", payload=params)

        # log the request
        await utilities.add_log_to_db(api_client=api_client, source="auth_routes", method="register", message=json.dumps(response))

        # If the user exists, return a 400 response
        if response.get("documents"):
            result = f"O utilizador com o email {body.get('email')} já se encontra registado!!!"
            # Log the duplicate registration attempt
            await utilities.add_log_to_db(api_client=api_client, source="auth_routes", method="register", message=result)

            return JSONResponse(status_code=400, content={"message":result})

        # Encrypt the user's password before storing it
        hashed_password = utilities.hash_password(body.get("password"))

        # Prepare the new user object
        new_user = {
            "name": body.get("name"),
            "email": body.get("email"),
            "password": hashed_password,
            "role": body.get("role", "user")
        }

        # Insert the new user into the database via the REST API
        insert_params = {
            "collection": USERS_COLLECTION,
            "data": new_user
        }
        
        insert_response = await api_client.insert(endpoint="insert", payload=insert_params)

        # log the request
        await utilities.add_log_to_db(api_client=api_client, source="auth_routes", method="register", message=json.dumps(insert_response))

        # Extract the created user ID from the response
        created_user = insert_response.get("id", "unknown")

        if created_user == "unknown":
            return JSONResponse(status_code=404, content={"message":f"Erro a registar o utilizador com o email {body.get("email")}!!!"})
        
        # Log the successful user registration
        await utilities.add_log_to_db(api_client=api_client, source="auth_routes", method="register", message=f"created_user={created_user}")

        # Return a success response
        return JSONResponse(
            content={"message":f"O utlizador com o email {body.get("email")} for registado com sucesso."},
            status_code=201
        )

    except Exception as e:
        # Handle unexpected errors
        errMessage = f"Error message:{e}"
        await utilities.add_log_to_db(api_client=api_client, source="auth_routes", method="register", message=errMessage)

        return JSONResponse(status_code=500, content={"message":errMessage})

# -------------------------------
# Endpoint: Login a user
# -------------------------------
@auth_router.post("/login", response_model=UserLogin)
async def login(request: Request, response: Response):
    """
    Endpoint for logging in a user.

    This endpoint validates the user's credentials, checks if the user exists in the database,
    and verifies the password. If successful, it generates a JWT token for the user.

    Args:
        request (Request): The incoming HTTP request containing user credentials.

    Returns:
        JSONResponse: A response containing either a JWT token (if login is successful) 
        or an error message (if there are issues with the login).

    Possible Status Codes:
        - 200: Login successful, token returned.
        - 400: User doesn't exist or incorrect password.
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

        await utilities.add_log_to_db(api_client=api_client, source="auth_routes", method="login", message=json.dumps(params))

        # Check if the user exists in the database via the REST API
        responseAdd = await api_client.find(endpoint="find", payload=params)

        # If the user doesn't exist, return a 400 responseAdd
        if not responseAdd.get("documents"):
            errMessage = f"O utilizador com o email {body.get("email")} não existe!!!"
            # Log the duplicate registration attempt
            await utilities.add_log_to_db(api_client=api_client, source="auth_routes", method="login", message=errMessage)
            return JSONResponse(status_code=400, content={"message": errMessage})

        # Retrieve the stored password from the database
        user_password = responseAdd.get("documents", [{}])[0].get("password", "unknown")

        # Check if the provided password matches the stored password
        passwordMatch = utilities.validate_password(user_password, body.get("password"))

        # If the passwords don't match, return a 400 responseAdd with an "Incorrect password" message
        if not passwordMatch:
            errMessage = f"O senha do utilizador com o email {body.get("email")} está incorreta!!!"
            await utilities.add_log_to_db(api_client=api_client, source="auth_routes", method="login", message=errMessage)
            return JSONResponse(status_code=400, content={"message": errMessage})

        # Retrieve the user ID
        user_id = responseAdd.get("documents", [{}])[0].get("_id", "unknown")

        # Generate a JWT token for the user
        token = utilities.create_token(user_id, body.get("email"))
        
        # get role
        role = responseAdd.get("documents", [{}])[0].get("role", "unknown")

        # Return the generated token
        return JSONResponse(status_code=200, content={"message": "Login realizado com sucesso.", "token": token, "role": role})
    
    except Exception as e:
        # Handle unexpected errors
        errMessage = f"Error message:{e}"
        await utilities.add_log_to_db(api_client=api_client, source="auth_routes", method="login", message=errMessage)
        return JSONResponse(status_code=500, content={"message": errMessage})

# -------------------------------
# Endpoint: Delete a user
# -------------------------------
@auth_router.post("/delete", response_model=UserLogin)
async def deleteUser(request: Request, response: Response):
    """
    Endpoint for delete user.

    This endpoint validates the user's credentials, checks if the user exists in the database,
    and verifies the password. If successful, it generates a JWT token for the user.

    Args:
        request (Request): The incoming HTTP request containing user credentials.

    Returns:
        JSONResponse: A response containing either a JWT token (if login is successful) 
        or an error message (if there are issues with the login).

    Possible Status Codes:
        - 200: Login successful, token returned.
        - 400: User doesn't exist or incorrect password.
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

        await utilities.add_log_to_db(api_client=api_client, source="auth_routes", method="delete", message=json.dumps(params))

        # Check if the user exists in the database via the REST API
        responseAdd = await api_client.find(endpoint="find", payload=params)

        # If the user doesn't exist, return a 400 responseAdd
        if not responseAdd.get("documents"):
            errMessage = f"O utilizador com o email {body.get("email")} não existe!!!"
            # Log the duplicate registration attempt
            await utilities.add_log_to_db(api_client=api_client, source="auth_routes", method="delete", message=errMessage)
            return JSONResponse(status_code=400, content={"message": errMessage})

        res = await api_client.delete(endpoint="delete", payload=params)

        # If the passwords don't match, return a 400 responseAdd with an "Incorrect password" message
        if not res:
            errMessage = f"Não foi possivel apagar o utilizador com o email {body.get("email")}!!!"
            await utilities.add_log_to_db(api_client=api_client, source="auth_routes", method="delete", message=errMessage)
            return JSONResponse(status_code=400, content={"message": errMessage})

        # Return the generated token
        return JSONResponse(status_code=200, content={"message": f"O utilizador com o email {body.get("email")} foi eliminado com sucesso!!!"})
    
    except Exception as e:
        # Handle unexpected errors
        errMessage = f"Error message:{e}"
        await utilities.add_log_to_db(api_client=api_client, source="auth_routes", method="delete", message=errMessage)
        return JSONResponse(status_code=500, content={"message": errMessage})

# -------------------------------
# Endpoint: Get all users
# -------------------------------
@auth_router.get("/list")
async def get_users(request: Request):
    """
    Retrieve all users from the database.

    This endpoint fetches all users from the database. If users are found, it returns
    a list of user details (name and role). If no users are found or an error occurs,
    it returns an appropriate error message.

    Args:
        request (Request): The incoming HTTP request.

    Returns:
        JSONResponse: A response containing the list of users or an error message.

    Possible Status Codes:
        - 200: Users retrieved successfully.
        - 400: No users found.
        - 500: Internal server error.
    """
    try:
        # Parse the JSON body from the request
        body = await request.json()

        id = False
        payload: dict = {}

        # Determine the query based on the request body
        if not body or body == {}:
            payload = {"collection": USERS_COLLECTION, "query": {}}
        # check if the body has the email key
        elif body.get("email"):
            payload = {"collection": USERS_COLLECTION, "query": {"email": body.get("email")}}

        # check if the body has the id key
        elif body.get("id"):
            payload = {"collection": USERS_COLLECTION, "query": {"id": body.get("id")}}

        await utilities.add_log_to_db(api_client=api_client, source="get_users", method="login", message=json.dumps(payload))

        if id:
            ## Query the database via the REST API
            response = await api_client.find_by_id(endpoint="find", payload=payload)
        else:
            # Query the database via the REST API
            response = await api_client.find(endpoint="find", payload=payload)

        # If no users are found, return a 400 response
        if not response.get("documents"):
            result = "Não foram encontrados utilizadores registados!!!"
            await utilities.add_log_to_db(api_client=api_client, source="get_users", method="login", message=result)
            return JSONResponse(status_code=400, content={"message": result})
        
        # Return the list of users
        return JSONResponse(content={"message": response.get("documents")}, status_code=200)

    except Exception as e:
        # Handle unexpected errors
        errMessage = f"Error message:{e}"
        await utilities.add_log_to_db(api_client=api_client, source="get_users", method="login", message=errMessage)
        return JSONResponse(status_code=500, content={"message":errMessage})
    