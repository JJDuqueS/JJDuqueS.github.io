#!/usr/bin/env sh
# Daily backup of the contact database, keeping the newest 14 copies.
# cron: 30 3 * * * /opt/portfolio-api/backup.sh >> /opt/portfolio-api/backup.log 2>&1
set -eu
cd "$(dirname "$0")"
stamp=$(date +%Y-%m-%dT%H%M)
docker compose exec -T api python -m app.backup "/backups/contact-$stamp.db"
ls -1t backups/contact-*.db | tail -n +15 | xargs -r rm --
