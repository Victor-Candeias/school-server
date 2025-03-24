from datetime import datetime
import logging
import os
from pathlib import Path
from dotenv import load_dotenv  # Load environment variables from a .env file
from fastapi import APIRouter, HTTPException, Request  # Import FastAPI utilities for routing and error handling
from utils.database import database  # Database handling utilities
from utils.logging import logging  # Custom logging utility
from pydantic import BaseModel

# Load environment variables from the .env file
# This ensures sensitive information (e.g., database credentials) is securely loaded
load_dotenv()

# Create a FastAPI router instance for defining API routes
router = APIRouter()

@router.post("/insert")
async def insert_document(request: Request):
    """
    Insert a document into a specified MongoDB collection.

    Args:
        request (Request): The raw JSON body of the request, containing the collection name and data.

    Returns:
        dict: A success message and the ID of the inserted document.

    Raises:
        HTTPException: If the collection name or data is missing, or if an error occurs during the insertion process.
    """
    try:
        # Parse the JSON body from the request
        body = await request.json()
        collection = body.get("collection")  # Extract the collection name
        data = body.get("data")  # Extract the document data

        if not collection or not data:
            raise HTTPException(status_code=400, detail="Both 'collection' and 'data' are required.")

        logging.info(f"insert_document();collection={collection}")
        logging.info(f"insert_document();data={data}")

        # Call the Database class's insert method to insert the document
        inserted_id = database.insert(collection, data)
        return {"message": "Document inserted", "id": inserted_id}
    except Exception as e:
        # Raise an HTTP 500 error if an exception occurs
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/find")
async def find_documents(request: Request):
    """
    Retrieve documents from a specified MongoDB collection based on a query.

    Args:
        request (Request): The raw JSON body of the request, containing the collection name and query.

    Returns:
        dict: A list of matching documents.

    Raises:
        HTTPException: If the collection name is missing, or if an error occurs during the retrieval process.
    """
    try:
        # Parse the JSON body from the request
        body = await request.json()
        collection = body.get("collection")  # Extract the collection name
        query = body.get("query") or {}  # Extract the query, default to an empty dictionary

        if not collection:
            raise HTTPException(status_code=400, detail="The 'collection' field is required.")

        logging.info(f"find_documents();collection={collection}")
        logging.info(f"find_documents();query={query}")

        # Call the Database class's find method to retrieve documents
        documents = database.find(collection_name=collection, filter=query)

        return {"documents": documents}
    except Exception as e:
        # Raise an HTTP 500 error if an exception occurs
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/findbyid")
async def find_documents_by_id(request: Request):
    """
    Retrieve a document from a specified MongoDB collection by its ID.

    Args:
        request (Request): The raw JSON body of the request, containing the collection name and document ID.

    Returns:
        dict: The matching document.

    Raises:
        HTTPException: If the collection name or ID is missing, or if an error occurs during the retrieval process.
    """
    try:
        # Parse the JSON body from the request
        body = await request.json()
        collection = body.get("collection")  # Extract the collection name
        id = body.get("id")  # Extract the document ID

        if not collection or not id:
            raise HTTPException(status_code=400, detail="Both 'collection' and 'id' are required.")

        logging.info(f"find_documents_by_id();collection={collection}")
        logging.info(f"find_documents_by_id();id={id}")

        # Call the Database class's find method to retrieve the document
        documents = database.find(collection_name=collection, id=id)

        return {"documents": documents}
    except Exception as e:
        # Raise an HTTP 500 error if an exception occurs
        raise HTTPException(status_code=500, detail=str(e))
    
@router.put("/update")
async def update_document(request: Request):
    """
    Update documents in a specified MongoDB collection based on a query.

    Args:
        request (Request): The raw JSON body of the request, containing the collection name, query, and update data.

    Returns:
        dict: A success message and the number of modified documents.

    Raises:
        HTTPException: If the collection name, query, or update data is missing, or if an error occurs during the update process.
    """
    try:
        # Parse the JSON body from the request
        body = await request.json()
        collection = body.get("collection")  # Extract the collection name
        id = body.get("id")  # Extract the document ID
        query = body.get("query") or {}  # Extract the query, default to an empty dictionary
        data = body.get("data")  # Extract the update data

        if not collection or (not id and not query) or not data:
            raise HTTPException(status_code=400, detail="The 'collection', 'query', and 'data' fields are required.")

        logging.info(f"update_document();collection={collection}")
        logging.info(f"update_document();id={id}")
        logging.info(f"update_document();query={query}")
        logging.info(f"update_document();data={data}")

        # Call the Database class's update method to update documents
        modified_count = database.update(collection, id, query, data)
        return {"message": "Document updated", "modified_count": modified_count}
    except Exception as e:
        # Raise an HTTP 500 error if an exception occurs
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/delete")
async def delete_document(request: Request):
    """
    Delete documents from a specified MongoDB collection based on a query.

    Args:
        request (Request): The raw JSON body of the request, containing the collection name and query.

    Returns:
        dict: A success message and the number of deleted documents.

    Raises:
        HTTPException: If the collection name or query is missing, or if an error occurs during the deletion process.
    """
    try:
        # Parse the JSON body from the request
        body = await request.json()
        collection = body.get("collection")  # Extract the collection name
        id = body.get("id")  # Extract the document ID
        query = body.get("query") or {}  # Extract the query, default to an empty dictionary

        if not collection or (not id and not query):
            raise HTTPException(status_code=400, detail="The 'collection' and 'query' fields are required.")

        logging.info(f"delete_document();collection={collection}")
        logging.info(f"delete_document();id={id}")
        logging.info(f"delete_document();query={query}")

        # Call the Database class's delete method to delete documents
        deleted_count = database.delete(collection, id, query)

        return {"message": "Document deleted", "deleted_count": deleted_count}
    except Exception as e:
        # Raise an HTTP 500 error if an exception occurs
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/log")
async def log(request: Request):
    """
    Insert a document into a specified MongoDB collection.

    Args:
        request (Request): The raw JSON body of the request, containing the collection name and data.

    Returns:
        dict: A success message and the ID of the inserted document.

    Raises:
        HTTPException: If the collection name or data is missing, or if an error occurs during the insertion process. 
    """
    try:
        # Parse the JSON body from the request
        body = await request.json()
        collection = body.get("collection")  # Extract the collection name
        source = body.get("source")  # Extract the document data
        logtype = body.get("logtype")  # Extract the document data
        logLevel = body.get("level")  # Extract the document data
        log_file_name = body.get("log_file_name", "default.log")  # Optional log file name

        # "timestamp": "2025-03-21T12:34:56.789Z",

        if not collection or not source or not logtype or not logLevel:
            raise HTTPException(status_code=400, detail="Both 'collection' and 'source' and 'logtype' and 'logLevel' are required.")

        logging.info(f"insert_document();collection={collection}")
        logging.info(f"insert_document();source={source}")
        logging.info(f"insert_document();logtype={logtype}")

        message = f"{body.get("timestamp")};{body.get("source")};{body.get("message")}"

        # checks if the logtype is db or file
        if logtype == 'db':
            # Call the Database class's insert method to insert the document
            inserted_id = database.log_to_mongodb(collection, logLevel, message, body.get("extra"))

            return {"message": "Document inserted", "id": inserted_id}
        else:
            # Change the log file dynamically
            change_log_file(log_file_name)
            
            # cahnge message
            message = f"{message};extra={body.get('extra')}"
            # Call the Database class's insert method to insert the document
            match logLevel:
                case "INFO":
                    logging.info(f"insert_document();{message}")

                case "ERROR":
                    logging.error(f"insert_document();{message}")   

                case "WARNING":
                    logging.warning(f"insert_document();{message}") 

                case "DEBUG":
                    logging.debug(f"insert_document();{message}")

                case "CRITICAL":
                    logging.critical(f"insert_document();{message}")    

                case _:  # default
                    logging.info(f"insert_document();{message}")

            return {"message": "Document inserted in log file"}
    
    except Exception as e:
        # Raise an HTTP 500 error if an exception occurs
        raise HTTPException(status_code=500, detail=str(e))
    
def change_log_file(log_file_name: str):
    """
    Change the log file dynamically at runtime.

    Args:
        log_file_name (str): The new log file name.
    """
    # Define the log directory path
    log_directory = os.path.join(Path.cwd(), 'log')

    # Ensure the log directory exists. If not, create it.
    os.makedirs(log_directory, exist_ok=True)
    
    # Add a timestamp to the log file name
    log_file_name = datetime.now().strftime('%Y%m%d') + '_' + log_file_name

    # Check if the file name has an extension
    if not os.path.splitext(log_file_name)[1]:  # The second element is the extension
        log_file_name += ".log"  # Add a default extension if none exists

    # Define the full log file path
    log_file_path = os.path.join(log_directory, log_file_name)

    # Remove all existing handlers
    for handler in logging.root.handlers[:]:
        logging.root.removeHandler(handler)

    # Add a new FileHandler with the new log file path
    logging.basicConfig(
        filename=log_file_path,
        filemode='a',  # Append mode
        format='%(asctime)s - %(levelname)s - %(message)s',
        level=logging.INFO
    )
    