import os
import sys


sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from routes.class_tests_router import normalize_evaluation_moment_templates
from routes.class_tests_router import normalize_attitude_templates
from routes.class_tests_router import normalize_hex_color
from routes.class_tests_router import enrich_student_moment_values
from routes.class_tests_router import build_semester_evaluations_summary
from routes.class_tests_router import validate_evaluation_moment_payload


def test_normalize_evaluation_moment_templates_preserves_valid_templates():
    assert normalize_evaluation_moment_templates(
        [
            {
                "id": "testes",
                "type": " Teste ",
                "weightPercentage": 60,
                "backgroundColor": "#123ABC",
                "averageBackgroundColor": "#234BCD",
                "weightedBackgroundColor": "#345CDE",
                "textColor": "#456DEF",
            },
            {
                "id": "questoes-aula",
                "type": "Questão aula",
                "weightPercentage": "40",
            },
        ]
    ) == [
        {
            "id": "testes",
            "type": "Teste",
            "weightPercentage": 60,
            "backgroundColor": "#123abc",
            "averageBackgroundColor": "#234bcd",
            "weightedBackgroundColor": "#345cde",
            "textColor": "#456def",
        },
        {
            "id": "questoes-aula",
            "type": "Questão aula",
            "weightPercentage": 40,
            "backgroundColor": "#5b21b6",
            "averageBackgroundColor": "#6d28d9",
            "weightedBackgroundColor": "#7c3aed",
            "textColor": "#f5f3ff",
        },
    ]


def test_normalize_evaluation_moment_templates_limits_percentage():
    assert normalize_evaluation_moment_templates(
        [
            {"id": "negative", "type": "Negativo", "weightPercentage": -10},
            {"id": "above", "type": "Acima", "weightPercentage": 140},
        ]
    ) == [
        {
            "id": "negative",
            "type": "Negativo",
            "weightPercentage": 0,
            "backgroundColor": "#1e40af",
            "averageBackgroundColor": "#1d4ed8",
            "weightedBackgroundColor": "#2563eb",
            "textColor": "#eff6ff",
        },
        {
            "id": "above",
            "type": "Acima",
            "weightPercentage": 100,
            "backgroundColor": "#5b21b6",
            "averageBackgroundColor": "#6d28d9",
            "weightedBackgroundColor": "#7c3aed",
            "textColor": "#f5f3ff",
        },
    ]


def test_normalize_evaluation_moment_templates_accepts_decimal_percentage():
    assert normalize_evaluation_moment_templates(
        [
            {"id": "decimal-point", "type": "Decimal ponto", "weightPercentage": "12.345"},
            {"id": "decimal-comma", "type": "Decimal vírgula", "weightPercentage": "12,34"},
        ]
    ) == [
        {
            "id": "decimal-point",
            "type": "Decimal ponto",
            "weightPercentage": 12.35,
            "backgroundColor": "#1e40af",
            "averageBackgroundColor": "#1d4ed8",
            "weightedBackgroundColor": "#2563eb",
            "textColor": "#eff6ff",
        },
        {
            "id": "decimal-comma",
            "type": "Decimal vírgula",
            "weightPercentage": 12.34,
            "backgroundColor": "#5b21b6",
            "averageBackgroundColor": "#6d28d9",
            "weightedBackgroundColor": "#7c3aed",
            "textColor": "#f5f3ff",
        },
    ]


def test_normalize_evaluation_moment_templates_discards_invalid_rows():
    assert normalize_evaluation_moment_templates(
        [
            {"type": "", "weightPercentage": 20},
            {"type": "Sem percentagem", "weightPercentage": "inválida"},
            None,
        ]
    ) == []


def test_normalize_attitude_templates_preserves_valid_templates():
    assert normalize_attitude_templates(
        [
            {
                "id": "participacao",
                "text": " Participação ",
                "alias": " Part. ",
                "weightPercentage": 20,
                "backgroundColor": "#123ABC",
                "weightedBackgroundColor": "#345CDE",
                "textColor": "#456DEF",
            },
            {
                "id": "comportamento",
                "text": "Comportamento",
                "alias": "Comp.",
                "weightPercentage": "30",
            },
        ]
    ) == [
        {
            "id": "participacao",
            "text": "Participação",
            "alias": "Part.",
            "weightPercentage": 20,
            "backgroundColor": "#123abc",
            "weightedBackgroundColor": "#345cde",
            "textColor": "#456def",
        },
        {
            "id": "comportamento",
            "text": "Comportamento",
            "alias": "Comp.",
            "weightPercentage": 30,
            "backgroundColor": "#5b21b6",
            "weightedBackgroundColor": "#7c3aed",
            "textColor": "#f5f3ff",
        },
    ]


def test_normalize_attitude_templates_limits_percentage_and_discards_invalid_rows():
    assert normalize_attitude_templates(
        [
            {"id": "negative", "text": "Negativo", "alias": "Neg.", "weightPercentage": -10},
            {"id": "above", "text": "Acima", "alias": "Ac.", "weightPercentage": 140},
            {"text": "", "alias": "Sem texto", "weightPercentage": 20},
            {"text": "Sem alias", "alias": "", "weightPercentage": 20},
            {"text": "Sem percentagem", "alias": "Sem", "weightPercentage": "inválida"},
            None,
        ]
    ) == [
        {
            "id": "negative",
            "text": "Negativo",
            "alias": "Neg.",
            "weightPercentage": 0,
            "backgroundColor": "#1e40af",
            "weightedBackgroundColor": "#2563eb",
            "textColor": "#eff6ff",
        },
        {
            "id": "above",
            "text": "Acima",
            "alias": "Ac.",
            "weightPercentage": 100,
            "backgroundColor": "#5b21b6",
            "weightedBackgroundColor": "#7c3aed",
            "textColor": "#f5f3ff",
        },
    ]


def test_normalize_attitude_templates_accepts_decimal_percentage():
    assert normalize_attitude_templates(
        [
            {"id": "decimal-point", "text": "Decimal ponto", "alias": "P.", "weightPercentage": "7.899"},
            {"id": "decimal-comma", "text": "Decimal vírgula", "alias": "V.", "weightPercentage": "7,89"},
        ]
    ) == [
        {
            "id": "decimal-point",
            "text": "Decimal ponto",
            "alias": "P.",
            "weightPercentage": 7.9,
            "backgroundColor": "#1e40af",
            "weightedBackgroundColor": "#2563eb",
            "textColor": "#eff6ff",
        },
        {
            "id": "decimal-comma",
            "text": "Decimal vírgula",
            "alias": "V.",
            "weightPercentage": 7.89,
            "backgroundColor": "#5b21b6",
            "weightedBackgroundColor": "#7c3aed",
            "textColor": "#f5f3ff",
        },
    ]


def test_normalize_hex_color_preserves_valid_color_in_lowercase():
    assert normalize_hex_color("#A1B2C3", "#ffffff") == "#a1b2c3"


def test_normalize_hex_color_uses_default_for_invalid_values():
    assert normalize_hex_color("green", "#15803d") == "#15803d"
    assert normalize_hex_color("#fff", "#ffffff") == "#ffffff"
    assert normalize_hex_color(None, "#ffffff") == "#ffffff"


def test_enrich_student_moment_values_adds_total_and_percentage():
    assert enrich_student_moment_values(
        [
            {
                "_id": "value-1",
                "momentId": "moment-1",
                "studentId": "student-1",
                "questionNumber": "1",
                "questionValue": 5,
                "value": "4",
            },
            {
                "_id": "value-2",
                "momentId": "moment-1",
                "studentId": "student-1",
                "questionNumber": "2",
                "questionValue": 15,
                "value": "12",
            },
        ],
        [{"_id": "moment-1", "totalValue": 20}],
    ) == [
        {
            "_id": "value-1",
            "momentId": "moment-1",
            "studentId": "student-1",
            "questionNumber": "1",
            "questionValue": 5,
            "value": "4",
            "studentMomentTotal": 16,
            "studentMomentMaxValue": 20,
            "studentMomentPercentage": 80.0,
            "studentMomentPercentageText": "80.0%",
            "studentMomentGrade": 4,
            "studentMomentBackgroundColor": "#15803d",
            "studentMomentTextColor": "#ffffff",
        },
        {
            "_id": "value-2",
            "momentId": "moment-1",
            "studentId": "student-1",
            "questionNumber": "2",
            "questionValue": 15,
            "value": "12",
            "studentMomentTotal": 16,
            "studentMomentMaxValue": 20,
            "studentMomentPercentage": 80.0,
            "studentMomentPercentageText": "80.0%",
            "studentMomentGrade": 4,
            "studentMomentBackgroundColor": "#15803d",
            "studentMomentTextColor": "#ffffff",
        },
    ]


def test_enrich_student_moment_values_falls_back_to_question_values():
    enriched_values = enrich_student_moment_values(
        [
            {
                "momentId": "moment-1",
                "studentId": "student-1",
                "questionNumber": "1",
                "questionValue": 5,
                "value": "2.5",
            },
            {
                "momentId": "moment-1",
                "studentId": "student-1",
                "questionNumber": "2",
                "questionValue": 5,
                "value": "5",
            },
        ],
    )

    assert enriched_values[0]["studentMomentTotal"] == 7.5
    assert enriched_values[0]["studentMomentMaxValue"] == 10
    assert enriched_values[0]["studentMomentPercentage"] == 75.0
    assert enriched_values[0]["studentMomentGrade"] == 4


def test_validate_evaluation_moment_payload_requires_questions_total():
    assert validate_evaluation_moment_payload(
        {
            "totalValue": 20,
            "questions": [
                {"number": "1", "value": 10},
                {"number": "2", "value": 5},
            ],
        }
    ) == "O total das questões deve ser 20. Total atual: 15."


def test_build_semester_evaluations_summary_calculates_groups_and_final_grade():
    summary = build_semester_evaluations_summary(
        {
            "userId": "user-1",
            "schoolId": "school-1",
            "yearId": "year-1",
            "classId": "class-1",
            "semester": "1",
            "title": "Avaliações - 1.º semestre",
        },
        [
            {
                "_id": "student-1",
                "name": "Ana",
                "active": True,
                "attitudes": [
                    {"templateId": "participacao", "value": 4},
                    {"templateId": "comportamento", "value": 5},
                ],
            },
            {
                "_id": "student-2",
                "name": "Bruno",
                "active": True,
                "attitudes": {"participacao": 3, "comportamento": 4},
            },
        ],
        [
            {
                "_id": "moment-1",
                "name": "Teste 1",
                "semester": "1",
                "type": "Teste",
                "totalValue": 20,
                "evaluationMomentTemplateWeightPercentage": 60,
            },
            {
                "_id": "moment-2",
                "name": "Questão aula 1",
                "semester": "1",
                "type": "Questão aula",
                "totalValue": 20,
                "evaluationMomentTemplateWeightPercentage": 40,
            },
        ],
        [
            {"momentId": "moment-1", "studentId": "student-1", "questionNumber": "1", "questionValue": 20, "value": 18},
            {"momentId": "moment-2", "studentId": "student-1", "questionNumber": "1", "questionValue": 20, "value": 14},
            {"momentId": "moment-1", "studentId": "student-2", "questionNumber": "1", "questionValue": 20, "value": 8},
            {"momentId": "moment-2", "studentId": "student-2", "questionNumber": "1", "questionValue": 20, "value": 10},
        ],
        {
            "evaluationMomentTemplates": [
                {"type": "Teste", "weightPercentage": 60},
                {"type": "Questão aula", "weightPercentage": 40},
            ],
            "attitudeTemplates": [
                {"id": "participacao", "text": "Participação", "alias": "Part.", "weightPercentage": 10},
                {"id": "comportamento", "text": "Comportamento", "alias": "Comp.", "weightPercentage": 15},
            ],
            "percentageRanges": None,
        },
    )

    assert summary["headers"] == [
        "Aluno",
        "Teste 1 (20)",
        "Teste - Média",
        "Teste - M*60%",
        "Questão aula 1 (20)",
        "Questão aula - Média",
        "Questão aula - M*40%",
        "Part.",
        "Comp.",
        "Atitudes - 25%",
        "Final",
        "Nota",
    ]
    assert summary["rows"][0] == ["Ana", "18", "18", "10.8", "14", "14", "5.6", "4", "5", "2.25", "16.4", "4"]
    assert summary["rows"][1] == ["Bruno", "8", "8", "4.8", "10", "10", "4", "3", "4", "1.75", "8.8", "2"]
    assert summary["attitudesWeightPercentage"] == 25
    assert summary["students"][0]["attitudesWeightedValue"] == 2.25
    assert summary["students"][0]["finalPercentage"] == 82.0
    assert summary["students"][0]["finalGrade"] == 4


def test_build_semester_evaluations_summary_uses_current_template_label_by_id():
    summary = build_semester_evaluations_summary(
        {
            "userId": "user-1",
            "schoolId": "school-1",
            "yearId": "year-1",
            "classId": "class-1",
            "semester": "1",
            "title": "Avaliações - 1.º semestre",
        },
        [{"_id": "student-1", "name": "Ana", "active": True}],
        [
            {
                "_id": "moment-1",
                "name": "Teste 1",
                "semester": "1",
                "type": "Testes escritos - 45%",
                "evaluationMomentTemplateId": "template-1",
                "evaluationMomentTemplateType": "Testes escritos - 45%",
                "evaluationMomentTemplateWeightPercentage": 45,
                "totalValue": 20,
            },
        ],
        [
            {
                "momentId": "moment-1",
                "studentId": "student-1",
                "questionNumber": "1",
                "questionValue": 20,
                "value": 18,
            },
        ],
        {
            "evaluationMomentTemplates": [
                {"id": "template-1", "type": "Testes escritos", "weightPercentage": 35},
            ],
            "percentageRanges": None,
        },
    )

    assert summary["groups"][0]["type"] == "Testes escritos"
    assert summary["groups"][0]["weightPercentage"] == 35
    assert "Testes escritos - Média" in summary["headers"]
    assert "Testes escritos - M*35%" in summary["headers"]
