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
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Import route modules
from routes.auth_routes import auth_router
from routes.schools_router import schools_router
from routes.years_routes import years_router
from routes.class_routes import class_router
from routes.students_routes import students_router
from routes.class_tests_router import school_tests_router

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

# Include the clases routes
# These routes handle user authentication, such as login and registration
app.include_router(auth_router, prefix="/auth", tags=["auth"])

# These routes handle operations related to classes management
app.include_router(schools_router, prefix="/schools", tags=["schools"])

# These routes handle operations related to years management
app.include_router(years_router, prefix="/years", tags=["years"])

# These routes handle operations related to classes management
app.include_router(class_router, prefix="/class", tags=["classes"])

# Include the students routes
# These routes handle operations related to students management
app.include_router(students_router, prefix="/students", tags=["students"])

app.include_router(school_tests_router, prefix="/config", tags=["configurations"])

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
    port = int(os.getenv("PORT", 8020))  # Default port is 8010

    # Print the host and port for debugging purposes
    print(f"Starting server on {host}:{port}")

    # Start the Uvicorn server to run the FastAPI application
    uvicorn.run("main:app", host=host, port=port, reload=False)
# End of main.py
