from fastapi import APIRouter, Request
from httpx import request

# Import custom utility modules
from utils.bd_client import BDClient  # Database handling utilities
from utils import utilities  # General utilities

from utils.config import BD_BASE_URL,STUDENT_TESTES_COLLECTION,TESTS_COLLECTION,MOMENTS_COLLECTION,CLASS_MOMENTS_COLLECTION

# Create a new router for data-related endpoints
school_tests_router = APIRouter()

# Instantiate the API client
api_client = BDClient(BD_BASE_URL)

# curl -X POST http://127.0.0.1:8001/config/addtest -H "Content-Type: application/json" -d "{\"name\": \"teste 1\", \"questions\": [{\"question\":\"1\", \"value\": \"12\"}, {\"question\":\"2\", \"value\": \"10\"}]}"
@school_tests_router.post("/addtest")
async def add_school_test(request: Request):
    return await utilities.add_document(api_client=api_client, request=request, collection=TESTS_COLLECTION, source="school_tests_router", method="add_school_test")

# curl -X POST http://127.0.0.1:8001/config/addclasstotest -H "Content-Type: application/json" -d "{\"classid\":\"67e32c8bf97d9bb2e993e50d\",\"testid\":\"67e342b8f97d9bb2e993e524\",\"students\":[{\"id\":\"1\",\"questions\":[{\"question\":\"1\",\"value\":\"12\",\"currentvalue\":\"10\"},{\"question\":\"2\",\"value\":\"10\",\"currentvalue\":\"9\"}]},{\"id\":\"2\",\"questions\":[{\"question\":\"1\",\"value\":\"12\",\"currentvalue\":\"12\"},{\"question\":\"2\",\"value\":\"10\",\"currentvalue\":\"10\"}]}]}"
@school_tests_router.post("/addclasstotest")
async def add_class_to_test(request: Request):
    return await utilities.add_document(api_client=api_client, request=request, collection=STUDENT_TESTES_COLLECTION, source="school_tests_router", method="add_school_test")

# curl -X POST http://127.0.0.1:8001/config/addevaluationmoments -H "Content-Type: application/json" -d "{\"moments\":[{\"id\":\"1\",\"name\":\"name 1\",\"percentage\":12},{\"id\":\"2\",\"name\":\"name 2\",\"percentage\":30},{\"id\":\"3\",\"name\":\"name 3\",\"percentage\":40}]}"
@school_tests_router.post("/addevaluationmoments")
async def create_class_moments(request: Request):
    return await utilities.add_document(api_client=api_client, request=request, collection=MOMENTS_COLLECTION, source="school_tests_router", method="create_class_moments")

# curl -X POST http://127.0.0.1:8001/config/addclassmoments -H "Content-Type: application/json" -d "{\"classid\":\"67e32c8bf97d9bb2e993e50d\",\"momentid\":\"67e34a1bf97d9bb2e993e52a\",\"students\":[{\"moments\":[{\"id\":\"1\",\"name\":\"name 1\",\"percentage\":12,\"studentid\":\"1\",\"testid\":\"67e342b8f97d9bb2e993e524\",\"studentvalue\":\"\"},{\"id\":\"2\",\"name\":\"name 2\",\"percentage\":30,\"studentid\":\"2\",\"testid\":\"67e342b8f97d9bb2e993e524\",\"studentvalue\":\"\"},{\"id\":\"3\",\"name\":\"name 3\",\"percentage\":40,\"studentid\":\"3\",\"testid\":\"67e342b8f97d9bb2e993e524\",\"studentvalue\":\"\"}]},{\"moments\":[{\"id\":\"1\",\"name\":\"name 1\",\"percentage\":12,\"testid\":\"\",\"studentid\":\"1\",\"studentvalue\":\"\"},{\"id\":\"2\",\"name\":\"name 2\",\"percentage\":30,\"testid\":\"\",\"studentid\":\"2\",\"studentvalue\":\"\"},{\"id\":\"3\",\"name\":\"name 3\",\"percentage\":40,\"testid\":\"\",\"studentid\":\"3\",\"studentvalue\":\"\"}]},{\"moments\":[{\"id\":\"1\",\"name\":\"name 1\",\"percentage\":12,\"testid\":\"\",\"studentid\":\"1\",\"studentvalue\":\"\"},{\"id\":\"2\",\"name\":\"name 2\",\"percentage\":30,\"testid\":\"\",\"studentid\":\"2\",\"studentvalue\":\"\"},{\"id\":\"3\",\"name\":\"name 3\",\"percentage\":40,\"testid\":\"\",\"studentid\":\"3\",\"studentvalue\":\"\"}]}]}"
@school_tests_router.post("/addclassmoments")
async def add_class_moments(request: Request):
    return await utilities.add_document(api_client=api_client, request=request, collection=CLASS_MOMENTS_COLLECTION, source="school_tests_router", method="add_class_moments")
