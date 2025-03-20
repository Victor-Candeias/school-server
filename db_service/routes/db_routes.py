import logging
from dotenv import load_dotenv  # Load environment variables from a .env file
from fastapi import APIRouter, HTTPException  # Import FastAPI utilities for routing and error handling
from utils.database import database  # Database handling utilities
from pydantic import BaseModel

# Load environment variables from the .env file
# This ensures sensitive information (e.g., database credentials) is securely loaded
load_dotenv()

# Create a FastAPI router instance for defining API routes
router = APIRouter()

class InsertRequest(BaseModel):
    collection: str = ''
    data: dict = {}

class FindRequest(BaseModel):
    collection: str = ''
    query: dict = {}

class UpdateRequest(BaseModel):
    collection: str = ''
    id: str = ''
    query: dict = {}
    data: dict = {}

class DeleteRequest(BaseModel):
    collection: str = ''
    id: str = ''
    query: dict = {}

@router.post("/insert")
def insert_document(request: InsertRequest):
    """
    Insert a document into a specified MongoDB collection.

    Args:
        request (InsertRequest): The request body containing the collection name and data.

    Returns:
        dict: A success message and the ID of the inserted document.

    Raises:
        HTTPException: If an error occurs during the insertion process.
    """
    try:
        # Call the Database class's insert method to insert the document
        collection = request.collection
        data =  request.data

        logging.info(f"insert_document();collection={collection}")
        logging.info(f"insert_document();data={data}")

        inserted_id = database.insert(collection, data)  # Pass only collection and data
        return {"message": "Document inserted", "id": inserted_id}
    except Exception as e:
        # Raise an HTTP 500 error if an exception occurs
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/find")
def find_documents(request: FindRequest):
    """
    Retrieve documents from a specified MongoDB collection based on a query.

    Args:
        collection (str): The name of the MongoDB collection.
        query (dict, optional): The filter criteria for the query. Defaults to an empty dictionary.

    Returns:
        dict: A list of matching documents.

    Raises:
        HTTPException: If an error occurs during the retrieval process.
    """
    try:
        collection = request.collection
        query =  request.query

        logging.info(f"find_documents();collection={collection}")
        logging.info(f"find_documents();data={query}")

        # Call the Database class's find method to retrieve documents
        documents = database.find(collection, query)

        return {"documents": documents}
    except Exception as e:
        # Raise an HTTP 500 error if an exception occurs
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/update")
def update_document(request: UpdateRequest):
    """
    Update documents in a specified MongoDB collection based on a query.

    Args:
        collection (str): The name of the MongoDB collection.
        query (dict): The filter criteria for selecting documents to update.
        update_data (dict): The data to update the selected documents with.

    Returns:
        dict: A success message and the number of modified documents.

    Raises:
        HTTPException: If an error occurs during the update process.
    """
    try:
        collection = request.collection
        id = request.id
        query =  request.query
        data = request.data

        logging.info(f"find_documents();collection={collection}")
        logging.info(f"find_documents();id={id}")
        logging.info(f"find_documents();data={query}")
        logging.info(f"find_documents();data={data}")

        # Call the Database class's update method to update documents
        modified_count = database.update(collection, id, query, data)
        return {"message": "Document updated", "modified_count": modified_count}
    except Exception as e:
        # Raise an HTTP 500 error if an exception occurs
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/delete")
def delete_document(request: DeleteRequest):
    """
    Delete documents from a specified MongoDB collection based on a query.

    Args:
        collection (str): The name of the MongoDB collection.
        query (dict): The filter criteria for selecting documents to delete.

    Returns:
        dict: A success message and the number of deleted documents.

    Raises:
        HTTPException: If an error occurs during the deletion process.
    """
    try:
        collection = request.collection
        id = request.id
        query = request.query

        logging.info(f"find_documents();collection={collection}")
        logging.info(f"insert_document();id={id}")
        logging.info(f"find_documents();data={query}")

        # Call the Database class's delete method to delete documents
        deleted_count = database.delete(collection, id, query)

        return {"message": "Document deleted", "deleted_count": deleted_count}
    except Exception as e:
        # Raise an HTTP 500 error if an exception occurs
        raise HTTPException(status_code=500, detail=str(e))