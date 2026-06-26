from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse
from httpx import request

# Import custom utility modules
from utils.bd_client import BDClient  # Database handling utilities
from utils import utilities  # General utilities

from utils.config import SCHOOLS_COLLECTION,BD_BASE_URL

# Create a new router for data-related endpoints
schools_router = APIRouter()

# Instantiate the API client
api_client = BDClient(BD_BASE_URL)

# Endpoint: Get all students
# curl -X POST http://127.0.0.1:8001/schools/add -H  "Content-Type: application/json" -d "{ \"userid\": \"67e32c8bf97d9bb2e993e50d\", \"classid\": \"67e32c8bf97d9bb2e993e50d\", \"id\": \"1\", \"name\": \"nome aluno\", \"email\": \"aluno@ctt.pt\" }"
@schools_router.post("/find")
async def find_school(request: Request):
    return await utilities.get_documents(api_client=api_client, endpoint="find", request=request, collection=SCHOOLS_COLLECTION, source="schools_router", method="find_school")

# Endpoint: Get all students by id
# curl -X GET http://127.0.0.1:8001/schools/listbyid -H  "Content-Type: application/json" -d "{ \"id\": \"67e3c8556c0e93daf9ef2d2f\" }"
@schools_router.post("/findbyid")
async def find_school_byid(request: Request):
    return await utilities.get_documents(api_client=api_client,endpoint ="findbyid", request=request, collection=SCHOOLS_COLLECTION, source="schools_router", method="find_school_byid")

# curl -X POST http://127.0.0.1:8001/schools/add -H  "Content-Type: application/json" -d "{ \"userid\": \"67e32c8bf97d9bb2e993e50d\", \"classid\": \"67e32c8bf97d9bb2e993e50d\", \"id\": \"1\", \"name\": \"nome aluno\", \"email\": \"aluno@ctt.pt\" }"
@schools_router.post("/add")
async def add_school(request: Request):
    return await utilities.add_document(api_client=api_client, request=request, collection=SCHOOLS_COLLECTION, source="schools_router", method="add_school")


@schools_router.put("/update")
async def update_school(request: Request):
    body = await request.json()
    school_id = body.get("id")
    data = body.get("data")

    if not school_id or not data:
        return JSONResponse(
            status_code=400,
            content={"message": "Os campos 'id' e 'data' são obrigatórios."},
        )

    response = await api_client.update(
        endpoint="update",
        payload={"collection": SCHOOLS_COLLECTION, "id": school_id, "data": data},
    )

    updated_school = response.get("modified_count")
    if not updated_school:
        return JSONResponse(status_code=404, content={"message": "Escola não encontrada."})

    return JSONResponse(content=updated_school, status_code=200)
