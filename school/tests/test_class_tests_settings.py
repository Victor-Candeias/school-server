import os
import sys


sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from routes.class_tests_router import normalize_evaluation_moment_templates
from routes.class_tests_router import normalize_hex_color


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


def test_normalize_hex_color_preserves_valid_color_in_lowercase():
    assert normalize_hex_color("#A1B2C3", "#ffffff") == "#a1b2c3"


def test_normalize_hex_color_uses_default_for_invalid_values():
    assert normalize_hex_color("green", "#15803d") == "#15803d"
    assert normalize_hex_color("#fff", "#ffffff") == "#ffffff"
    assert normalize_hex_color(None, "#ffffff") == "#ffffff"
