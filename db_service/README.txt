curl -X POST "http://127.0.0.1:8000/insert" -H "Content-Type: application/json" -d "{\"collection\": \"test_collection\", \"data\": {\"name\": \"test_document\"}}"

pytest tests/test_db_routes.py