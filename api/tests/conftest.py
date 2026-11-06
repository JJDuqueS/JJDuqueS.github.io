from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient

from app.config import Settings
from app.main import create_app


@pytest.fixture
def settings(tmp_path) -> Settings:
    return Settings(
        database_path=str(tmp_path / "contact.db"),
        cors_origins=["https://jjduques.github.io"],
        rate_limit_per_ip=3,
        rate_limit_global=5,
    )


@pytest.fixture
def client(settings: Settings) -> Iterator[TestClient]:
    with TestClient(create_app(settings)) as client:
        yield client


VALID = {
    "name": "Ada Lovelace",
    "email": "ada@example.com",
    "message": "Hello, I'd like to talk about a role.",
}
