from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse

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
async def findbyid_years(request: Request,  _: None = Depends(utilities.verificar_token_cookie)):
    return await utilities.get_documents(api_client=api_client, endpoint="find", request=request, collection=YEARS_COLLECTION, source="years_router", method="findbyid_years")

# curl -X POST http://127.0.0.1:8001/class/add -H  "Content-Type: application/json" -d "{ \"userid\": \"67e32c8bf97d9bb2e993e50d\", \"level\": 6, \"class\": \"A\" }"
@years_router.post("/add")
async def add_year(request: Request,  _: None = Depends(utilities.verificar_token_cookie)):
    return await utilities.add_document(api_client=api_client, request=request, collection=YEARS_COLLECTION, source="years_router", method="add_year")


@years_router.put("/update")
async def update_year(request: Request, _: None = Depends(utilities.verificar_token_cookie)):
    body = await request.json()
    year_id = body.get("id")
    data = body.get("data")

    if not year_id or not data:
        return JSONResponse(
            status_code=400,
            content={"message": "Os campos 'id' e 'data' são obrigatórios."},
        )

    response = await api_client.update(
        endpoint="update",
        payload={"collection": YEARS_COLLECTION, "id": year_id, "data": data},
    )

    updated_year = response.get("modified_count")
    if not updated_year:
        return JSONResponse(status_code=404, content={"message": "Ano letivo não encontrado."})

    return JSONResponse(content=updated_year, status_code=200)
