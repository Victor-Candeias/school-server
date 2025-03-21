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
import os
from fastapi import FastAPI
# Import HTTPS redirect middleware
# from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware

# Add HTTPS redirect middleware to enforce HTTPS
app = FastAPI()
# app.add_middleware(HTTPSRedirectMiddleware)

# Import route modules
from routes.auth_routes import auth_router

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

# Run the FastAPI app with Uvicorn
if __name__ == "__main__":
    """
    Entry point for the FastAPI application.

    This block checks if the script is being run directly (not imported as a module).
    If so, it starts the FastAPI application using Uvicorn as the ASGI server.

    Uvicorn is an ASGI server that serves FastAPI applications and handles asynchronous requests.

    The app will be available at: https://127.0.0.1:8010

    Arguments:
        - host (str): The IP address or hostname to bind the server to (default: 127.0.0.1).
        - port (int): The port to bind the server to (default: 8010).
        - reload (bool): Enables automatic reloading of the app on code changes (useful for development).
    """
    import uvicorn
    
    # Retrieve the host and port from environment variables, with default values
    host = os.getenv("HOST", "127.0.0.1")  # Default host is 127.0.0.1 (localhost)
    port = int(os.getenv("PORT", 8010))  # Default port is 8010

    # Print the host and port for debugging purposes
    print(host)
    print(port)

    # Start the Uvicorn server to run the FastAPI application
    # The server will listen on the specified host and portcls
    uvicorn.run("main:app", host=host, port=port, reload=False)
    # uvicorn.run("main:app", host="127.0.0.1", port=8001, reload=True, ssl_keyfile="key.pem", ssl_certfile="cert.pem")
