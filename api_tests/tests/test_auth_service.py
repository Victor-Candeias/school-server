from uuid import uuid4


def test_auth_register_login_list_delete_flow(client, auth_service_url):
    email = f"api-test-{uuid4()}@example.com"
    password = "P@ssw0rd!123"

    register_response = client.post(
        f"{auth_service_url}/auth/register",
        json={"name": "API Test User", "email": email, "password": password, "role": "tester"},
    )
    assert register_response.status_code == 201

    login_response = client.post(
        f"{auth_service_url}/auth/login",
        json={"email": email, "password": password},
    )
    assert login_response.status_code == 200
    assert login_response.json()["role"] == "tester"

    list_response = client.request(
        "GET",
        f"{auth_service_url}/auth/list",
        json={"email": email},
    )
    assert list_response.status_code == 200
    assert list_response.json()["message"][0]["email"] == email

    delete_response = client.request(
        "DELETE",
        f"{auth_service_url}/auth/delete",
        json={"email": email},
    )
    assert delete_response.status_code == 200

