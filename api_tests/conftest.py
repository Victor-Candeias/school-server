import os
import time

import httpx
import pytest


DB_SERVICE_URL = os.getenv("DB_SERVICE_URL", "http://127.0.0.1:8000")
AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://127.0.0.1:8010")
SCHOOL_SERVICE_URL = os.getenv("SCHOOL_SERVICE_URL", "http://127.0.0.1:8020")


@pytest.fixture(scope="session")
def db_service_url() -> str:
    return DB_SERVICE_URL


@pytest.fixture(scope="session")
def auth_service_url() -> str:
    return AUTH_SERVICE_URL


@pytest.fixture(scope="session")
def school_service_url() -> str:
    return SCHOOL_SERVICE_URL


@pytest.fixture(scope="session")
def client() -> httpx.Client:
    with httpx.Client(timeout=10.0) as test_client:
        yield test_client


def wait_for_api(client: httpx.Client, base_url: str, service_name: str) -> None:
    last_error = None
    for _ in range(10):
        try:
            response = client.get(f"{base_url}/openapi.json")
            if response.status_code == 200:
                return
            last_error = f"HTTP {response.status_code}"
        except httpx.HTTPError as exc:
            last_error = str(exc)
        time.sleep(0.5)

    pytest.fail(f"{service_name} is not responding at {base_url}: {last_error}")

