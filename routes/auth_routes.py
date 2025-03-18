from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse

# Import custom utility modules
from utils.database import database  # Database handling utilities
from utils.logging import logging  # Logging utilities
from utils import utilities  # General utilities

# Importing the User model from the models module
from models.user import User
from models.userlogin import UserLogin

# Create a new router for authentication-related endpoints
auth_router = APIRouter()

# Create a new user
@auth_router.post("/register")
def register_user(user: User):
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
        # Validate input: Ensure all required fields are provided
        if not user.name or not user.password or not user.role:
            # Log the registration attempt
            # database.add_log("register_user()", "Invalid input")
            utilities.add_log_to_db("register_user()", "Invalid input")

            # return JSONResponse(content={"error": "Invalid input"}, status_code=400)
            HTTPException(status_code=400, detail="Invalid input")

        # Check if the user already exists in the database
        user_exists = database.get_user({'name': user.name})
        if user_exists:
            result = "User already exists!!!"

            # Log the duplicate registration attempt
            # database.add_log("register_user()", f"{result}={user.name}")
            utilities.add_log_to_db("register_user()", f"{result}={user.name}")

            HTTPException(status_code=400, detail=result)

        # Encrypt the user's password before storing it
        hashed_password = utilities.hash_password(user.password)

        # Create a new user object
        new_user = {"name": user.name, "password": hashed_password, "role": user.role}  
        
        # Insert the new user into the database and store the generated user ID
        created_user = str(database.add_user(new_user))

        # Log the successful user registration
        # database.add_log("register_user()", f"created_user={created_user}")
        utilities.add_log_to_db("register_user()", f"created_user={created_user}")

        return JSONResponse(
            content={"message": "User registered successfully", "user": created_user}, 
            status_code=201
        )
    
    except Exception as e:
        # Log any errors that occur during registration
        # database.add_log("register_user()", f"Registration error: {e}", True)
        utilities.add_log_to_db("register_user()", f"Registration error: {e}", True)

        raise HTTPException(status_code=500, detail="Internal server error")

# Login a user and return a token
@auth_router.post("/login")
def login_user(user: UserLogin):
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
        # Validate input: Ensure all required fields (username and password) are provided
        if not user.name or not user.password:
            # Log the invalid login attempt
            database.add_log("login()", "Invalid input")

            # Return a 400 Bad Request response with an error message
            # return JSONResponse(content={"error": "Invalid input"}, status_code=400)
            raise HTTPException(status_code=400, detail="Invalid input")

        # Log the username being attempted to login
        database.add_log("login()", f"user_id={user.name}")

        # Retrieve the user from the database by username
        dbUser = database.get_user({'name': user.name})

        # If no user is found in the database, return a 400 response with an error message
        if not dbUser or len(dbUser) == 0:
            # Log the failed login attempt due to user not found
            database.add_log("login()", "User not found")
            raise HTTPException(status_code=400, detail="User not found")
            # return JSONResponse(content={"message": "User not found"}, status_code=400)

        # Check if the provided password matches the stored password
        passwordMatch = utilities.validate_password(dbUser[0]['password'], user.password)

        # Log the result of the password validation (true/false)
        database.add_log("login()", f"passwordMatch={passwordMatch}")
        
        # If the passwords don't match, return a 400 response with an "Incorrect password" message
        if not passwordMatch:
            # return JSONResponse(content={"message": "Incorrect password"}, status_code=400)
            raise HTTPException(status_code=400, detail="Incorrect password")

        # If the password matches, generate a JWT token for the user
        token = utilities.create_token(dbUser)
        
        # Return the generated token in a successful response
        return JSONResponse(content={"token": token}, status_code=200)
    
    except Exception as e:
        # In case of any error (e.g., database issues or unexpected errors), log the error
        database.add_log("login_user()", f"Login user error: {e}", True)

        # Return a 500 Internal Server Error response with a generic error message
        # return JSONResponse(content={"message": "Internal server error"}, status_code=500)
        raise HTTPException(status_code=500, detail="Internal server error")
