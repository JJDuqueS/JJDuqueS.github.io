"""Tells n8n about new messages. n8n sends the email.

Messages are saved before this runs, so a failed call only delays the email:
the maintenance loop retries pending messages up to max_notify_attempts times.
"""

import logging

import httpx

from app import db
from app.config import Settings

log = logging.getLogger("portfolio.notify")


def describe_failure(error: httpx.HTTPError) -> str:
    """What went wrong calling the webhook and where to look, without the URL or the token."""
    if isinstance(error, httpx.HTTPStatusError):
        status = error.response.status_code
        hints = {
            401: "n8n rejected the token: check the Header Auth credential",
            403: "n8n rejected the token: the header must be X-Webhook-Token with the value from .env",
            404: "n8n has no such webhook: activate the workflow and check the path and the POST method",
            500: "the n8n workflow failed: open its executions",
        }
        return f"HTTP {status} ({hints.get(status, 'unexpected answer from n8n')})"
    if isinstance(error, httpx.ConnectTimeout):
        return "ConnectTimeout (no answer: a firewall is probably blocking the port from Docker)"
    if isinstance(error, httpx.ConnectError):
        return f"ConnectError ({error}: n8n isn't reachable at that host and port from the container)"
    if isinstance(error, httpx.TimeoutException):
        return f"{type(error).__name__} (n8n accepted the call but took more than 10 s to answer)"
    return f"{type(error).__name__} ({error})"


def notify_pending(settings: Settings, client: httpx.Client | None = None) -> int:
    if not settings.n8n_webhook_url:
        return 0
    sent = 0
    own_client = client is None
    client = client or httpx.Client(timeout=10)
    try:
        for message in db.pending_messages(settings.database_path, settings.max_notify_attempts):
            try:
                response = client.post(
                    settings.n8n_webhook_url,
                    headers={"X-Webhook-Token": settings.n8n_webhook_token},
                    json={
                        "id": message.id,
                        "name": message.name,
                        "email": message.email,
                        "message": message.message,
                        "created_at": message.created_at,
                    },
                )
                response.raise_for_status()
            except httpx.HTTPError as error:
                db.mark_failed(settings.database_path, message.id)
                log.warning("notify failed for message %s: %s", message.id, describe_failure(error))
                continue
            db.mark_notified(settings.database_path, message.id)
            sent += 1
    finally:
        if own_client:
            client.close()
    return sent
