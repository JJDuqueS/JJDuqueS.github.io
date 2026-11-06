import sqlite3
from datetime import UTC, datetime, timedelta

from fastapi.testclient import TestClient

from app import db
from app.config import Settings


def test_health_reports_the_laptop_without_identifying_it(client: TestClient) -> None:
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.headers["cache-control"] == "no-store"
    body = response.json()
    assert body["status"] == "ok"
    assert set(body["host"]) == {"uptime_seconds", "load", "memory_mb"}
    text = response.text.lower()
    for leak in ("hostname", "version", "/data", "127.0.0.1"):
        assert leak not in text


def test_migrations_are_idempotent(settings: Settings) -> None:
    assert db.migrate(settings.database_path) == 1
    assert db.migrate(settings.database_path) == 1
    with sqlite3.connect(settings.database_path) as conn:
        assert conn.execute("PRAGMA journal_mode").fetchone()[0] == "wal"


def test_purges_messages_past_retention(settings: Settings) -> None:
    db.migrate(settings.database_path)
    db.insert_message(settings.database_path, "New", "new@example.com", "A recent message.")
    old = (datetime.now(UTC) - timedelta(days=200)).isoformat(timespec="seconds")
    with sqlite3.connect(settings.database_path) as conn:
        conn.execute(
            "INSERT INTO contact_messages (name, email, message, created_at) VALUES (?, ?, ?, ?)",
            ("Old", "old@example.com", "An old message.", old),
        )
    assert db.purge_older_than(settings.database_path, 180) == 1
    with sqlite3.connect(settings.database_path) as conn:
        assert [row[0] for row in conn.execute("SELECT name FROM contact_messages")] == ["New"]


def test_backup_is_a_readable_copy(settings: Settings, tmp_path) -> None:
    db.migrate(settings.database_path)
    db.insert_message(settings.database_path, "Ada", "ada@example.com", "Hello there, Juan.")
    destination = tmp_path / "backups" / "contact.db"
    db.backup(settings.database_path, str(destination))
    with sqlite3.connect(destination) as conn:
        assert conn.execute("SELECT count(*) FROM contact_messages").fetchone()[0] == 1
