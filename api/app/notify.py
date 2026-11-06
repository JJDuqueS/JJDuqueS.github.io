"""Tells n8n about new messages. n8n sends the email.

Messages are saved before this runs, so a failed call only delays the email:
the maintenance loop retries pending messages up to max_notify_attempts times.
"""

import logging

import httpx

from app import db
from app.config import Settings

log = logging.getLogger("portfolio.notify")


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
                log.warning("notify failed for message %s: %s", message.id, type(error).__name__)
                continue
            db.mark_notified(settings.database_path, message.id)
            sent += 1
    finally:
        if own_client:
            client.close()
    return sent
