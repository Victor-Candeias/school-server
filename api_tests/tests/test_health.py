from conftest import wait_for_api


def test_all_services_publish_openapi(client, db_service_url, auth_service_url, school_service_url):
    services = {
        "db_service": db_service_url,
        "auth": auth_service_url,
        "school": school_service_url,
    }

    for service_name, base_url in services.items():
        wait_for_api(client, base_url, service_name)
        response = client.get(f"{base_url}/openapi.json")

        assert response.status_code == 200
        assert "paths" in response.json()


def test_all_services_publish_swagger_docs(client, db_service_url, auth_service_url, school_service_url):
    for base_url in (db_service_url, auth_service_url, school_service_url):
        response = client.get(f"{base_url}/docs")

        assert response.status_code == 200
        assert "text/html" in response.headers["content-type"]

