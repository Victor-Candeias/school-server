import os
import sys


sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from routes.class_tests_router import normalize_evaluation_moment_templates


def test_normalize_evaluation_moment_templates_preserves_valid_templates():
    assert normalize_evaluation_moment_templates(
        [
            {
                "id": "testes",
                "type": " Teste ",
                "weightPercentage": 60,
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
        },
        {
            "id": "questoes-aula",
            "type": "Questão aula",
            "weightPercentage": 40,
        },
    ]


def test_normalize_evaluation_moment_templates_limits_percentage():
    assert normalize_evaluation_moment_templates(
        [
            {"id": "negative", "type": "Negativo", "weightPercentage": -10},
            {"id": "above", "type": "Acima", "weightPercentage": 140},
        ]
    ) == [
        {"id": "negative", "type": "Negativo", "weightPercentage": 0},
        {"id": "above", "type": "Acima", "weightPercentage": 100},
    ]


def test_normalize_evaluation_moment_templates_discards_invalid_rows():
    assert normalize_evaluation_moment_templates(
        [
            {"type": "", "weightPercentage": 20},
            {"type": "Sem percentagem", "weightPercentage": "inválida"},
            None,
        ]
    ) == []
