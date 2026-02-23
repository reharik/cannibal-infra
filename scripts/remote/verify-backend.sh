#!/usr/bin/env bash
set -euo pipefail

if [ -f /opt/network/env/prod.env ]; then
  set -a
  # shellcheck source=/dev/null
  . /opt/network/env/prod.env
  set +a
fi
: "${APP_NAME:=network-prod}"

sleep 5

# Verify API is responding on the port the shared proxy uses (localhost:3000)
if curl -fsS http://127.0.0.1:3000/health >/dev/null; then
  echo "Health check passed (API on :3000)."
  exit 0
fi

echo "Health check failed (API not responding on :3000)."
docker compose --env-file /opt/network/env/prod.env -f /opt/network/docker-compose.prod.yml ps || true
docker compose --env-file /opt/network/env/prod.env -f /opt/network/docker-compose.prod.yml logs --tail=200 || true
exit 1
