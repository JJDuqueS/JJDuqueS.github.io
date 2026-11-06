#!/usr/bin/env sh
# Pulls the newest API image published by CI and restarts the API only if it changed.
# cron: */15 * * * * ~/portfolio-api/update.sh >> ~/portfolio-api/update.log 2>&1
set -eu
cd "$(dirname "$0")"
before=$(docker compose images -q api 2>/dev/null || true)
docker compose pull --quiet api
docker compose up -d --remove-orphans
after=$(docker compose images -q api)
if [ "$before" != "$after" ]; then
  echo "$(date -Iseconds) updated to $after"
  docker image prune -f >/dev/null
fi
