import re
import tempfile
from pathlib import Path

from fastapi import APIRouter, Depends, Request
from fastapi.responses import FileResponse, JSONResponse
from httpx import request
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle

# Import custom utility modules
from utils.bd_client import BDClient  # Database handling utilities
from utils import utilities  # General utilities

from utils.config import (
    BD_BASE_URL,
    STUDENT_TESTES_COLLECTION,
    TESTS_COLLECTION,
    MOMENTS_COLLECTION,
    CLASS_MOMENTS_COLLECTION,
    SEMESTER_EVALUATIONS_COLLECTION,
)

# Create a new router for data-related endpoints
school_tests_router = APIRouter()

# Instantiate the API client
api_client = BDClient(BD_BASE_URL)

APP_SETTINGS_COLLECTION = "appsettings"
APP_SETTINGS_KEY = "global"
DEFAULT_APP_SETTINGS = {
    "key": APP_SETTINGS_KEY,
    "inactiveLogoutMinutes": 15,
    "messageTimeoutSeconds": 5,
    "percentageRanges": [
        {
            "id": "very-low",
            "min": 0,
            "max": 10,
            "backgroundColor": "#dc2626",
            "textColor": "#ffffff",
        },
        {
            "id": "low",
            "min": 11,
            "max": 39,
            "backgroundColor": "#fdba74",
            "textColor": "#7c2d12",
        },
        {
            "id": "mid-low",
            "min": 40,
            "max": 49,
            "backgroundColor": "#fde68a",
            "textColor": "#713f12",
        },
        {
            "id": "mid",
            "min": 50,
            "max": 69,
            "backgroundColor": "#bbf7d0",
            "textColor": "#14532d",
        },
        {
            "id": "high",
            "min": 70,
            "max": 85,
            "backgroundColor": "#15803d",
            "textColor": "#ffffff",
        },
        {
            "id": "very-high",
            "min": 86,
            "max": 100,
            "backgroundColor": "#ddd6fe",
            "textColor": "#4c1d95",
        },
    ],
}


def safe_report_filename(value):
    normalized = re.sub(r"[^A-Za-z0-9_-]+", "_", value.strip())
    return normalized.strip("_") or "momento_avaliacao"


def normalize_inactive_logout_minutes(value):
    if isinstance(value, bool):
        return DEFAULT_APP_SETTINGS["inactiveLogoutMinutes"]

    try:
        minutes = int(value)
    except (TypeError, ValueError):
        return DEFAULT_APP_SETTINGS["inactiveLogoutMinutes"]

    return minutes if minutes > 0 else DEFAULT_APP_SETTINGS["inactiveLogoutMinutes"]


def normalize_message_timeout_seconds(value):
    if isinstance(value, bool):
        return DEFAULT_APP_SETTINGS["messageTimeoutSeconds"]

    try:
        seconds = int(value)
    except (TypeError, ValueError):
        return DEFAULT_APP_SETTINGS["messageTimeoutSeconds"]

    return seconds if seconds > 0 else DEFAULT_APP_SETTINGS["messageTimeoutSeconds"]


def normalize_percentage_ranges(value):
    if not isinstance(value, list):
        return DEFAULT_APP_SETTINGS["percentageRanges"]

    normalized_ranges = []
    for percentage_range in value:
        if not isinstance(percentage_range, dict):
            return DEFAULT_APP_SETTINGS["percentageRanges"]

        try:
            min_value = int(percentage_range.get("min"))
            max_value = int(percentage_range.get("max"))
        except (TypeError, ValueError):
            return DEFAULT_APP_SETTINGS["percentageRanges"]

        background_color = percentage_range.get("backgroundColor")
        text_color = percentage_range.get("textColor")
        if not isinstance(background_color, str) or not isinstance(text_color, str):
            return DEFAULT_APP_SETTINGS["percentageRanges"]

        normalized_ranges.append(
            {
                "id": str(percentage_range.get("id") or f"{min_value}-{max_value}"),
                "min": min_value,
                "max": max_value,
                "backgroundColor": background_color,
                "textColor": text_color,
            }
        )

    return normalized_ranges or DEFAULT_APP_SETTINGS["percentageRanges"]


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

    settings = {**DEFAULT_APP_SETTINGS, **documents[0]}
    settings["inactiveLogoutMinutes"] = normalize_inactive_logout_minutes(
        settings.get("inactiveLogoutMinutes"),
    )
    settings["messageTimeoutSeconds"] = normalize_message_timeout_seconds(
        settings.get("messageTimeoutSeconds"),
    )
    settings["percentageRanges"] = normalize_percentage_ranges(settings.get("percentageRanges"))
    if (
        documents[0].get("messageTimeoutSeconds") != settings["messageTimeoutSeconds"]
        or documents[0].get("percentageRanges") != settings["percentageRanges"]
    ):
        await api_client.update(
            endpoint="update",
            payload={
                "collection": APP_SETTINGS_COLLECTION,
                "query": {"key": APP_SETTINGS_KEY},
                "data": settings,
            },
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
        "messageTimeoutSeconds": normalize_message_timeout_seconds(body.get("messageTimeoutSeconds")),
        "percentageRanges": normalize_percentage_ranges(body.get("percentageRanges")),
    }
    payload = {
        "collection": APP_SETTINGS_COLLECTION,
        "query": {"key": APP_SETTINGS_KEY},
        "data": data,
    }
    response = await api_client.update(endpoint="update", payload=payload)

    if not response.get("modified_count"):
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
@school_tests_router.post("/findevaluationmoments")
@school_tests_router.get("/findevaluationmoments")
async def find_evoluation_moments(request: Request,  _: None = Depends(utilities.verificar_token_cookie)):
    return await utilities.get_documents(api_client=api_client, endpoint="find", request=request, collection=MOMENTS_COLLECTION, source="school_tests_router", method="find_evoluation_moments")

# curl -X GET http://127.0.0.1:8001/config/findbyidevaluationmoments -H "Content-Type: application/json" -d "{\"id\":\"werrwerwe\"}"
@school_tests_router.get("/findbyidevaluationmoments")
async def findbyid_evoluation_moments(request: Request,  _: None = Depends(utilities.verificar_token_cookie)):
    return await utilities.get_documents(api_client=api_client, endpoint="findbyid", request=request, collection=MOMENTS_COLLECTION, source="school_tests_router", method="findbyid_evoluation_moments")


@school_tests_router.put("/updateevaluationmoments")
async def update_evoluation_moments(request: Request,  _: None = Depends(utilities.verificar_token_cookie)):
    body = await request.json()
    moment_id = body.get("id")
    data = body.get("data")

    if not moment_id or not data:
        return JSONResponse(
            status_code=400,
            content={"message": "Os campos 'id' e 'data' são obrigatórios."},
        )

    response = await api_client.update(
        endpoint="update",
        payload={"collection": MOMENTS_COLLECTION, "id": moment_id, "data": data},
    )

    updated_moment = response.get("modified_count")
    if not updated_moment:
        return JSONResponse(status_code=404, content={"message": "Momento de avaliação não encontrado."})

    return JSONResponse(content=updated_moment, status_code=200)


@school_tests_router.delete("/deleteevaluationmoments")
async def delete_evoluation_moments(request: Request,  _: None = Depends(utilities.verificar_token_cookie)):
    body = await request.json()
    moment_id = body.get("id")

    if not moment_id:
        return JSONResponse(
            status_code=400,
            content={"message": "O campo 'id' é obrigatório."},
        )

    response = await api_client.delete(
        endpoint="delete",
        payload={"collection": MOMENTS_COLLECTION, "id": moment_id},
    )

    deleted_count = response.get("deleted_count", 0)
    if not deleted_count:
        return JSONResponse(status_code=404, content={"message": "Momento de avaliação não encontrado."})

    return JSONResponse(content=deleted_count, status_code=200)

# curl -X POST http://127.0.0.1:8001/config/addclassmoments -H "Content-Type: application/json" -d "{\"user\":\"user\", \"classid\":\"67e32c8bf97d9bb2e993e50d\",\"momentid\":\"67e34a1bf97d9bb2e993e52a\",\"students\":[{\"moments\":[{\"id\":\"1\",\"name\":\"name 1\",\"percentage\":12,\"studentid\":\"1\",\"testid\":\"67e342b8f97d9bb2e993e524\",\"studentvalue\":\"\"},{\"id\":\"2\",\"name\":\"name 2\",\"percentage\":30,\"studentid\":\"2\",\"testid\":\"67e342b8f97d9bb2e993e524\",\"studentvalue\":\"\"},{\"id\":\"3\",\"name\":\"name 3\",\"percentage\":40,\"studentid\":\"3\",\"testid\":\"67e342b8f97d9bb2e993e524\",\"studentvalue\":\"\"}]},{\"moments\":[{\"id\":\"1\",\"name\":\"name 1\",\"percentage\":12,\"testid\":\"\",\"studentid\":\"1\",\"studentvalue\":\"\"},{\"id\":\"2\",\"name\":\"name 2\",\"percentage\":30,\"testid\":\"\",\"studentid\":\"2\",\"studentvalue\":\"\"},{\"id\":\"3\",\"name\":\"name 3\",\"percentage\":40,\"testid\":\"\",\"studentid\":\"3\",\"studentvalue\":\"\"}]},{\"moments\":[{\"id\":\"1\",\"name\":\"name 1\",\"percentage\":12,\"testid\":\"\",\"studentid\":\"1\",\"studentvalue\":\"\"},{\"id\":\"2\",\"name\":\"name 2\",\"percentage\":30,\"testid\":\"\",\"studentid\":\"2\",\"studentvalue\":\"\"},{\"id\":\"3\",\"name\":\"name 3\",\"percentage\":40,\"testid\":\"\",\"studentid\":\"3\",\"studentvalue\":\"\"}]}]}"
@school_tests_router.post("/addmomentsclass")
async def add_moments_class(request: Request,  _: None = Depends(utilities.verificar_token_cookie)):
    return await utilities.add_document(api_client=api_client, request=request, collection=CLASS_MOMENTS_COLLECTION, source="school_tests_router", method="add_moments_class")

# curl -X GET http://127.0.0.1:8001/config/findmomentsclass -H "Content-Type: application/json" -d "{\"user\":\"user\", \"classid\":\"67e32c8bf97d9bb2e993e50d\",\"momentid\":\"67e34a1bf97d9bb2e993e52a\"}"
@school_tests_router.get("/findmomentsclass")
@school_tests_router.post("/findmomentsclass")
async def find_moments_class(request: Request,  _: None = Depends(utilities.verificar_token_cookie)):
    return await utilities.get_documents(api_client=api_client, endpoint="find", request=request, collection=CLASS_MOMENTS_COLLECTION, source="school_tests_router", method="find_moments_class")


@school_tests_router.put("/upsertmomentvalue")
async def upsert_moment_value(request: Request,  _: None = Depends(utilities.verificar_token_cookie)):
    body = await request.json()
    required_fields = [
        "userId",
        "schoolId",
        "yearId",
        "classId",
        "momentId",
        "studentId",
        "questionNumber",
    ]
    missing_fields = [field for field in required_fields if body.get(field) in (None, "")]

    if missing_fields:
        return JSONResponse(
            status_code=400,
            content={"message": f"Campos obrigatórios em falta: {', '.join(missing_fields)}."},
        )

    query = {field: body.get(field) for field in required_fields}
    data = {
        **query,
        "schoolName": body.get("schoolName"),
        "academicYearId": body.get("academicYearId") or body.get("yearId"),
        "academicYearName": body.get("academicYearName"),
        "className": body.get("className"),
        "name": body.get("name") or body.get("momentName"),
        "momentName": body.get("momentName"),
        "studentUniqueId": body.get("studentUniqueId"),
        "studentName": body.get("studentName"),
        "questionValue": body.get("questionValue"),
        "value": body.get("value"),
    }

    response = await api_client.update(
        endpoint="update",
        payload={"collection": CLASS_MOMENTS_COLLECTION, "query": query, "data": data},
    )

    if not response.get("modified_count"):
        existing = await api_client.find(
            endpoint="find",
            payload={"collection": CLASS_MOMENTS_COLLECTION, "query": query},
        )
        if existing.get("documents"):
            return JSONResponse(content={"value": data}, status_code=200)

        created = await api_client.insert(
            endpoint="insert",
            payload={"collection": CLASS_MOMENTS_COLLECTION, "data": data},
        )
        created_id = created.get("id")
        if not created_id:
            return JSONResponse(
                status_code=500,
                content={"message": "Erro ao gravar valor do aluno."},
            )
        return JSONResponse(content={"id": created_id, "value": data}, status_code=201)

    return JSONResponse(content={"value": data}, status_code=200)


@school_tests_router.post("/moment-assessment-report")
async def create_moment_assessment_report(request: Request,  _: None = Depends(utilities.verificar_token_cookie)):
    body = await request.json()
    title = body.get("title")
    headers = body.get("headers")
    rows = body.get("rows")

    if not title or not headers or not rows:
        return JSONResponse(
            status_code=400,
            content={"message": "Os campos 'title', 'headers' e 'rows' são obrigatórios."},
        )

    reports_dir = Path(tempfile.gettempdir()) / "school-server-reports"
    reports_dir.mkdir(parents=True, exist_ok=True)
    pdf_path = reports_dir / f"{safe_report_filename(title)}.pdf"

    document = SimpleDocTemplate(
        str(pdf_path),
        pagesize=landscape(A4),
        rightMargin=24,
        leftMargin=24,
        topMargin=24,
        bottomMargin=24,
    )
    styles = getSampleStyleSheet()
    elements = [
        Paragraph(str(title), styles["Title"]),
        Spacer(1, 12),
    ]
    table_data = [[Paragraph(str(cell), styles["BodyText"]) for cell in headers]]
    table_data.extend([[Paragraph(str(cell), styles["BodyText"]) for cell in row] for row in rows])
    available_width = landscape(A4)[0] - 48
    first_col_width = min(160, available_width * 0.28)
    other_columns = max(len(headers) - 1, 1)
    col_widths = [first_col_width] + [
        (available_width - first_col_width) / other_columns
    ] * other_columns
    table = Table(table_data, colWidths=col_widths, repeatRows=1)
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e2e8f0")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#0f172a")),
                ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#cbd5e1")),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 7),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
            ]
        )
    )
    elements.append(table)
    document.build(elements)

    return JSONResponse(
        content={
            "path": str(pdf_path),
            "url": f"/config/moment-assessment-report/{pdf_path.name}",
        },
        status_code=201,
    )


@school_tests_router.get("/moment-assessment-report/{filename}")
async def open_moment_assessment_report(filename: str, _: None = Depends(utilities.verificar_token_cookie)):
    safe_filename = Path(filename).name
    report_path = Path(tempfile.gettempdir()) / "school-server-reports" / safe_filename

    if not report_path.exists() or report_path.suffix.lower() != ".pdf":
        return JSONResponse(status_code=404, content={"message": "Relatório não encontrado."})

    return FileResponse(
        path=str(report_path),
        media_type="application/pdf",
        filename=safe_filename,
        headers={"Content-Disposition": f'inline; filename="{safe_filename}"'},
    )


@school_tests_router.put("/upsertsemesterevaluations")
async def upsert_semester_evaluations(request: Request, _: None = Depends(utilities.verificar_token_cookie)):
    body = await request.json()
    required_fields = [
        "userId",
        "schoolId",
        "yearId",
        "classId",
        "semester",
    ]
    missing_fields = [field for field in required_fields if body.get(field) in (None, "")]

    if missing_fields:
        return JSONResponse(
            status_code=400,
            content={"message": f"Campos obrigatórios em falta: {', '.join(missing_fields)}."},
        )

    query = {field: body.get(field) for field in required_fields}
    data = {
        **query,
        "schoolName": body.get("schoolName"),
        "academicYearId": body.get("academicYearId") or body.get("yearId"),
        "academicYearName": body.get("academicYearName"),
        "className": body.get("className"),
        "title": body.get("title"),
        "tests": body.get("tests") or [],
        "headers": body.get("headers") or [],
        "rows": body.get("rows") or [],
    }

    response = await api_client.update(
        endpoint="update",
        payload={"collection": SEMESTER_EVALUATIONS_COLLECTION, "query": query, "data": data},
    )

    if not response.get("modified_count"):
        existing = await api_client.find(
            endpoint="find",
            payload={"collection": SEMESTER_EVALUATIONS_COLLECTION, "query": query},
        )
        if existing.get("documents"):
            return JSONResponse(content={"value": data}, status_code=200)

        created = await api_client.insert(
            endpoint="insert",
            payload={"collection": SEMESTER_EVALUATIONS_COLLECTION, "data": data},
        )
        created_id = created.get("id")
        if not created_id:
            return JSONResponse(
                status_code=500,
                content={"message": "Erro ao gravar avaliações do semestre."},
            )
        return JSONResponse(content={"id": created_id, "value": data}, status_code=201)

    return JSONResponse(content={"value": data}, status_code=200)

# curl -X GET http://127.0.0.1:8001/config/findbyidmomentsclass -H "Content-Type: application/json" -d "{ \"id\":\"67e32c8bf97d9bb2e993e50d\" }"
@school_tests_router.get("/findbyidmomentsclass")
async def findbyid_moments_class(request: Request,  _: None = Depends(utilities.verificar_token_cookie)):
    return await utilities.get_documents(api_client=api_client, endpoint="findbyid", request=request, collection=CLASS_MOMENTS_COLLECTION, source="school_tests_router", method="findbyid_moments_class")