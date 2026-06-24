def test_school_public_find_endpoints_do_not_fail(client, school_service_url):
    endpoints = [
        "/schools/find",
        "/years/find",
        "/class/find",
        "/students/find",
    ]

    for endpoint in endpoints:
        response = client.post(f"{school_service_url}{endpoint}", json={})

        assert response.status_code in (200, 400)
        assert response.status_code < 500

