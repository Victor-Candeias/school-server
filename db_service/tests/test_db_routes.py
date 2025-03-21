import json
import sys
import os

# Add the project root directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pytest
from fastapi.testclient import TestClient
from main import app  # Import the FastAPI app from the main module

# Create a TestClient instance for the FastAPI app
client = TestClient(app)

# Mock the Database class to avoid interacting with the actual database
from utils.database import Database
from unittest.mock import MagicMock

@pytest.fixture(autouse=True)
def mock_database():
    """
    Automatically mock the Database class for all tests.
    """
    Database.insert = MagicMock(return_value="mocked_id")
    Database.find = MagicMock(return_value=[{"_id": "mocked_id", "name": "test"}])
    Database.update = MagicMock(return_value=1)
    Database.delete = MagicMock(return_value=1)

def test_insert_document():
    """
    Test the /insert route for inserting a document.
    """
    response = client.post("/db/insert", json={"collection": "test_collection", "data": {"name": "test_document"}})
    assert response.status_code == 200
    assert response.json() == {"message": "Document inserted", "id": "mocked_id"}

def test_find_documents():
    """
    Test the /find route for retrieving documents.
    """
    response = client.post(
        "/db/find",
        json={
            "collection": "test_collection",
            "query": {"name": "test_document"}
        }
    )
    assert response.status_code == 200
    assert response.json() == {"documents": [{"_id": "mocked_id", "name": "test"}]}

def test_find_all_documents():
    """
    Test the /find route for retrieving documents.
    """
    response = client.post(
        "/db/find",
        json={
            "collection": "test_collection",
        }
    )
    assert response.status_code == 200
    assert response.json() == {"documents": [{"_id": "mocked_id", "name": "test"}]}

def test_update_document():
    """
    Test the /update route for updating a document.
    """
    response = client.put(
        "/db/update",
        json={  # Enviar os dados no corpo da requisição
            "collection": "test_collection",
            "query": {"name": "test_document"},
            "data": {"name": "updated_document"}
        },
    )

    assert response.status_code == 200
    assert response.json() == {"message": "Document updated", "modified_count": 1}

def test_delete_document():
    """
    Test the /delete route for deleting a document.
    """
    response = client.request(
        "DELETE",  # Especificar o método DELETE
        "/db/delete",
        json={  # Enviar os dados no corpo da requisição como JSON
            "collection": "test_collection",
            "query": {"name": "updated_document"}
        },
    )

    assert response.status_code == 200
    assert response.json() == {"message": "Document deleted", "deleted_count": 1}