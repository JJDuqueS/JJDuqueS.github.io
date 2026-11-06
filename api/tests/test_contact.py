import sqlite3

from fastapi.testclient import TestClient

from app.config import Settings
from tests.conftest import VALID


def rows(settings: Settings) -> list[tuple]:
    with sqlite3.connect(settings.database_path) as conn:
        return conn.execute("SELECT name, email, message, notified_at FROM contact_messages").fetchall()


def test_saves_a_valid_message(client: TestClient, settings: Settings) -> None:
    response = client.post("/api/contact", json=VALID, headers={"X-Forwarded-For": "203.0.113.1"})
    assert response.status_code == 201
    assert response.json() == {"status": "received"}
    assert rows(settings) == [(VALID["name"], VALID["email"], VALID["message"], None)]


def test_trims_whitespace(client: TestClient, settings: Settings) -> None:
    client.post("/api/contact", json={**VALID, "name": "  Ada  "})
    assert rows(settings)[0][0] == "Ada"


def test_rejects_invalid_fields(client: TestClient, settings: Settings) -> None:
    for bad in (
        {**VALID, "email": "not-an-email"},
        {**VALID, "message": "short"},
        {**VALID, "name": ""},
        {**VALID, "name": "x" * 101},
        {**VALID, "message": "x" * 5001},
        {"name": "Ada"},
    ):
        assert client.post("/api/contact", json=bad).status_code == 422, bad
    assert rows(settings) == []


def test_drops_honeypot_messages_but_answers_like_it_worked(client: TestClient, settings: Settings) -> None:
    response = client.post("/api/contact", json={**VALID, "website": "https://spam.example"})
    assert response.status_code == 201
    assert rows(settings) == []


def test_limits_each_visitor(client: TestClient) -> None:
    headers = {"X-Forwarded-For": "203.0.113.7, 10.0.0.1"}
    codes = [client.post("/api/contact", json=VALID, headers=headers).status_code for _ in range(4)]
    assert codes == [201, 201, 201, 429]
    # Another visitor is still allowed.
    other = client.post("/api/contact", json=VALID, headers={"X-Forwarded-For": "198.51.100.2"})
    assert other.status_code == 201


def test_limits_everyone_together_without_a_forwarded_address(client: TestClient) -> None:
    codes = [client.post("/api/contact", json=VALID).status_code for _ in range(6)]
    assert codes == [201] * 5 + [429]
    assert client.post("/api/contact", json=VALID).headers["retry-after"] == "3600"


def test_refuses_huge_bodies(client: TestClient) -> None:
    response = client.post(
        "/api/contact", content=b"x" * 20_000, headers={"Content-Type": "application/json"}
    )
    assert response.status_code == 413


def test_allows_the_site_origin_only(client: TestClient) -> None:
    preflight = {"Access-Control-Request-Method": "POST", "Access-Control-Request-Headers": "content-type"}
    allowed = client.options("/api/contact", headers={"Origin": "https://jjduques.github.io", **preflight})
    assert allowed.headers["access-control-allow-origin"] == "https://jjduques.github.io"
    denied = client.options("/api/contact", headers={"Origin": "https://evil.example", **preflight})
    assert "access-control-allow-origin" not in denied.headers
