"""The API behind jjduques.github.io.

GET  /api/health   is the laptop up, and how busy is it
POST /api/contact  the contact form (contract in CLAUDE.md)
"""

import asyncio
import logging
import time
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from typing import Annotated

from fastapi import BackgroundTasks, FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app import db, system
from app.config import Settings
from app.notify import notify_pending
from app.ratelimit import SHARED, RateLimiter

log = logging.getLogger("portfolio.api")

# Bigger than any valid message; anything larger is refused before it is parsed.
MAX_BODY_BYTES = 16 * 1024


class ContactIn(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="ignore")

    name: Annotated[str, Field(min_length=1, max_length=100)]
    email: Annotated[EmailStr, Field(max_length=254)]
    message: Annotated[str, Field(min_length=10, max_length=5000)]
    # Honeypot: hidden from people, so anything in it means a bot.
    website: Annotated[str, Field(max_length=500)] = ""


def run_maintenance(settings: Settings) -> None:
    notify_pending(settings)
    purged = db.purge_older_than(settings.database_path, settings.retention_days)
    if purged:
        log.info("purged %s messages older than %s days", purged, settings.retention_days)


def create_app(settings: Settings | None = None) -> FastAPI:
    """Run with `uvicorn --factory app.main:create_app`."""
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
    # httpx logs every request URL, including the webhook's; failures are logged by app.notify.
    logging.getLogger("httpx").setLevel(logging.WARNING)
    settings = settings or Settings.from_env()
    limiter = RateLimiter(settings.rate_limit_per_ip, settings.rate_limit_global)
    started = time.monotonic()

    @asynccontextmanager
    async def lifespan(_: FastAPI) -> AsyncIterator[None]:
        version = db.migrate(settings.database_path)
        log.info("database ready at schema version %s", version)

        async def maintenance_loop() -> None:
            while True:
                try:
                    await asyncio.to_thread(run_maintenance, settings)
                except Exception:
                    log.exception("maintenance failed")
                await asyncio.sleep(settings.maintenance_interval_seconds)

        task = asyncio.create_task(maintenance_loop())
        try:
            yield
        finally:
            task.cancel()

    app = FastAPI(
        title="Juan Duque · portfolio API",
        summary="Runs on a 2014 laptop. Serves the contact form and reports its own health.",
        version="0.1.0",
        docs_url="/api/docs",
        redoc_url=None,
        openapi_url="/api/openapi.json",
        lifespan=lifespan,
    )
    app.state.settings = settings
    app.state.limiter = limiter

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_methods=["GET", "POST"],
        allow_headers=["Content-Type"],
        max_age=600,
    )

    @app.middleware("http")
    async def limit_body_size(request: Request, call_next):
        length = request.headers.get("content-length")
        if length and length.isdigit() and int(length) > MAX_BODY_BYTES:
            return JSONResponse({"detail": "Request body too large."}, status_code=413)
        return await call_next(request)

    reported = {"done": False}

    def client_key(request: Request) -> str:
        forwarded = request.headers.get("x-forwarded-for", "") if settings.trust_forwarded_for else ""
        first = forwarded.split(",")[0].strip()
        if not reported["done"]:
            # Logged once, without the address, so the deployment can confirm what the proxy sends.
            reported["done"] = True
            if first:
                log.info("visitor addresses are forwarded by the proxy: limits apply per visitor")
            else:
                log.info("visitor addresses are not forwarded: only the global limit applies")
        # Without a forwarded address every visitor looks the same (the local proxy),
        # so only the global limit applies.
        return first or SHARED

    @app.get("/api/health", summary="Is the laptop up, and how busy is it")
    def health(response: Response) -> dict:
        response.headers["Cache-Control"] = "no-store"
        database_ok = db.is_healthy(settings.database_path)
        if not database_ok:
            response.status_code = 503
        return {
            "status": "ok" if database_ok else "degraded",
            "database": "ok" if database_ok else "unavailable",
            "uptime_seconds": int(time.monotonic() - started),
            "host": {
                "uptime_seconds": system.host_uptime_seconds(),
                "load": system.load_average(),
                "memory_mb": system.memory_mb(),
            },
        }

    @app.post(
        "/api/contact",
        status_code=201,
        summary="Send me a message",
        responses={422: {"description": "Invalid fields"}, 429: {"description": "Too many messages"}},
    )
    def contact(body: ContactIn, request: Request, background: BackgroundTasks) -> dict:
        if not limiter.allow(client_key(request)):
            raise HTTPException(429, "Too many messages. Try again later.", headers={"Retry-After": "3600"})
        if body.website:
            # Looks like it worked, so the bot moves on. Nothing is stored.
            log.info("honeypot filled, message dropped")
            return {"status": "received"}
        message_id = db.insert_message(settings.database_path, body.name, body.email, body.message)
        log.info("message %s saved", message_id)
        background.add_task(notify_pending, settings)
        return {"status": "received"}

    return app
