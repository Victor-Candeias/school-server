from fastapi import APIRouter, Request
from httpx import request

# Import custom utility modules
from utils.bd_client import BDClient  # Database handling utilities
from utils import utilities  # General utilities

from utils.config import STUDENTS_COLLECTION,BD_BASE_URL

# Create a new router for data-related endpoints
students_router = APIRouter()

# Instantiate the API client
api_client = BDClient(BD_BASE_URL)

# Endpoint: Get all students
# curl -X GET http://127.0.0.1:8001/students/list -H  "Content-Type: application/json" -d "{ }"
# curl -X GET http://127.0.0.1:8001/students/list -H  "Content-Type: application/json" -d "{\"classid\":\"67e32c8bf97d9bb2e993e50d\" }"
@students_router.get("/list")
async def get_class_students(request: Request):
    return await utilities.get_documents(api_client=api_client, endpoint="find", request=request, collection=STUDENTS_COLLECTION, source="students_routes", method="get_class_students")

# Endpoint: Get all students by id
# curl -X GET http://127.0.0.1:8001/students/listbyid -H  "Content-Type: application/json" -d "{ \"id\": \"67e33ae5f97d9bb2e993e517\" }"
@students_router.get("/listbyid")
async def get_class_students(request: Request):
    return await utilities.get_documents(api_client=api_client,endpoint ="findbyid", request=request, collection=STUDENTS_COLLECTION, source="students_routes", method="get_class_students")

# curl -X POST http://127.0.0.1:8001/students/add -H "Content-Type: application/json" -d "{ \"classid\": \"67e32c8bf97d9bb2e993e50d\", \"id\": \"1\", \"name\": \"nome aluno\", \"email\": \"aluno@ctt.pt\" }"
@students_router.post("/add")
async def add_class_student(request: Request):
    return await utilities.add_document(api_client=api_client, request=request, collection=STUDENTS_COLLECTION, source="students_routes", method="add_class_student")
