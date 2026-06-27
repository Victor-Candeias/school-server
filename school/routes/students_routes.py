from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse
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
# curl -X POST http://127.0.0.1:8001/students/add -H  "Content-Type: application/json" -d "{ \"userid\": \"67e32c8bf97d9bb2e993e50d\", \"classid\": \"67e32c8bf97d9bb2e993e50d\", \"id\": \"1\", \"name\": \"nome aluno\", \"email\": \"aluno@ctt.pt\" }"
@students_router.post("/find")
async def find_class_students(request: Request):
    return await utilities.get_documents(api_client=api_client, endpoint="find", request=request, collection=STUDENTS_COLLECTION, source="students_routes", method="find_class_students")

# Endpoint: Get all students by id
# curl -X GET http://127.0.0.1:8001/students/listbyid -H  "Content-Type: application/json" -d "{ \"id\": \"67e3c8556c0e93daf9ef2d2f\" }"
@students_router.get("/findbyid")
async def findbyid_class_students(request: Request):
    return await utilities.get_documents(api_client=api_client,endpoint ="findbyid", request=request, collection=STUDENTS_COLLECTION, source="students_routes", method="findbyid_class_students")

# curl -X POST http://127.0.0.1:8001/students/add -H  "Content-Type: application/json" -d "{ \"userid\": \"67e32c8bf97d9bb2e993e50d\", \"classid\": \"67e32c8bf97d9bb2e993e50d\", \"id\": \"1\", \"name\": \"nome aluno\", \"email\": \"aluno@ctt.pt\" }"
@students_router.post("/add")
async def add_class_student(request: Request):
    return await utilities.add_document(api_client=api_client, request=request, collection=STUDENTS_COLLECTION, source="students_routes", method="add_class_student")


@students_router.put("/update")
async def update_class_student(request: Request):
    body = await request.json()
    student_id = body.get("id")
    data = body.get("data")

    if not student_id or not data:
        return JSONResponse(
            status_code=400,
            content={"message": "Os campos 'id' e 'data' são obrigatórios."},
        )

    response = await api_client.update(
        endpoint="update",
        payload={"collection": STUDENTS_COLLECTION, "id": student_id, "data": data},
    )

    updated_student = response.get("modified_count")
    if not updated_student:
        return JSONResponse(status_code=404, content={"message": "Aluno não encontrado."})

    return JSONResponse(content=updated_student, status_code=200)


@students_router.delete("/delete")
async def delete_class_student(request: Request):
    body = await request.json()
    student_id = body.get("id")

    if not student_id:
        return JSONResponse(
            status_code=400,
            content={"message": "O campo 'id' é obrigatório."},
        )

    response = await api_client.delete(
        endpoint="delete",
        payload={"collection": STUDENTS_COLLECTION, "id": student_id},
    )

    deleted_count = response.get("deleted_count", 0)
    if not deleted_count:
        return JSONResponse(status_code=404, content={"message": "Aluno não encontrado."})

    return JSONResponse(content=deleted_count, status_code=200)
