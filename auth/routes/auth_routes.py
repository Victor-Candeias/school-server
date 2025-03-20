from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse

# Import custom utility modules
from utils.database import database  # Database handling utilities
from utils.logging import logging  # Logging utilities
from utils import utilities  # General utilities

# Importing the User model from the models module
from models.user import User
from models.userlogin import UserLogin

from config import USERS_COLLECTION

# Create a new router for authentication-related endpoints
auth_router = APIRouter()

# Create a new user
@auth_router.post("/register", response_model=User)
def register(user: User):
    """
    Endpoint to create a new user.

    Args:
        user (User): A Pydantic model containing user details (name, password, role).

    Returns:
        JSONResponse: A response indicating success or failure.
    
    Possible Status Codes:
        - 201: User registered successfully.
        - 400: Invalid input or user already exists.
        - 500: Internal server error.
    """
    try:
        # Check if the user already exists in the database
        user_exists = database.find(USERS_COLLECTION, {'email': user.email})
        if user_exists:
            result = "User already exists!!!"

            # Log the duplicate registration attempt
            utilities.add_log_to_db("register_user()", f"{result}={user.email}")

            return JSONResponse(status_code=400, content=result)

        # Encrypt the user's password before storing it
        hashed_password = utilities.hash_password(user.password)

        # Create a new user object
        new_user = {"name": user.name, "password": hashed_password, "email": user.email, "role": user.role}  
        
        # Insert the new user into the database and store the generated user ID
        created_user = str(database.insert(USERS_COLLECTION, new_user))

        # Log the successful user registration
        utilities.add_log_to_db("register_user()", f"created_user={created_user}")

        return JSONResponse(
            content={"message": "User registered successfully", "user": created_user}, 
            status_code=201
        )
    
    except Exception as e:
        # Log any errors that occur during registration
        utilities.add_log_to_db("register_user()", f"Registration error: {e}", True)

        return JSONResponse(status_code=500, content="Internal server error")

# Login a user and return a token
@auth_router.post("/login", response_model=UserLogin)
def login(user: UserLogin):
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
        # Log the username being attempted to login
        database.add_log("login()", f"useremail={user.email}")

        # Retrieve the user from the database by username
        dbUser = database.find(USERS_COLLECTION, {'email': user.email})

        # If no user is found in the database, return a 400 response with an error message
        if not dbUser or len(dbUser) == 0:
            # Log the failed login attempt due to user not found
            database.add_log("login()", "User not found")
            return JSONResponse(status_code=400, content="User not found")

        # Check if the provided password matches the stored password
        passwordMatch = utilities.validate_password(dbUser[0]['password'], user.password)

        # Log the result of the password validation (true/false)
        database.add_log("login()", f"passwordMatch={passwordMatch}")
        
        # If the passwords don't match, return a 400 response with an "Incorrect password" message
        if not passwordMatch:
            return JSONResponse(status_code=400, content="Incorrect password")

        # If the password matches, generate a JWT token for the user
        token = utilities.create_token(dbUser)
        
        # Return the generated token in a successful response
        return JSONResponse(content={"token": token}, status_code=200)
    
    except Exception as e:
        # In case of any error (e.g., database issues or unexpected errors), log the error
        database.add_log("login_user()", f"Login user error: {e}", True)

        # Return a 500 Internal Server Error response with a generic error message
        return JSONResponse(status_code=500, content="Internal server error")

# Endpoint: Get all users
@auth_router.get("/users", response_model=User)
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