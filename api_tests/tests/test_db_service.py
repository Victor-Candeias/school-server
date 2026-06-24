from uuid import uuid4


def test_db_service_crud_flow(client, db_service_url):
    collection = "api_test_documents"
    test_key = f"api-test-{uuid4()}"

    insert_response = client.post(
        f"{db_service_url}/db-api/insert",
        json={"collection": collection, "data": {"test_key": test_key, "value": "created"}},
    )
    assert insert_response.status_code == 200
    document_id = insert_response.json()["id"]

    find_response = client.post(
        f"{db_service_url}/db-api/find",
        json={"collection": collection, "query": {"test_key": test_key}},
    )
    assert find_response.status_code == 200
    assert find_response.json()["documents"][0]["_id"] == document_id

    update_response = client.put(
        f"{db_service_url}/db-api/update",
        json={"collection": collection, "id": document_id, "data": {"value": "updated"}},
    )
    assert update_response.status_code == 200
    assert update_response.json()["modified_count"]["value"] == "updated"

    delete_response = client.request(
        "DELETE",
        f"{db_service_url}/db-api/delete",
        json={"collection": collection, "id": document_id},
    )
    assert delete_response.status_code == 200
    assert delete_response.json()["deleted_count"] == 1

