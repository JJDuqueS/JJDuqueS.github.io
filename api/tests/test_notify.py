import httpx

from app import db
from app.config import Settings
from app.notify import describe_failure, notify_pending


def settings_with_webhook(settings: Settings) -> Settings:
    return Settings(
        database_path=settings.database_path,
        n8n_webhook_url="http://n8n.test/webhook/contact",
        n8n_webhook_token="secret",
        max_notify_attempts=2,
    )


def test_sends_pending_messages_once(settings: Settings) -> None:
    db.migrate(settings.database_path)
    db.insert_message(settings.database_path, "Ada", "ada@example.com", "Hello there, Juan.")
    seen = []

    def handler(request: httpx.Request) -> httpx.Response:
        seen.append((request.headers["x-webhook-token"], request.read()))
        return httpx.Response(200)

    configured = settings_with_webhook(settings)
    client = httpx.Client(transport=httpx.MockTransport(handler))
    assert notify_pending(configured, client) == 1
    assert notify_pending(configured, client) == 0
    assert len(seen) == 1
    assert seen[0][0] == "secret"
    assert b'"email":"ada@example.com"' in seen[0][1]


def test_keeps_failed_messages_and_stops_after_the_last_attempt(settings: Settings) -> None:
    db.migrate(settings.database_path)
    db.insert_message(settings.database_path, "Ada", "ada@example.com", "Hello there, Juan.")
    calls = []

    def handler(request: httpx.Request) -> httpx.Response:
        calls.append(request)
        return httpx.Response(502)

    configured = settings_with_webhook(settings)
    client = httpx.Client(transport=httpx.MockTransport(handler))
    for _ in range(3):
        notify_pending(configured, client)
    assert len(calls) == 2
    assert len(db.pending_messages(settings.database_path, max_attempts=99)) == 1


def test_does_nothing_without_a_webhook(settings: Settings) -> None:
    db.migrate(settings.database_path)
    db.insert_message(settings.database_path, "Ada", "ada@example.com", "Hello there, Juan.")
    assert notify_pending(settings) == 0


def test_failures_say_where_to_look_without_the_url() -> None:
    request = httpx.Request("POST", "http://n8n.test/webhook/secret-path")
    not_found = httpx.HTTPStatusError("x", request=request, response=httpx.Response(404, request=request))
    assert describe_failure(not_found).startswith("HTTP 404 (n8n has no such webhook")
    assert describe_failure(httpx.ConnectTimeout("timed out")).startswith("ConnectTimeout")
    refused = describe_failure(httpx.ConnectError("[Errno 111] Connection refused"))
    assert "Connection refused" in refused
    for text in (describe_failure(not_found), refused):
        assert "secret-path" not in text
