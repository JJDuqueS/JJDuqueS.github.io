"""python -m app.check_webhook

Sends one test message to the n8n webhook from inside the container and says what
happened. If it works, n8n emails you the test message.
"""

import sys

import httpx

from app.config import Settings
from app.notify import describe_failure

if __name__ == "__main__":
    settings = Settings.from_env()
    if not settings.n8n_webhook_url:
        sys.exit("N8N_WEBHOOK_URL is empty in .env, so messages are only stored.")
    if not settings.n8n_webhook_token:
        print("warning: N8N_WEBHOOK_TOKEN is empty in .env")
    print(f"calling {settings.n8n_webhook_url}")
    try:
        response = httpx.post(
            settings.n8n_webhook_url,
            headers={"X-Webhook-Token": settings.n8n_webhook_token},
            json={
                "id": 0,
                "name": "Webhook check",
                "email": "check@example.com",
                "message": "Test message from python -m app.check_webhook.",
                "created_at": "now",
            },
            timeout=10,
        )
        response.raise_for_status()
    except httpx.HTTPError as error:
        sys.exit(f"failed: {describe_failure(error)}")
    print(f"ok: n8n answered HTTP {response.status_code}. The test email should arrive now.")
