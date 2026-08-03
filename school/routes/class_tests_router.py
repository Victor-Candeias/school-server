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
    STUDENTS_COLLECTION,
    STUDENT_TESTES_COLLECTION,
    TESTS_COLLECTION,
    MOMENTS_COLLECTION,
    CLASS_MOMENTS_COLLECTION,
    STUDENT_CALENDAR_COLLECTION,
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
    "popupBackgroundColor": "#15803d",
    "popupTextColor": "#ffffff",
    "errorPopupBackgroundColor": "#fee2e2",
    "errorPopupTextColor": "#dc2626",
    "evaluationMomentTemplates": [],
    "percentageRanges": [
        {
            "id": "very-low",
            "min": 0,
            "max": 10,
            "nota": 1,
            "backgroundColor": "#dc2626",
            "textColor": "#ffffff",
        },
        {
            "id": "low",
            "min": 11,
            "max": 39,
            "nota": 2,
            "backgroundColor": "#fdba74",
            "textColor": "#7c2d12",
        },
        {
            "id": "mid-low",
            "min": 40,
            "max": 49,
            "nota": 2,
            "backgroundColor": "#fde68a",
            "textColor": "#713f12",
        },
        {
            "id": "mid",
            "min": 50,
            "max": 69,
            "nota": 3,
            "backgroundColor": "#bbf7d0",
            "textColor": "#14532d",
        },
        {
            "id": "high",
            "min": 70,
            "max": 85,
            "nota": 4,
            "backgroundColor": "#15803d",
            "textColor": "#ffffff",
        },
        {
            "id": "very-high",
            "min": 86,
            "max": 100,
            "nota": 5,
            "backgroundColor": "#ddd6fe",
            "textColor": "#4c1d95",
        },
    ],
}

DEFAULT_EVALUATION_MOMENT_TEMPLATE_COLORS = [
    {
        "backgroundColor": "#1e40af",
        "averageBackgroundColor": "#1d4ed8",
        "weightedBackgroundColor": "#2563eb",
        "textColor": "#eff6ff",
    },
    {
        "backgroundColor": "#5b21b6",
        "averageBackgroundColor": "#6d28d9",
        "weightedBackgroundColor": "#7c3aed",
        "textColor": "#f5f3ff",
    },
    {
        "backgroundColor": "#9a3412",
        "averageBackgroundColor": "#c2410c",
        "weightedBackgroundColor": "#ea580c",
        "textColor": "#fff7ed",
    },
    {
        "backgroundColor": "#115e59",
        "averageBackgroundColor": "#0f766e",
        "weightedBackgroundColor": "#0d9488",
        "textColor": "#f0fdfa",
    },
]


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


def normalize_hex_color(value, default):
    if not isinstance(value, str) or not re.fullmatch(r"#[0-9a-fA-F]{6}", value):
        return default

    return value.lower()


def normalize_evaluation_moment_templates(value):
    if not isinstance(value, list):
        return DEFAULT_APP_SETTINGS["evaluationMomentTemplates"]

    normalized_templates = []
    for template_index, template in enumerate(value):
        if not isinstance(template, dict):
            continue

        moment_type = template.get("type")
        if not isinstance(moment_type, str) or not moment_type.strip():
            continue

        weight_percentage = template.get("weightPercentage")
        if isinstance(weight_percentage, bool):
            continue

        try:
            normalized_weight = round(float(weight_percentage))
        except (TypeError, ValueError):
            continue
        default_colors = DEFAULT_EVALUATION_MOMENT_TEMPLATE_COLORS[
            template_index % len(DEFAULT_EVALUATION_MOMENT_TEMPLATE_COLORS)
        ]

        normalized_templates.append(
            {
                "id": str(template.get("id") or f"evaluation-template-{template_index + 1}"),
                "type": moment_type.strip(),
                "weightPercentage": min(100, max(0, normalized_weight)),
                "backgroundColor": normalize_hex_color(
                    template.get("backgroundColor"),
                    default_colors["backgroundColor"],
                ),
                "averageBackgroundColor": normalize_hex_color(
                    template.get("averageBackgroundColor"),
                    default_colors["averageBackgroundColor"],
                ),
                "weightedBackgroundColor": normalize_hex_color(
                    template.get("weightedBackgroundColor"),
                    default_colors["weightedBackgroundColor"],
                ),
                "textColor": normalize_hex_color(
                    template.get("textColor"),
                    default_colors["textColor"],
                ),
            }
        )

    return normalized_templates


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
            nota = int(percentage_range.get("nota", 0))
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
                "nota": max(0, nota),
                "backgroundColor": background_color,
                "textColor": text_color,
            }
        )

    return normalized_ranges or DEFAULT_APP_SETTINGS["percentageRanges"]


def get_percentage_range(percentage, percentage_ranges=None):
    ranges = normalize_percentage_ranges(percentage_ranges or DEFAULT_APP_SETTINGS["percentageRanges"])
    matching_range = next(
        (
            percentage_range
            for percentage_range in ranges
            if percentage >= percentage_range["min"] and percentage <= percentage_range["max"]
        ),
        None,
    )

    return matching_range or ranges[-1]


def get_percentage_fields(percentage, percentage_ranges=None, prefix=""):
    percentage_range = get_percentage_range(percentage, percentage_ranges)
    return {
        f"{prefix}Percentage": round(percentage, 1),
        f"{prefix}PercentageText": f"{percentage:.1f}%",
        f"{prefix}Grade": percentage_range.get("nota", 0),
        f"{prefix}BackgroundColor": percentage_range.get("backgroundColor"),
        f"{prefix}TextColor": percentage_range.get("textColor"),
    }


def to_float(value, default=0):
    if isinstance(value, bool):
        return default

    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def format_number(value):
    rounded_value = round(value, 2)
    return int(rounded_value) if rounded_value.is_integer() else rounded_value


def get_document_id(document):
    return document.get("_id") or document.get("id")


def get_string_value(value, default=""):
    return value if isinstance(value, str) else default


def get_student_name(student):
    return get_string_value(student.get("name")) or "Aluno"


def get_moment_name(moment):
    return get_string_value(moment.get("name")) or "Momento de avaliação"


def get_moment_type_label(moment):
    moment_type = get_string_value(
        moment.get("evaluationMomentTemplateType") or moment.get("type")
    )

    if moment_type == "questao-aula":
        return "Questão aula"

    if moment_type == "teste":
        return "Teste"

    return moment_type or "Sem tipo"


def get_moment_template(moment, templates):
    template_id = get_string_value(moment.get("evaluationMomentTemplateId"))
    if template_id:
        matching_template = next(
            (
                template
                for template in templates
                if get_string_value(template.get("id")) == template_id
            ),
            None,
        )

        if matching_template:
            return matching_template

    moment_type = get_moment_type_label(moment)
    return next(
        (
            template
            for template in templates
            if template.get("type") == moment_type
        ),
        None,
    )


def get_moment_group_type_label(moment, templates):
    matching_template = get_moment_template(moment, templates)
    if matching_template:
        return get_string_value(matching_template.get("type")) or "Sem tipo"

    return get_moment_type_label(moment)


def get_moment_semester(moment):
    return "2" if str(moment.get("semester", "1")) == "2" else "1"


def get_moment_max_value(moment, value_documents):
    if moment:
        max_value = to_float(moment.get("totalValue"))
        if max_value:
            return max_value

        questions = moment.get("questions")
        if isinstance(questions, list):
            questions_total = sum(
                to_float(question.get("value")) for question in questions if isinstance(question, dict)
            )
            if questions_total:
                return questions_total

    question_values = {}
    for value_document in value_documents:
        question_number = value_document.get("questionNumber")
        if question_number not in question_values:
            question_values[question_number] = to_float(value_document.get("questionValue"))

    return sum(question_values.values())


def get_moment_weight_percentage(moment, templates):
    configured_template = get_moment_template(moment, templates)

    if configured_template:
        return to_float(configured_template.get("weightPercentage"))

    return to_float(moment.get("evaluationMomentTemplateWeightPercentage"))


def get_question_max_value(moment, question_number, fallback_value):
    if moment:
        questions = moment.get("questions")
        if isinstance(questions, list):
            for question in questions:
                if (
                    isinstance(question, dict)
                    and str(question.get("number") or question.get("questionNumber")) == str(question_number)
                ):
                    return to_float(question.get("value"))

    return to_float(fallback_value)


def normalize_moment_value(value):
    if value in (None, ""):
        value = 0
    if isinstance(value, str):
        value = value.strip() or "0"
    if isinstance(value, bool):
        return None

    try:
        numeric_value = float(value)
    except (TypeError, ValueError):
        return None

    return numeric_value if numeric_value >= 0 else None


def build_projected_student_moment_values(existing_values, next_value):
    projected_values = []
    replaced = False

    for existing_value in existing_values:
        if existing_value.get("questionNumber") == next_value.get("questionNumber"):
            projected_values.append(next_value)
            replaced = True
        else:
            projected_values.append(existing_value)

    if not replaced:
        projected_values.append(next_value)

    return projected_values


def validate_evaluation_moment_payload(data):
    if not isinstance(data, dict):
        return "Dados do momento de avaliação inválidos."

    questions = data.get("questions")
    if not isinstance(questions, list) or len(questions) == 0:
        return None

    question_total = 0
    for question in questions:
        if not isinstance(question, dict):
            return "Preenche o número e o valor de todas as questões."

        question_number = question.get("number") or question.get("questionNumber")
        question_value = normalize_moment_value(question.get("value"))
        if not question_number or question_value is None or question_value <= 0:
            return "Preenche o número e o valor de todas as questões."

        question_total += question_value

    total_value = to_float(data.get("totalValue"))
    if total_value and format_number(question_total) != format_number(total_value):
        return (
            f"O total das questões deve ser {format_number(total_value)}. "
            f"Total atual: {format_number(question_total)}."
        )

    return None


async def find_moment_for_value(body):
    moment_query = {}

    if body.get("userId"):
        moment_query["userId"] = body.get("userId")
    if body.get("classId"):
        moment_query["classId"] = body.get("classId")

    response = await api_client.find(
        endpoint="find",
        payload={"collection": MOMENTS_COLLECTION, "query": moment_query},
    )
    moments = response.get("documents") or []
    moment_id = str(body.get("momentId"))

    return next(
        (
            moment
            for moment in moments
            if str(get_document_id(moment)) == moment_id
        ),
        None,
    )


def enrich_student_moment_values(value_documents, moments=None, percentage_ranges=None):
    moments = moments or []
    percentage_ranges = percentage_ranges or DEFAULT_APP_SETTINGS["percentageRanges"]
    moments_by_id = {
        str(moment_id): moment
        for moment in moments
        if isinstance(moment, dict)
        for moment_id in [get_document_id(moment)]
        if moment_id
    }
    groups = {}

    for value_document in value_documents:
        group_key = (value_document.get("momentId"), value_document.get("studentId"))
        groups.setdefault(group_key, []).append(value_document)

    enriched_documents = []
    for (moment_id, student_id), group_documents in groups.items():
        total = sum(to_float(value_document.get("value")) for value_document in group_documents)
        moment = moments_by_id.get(str(moment_id))
        max_value = get_moment_max_value(moment, group_documents)
        percentage = (total / max_value) * 100 if max_value else 0
        processed_fields = {
            "studentMomentTotal": format_number(total),
            "studentMomentMaxValue": format_number(max_value),
            **get_percentage_fields(percentage, percentage_ranges, "studentMoment"),
        }

        enriched_documents.extend(
            {
                **value_document,
                **processed_fields,
            }
            for value_document in group_documents
        )

    return enriched_documents


def get_student_moment_total(enriched_values, student_id, moment_id):
    matching_value = next(
        (
            value_document
            for value_document in enriched_values
            if str(value_document.get("studentId")) == str(student_id)
            and str(value_document.get("momentId")) == str(moment_id)
            and value_document.get("studentMomentTotal") is not None
        ),
        None,
    )

    return to_float(matching_value.get("studentMomentTotal")) if matching_value else 0


def group_semester_moments(moments, templates):
    groups = []

    for moment in moments:
        moment_type = get_moment_group_type_label(moment, templates)
        existing_group = next(
            (group for group in groups if group["type"] == moment_type),
            None,
        )

        if existing_group:
            existing_group["moments"].append(moment)
        else:
            groups.append(
                {
                    "type": moment_type,
                    "weightPercentage": format_number(
                        get_moment_weight_percentage(moment, templates),
                    ),
                    "moments": [moment],
                }
            )

    return groups


def build_semester_evaluations_summary(metadata, students, moments, value_documents, settings):
    percentage_ranges = normalize_percentage_ranges(settings.get("percentageRanges"))
    templates = normalize_evaluation_moment_templates(settings.get("evaluationMomentTemplates"))
    semester = str(metadata.get("semester"))
    semester_moments = [
        moment
        for moment in moments
        if get_moment_semester(moment) == semester
    ]
    groups = group_semester_moments(semester_moments, templates)
    enriched_values = enrich_student_moment_values(
        value_documents,
        semester_moments,
        percentage_ranges,
    )
    final_max_value = 0

    for group in groups:
        if not group["moments"]:
            continue

        group_max_average = sum(
            get_moment_max_value(moment, [])
            for moment in group["moments"]
        ) / len(group["moments"])
        final_max_value += group_max_average * (to_float(group["weightPercentage"]) / 100)

    active_students = [student for student in students if student.get("active") is not False]
    student_summaries = []

    for student in active_students:
        student_id = get_document_id(student)
        student_groups = []
        final_value = 0

        for group in groups:
            moment_summaries = [
                {
                    "id": get_document_id(moment),
                    "name": get_moment_name(moment),
                    "totalValue": format_number(get_moment_max_value(moment, [])),
                    "studentTotal": format_number(
                        get_student_moment_total(
                            enriched_values,
                            student_id,
                            get_document_id(moment),
                        )
                    ),
                }
                for moment in group["moments"]
            ]
            group_average = (
                sum(moment["studentTotal"] for moment in moment_summaries) / len(moment_summaries)
                if moment_summaries
                else 0
            )
            weighted_value = group_average * (to_float(group["weightPercentage"]) / 100)
            final_value += weighted_value
            student_groups.append(
                {
                    "type": group["type"],
                    "weightPercentage": group["weightPercentage"],
                    "moments": moment_summaries,
                    "average": format_number(group_average),
                    "weightedValue": format_number(weighted_value),
                }
            )

        final_percentage = (final_value / final_max_value) * 100 if final_max_value else final_value
        final_range = get_percentage_range(final_percentage, percentage_ranges)
        student_summaries.append(
            {
                "studentId": student_id,
                "studentName": get_student_name(student),
                "groups": student_groups,
                "finalValue": format_number(final_value),
                "finalMaxValue": format_number(final_max_value),
                "finalPercentage": round(final_percentage, 1),
                "finalPercentageText": f"{final_percentage:.1f}%",
                "finalGrade": final_range.get("nota", 0),
                "finalBackgroundColor": final_range.get("backgroundColor"),
                "finalTextColor": final_range.get("textColor"),
            }
        )

    headers = [
        "Aluno",
        *[
            header
            for group in groups
            for header in [
                *[
                    f"{get_moment_name(moment)} ({format_number(get_moment_max_value(moment, []))})"
                    for moment in group["moments"]
                ],
                f"{group['type']} - Média",
                f"{group['type']} - M*{format_number(group['weightPercentage'])}%",
            ]
        ],
        "Final",
        "Nota",
    ]
    rows = [
        [
            student_summary["studentName"],
            *[
                str(value)
                for group in student_summary["groups"]
                for value in [
                    *[moment["studentTotal"] for moment in group["moments"]],
                    group["average"],
                    group["weightedValue"],
                ]
            ],
            str(student_summary["finalValue"]),
            str(student_summary["finalGrade"]),
        ]
        for student_summary in student_summaries
    ]

    return {
        **metadata,
        "title": metadata.get("title") or f"Avaliações - {semester}.º semestre",
        "tests": [
            {
                "id": get_document_id(moment),
                "name": get_moment_name(moment),
                "totalValue": format_number(get_moment_max_value(moment, [])),
            }
            for moment in semester_moments
        ],
        "groups": [
            {
                "type": group["type"],
                "weightPercentage": group["weightPercentage"],
                "moments": [
                    {
                        "id": get_document_id(moment),
                        "name": get_moment_name(moment),
                        "totalValue": format_number(get_moment_max_value(moment, [])),
                    }
                    for moment in group["moments"]
                ],
            }
            for group in groups
        ],
        "headers": headers,
        "rows": rows,
        "students": student_summaries,
    }


def get_semester_evaluations_comparison_payload(document):
    return {
        "tests": document.get("tests") or [],
        "groups": document.get("groups") or [],
        "headers": document.get("headers") or [],
        "rows": document.get("rows") or [],
        "students": document.get("students") or [],
    }


async def find_moments_for_values(value_documents, query):
    moment_query = {}

    if query.get("userId"):
        moment_query["userId"] = query.get("userId")
    if query.get("classId"):
        moment_query["classId"] = query.get("classId")

    response = await api_client.find(
        endpoint="find",
        payload={"collection": MOMENTS_COLLECTION, "query": moment_query},
    )
    moments = response.get("documents") or []
    moment_ids = {value_document.get("momentId") for value_document in value_documents}

    return [
        moment for moment in moments
        if not moment_ids or get_document_id(moment) in moment_ids
    ]


async def get_normalized_app_settings():
    response = await api_client.find(
        endpoint="find",
        payload={"collection": APP_SETTINGS_COLLECTION, "query": {"key": APP_SETTINGS_KEY}},
    )
    documents = response.get("documents") or []
    settings = {**DEFAULT_APP_SETTINGS, **(documents[0] if documents else {})}
    settings["evaluationMomentTemplates"] = normalize_evaluation_moment_templates(
        settings.get("evaluationMomentTemplates"),
    )
    settings["percentageRanges"] = normalize_percentage_ranges(settings.get("percentageRanges"))
    return settings


async def find_enriched_moment_values(query):
    response = await api_client.find(
        endpoint="find",
        payload={"collection": CLASS_MOMENTS_COLLECTION, "query": query},
    )
    value_documents = response.get("documents") or []
    if not value_documents:
        return []

    moments = await find_moments_for_values(value_documents, query)
    settings = await get_normalized_app_settings()
    return enrich_student_moment_values(value_documents, moments, settings["percentageRanges"])


async def get_semester_evaluations_summary(body):
    required_fields = [
        "userId",
        "schoolId",
        "yearId",
        "classId",
        "semester",
    ]
    missing_fields = [field for field in required_fields if body.get(field) in (None, "")]

    if missing_fields:
        return None, JSONResponse(
            status_code=400,
            content={"message": f"Campos obrigatórios em falta: {', '.join(missing_fields)}."},
        )

    class_id = body.get("classId")
    user_id = body.get("userId")
    class_query = {"userId": user_id, "classId": class_id}
    students_response = await api_client.find(
        endpoint="find",
        payload={"collection": STUDENTS_COLLECTION, "query": class_query},
    )
    moments_response = await api_client.find(
        endpoint="find",
        payload={"collection": MOMENTS_COLLECTION, "query": class_query},
    )
    values_response = await api_client.find(
        endpoint="find",
        payload={"collection": CLASS_MOMENTS_COLLECTION, "query": class_query},
    )
    settings = await get_normalized_app_settings()
    metadata = {
        "userId": user_id,
        "schoolId": body.get("schoolId"),
        "schoolName": body.get("schoolName"),
        "yearId": body.get("yearId"),
        "academicYearId": body.get("academicYearId") or body.get("yearId"),
        "academicYearName": body.get("academicYearName"),
        "classId": class_id,
        "className": body.get("className"),
        "semester": str(body.get("semester")),
        "title": body.get("title"),
    }
    summary = build_semester_evaluations_summary(
        metadata,
        students_response.get("documents") or [],
        moments_response.get("documents") or [],
        values_response.get("documents") or [],
        settings,
    )
    saved_response = await api_client.find(
        endpoint="find",
        payload={
            "collection": SEMESTER_EVALUATIONS_COLLECTION,
            "query": {
                "userId": user_id,
                "schoolId": body.get("schoolId"),
                "yearId": body.get("yearId"),
                "classId": class_id,
                "semester": str(body.get("semester")),
            },
        },
    )
    saved_documents = saved_response.get("documents") or []
    saved_summary = saved_documents[0] if saved_documents else None
    summary["hasUnsavedChanges"] = (
        saved_summary is None
        or get_semester_evaluations_comparison_payload(saved_summary)
        != get_semester_evaluations_comparison_payload(summary)
    )

    return summary, None


async def get_moment_assessment_report_data(body):
    required_fields = ["userId", "classId", "momentId"]
    missing_fields = [field for field in required_fields if body.get(field) in (None, "")]

    if missing_fields:
        return None, JSONResponse(
            status_code=400,
            content={"message": f"Campos obrigatórios em falta: {', '.join(missing_fields)}."},
        )

    class_query = {"userId": body.get("userId"), "classId": body.get("classId")}
    moment_id = str(body.get("momentId"))
    students_response = await api_client.find(
        endpoint="find",
        payload={"collection": STUDENTS_COLLECTION, "query": class_query},
    )
    moments_response = await api_client.find(
        endpoint="find",
        payload={"collection": MOMENTS_COLLECTION, "query": class_query},
    )
    values_response = await api_client.find(
        endpoint="find",
        payload={
            "collection": CLASS_MOMENTS_COLLECTION,
            "query": {**class_query, "momentId": body.get("momentId")},
        },
    )
    moments = moments_response.get("documents") or []
    moment = next(
        (
            moment
            for moment in moments
            if str(get_document_id(moment)) == moment_id
        ),
        None,
    )

    if not moment:
        return None, JSONResponse(
            status_code=404,
            content={"message": "Momento de avaliação não encontrado."},
        )

    settings = await get_normalized_app_settings()
    values = values_response.get("documents") or []
    enriched_values = enrich_student_moment_values(values, [moment], settings["percentageRanges"])
    questions = [
        question
        for question in moment.get("questions", [])
        if isinstance(question, dict)
    ]
    active_students = [
        student
        for student in (students_response.get("documents") or [])
        if student.get("active") is not False
    ]
    headers = [
        "Aluno",
        *[
            f"Q{question.get('number') or question.get('questionNumber')} ({format_number(to_float(question.get('value')))})"
            for question in questions
        ],
        "Total",
        "%",
        "Nota",
    ]
    rows = []

    for student in active_students:
        student_id = get_document_id(student)
        student_values = [
            next(
                (
                    value_document
                    for value_document in values
                    if str(value_document.get("studentId")) == str(student_id)
                    and str(value_document.get("questionNumber"))
                    == str(question.get("number") or question.get("questionNumber"))
                ),
                {},
            )
            for question in questions
        ]
        matching_enriched_value = next(
            (
                value_document
                for value_document in enriched_values
                if str(value_document.get("studentId")) == str(student_id)
            ),
            {},
        )
        rows.append(
            [
                get_student_name(student),
                *[str(value_document.get("value", 0)) for value_document in student_values],
                str(format_number(to_float(matching_enriched_value.get("studentMomentTotal")))),
                matching_enriched_value.get("studentMomentPercentageText", "0.0%"),
                str(matching_enriched_value.get("studentMomentGrade", 0)),
            ]
        )

    return {
        "title": body.get("title") or get_moment_name(moment),
        "headers": headers,
        "rows": rows,
    }, None


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
    settings["popupBackgroundColor"] = normalize_hex_color(
        settings.get("popupBackgroundColor"),
        DEFAULT_APP_SETTINGS["popupBackgroundColor"],
    )
    settings["popupTextColor"] = normalize_hex_color(
        settings.get("popupTextColor"),
        DEFAULT_APP_SETTINGS["popupTextColor"],
    )
    settings["errorPopupBackgroundColor"] = normalize_hex_color(
        settings.get("errorPopupBackgroundColor"),
        DEFAULT_APP_SETTINGS["errorPopupBackgroundColor"],
    )
    settings["errorPopupTextColor"] = normalize_hex_color(
        settings.get("errorPopupTextColor"),
        DEFAULT_APP_SETTINGS["errorPopupTextColor"],
    )
    settings["evaluationMomentTemplates"] = normalize_evaluation_moment_templates(
        settings.get("evaluationMomentTemplates"),
    )
    settings["percentageRanges"] = normalize_percentage_ranges(settings.get("percentageRanges"))
    if (
        documents[0].get("messageTimeoutSeconds") != settings["messageTimeoutSeconds"]
        or documents[0].get("popupBackgroundColor") != settings["popupBackgroundColor"]
        or documents[0].get("popupTextColor") != settings["popupTextColor"]
        or documents[0].get("errorPopupBackgroundColor") != settings["errorPopupBackgroundColor"]
        or documents[0].get("errorPopupTextColor") != settings["errorPopupTextColor"]
        or documents[0].get("evaluationMomentTemplates") != settings["evaluationMomentTemplates"]
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
        "popupBackgroundColor": normalize_hex_color(
            body.get("popupBackgroundColor"),
            DEFAULT_APP_SETTINGS["popupBackgroundColor"],
        ),
        "popupTextColor": normalize_hex_color(
            body.get("popupTextColor"),
            DEFAULT_APP_SETTINGS["popupTextColor"],
        ),
        "errorPopupBackgroundColor": normalize_hex_color(
            body.get("errorPopupBackgroundColor"),
            DEFAULT_APP_SETTINGS["errorPopupBackgroundColor"],
        ),
        "errorPopupTextColor": normalize_hex_color(
            body.get("errorPopupTextColor"),
            DEFAULT_APP_SETTINGS["errorPopupTextColor"],
        ),
        "evaluationMomentTemplates": normalize_evaluation_moment_templates(
            body.get("evaluationMomentTemplates"),
        ),
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

# curl -X POST http://127.0.0.1:8020/config/addtest -H "Content-Type: application/json" -d "{\"userid\": \"67e32c8bf97d9bb2e993e50d\", \"name\": \"teste 1\", \"questions\": [{\"question\":\"1\", \"value\": \"12\"}, {\"question\":\"2\", \"value\": \"10\"}]}"
@school_tests_router.post("/addtest")
async def add_school_test(request: Request,  _: None = Depends(utilities.verificar_token_cookie)):
    return await utilities.add_document(api_client=api_client, request=request, collection=TESTS_COLLECTION, source="school_tests_router", method="add_school_test")

# curl -X GET http://127.0.0.1:8020/config/findtest -H "Content-Type: application/json" -d "{\"userid\": \"67e32c8bf97d9bb2e993e50d\", \"name\": \"teste 1\", \"questions\": [{\"question\":\"1\", \"value\": \"12\"}, {\"question\":\"2\", \"value\": \"10\"}]}"
@school_tests_router.get("/findtest")
async def find_school_test(request: Request,  _: None = Depends(utilities.verificar_token_cookie)):
    return await utilities.get_documents(api_client=api_client, endpoint="find", request=request, collection=TESTS_COLLECTION, source="school_tests_router", method="find_school_test")

# curl -X GET http://127.0.0.1:8020/config/findtestbyid -H "Content-Type: application/json" -d "{\"id\": \"67e32c8bf97d9bb2e993e50d\" }"
@school_tests_router.get("/findtestbyid")
async def findbyid_school_test(request: Request,  _: None = Depends(utilities.verificar_token_cookie)):
    return await utilities.get_documents(api_client=api_client, endpoint="findbyid", request=request, collection=TESTS_COLLECTION, source="school_tests_router", method="findbyid_school_test")

# curl -X POST http://127.0.0.1:8020/config/addclasstotest -H "Content-Type: application/json" -d "{\"userid\": \"67e32c8bf97d9bb2e993e50d\", \"classid\":\"67e32c8bf97d9bb2e993e50d\",\"testid\":\"67e342b8f97d9bb2e993e524\",\"students\":[{\"id\":\"1\",\"questions\":[{\"question\":\"1\",\"value\":\"12\",\"currentvalue\":\"10\"},{\"question\":\"2\",\"value\":\"10\",\"currentvalue\":\"9\"}]},{\"id\":\"2\",\"questions\":[{\"question\":\"1\",\"value\":\"12\",\"currentvalue\":\"12\"},{\"question\":\"2\",\"value\":\"10\",\"currentvalue\":\"10\"}]}]}"
@school_tests_router.post("/addclasstotest")
async def add_class_to_test(request: Request,  _: None = Depends(utilities.verificar_token_cookie)):
    return await utilities.add_document(api_client=api_client, request=request, collection=STUDENT_TESTES_COLLECTION, source="school_tests_router", method="add_school_test")

# curl -X GET http://127.0.0.1:8020/config/findclasstotest -H "Content-Type: application/json" -d "{\"userid\": \"67e32c8bf97d9bb2e993e50d\", \"classid\":\"67e32c8bf97d9bb2e993e50d\",\"testid\":\"67e342b8f97d9bb2e993e524\",\"students\":[{\"id\":\"1\",\"questions\":[{\"question\":\"1\",\"value\":\"12\",\"currentvalue\":\"10\"},{\"question\":\"2\",\"value\":\"10\",\"currentvalue\":\"9\"}]},{\"id\":\"2\",\"questions\":[{\"question\":\"1\",\"value\":\"12\",\"currentvalue\":\"12\"},{\"question\":\"2\",\"value\":\"10\",\"currentvalue\":\"10\"}]}]}"
@school_tests_router.get("/findclasstotest")
async def find_class_to_test(request: Request,  _: None = Depends(utilities.verificar_token_cookie)):
    return await utilities.get_documents(api_client=api_client, endpoint="find", request=request, collection=STUDENT_TESTES_COLLECTION, source="school_tests_router", method="find_class_to_test")

# curl -X GET http://127.0.0.1:8020/config/findbyidclasstotest -H "Content-Type: application/json" -d "{\"id\": \"67e32c8bf97d9bb2e993e50d\"}"
@school_tests_router.get("/findbyidclasstotest")
async def findbyid_class_to_test(request: Request,  _: None = Depends(utilities.verificar_token_cookie)):
    return await utilities.get_documents(api_client=api_client, endpoint="findbyid", request=request, collection=STUDENT_TESTES_COLLECTION, source="school_tests_router", method="findbyid_class_to_test")

# curl -X POST http://127.0.0.1:8020/config/addevaluationmoments -H "Content-Type: application/json" -d "{\"user\":\"user\", \"moments\":[{\"id\":\"1\",\"name\":\"name 1\",\"percentage\":12},{\"id\":\"2\",\"name\":\"name 2\",\"percentage\":30},{\"id\":\"3\",\"name\":\"name 3\",\"percentage\":40}]}"
@school_tests_router.post("/addevaluationmoments")
async def create_evoluation_moments(request: Request,  _: None = Depends(utilities.verificar_token_cookie)):
    body = await request.json()
    validation_error = validate_evaluation_moment_payload(body)
    if validation_error:
        return JSONResponse(status_code=400, content={"message": validation_error})

    response = await api_client.find(
        endpoint="find",
        payload={"collection": MOMENTS_COLLECTION, "query": body},
    )
    if response.get("documents"):
        document_id = response.get("documents", [{}])[0].get("_id", "unknown")
        return JSONResponse(
            status_code=400,
            content={"message": f"Document already exists: id={document_id}"},
        )

    created = await api_client.insert(
        endpoint="insert",
        payload={"collection": MOMENTS_COLLECTION, "data": body},
    )
    created_id = created.get("id")
    if not created_id:
        return JSONResponse(
            status_code=404,
            content={"message": f"Error creating create_evoluation_moments {body}"},
        )

    return JSONResponse(
        content={"message": "Create_evoluation_moments added successfully", "id": created_id},
        status_code=201,
    )

# curl -X GET http://127.0.0.1:8020/config/findevaluationmoments -H "Content-Type: application/json" -d "{\"user\":\"user\", \"moments\":[{\"id\":\"1\",\"name\":\"name 1\",\"percentage\":12},{\"id\":\"2\",\"name\":\"name 2\",\"percentage\":30},{\"id\":\"3\",\"name\":\"name 3\",\"percentage\":40}]}"
@school_tests_router.post("/findevaluationmoments")
@school_tests_router.get("/findevaluationmoments")
async def find_evoluation_moments(request: Request,  _: None = Depends(utilities.verificar_token_cookie)):
    return await utilities.get_documents(api_client=api_client, endpoint="find", request=request, collection=MOMENTS_COLLECTION, source="school_tests_router", method="find_evoluation_moments")

# curl -X GET http://127.0.0.1:8020/config/findbyidevaluationmoments -H "Content-Type: application/json" -d "{\"id\":\"werrwerwe\"}"
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

    validation_error = validate_evaluation_moment_payload(data)
    if validation_error:
        return JSONResponse(status_code=400, content={"message": validation_error})

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

# curl -X POST http://127.0.0.1:8020/config/addclassmoments -H "Content-Type: application/json" -d "{\"user\":\"user\", \"classid\":\"67e32c8bf97d9bb2e993e50d\",\"momentid\":\"67e34a1bf97d9bb2e993e52a\",\"students\":[{\"moments\":[{\"id\":\"1\",\"name\":\"name 1\",\"percentage\":12,\"studentid\":\"1\",\"testid\":\"67e342b8f97d9bb2e993e524\",\"studentvalue\":\"\"},{\"id\":\"2\",\"name\":\"name 2\",\"percentage\":30,\"studentid\":\"2\",\"testid\":\"67e342b8f97d9bb2e993e524\",\"studentvalue\":\"\"},{\"id\":\"3\",\"name\":\"name 3\",\"percentage\":40,\"studentid\":\"3\",\"testid\":\"67e342b8f97d9bb2e993e524\",\"studentvalue\":\"\"}]},{\"moments\":[{\"id\":\"1\",\"name\":\"name 1\",\"percentage\":12,\"testid\":\"\",\"studentid\":\"1\",\"studentvalue\":\"\"},{\"id\":\"2\",\"name\":\"name 2\",\"percentage\":30,\"testid\":\"\",\"studentid\":\"2\",\"studentvalue\":\"\"},{\"id\":\"3\",\"name\":\"name 3\",\"percentage\":40,\"testid\":\"\",\"studentid\":\"3\",\"studentvalue\":\"\"}]},{\"moments\":[{\"id\":\"1\",\"name\":\"name 1\",\"percentage\":12,\"testid\":\"\",\"studentid\":\"1\",\"studentvalue\":\"\"},{\"id\":\"2\",\"name\":\"name 2\",\"percentage\":30,\"testid\":\"\",\"studentid\":\"2\",\"studentvalue\":\"\"},{\"id\":\"3\",\"name\":\"name 3\",\"percentage\":40,\"testid\":\"\",\"studentid\":\"3\",\"studentvalue\":\"\"}]}]}"
@school_tests_router.post("/addmomentsclass")
async def add_moments_class(request: Request,  _: None = Depends(utilities.verificar_token_cookie)):
    return await utilities.add_document(api_client=api_client, request=request, collection=CLASS_MOMENTS_COLLECTION, source="school_tests_router", method="add_moments_class")

# curl -X GET http://127.0.0.1:8020/config/findmomentsclass -H "Content-Type: application/json" -d "{\"user\":\"user\", \"classid\":\"67e32c8bf97d9bb2e993e50d\",\"momentid\":\"67e34a1bf97d9bb2e993e52a\"}"
@school_tests_router.get("/findmomentsclass")
@school_tests_router.post("/findmomentsclass")
async def find_moments_class(request: Request,  _: None = Depends(utilities.verificar_token_cookie)):
    try:
        try:
            query = await request.json()
        except Exception:
            query = {}

        return JSONResponse(content=await find_enriched_moment_values(query), status_code=200)
    except Exception as e:
        await utilities.add_log_to_db(
            api_client=api_client,
            source="school_tests_router",
            method="find_moments_class",
            message=f"Get find_moments_class error: {e}",
            error=True,
        )
        return JSONResponse(status_code=500, content={"message": f"Get find_moments_class error: {e}"})


@school_tests_router.post("/semester-evaluations-summary")
async def semester_evaluations_summary(request: Request, _: None = Depends(utilities.verificar_token_cookie)):
    body = await request.json()
    summary, error_response = await get_semester_evaluations_summary(body)
    if error_response:
        return error_response

    return JSONResponse(content=summary, status_code=200)


@school_tests_router.put("/addstudentscalendar")
async def add_student_calendar_task(request: Request, _: None = Depends(utilities.verificar_token_cookie)):
    return await utilities.add_document(
        api_client=api_client,
        request=request,
        collection=STUDENT_CALENDAR_COLLECTION,
        source="school_tests_router",
        method="add_student_calendar_task",
    )


@school_tests_router.post("/findstudentscalendar")
async def find_student_calendar_tasks(request: Request, _: None = Depends(utilities.verificar_token_cookie)):
    return await utilities.get_documents(
        api_client=api_client,
        endpoint="find",
        request=request,
        collection=STUDENT_CALENDAR_COLLECTION,
        source="school_tests_router",
        method="find_student_calendar_tasks",
    )


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

    numeric_value = normalize_moment_value(body.get("value"))
    if numeric_value is None:
        return JSONResponse(
            status_code=400,
            content={"message": "Insere um valor válido para a questão."},
        )

    query = {field: body.get(field) for field in required_fields}
    group_query = {field: body.get(field) for field in required_fields if field != "questionNumber"}
    moment = await find_moment_for_value(body)
    question_value = get_question_max_value(
        moment,
        body.get("questionNumber"),
        body.get("questionValue"),
    )

    if question_value and numeric_value > question_value:
        return JSONResponse(
            status_code=400,
            content={
                "message": (
                    f"O valor da questão {body.get('questionNumber')} "
                    f"não pode ultrapassar {format_number(question_value)}."
                )
            },
        )

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
        "questionValue": format_number(question_value),
        "value": format_number(numeric_value),
    }

    existing_group_response = await api_client.find(
        endpoint="find",
        payload={"collection": CLASS_MOMENTS_COLLECTION, "query": group_query},
    )
    existing_group_values = existing_group_response.get("documents") or []
    projected_values = build_projected_student_moment_values(existing_group_values, data)
    moment_max_value = get_moment_max_value(moment, projected_values)
    projected_total = sum(to_float(value_document.get("value")) for value_document in projected_values)

    if moment_max_value and projected_total > moment_max_value:
        return JSONResponse(
            status_code=400,
            content={
                "message": (
                    f"O total do aluno não pode ultrapassar {format_number(moment_max_value)}. "
                    f"Total atual: {format_number(projected_total)}."
                )
            },
        )

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
            enriched_values = await find_enriched_moment_values(group_query)
            current_value = next(
                (
                    value
                    for value in enriched_values
                    if value.get("questionNumber") == body.get("questionNumber")
                ),
                data,
            )
            return JSONResponse(content={"value": current_value}, status_code=200)

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
        enriched_values = await find_enriched_moment_values(group_query)
        current_value = next(
            (
                value
                for value in enriched_values
                if value.get("questionNumber") == body.get("questionNumber")
            ),
            {**data, "_id": created_id},
        )
        return JSONResponse(content={"id": created_id, "value": current_value}, status_code=201)

    enriched_values = await find_enriched_moment_values(group_query)
    current_value = next(
        (
            value
            for value in enriched_values
            if value.get("questionNumber") == body.get("questionNumber")
        ),
        data,
    )
    return JSONResponse(content={"value": current_value}, status_code=200)


@school_tests_router.post("/moment-assessment-report")
async def create_moment_assessment_report(request: Request,  _: None = Depends(utilities.verificar_token_cookie)):
    body = await request.json()
    if body.get("reportType") == "moment-assessment":
        report_data, error_response = await get_moment_assessment_report_data(body)
        if error_response:
            return error_response
        body = report_data
    elif body.get("reportType") == "semester-evaluations":
        summary, error_response = await get_semester_evaluations_summary(body)
        if error_response:
            return error_response
        body = {
            "title": summary["title"],
            "headers": summary["headers"],
            "rows": summary["rows"],
        }

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
    data, error_response = await get_semester_evaluations_summary(body)
    if error_response:
        return error_response

    data["hasUnsavedChanges"] = False
    required_fields = ["userId", "schoolId", "yearId", "classId", "semester"]
    query = {field: data.get(field) for field in required_fields}

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

# curl -X GET http://127.0.0.1:8020/config/findbyidmomentsclass -H "Content-Type: application/json" -d "{ \"id\":\"67e32c8bf97d9bb2e993e50d\" }"
@school_tests_router.get("/findbyidmomentsclass")
async def findbyid_moments_class(request: Request,  _: None = Depends(utilities.verificar_token_cookie)):
    return await utilities.get_documents(api_client=api_client, endpoint="findbyid", request=request, collection=CLASS_MOMENTS_COLLECTION, source="school_tests_router", method="findbyid_moments_class")
