# Running the API on the laptop

The API runs in Docker on the laptop, listening on `127.0.0.1:8080` only. Tailscale Funnel, running on the laptop itself, publishes it at `https://<machine>.<tailnet>.ts.net` (ADR 0004). New messages are saved in SQLite, then sent to an n8n webhook on the same laptop that emails them.

```
visitor ──HTTPS──▶ Tailscale Funnel ──▶ 127.0.0.1:8080 ──▶ api container ──▶ /data/contact.db
                                                              └──webhook──▶ n8n ──▶ email
```

Everything below runs on the laptop, as a user in the `docker` group (`sudo usermod -aG docker $USER`, then log out and back in). The service lives in `/opt/portfolio-api`. Nothing is built there: CI publishes `ghcr.io/jjduques/portfolio-api`, and the laptop pulls it.

## 1. Make the image pullable

After the first merge to `main`, CI publishes the image. On GitHub: your profile → Packages → `portfolio-api` → Package settings → Change visibility → **Public**. The code is already public, and this way the laptop needs no GitHub credentials.

## 2. Get the files

```bash
# /opt is owned by root; the folder itself belongs to you, so no sudo is needed day to day.
sudo mkdir -p /opt/portfolio-api && sudo chown "$USER":"$USER" /opt/portfolio-api
cd /opt/portfolio-api
base=https://raw.githubusercontent.com/JJDuqueS/JJDuqueS.github.io/main/deploy
for file in compose.yaml .env.example backup.sh update.sh; do curl -fsSLO "$base/$file"; done
chmod +x backup.sh update.sh
cp .env.example .env && chmod 600 .env
openssl rand -hex 32   # paste it as N8N_WEBHOOK_TOKEN in .env
nano .env
```

The container runs as user 10001, which must own the data folders:

```bash
mkdir -p data backups && sudo chown 10001:10001 data backups
```

## 3. Start the API

```bash
docker compose up -d
curl -s http://127.0.0.1:8080/api/health
```

The health check should answer `"status":"ok"`. `docker stats --no-stream` should show the container using around 60 MB.

## 4. The n8n workflow

Create a workflow with two nodes and **activate** it, so it listens on `/webhook/` and not only on `/webhook-test/`:

1. **Webhook**: method `POST`, path `portfolio-contact`, authentication **Header Auth** with a credential whose name is `X-Webhook-Token` and whose value is the token from `.env`. Respond: **When last node finishes**, so a failed email returns an error and the API tries again later.
2. **Send Email** (or Gmail) to yourself. Subject `Portfolio: message from {{ $json.body.name }}`, reply-to `{{ $json.body.email }}`, body `{{ $json.body.message }}`.

The API calls `http://host.docker.internal:5678/webhook/portfolio-contact`. That works when n8n publishes port 5678 on the host (`"5678:5678"` in its Compose file) and no firewall blocks it. If it doesn't, see "When n8n doesn't get the message" below.

Check it from the laptop:

```bash
curl -s -X POST http://127.0.0.1:8080/api/contact -H 'Content-Type: application/json' \
  -d '{"name":"Test","email":"you@example.com","message":"Testing the portfolio API."}'
docker compose logs --tail 20 api
```

The email should arrive within seconds. If n8n is down, the message stays in the database and the API retries every 15 minutes, up to 8 times.

### When n8n doesn't get the message

Run the check from inside the container. It sends one test message and says what failed:

```bash
docker compose exec api python -m app.check_webhook
```

| It says | Cause | Fix |
| --- | --- | --- |
| `N8N_WEBHOOK_URL is empty` | `.env` isn't filled in, or the container started before you edited it | Edit `.env`, then `docker compose up -d` |
| `ConnectError (... Name or service not known` | The container can't resolve `host.docker.internal` | Use this repository's `compose.yaml`, which sets `extra_hosts` |
| `ConnectError (... Connection refused` | Nothing answers on that port from Docker: n8n is stopped, uses another port, or publishes it as `127.0.0.1:5678:5678` | `docker ps` to check n8n; publish the port as `"5678:5678"`, or use the shared network below |
| `ConnectTimeout` | A firewall drops traffic from Docker to the host | `sudo ufw allow from 172.16.0.0/12 to any port 5678 proto tcp` (Docker's address range), or use the shared network below |
| `HTTP 404` | n8n has no such webhook | Activate the workflow (the production URL is `/webhook/`, not `/webhook-test/`), and check the path `portfolio-contact` and the method `POST` |
| `HTTP 401` or `HTTP 403` | The token doesn't match | The Header Auth credential needs the name `X-Webhook-Token` and the exact value of `N8N_WEBHOOK_TOKEN` |
| `HTTP 500` | The workflow ran and failed, usually the email node | Open the workflow's executions in n8n |
| `ReadTimeout` | The workflow took more than 10 seconds | Set the Webhook node to respond **Immediately**; a failed email then won't be retried |

**Shared network, when the host route doesn't work.** Put the API and n8n on one Docker network, so the API calls n8n by name and the host's ports and firewall stop mattering:

```bash
docker network create portfolio-n8n
```

In n8n's Compose file, add the network to the n8n service and declare it:

```yaml
services:
  n8n:
    networks: [default, portfolio-n8n]
networks:
  portfolio-n8n:
    external: true
```

In `/opt/portfolio-api`, create `compose.override.yaml`, which Compose loads on its own:

```yaml
services:
  api:
    networks: [default, portfolio-n8n]
networks:
  portfolio-n8n:
    external: true
```

Set `N8N_WEBHOOK_URL=http://n8n:5678/webhook/portfolio-contact` in `.env`, using the n8n service's name. Then run `docker compose up -d` in both folders and repeat the check.

## 5. Publish it with Tailscale Funnel

```bash
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up
sudo tailscale set --hostname=jjd-api        # the public URL starts with this name
sudo tailscale funnel --bg 8080
```

The first `funnel` command may ask you to enable HTTPS certificates and the Funnel attribute in the admin console; follow the link it prints. It then prints the public URL, for example `https://jjd-api.tail1234.ts.net`. With `--bg` it survives reboots. `tailscale funnel status` shows it, and `sudo tailscale funnel --bg 8080 off` turns it off.

From your phone on mobile data, open `https://<that URL>/api/health` and `https://<that URL>/api/docs`.

Then send one message through the public URL and check the log:

```bash
docker compose logs api | grep "visitor addresses"
```

- `are forwarded`: Funnel passes the visitor's IP, and each visitor gets 5 messages an hour.
- `are not forwarded`: every visitor looks the same, and only the shared limit of 30 an hour applies. That still protects the laptop and your inbox; lower `RATE_LIMIT_GLOBAL` if spam gets through.

## 6. Point the site at the API

On GitHub: Settings → Secrets and variables → Actions → Variables → New repository variable, `API_URL` = the Funnel URL, with no trailing `/`. Then Actions → CI → Run workflow on `main`. The new build enables the contact form.

## 7. Updates and backups

```bash
crontab -e
```

```
*/15 * * * * /opt/portfolio-api/update.sh >> /opt/portfolio-api/update.log 2>&1
30 3 * * *   /opt/portfolio-api/backup.sh >> /opt/portfolio-api/backup.log 2>&1
```

`update.sh` pulls the image CI published from `main` and restarts the API only if it changed. `backup.sh` writes a consistent copy with `VACUUM INTO` (copying a live SQLite file is not safe) and keeps the newest 14.

## Restoring a backup

```bash
cd /opt/portfolio-api
docker compose stop api
mv data/contact.db data/contact.db.broken && rm -f data/contact.db-wal data/contact.db-shm
cp backups/contact-YYYY-MM-DDTHHMM.db data/contact.db && sudo chown 10001:10001 data/contact.db
docker compose start api && curl -s http://127.0.0.1:8080/api/health
```

Try it once now, while nothing depends on it.

## Reading messages

The email is the normal way. To look at the database directly:

```bash
docker compose exec api python -c "import sqlite3; [print(r) for r in sqlite3.connect('/data/contact.db').execute('select id, created_at, name, email, notified_at from contact_messages order by id desc limit 10')]"
```
