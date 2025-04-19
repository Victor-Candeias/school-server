from fastapi import APIRouter, Depends, Request

# Import custom utility modules
from utils.bd_client import BDClient  # Database handling utilities
from utils import utilities  # General utilities

from utils.config import CLASSES_COLLECTION,BD_BASE_URL

# Create a new router for data-related endpoints
class_router = APIRouter()

# Instantiate the API client
api_client = BDClient(BD_BASE_URL)

# Endpoint: Get all users
# curl -X GET http://127.0.0.1:8001/class/find -H  "Content-Type: application/json" -d "{}"
# curl -X GET http://127.0.0.1:8001/class/find -H  "Content-Type: application/json" -d "{ \"level\": 6, \"class\": \"A\" }"
@class_router.post("/find")
async def find_classes(request: Request):
    return await utilities.get_documents(api_client=api_client, endpoint="find", request=request, collection=CLASSES_COLLECTION, source="class_routes", method="find_classes")

# Endpoint: Get all users
# curl -X GET http://127.0.0.1:8001/class/findbyid -H  "Content-Type: application/json" -d "{ \"id\": \"67e32c8bf97d9bb2e993e50d\" }"
@class_router.get("/findbyid")
async def findbyid_classes(request: Request):
    return await utilities.get_documents(api_client=api_client, endpoint="find", request=request, collection=CLASSES_COLLECTION, source="class_routes", method="findbyid_classes")

# curl -X POST http://127.0.0.1:8001/class/add -H  "Content-Type: application/json" -d "{ \"userid\": \"67e32c8bf97d9bb2e993e50d\", \"level\": 6, \"class\": \"A\" }"
@class_router.post("/add")
async def add_class(request: Request):
    return await utilities.add_document(api_client=api_client, request=request, collection=CLASSES_COLLECTION, source="class_routes", method="add_class")

# curl -X GET http://127.0.0.1:8001/class/levels -H  "Content-Type: application/json"
@class_router.get("/levels")
def get_levels():
    """
    Retrieves a list of fixed level values from the LevelEnum.

    This endpoint returns a list of predefined levels that do not change over time.
    It fetches the values using the `returnLevels` method from the `utilities` module.

    Returns:
        list: A JSON list containing the available levels.

    Example Response:
        HTTP/1.1 200 OK
        Content-Type: application/json
        [
            "7",
            "8",
            "9",
            "10",
            "11",
            "12"
        ]
    """
    return utilities.returnLevels()