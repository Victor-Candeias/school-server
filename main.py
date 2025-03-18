"""
main.py

This is the entry point for the FastAPI application. It initializes the FastAPI app,
includes route modules, and starts the Uvicorn server for handling HTTP requests.

Routes:
    - /auth: Handles authentication-related operations (e.g., login, registration).
    - /data: Handles data-related operations.

Environment Variables:
    - Loaded from a .env file using the dotenv library.
"""

# Import FastAPI framework
from fastapi import FastAPI
# Import HTTPS redirect middleware
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware

# Add HTTPS redirect middleware to enforce HTTPS
app = FastAPI()
app.add_middleware(HTTPSRedirectMiddleware)

# Import route modules
from routes.auth_routes import auth_router
from routes.data_routes import data_router
from routes.class_routes import class_router

# Import environment variable loader
from dotenv import load_dotenv

# Load environment variables from the .env file at startup
# This allows sensitive information (e.g., database credentials) to be stored securely
load_dotenv()

# Initialize the FastAPI application
# This creates the main app instance that will handle all incoming requests
app = FastAPI()

# Include the authentication routes
# These routes handle user authentication, such as login and registration
app.include_router(auth_router, prefix="/auth", tags=["auth"])

# Include the data routes
# These routes handle operations related to data management
app.include_router(data_router, prefix="/data", tags=["data"])

# Include the clases routes
# These routes handle operations related to data management
app.include_router(class_router, prefix="/class", tags=["classes"])

# Run the FastAPI app with Uvicorn
if __name__ == "__main__":
    """
    Entry point for the FastAPI application.

    This block checks if the script is being run directly (not imported as a module).
    If so, it starts the FastAPI application using Uvicorn as the ASGI server.

    Uvicorn is an ASGI server that serves FastAPI applications and handles asynchronous requests.

    The app will be available at: https://127.0.0.1:8001

    Arguments:
        - host (str): The IP address or hostname to bind the server to (default: 127.0.0.1).
        - port (int): The port to bind the server to (default: 8001).
        - reload (bool): Enables automatic reloading of the app on code changes (useful for development).
    """
    import uvicorn

    # Start the Uvicorn server to run the FastAPI application
    # The server will listen on the specified host and portcls
    # uvicorn.run("main:app", host="127.0.0.1", port=8001, reload=True)
    uvicorn.run("main:app", host="127.0.0.1", port=8001, reload=True, ssl_keyfile="key.pem", ssl_certfile="cert.pem")
