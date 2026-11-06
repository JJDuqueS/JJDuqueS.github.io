# The portfolio API. Built by GitHub Actions for linux/amd64 and pulled by the laptop;
# never built on the laptop itself.
FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# Locked, hashed dependencies first, so code changes reuse this layer.
COPY requirements.txt .
RUN pip install --require-hashes -r requirements.txt

COPY app ./app

# An unprivileged user that owns only the data directory.
RUN useradd --system --uid 10001 --no-create-home api \
    && mkdir -p /data /backups \
    && chown api /data /backups
USER api

ENV DATABASE_PATH=/data/contact.db
EXPOSE 8000

HEALTHCHECK --interval=60s --timeout=5s --start-period=20s --retries=3 \
    CMD ["python", "-c", "import urllib.request,sys; sys.exit(0 if urllib.request.urlopen('http://127.0.0.1:8000/api/health', timeout=4).status == 200 else 1)"]

# One worker: SQLite has one writer and the rate limit lives in memory.
CMD ["uvicorn", "--factory", "app.main:create_app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1", "--no-access-log", "--no-server-header"]
