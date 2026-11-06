"""SQLite access with the standard library: one short-lived connection per operation.

The API runs a single worker, so SQLite's single writer is never a bottleneck.
WAL mode lets the backup and the health check read while a message is being written.
"""

import sqlite3
from collections.abc import Iterator
from contextlib import contextmanager
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from importlib import resources
from pathlib import Path


def now() -> str:
    return datetime.now(UTC).isoformat(timespec="seconds")


@contextmanager
def connect(path: str) -> Iterator[sqlite3.Connection]:
    conn = sqlite3.connect(path, timeout=5)
    try:
        conn.execute("PRAGMA busy_timeout = 5000")
        conn.execute("PRAGMA foreign_keys = ON")
        conn.row_factory = sqlite3.Row
        with conn:
            yield conn
    finally:
        conn.close()


def migrate(path: str) -> int:
    """Applies migrations/NNNN_*.sql in order, tracked with PRAGMA user_version."""
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    files = sorted(
        (entry for entry in resources.files("app.migrations").iterdir() if entry.name.endswith(".sql")),
        key=lambda entry: entry.name,
    )
    with connect(path) as conn:
        conn.execute("PRAGMA journal_mode = WAL")
        version = conn.execute("PRAGMA user_version").fetchone()[0]
        for entry in files:
            number = int(entry.name.split("_", 1)[0])
            if number <= version:
                continue
            conn.executescript(entry.read_text(encoding="utf-8"))
            conn.execute(f"PRAGMA user_version = {number}")
            version = number
    return version


@dataclass(frozen=True)
class Message:
    id: int
    name: str
    email: str
    message: str
    created_at: str


def insert_message(path: str, name: str, email: str, message: str) -> int:
    with connect(path) as conn:
        cursor = conn.execute(
            "INSERT INTO contact_messages (name, email, message, created_at) VALUES (?, ?, ?, ?)",
            (name, email, message, now()),
        )
        return int(cursor.lastrowid or 0)


def pending_messages(path: str, max_attempts: int) -> list[Message]:
    with connect(path) as conn:
        rows = conn.execute(
            "SELECT id, name, email, message, created_at FROM contact_messages "
            "WHERE notified_at IS NULL AND notify_attempts < ? ORDER BY id",
            (max_attempts,),
        ).fetchall()
    return [Message(**dict(row)) for row in rows]


def mark_notified(path: str, message_id: int) -> None:
    with connect(path) as conn:
        conn.execute("UPDATE contact_messages SET notified_at = ? WHERE id = ?", (now(), message_id))


def mark_failed(path: str, message_id: int) -> None:
    with connect(path) as conn:
        conn.execute(
            "UPDATE contact_messages SET notify_attempts = notify_attempts + 1 WHERE id = ?", (message_id,)
        )


def purge_older_than(path: str, days: int) -> int:
    cutoff = (datetime.now(UTC) - timedelta(days=days)).isoformat(timespec="seconds")
    with connect(path) as conn:
        return conn.execute("DELETE FROM contact_messages WHERE created_at < ?", (cutoff,)).rowcount


def is_healthy(path: str) -> bool:
    try:
        with connect(path) as conn:
            conn.execute("SELECT 1 FROM contact_messages LIMIT 1").fetchall()
        return True
    except sqlite3.Error:
        return False


def backup(path: str, destination: str) -> None:
    """A consistent copy of a live database. Copying the file itself is not safe."""
    Path(destination).parent.mkdir(parents=True, exist_ok=True)
    if Path(destination).exists():
        raise FileExistsError(destination)
    with connect(path) as conn:
        conn.execute("VACUUM INTO ?", (destination,))
