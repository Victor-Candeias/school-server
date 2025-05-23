"""
main.py

This is the entry point for the FastAPI application. It initializes the FastAPI app,
includes route modules, and starts the Uvicorn server for handling HTTP requests.

Routes:
    - /auth: Handles authentication-related operations (e.g., login, registration).

Environment Variables:
    - Loaded from a .env file using the dotenv library.
    - HOST: The IP address or hostname to bind the server to (default: 127.0.0.1).
    - PORT: The port to bind the server to (default: 8010).
"""

# Import FastAPI framework
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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

# Defina as origens permitidas (pode ser específico ou "*")
origins = [
    "http://localhost:3000",  # Next.js em desenvolvimento
    "http://127.0.0.1:3000",
    "http://localhost:3001",  # Next.js em desenvolvimento
    "http://127.0.0.1:3001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Permite apenas essas origens
    allow_credentials=True,  # Permite cookies
    allow_methods=["*"],  # Permite todos os métodos (GET, POST, etc.)
    allow_headers=["*"],  # Permite todos os headers
)

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

    The app will be available at: http://127.0.0.1:8010 (default).

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
    print(f"Starting server on {host}:{port}")

    # Start the Uvicorn server to run the FastAPI application
    uvicorn.run("main:app", host=host, port=port, reload=False)
# End of main.py