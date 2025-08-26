"""
bd_client.py

This file contains the BDClient class, which provides methods for interacting with a REST API
that performs database operations such as inserting, finding, updating, and deleting documents.

The BDClient class uses the `httpx` library to make asynchronous HTTP requests to the API.

Methods:
    - insert: Insert a new document into the database.
    - find: Find documents in the database based on a query.
    - find_by_id: Find a specific document in the database by its ID.
    - update: Update an existing document in the database.
    - delete: Delete a document from the database.

Dependencies:
    - httpx: For making asynchronous HTTP requests.
    - json: For serializing and deserializing JSON data.
    - typing: For type annotations (Dict, Any, Optional).
"""

import json
import httpx
from typing import Optional, Dict, Any

class BDClient:
    """
    A client for interacting with a REST API for database operations.

    Args:
        base_url (str): The base URL of the REST API.
    """
    def __init__(self, base_url: str):
        self.base_url = base_url

    async def insert(self, endpoint: str, payload: Optional[Dict[str, Any]] = None):
        """
        Insert a new document into the database.

        Args:
            endpoint (str): The API endpoint for the insert operation (e.g., "/db/insert").
            payload (Dict[str, Any]): The data to insert into the database.

        Returns:
            Dict[str, Any]: The JSON response from the API.
        """
        if payload is None:
            payload = {}

        url = f"{self.base_url}/{endpoint}"

        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(url, json=payload)
                print("Insert Document Response:", response.status_code, response.json())

                # Raise an exception for any HTTP errors
                response.raise_for_status()
                return response.json()
            except Exception as e:
                # Log the error and return an empty response
                print(f"Error in insert(): {e}")
                return {}
            
    async def find(self, endpoint: str, payload: Optional[Dict[str, Any]] = None):
        """
        Find documents in the database based on a query.

        Args:
            endpoint (str): The API endpoint for the find operation (e.g., "/db/find").
            payload (Dict[str, Any]): The query to use for finding documents.

        Returns:
            Dict[str, Any]: The JSON response from the API.
        """
        if payload is None:
            payload = {}
        
        url = f"{self.base_url}/{endpoint}"

        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(url, json=payload)
                print("Find Documents Response:", response.status_code, response.json())

                # Raise an exception for any HTTP errors
                response.raise_for_status()
                return response.json()
            except Exception as e:
                # Log the error and return an empty response
                print(f"Error in find(): {e}")
                return {}

    async def find_by_id(self, endpoint: str, payload: Optional[Dict[str, Any]] = None):
        """
        Find a specific document in the database by its ID.

        Args:
            endpoint (str): The API endpoint for the find operation (e.g., "/db/find_by_id").
            payload (Dict[str, Any]): The query containing the document ID.

        Returns:
            Dict[str, Any]: The JSON response from the API.
        """
        if payload is None:
            payload = {}

        url = f"{self.base_url}/{endpoint}"

        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(url, json=payload)
                print("Find Document by ID Response:", response.status_code, response.json())

                # Raise an exception for any HTTP errors
                response.raise_for_status()
                return response.json()
            except Exception as e:
                # Log the error and return an empty response
                print(f"Error in find_by_id(): {e}")
                return {}

    async def update(self, endpoint: str, payload: Optional[Dict[str, Any]] = None):
        """
        Update an existing document in the database.

        Args:
            endpoint (str): The API endpoint for the update operation (e.g., "/db/update").
            payload (Dict[str, Any]): The data to update in the database.

        Returns:
            Dict[str, Any]: The JSON response from the API.
        """
        if payload is None:
            payload = {}

        url = f"{self.base_url}/{endpoint}"

        async with httpx.AsyncClient() as client:
            try:
                response = await client.put(url, json=payload)
                print("Update Document Response:", response.status_code, response.json())

                # Raise an exception for any HTTP errors
                response.raise_for_status()
                return response.json()
            except Exception as e:
                # Log the error and return an empty response
                print(f"Error in update(): {e}")
                return {}
            
    async def delete(self, endpoint: str, payload: Optional[Dict[str, Any]] = None):
        """
        Delete a document from the database.

        Args:
            endpoint (str): The API endpoint for the delete operation (e.g., "/db/delete").
            payload (Dict[str, Any]): The query to identify the document to delete.

        Returns:
            Dict[str, Any]: The JSON response from the API.
        """
        if payload is None:
            payload = {}
            
        url = f"{self.base_url}/{endpoint}"

        async with httpx.AsyncClient() as client:
            try:
                response = await client.request("DELETE", url, content=json.dumps(payload))  # Use request with content
                print("Delete Document Response:", response.status_code, response.json())

                # Raise an exception for any HTTP errors
                response.raise_for_status()
                return response.json()
            except Exception as e:
                # Log the error and return an empty response
                print(f"Error in delete(): {e}")
                return {}
