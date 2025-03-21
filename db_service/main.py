import os  # Import the os module to interact with environment variables
from fastapi import FastAPI  # Import FastAPI to create the application instance
from routes.db_routes import router  # Import the router from the db_routes module
from dotenv import load_dotenv  # Import dotenv to load environment variables from a .env file

# Load environment variables from the .env file at startup
# This allows sensitive information (e.g., database credentials) to be stored securely
load_dotenv()

# Create an instance of the FastAPI application
app = FastAPI()

# Register the database routes with the application
# - `prefix="/db"`: All routes in the router will be prefixed with `/db`
# - `tags=["Database"]`: Tags are used for grouping routes in the API documentation
app.include_router(router, prefix="/db", tags=["Database"])

# Entry point for the FastAPI application
if __name__ == "__main__":
    """
    This block checks if the script is being run directly (not imported as a module).
    If so, it starts the FastAPI application using Uvicorn as the ASGI server.

    Uvicorn is an ASGI server that serves FastAPI applications and handles asynchronous requests.

    The app will be available at: http://127.0.0.1:8000 (default settings)

    Environment Variables:
        - HOST: The IP address or hostname to bind the server to (default: 127.0.0.1).
        - PORT: The port to bind the server to (default: 8000).

    Arguments:
        - host (str): The IP address or hostname to bind the server to.
        - port (int): The port to bind the server to.
        - reload (bool): Enables automatic reloading of the app on code changes (useful for development).
    """
    import uvicorn  # Import Uvicorn to run the FastAPI application

    # Retrieve the host and port from environment variables, with default values
    host = os.getenv("HOST", "127.0.0.1")  # Default host is 127.0.0.1 (localhost)
    port = int(os.getenv("PORT", 8000))  # Default port is 8000

    # Print the host and port for debugging purposes
    print(f"Starting server on {host}:{port}")

    # Start the Uvicorn server to run the FastAPI application
    # The server will listen on the specified host and port
    # `reload=False` disables automatic reloading (useful for production)
    uvicorn.run("main:app", host=host, port=port, reload=False)

    # Uncomment the following line to enable SSL (HTTPS) with a key and certificate
    # uvicorn.run("main:app", host="127.0.0.1", port=8001, reload=True, ssl_keyfile="key.pem", ssl_certfile="cert.pem")
