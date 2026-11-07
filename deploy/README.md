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

The API calls `http://host.docker.internal:5678/webhook/portfolio-contact`. That works when n8n publishes port 5678 on the host. If n8n only listens on `127.0.0.1`, publish it on the Docker bridge as well, or change `N8N_WEBHOOK_URL`.

Check it from the laptop:

```bash
curl -s -X POST http://127.0.0.1:8080/api/contact -H 'Content-Type: application/json' \
  -d '{"name":"Test","email":"you@example.com","message":"Testing the portfolio API."}'
docker compose logs --tail 20 api
```

The email should arrive within seconds. If n8n is down, the message stays in the database and the API retries every 15 minutes, up to 8 times.

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
