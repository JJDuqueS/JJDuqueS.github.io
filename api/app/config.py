"""Settings, read once from environment variables. See deploy/.env.example."""

import os
from dataclasses import dataclass, field


def _list(value: str) -> list[str]:
    return [item.strip().rstrip("/") for item in value.split(",") if item.strip()]


@dataclass(frozen=True)
class Settings:
    database_path: str = "/data/contact.db"
    cors_origins: list[str] = field(default_factory=lambda: ["https://jjduques.github.io"])
    # n8n webhook that emails me each new message. Empty = messages are only stored.
    n8n_webhook_url: str = ""
    n8n_webhook_token: str = ""
    # Messages per hour. Per visitor when the proxy forwards their IP, and for everyone together.
    rate_limit_per_ip: int = 5
    rate_limit_global: int = 30
    # Use the first address in X-Forwarded-For. Only safe because the port is bound to
    # 127.0.0.1 on the laptop, so the only client is the Tailscale Funnel proxy.
    trust_forwarded_for: bool = True
    retention_days: int = 180
    max_notify_attempts: int = 8
    maintenance_interval_seconds: int = 900

    @classmethod
    def from_env(cls) -> "Settings":
        env = os.environ
        defaults = cls()
        return cls(
            database_path=env.get("DATABASE_PATH", defaults.database_path),
            cors_origins=_list(env["CORS_ORIGINS"]) if env.get("CORS_ORIGINS") else defaults.cors_origins,
            n8n_webhook_url=env.get("N8N_WEBHOOK_URL", ""),
            n8n_webhook_token=env.get("N8N_WEBHOOK_TOKEN", ""),
            rate_limit_per_ip=int(env.get("RATE_LIMIT_PER_IP", defaults.rate_limit_per_ip)),
            rate_limit_global=int(env.get("RATE_LIMIT_GLOBAL", defaults.rate_limit_global)),
            trust_forwarded_for=env.get("TRUST_FORWARDED_FOR", "true").lower() == "true",
            retention_days=int(env.get("RETENTION_DAYS", defaults.retention_days)),
        )
