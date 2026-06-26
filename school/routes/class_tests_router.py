from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse
from httpx import request

# Import custom utility modules
from utils.bd_client import BDClient  # Database handling utilities
from utils import utilities  # General utilities

from utils.config import BD_BASE_URL,STUDENT_TESTES_COLLECTION,TESTS_COLLECTION,MOMENTS_COLLECTION,CLASS_MOMENTS_COLLECTION

# Create a new router for data-related endpoints
school_tests_router = APIRouter()

# Instantiate the API client
api_client = BDClient(BD_BASE_URL)

APP_SETTINGS_COLLECTION = "appsettings"
APP_SETTINGS_KEY = "global"
DEFAULT_APP_SETTINGS = {
    "key": APP_SETTINGS_KEY,
    "inactiveLogoutMinutes": 15,
}


def normalize_inactive_logout_minutes(value):
    if isinstance(value, bool):
        return DEFAULT_APP_SETTINGS["inactiveLogoutMinutes"]

    try:
        minutes = int(value)
    except (TypeError, ValueError):
        return DEFAULT_APP_SETTINGS["inactiveLogoutMinutes"]

    return minutes if minutes > 0 else DEFAULT_APP_SETTINGS["inactiveLogoutMinutes"]


@school_tests_router.get("/app-settings")
async def get_app_settings(_: None = Depends(utilities.verificar_token_cookie)):
    payload = {"collection": APP_SETTINGS_COLLECTION, "query": {"key": APP_SETTINGS_KEY}}
    response = await api_client.find(endpoint="find", payload=payload)
    documents = response.get("documents") or []

    if not documents:
        created = await api_client.insert(
            endpoint="insert",
            payload={"collection": APP_SETTINGS_COLLECTION, "data": DEFAULT_APP_SETTINGS},
        )
        if not created.get("id"):
            return JSONResponse(
                status_code=500,
                content={"message": "Erro ao criar configurações da aplicação."},
            )
        return JSONResponse(content=DEFAULT_APP_SETTINGS, status_code=200)

    settings = documents[0]
    settings["inactiveLogoutMinutes"] = normalize_inactive_logout_minutes(
        settings.get("inactiveLogoutMinutes"),
    )
    return JSONResponse(content=settings, status_code=200)


@school_tests_router.put("/app-settings")
async def update_app_settings(request: Request, _: None = Depends(utilities.verificar_token_cookie)):
    body = await request.json()
    inactive_logout_minutes = normalize_inactive_logout_minutes(
        body.get("inactiveLogoutMinutes"),
    )
    data = {
        "key": APP_SETTINGS_KEY,
        "inactiveLogoutMinutes": inactive_logout_minutes,
    }
    payload = {
        "collection": APP_SETTINGS_COLLECTION,
        "query": {"key": APP_SETTINGS_KEY},
        "data": data,
    }
    response = await api_client.update(endpoint="update", payload=payload)

    if response.get("modified_count", 0) == 0:
        created = await api_client.insert(
            endpoint="insert",
            payload={"collection": APP_SETTINGS_COLLECTION, "data": data},
        )
        if not created.get("id"):
            return JSONResponse(
                status_code=500,
                content={"message": "Erro ao atualizar configurações da aplicação."},
            )

    return JSONResponse(content=data, status_code=200)

# curl -X POST http://127.0.0.1:8001/config/addtest -H "Content-Type: application/json" -d "{\"userid\": \"67e32c8bf97d9bb2e993e50d\", \"name\": \"teste 1\", \"questions\": [{\"question\":\"1\", \"value\": \"12\"}, {\"question\":\"2\", \"value\": \"10\"}]}"
@school_tests_router.post("/addtest")
async def add_school_test(request: Request,  _: None = Depends(utilities.verificar_token_cookie)):
    return await utilities.add_document(api_client=api_client, request=request, collection=TESTS_COLLECTION, source="school_tests_router", method="add_school_test")

# curl -X GET http://127.0.0.1:8001/config/findtest -H "Content-Type: application/json" -d "{\"userid\": \"67e32c8bf97d9bb2e993e50d\", \"name\": \"teste 1\", \"questions\": [{\"question\":\"1\", \"value\": \"12\"}, {\"question\":\"2\", \"value\": \"10\"}]}"
@school_tests_router.get("/findtest")
async def find_school_test(request: Request,  _: None = Depends(utilities.verificar_token_cookie)):
    return await utilities.get_documents(api_client=api_client, endpoint="find", request=request, collection=TESTS_COLLECTION, source="school_tests_router", method="find_school_test")

# curl -X GET http://127.0.0.1:8001/config/findtestbyid -H "Content-Type: application/json" -d "{\"id\": \"67e32c8bf97d9bb2e993e50d\" }"
@school_tests_router.get("/findtestbyid")
async def findbyid_school_test(request: Request,  _: None = Depends(utilities.verificar_token_cookie)):
    return await utilities.get_documents(api_client=api_client, endpoint="findbyid", request=request, collection=TESTS_COLLECTION, source="school_tests_router", method="findbyid_school_test")

# curl -X POST http://127.0.0.1:8001/config/addclasstotest -H "Content-Type: application/json" -d "{\"userid\": \"67e32c8bf97d9bb2e993e50d\", \"classid\":\"67e32c8bf97d9bb2e993e50d\",\"testid\":\"67e342b8f97d9bb2e993e524\",\"students\":[{\"id\":\"1\",\"questions\":[{\"question\":\"1\",\"value\":\"12\",\"currentvalue\":\"10\"},{\"question\":\"2\",\"value\":\"10\",\"currentvalue\":\"9\"}]},{\"id\":\"2\",\"questions\":[{\"question\":\"1\",\"value\":\"12\",\"currentvalue\":\"12\"},{\"question\":\"2\",\"value\":\"10\",\"currentvalue\":\"10\"}]}]}"
@school_tests_router.post("/addclasstotest")
async def add_class_to_test(request: Request,  _: None = Depends(utilities.verificar_token_cookie)):
    return await utilities.add_document(api_client=api_client, request=request, collection=STUDENT_TESTES_COLLECTION, source="school_tests_router", method="add_school_test")

# curl -X GET http://127.0.0.1:8001/config/findclasstotest -H "Content-Type: application/json" -d "{\"userid\": \"67e32c8bf97d9bb2e993e50d\", \"classid\":\"67e32c8bf97d9bb2e993e50d\",\"testid\":\"67e342b8f97d9bb2e993e524\",\"students\":[{\"id\":\"1\",\"questions\":[{\"question\":\"1\",\"value\":\"12\",\"currentvalue\":\"10\"},{\"question\":\"2\",\"value\":\"10\",\"currentvalue\":\"9\"}]},{\"id\":\"2\",\"questions\":[{\"question\":\"1\",\"value\":\"12\",\"currentvalue\":\"12\"},{\"question\":\"2\",\"value\":\"10\",\"currentvalue\":\"10\"}]}]}"
@school_tests_router.get("/findclasstotest")
async def find_class_to_test(request: Request,  _: None = Depends(utilities.verificar_token_cookie)):
    return await utilities.get_documents(api_client=api_client, endpoint="find", request=request, collection=STUDENT_TESTES_COLLECTION, source="school_tests_router", method="find_class_to_test")

# curl -X GET http://127.0.0.1:8001/config/findbyidclasstotest -H "Content-Type: application/json" -d "{\"id\": \"67e32c8bf97d9bb2e993e50d\"}"
@school_tests_router.get("/findbyidclasstotest")
async def findbyid_class_to_test(request: Request,  _: None = Depends(utilities.verificar_token_cookie)):
    return await utilities.get_documents(api_client=api_client, endpoint="findbyid", request=request, collection=STUDENT_TESTES_COLLECTION, source="school_tests_router", method="findbyid_class_to_test")

# curl -X POST http://127.0.0.1:8001/config/addevaluationmoments -H "Content-Type: application/json" -d "{\"user\":\"user\", \"moments\":[{\"id\":\"1\",\"name\":\"name 1\",\"percentage\":12},{\"id\":\"2\",\"name\":\"name 2\",\"percentage\":30},{\"id\":\"3\",\"name\":\"name 3\",\"percentage\":40}]}"
@school_tests_router.post("/addevaluationmoments")
async def create_evoluation_moments(request: Request,  _: None = Depends(utilities.verificar_token_cookie)):
    return await utilities.add_document(api_client=api_client, request=request, collection=MOMENTS_COLLECTION, source="school_tests_router", method="create_evoluation_moments")

# curl -X GET http://127.0.0.1:8001/config/findevaluationmoments -H "Content-Type: application/json" -d "{\"user\":\"user\", \"moments\":[{\"id\":\"1\",\"name\":\"name 1\",\"percentage\":12},{\"id\":\"2\",\"name\":\"name 2\",\"percentage\":30},{\"id\":\"3\",\"name\":\"name 3\",\"percentage\":40}]}"
@school_tests_router.get("/findevaluationmoments")
async def find_evoluation_moments(request: Request,  _: None = Depends(utilities.verificar_token_cookie)):
    return await utilities.get_documents(api_client=api_client, endpoint="find", request=request, collection=MOMENTS_COLLECTION, source="school_tests_router", method="find_evoluation_moments")

# curl -X GET http://127.0.0.1:8001/config/findbyidevaluationmoments -H "Content-Type: application/json" -d "{\"id\":\"werrwerwe\"}"
@school_tests_router.get("/findbyidevaluationmoments")
async def findbyid_evoluation_moments(request: Request,  _: None = Depends(utilities.verificar_token_cookie)):
    return await utilities.get_documents(api_client=api_client, endpoint="findbyid", request=request, collection=MOMENTS_COLLECTION, source="school_tests_router", method="findbyid_evoluation_moments")

# curl -X POST http://127.0.0.1:8001/config/addclassmoments -H "Content-Type: application/json" -d "{\"user\":\"user\", \"classid\":\"67e32c8bf97d9bb2e993e50d\",\"momentid\":\"67e34a1bf97d9bb2e993e52a\",\"students\":[{\"moments\":[{\"id\":\"1\",\"name\":\"name 1\",\"percentage\":12,\"studentid\":\"1\",\"testid\":\"67e342b8f97d9bb2e993e524\",\"studentvalue\":\"\"},{\"id\":\"2\",\"name\":\"name 2\",\"percentage\":30,\"studentid\":\"2\",\"testid\":\"67e342b8f97d9bb2e993e524\",\"studentvalue\":\"\"},{\"id\":\"3\",\"name\":\"name 3\",\"percentage\":40,\"studentid\":\"3\",\"testid\":\"67e342b8f97d9bb2e993e524\",\"studentvalue\":\"\"}]},{\"moments\":[{\"id\":\"1\",\"name\":\"name 1\",\"percentage\":12,\"testid\":\"\",\"studentid\":\"1\",\"studentvalue\":\"\"},{\"id\":\"2\",\"name\":\"name 2\",\"percentage\":30,\"testid\":\"\",\"studentid\":\"2\",\"studentvalue\":\"\"},{\"id\":\"3\",\"name\":\"name 3\",\"percentage\":40,\"testid\":\"\",\"studentid\":\"3\",\"studentvalue\":\"\"}]},{\"moments\":[{\"id\":\"1\",\"name\":\"name 1\",\"percentage\":12,\"testid\":\"\",\"studentid\":\"1\",\"studentvalue\":\"\"},{\"id\":\"2\",\"name\":\"name 2\",\"percentage\":30,\"testid\":\"\",\"studentid\":\"2\",\"studentvalue\":\"\"},{\"id\":\"3\",\"name\":\"name 3\",\"percentage\":40,\"testid\":\"\",\"studentid\":\"3\",\"studentvalue\":\"\"}]}]}"
@school_tests_router.post("/addmomentsclass")
async def add_moments_class(request: Request,  _: None = Depends(utilities.verificar_token_cookie)):
    return await utilities.add_document(api_client=api_client, request=request, collection=CLASS_MOMENTS_COLLECTION, source="school_tests_router", method="add_moments_class")

# curl -X GET http://127.0.0.1:8001/config/findmomentsclass -H "Content-Type: application/json" -d "{\"user\":\"user\", \"classid\":\"67e32c8bf97d9bb2e993e50d\",\"momentid\":\"67e34a1bf97d9bb2e993e52a\"}"
@school_tests_router.get("/findmomentsclass")
async def find_moments_class(request: Request,  _: None = Depends(utilities.verificar_token_cookie)):
    return await utilities.get_documents(api_client=api_client, endpoint="find", request=request, collection=CLASS_MOMENTS_COLLECTION, source="school_tests_router", method="find_moments_class")

# curl -X GET http://127.0.0.1:8001/config/findbyidmomentsclass -H "Content-Type: application/json" -d "{ \"id\":\"67e32c8bf97d9bb2e993e50d\" }"
@school_tests_router.get("/findbyidmomentsclass")
async def findbyid_moments_class(request: Request,  _: None = Depends(utilities.verificar_token_cookie)):
    return await utilities.get_documents(api_client=api_client, endpoint="findbyid", request=request, collection=CLASS_MOMENTS_COLLECTION, source="school_tests_router", method="findbyid_moments_class")