# API

FastAPI service behind the contact form, running on a 2014 laptop with 2 GB of RAM (ADR 0004). One worker, SQLite through the standard library, no ORM.

| Endpoint | What it does |
| --- | --- |
| `GET /api/health` | `ok` or `degraded`, the API's uptime, and the laptop's uptime, load and memory. Nothing that identifies the machine. |
| `POST /api/contact` | Saves a message, then notifies n8n. Contract in `CLAUDE.md`. |
| `GET /api/docs` | Interactive OpenAPI docs. |

## Develop

```bash
cd api
uv venv -p 3.13 && . .venv/bin/activate
uv pip install -e ".[dev]"
DATABASE_PATH=./dev.db CORS_ORIGINS=http://localhost:3000 uvicorn --factory app.main:create_app --reload
ruff check . && ruff format --check . && pytest
```

To see the form working locally, build the site with `NEXT_PUBLIC_API_URL=http://127.0.0.1:8000`.

## How it behaves

- **Validation**: Pydantic, with the limits from the contract. Invalid fields get a 422.
- **Honeypot**: a filled `website` field gets a normal 201 and nothing is stored.
- **Rate limit**: in memory, per visitor when the proxy forwards `X-Forwarded-For`, and for everyone together. Over the limit: 429 with `Retry-After`. Counts reset when the API restarts.
- **Save first, notify after**: the message is stored before n8n is called. A background loop retries pending notifications every 15 minutes, up to 8 times, and deletes messages older than `RETENTION_DAYS`.
- **Privacy**: no IP address or user agent is stored, and access logs are off.
- **Migrations**: `app/migrations/NNNN_name.sql`, applied in order at startup and tracked with `PRAGMA user_version`. Add a new file; never edit an applied one.
- **Backups**: `python -m app.backup DESTINATION` writes a consistent copy with `VACUUM INTO`.
- **Webhook check**: `python -m app.check_webhook` sends one test message to n8n and explains any failure. The same explanation goes to the log when a notification fails.

## Dependencies

`requirements.txt` is locked with hashes and used by the Docker image. After changing `pyproject.toml`:

```bash
uv pip compile pyproject.toml -o requirements.txt --python-version 3.13 --generate-hashes
```
