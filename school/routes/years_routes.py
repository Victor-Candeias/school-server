from fastapi import APIRouter, Request

# Import custom utility modules
from utils.bd_client import BDClient  # Database handling utilities
from utils import utilities  # General utilities

from utils.config import YEARS_COLLECTION,BD_BASE_URL

# Create a new router for data-related endpoints
years_router = APIRouter()

# Instantiate the API client
api_client = BDClient(BD_BASE_URL)

# Endpoint: Get all users
# curl -X GET http://127.0.0.1:8001/class/find -H  "Content-Type: application/json" -d "{}"
# curl -X GET http://127.0.0.1:8001/class/find -H  "Content-Type: application/json" -d "{ \"level\": 6, \"class\": \"A\" }"
@years_router.post("/find")
async def find_years(request: Request):
    return await utilities.get_documents(api_client=api_client, endpoint="find", request=request, collection=YEARS_COLLECTION, source="years_router", method="find_years")

# Endpoint: Get all users
# curl -X GET http://127.0.0.1:8001/class/findbyid -H  "Content-Type: application/json" -d "{ \"id\": \"67e32c8bf97d9bb2e993e50d\" }"
@years_router.post("/findbyid")
async def findbyid_years(request: Request):
    return await utilities.get_documents(api_client=api_client, endpoint="find", request=request, collection=YEARS_COLLECTION, source="years_router", method="findbyid_years")

# curl -X POST http://127.0.0.1:8001/class/add -H  "Content-Type: application/json" -d "{ \"userid\": \"67e32c8bf97d9bb2e993e50d\", \"level\": 6, \"class\": \"A\" }"
@years_router.post("/add")
async def add_year(request: Request):
    return await utilities.add_document(api_client=api_client, request=request, collection=YEARS_COLLECTION, source="years_router", method="add_year")
