# 0004. The API on the laptop, exposed with Tailscale Funnel

Date: 2026-11-06
Status: Accepted

Replaces the exposure part of ADR 0002 (Cloudflare Tunnel and Caddy). The rest of 0002 stands: the pages are on GitHub Pages and the API runs on the laptop.

## Context
The contact form needs an API with a stable public HTTPS URL. Cloudflare Tunnel needs a domain whose DNS is on Cloudflare, and there is no domain yet. The laptop has 2 GB of RAM. n8n already runs on the same laptop and can send email.

## Decision
- A FastAPI service, one worker, with `GET /api/health` and `POST /api/contact`, storing messages in its own SQLite file. It runs in Docker and publishes its port on `127.0.0.1` only.
- Tailscale runs on the laptop itself, and `tailscale funnel` publishes that local port at `https://<machine>.<tailnet>.ts.net`. Funnel terminates HTTPS, so there is no Caddy.
- After a message is saved, the API calls an n8n webhook on the same laptop, which sends me the email. Failed notifications are retried; the message is never lost.

## Trade-offs
- Pro: free, no domain, no open ports on the router and no public IP needed.
- Pro: one container less (no Caddy), which matters with 2 GB of RAM.
- Pro: the email logic lives in n8n, where I already build workflows, instead of SMTP code in the API.
- Con: the URL is a `ts.net` name, less professional than `api.<my domain>`. Moving to a domain later means changing the `API_URL` variable and redeploying the site.
- Con: Funnel is in beta, has bandwidth limits that can't be configured, and is a dependency on Tailscale.
- Con: Tailscale's documentation doesn't state whether Funnel forwards the visitor's IP. The rate limit uses `X-Forwarded-For` when it arrives and falls back to a limit shared by all visitors when it doesn't. This is checked at deployment.
- Con: the API now reaches another service on the laptop (the n8n webhook). It is the only exception to "the API must not reach the laptop's other services"; it calls one URL with a shared secret and nothing else.

## Alternatives considered
- Buy a domain and use Cloudflare Tunnel: the original plan, about USD 10–15 a year. It stays the next step once there is a domain.
- SMTP from the API with a Gmail app password: no dependency on n8n, but more code and a credential in the API.
