#!/usr/bin/env bash
set -euo pipefail

cd /opt/network

# Load env so APP_NAME (and other vars) are available for compose file substitution
if [ -f /opt/network/env/prod.env ]; then
  set -a
  # shellcheck source=/dev/null
  . /opt/network/env/prod.env
  set +a
fi
: "${APP_NAME:=network-prod}"

echo "Starting EC2 deploy at $(date)"

if [ ! -d /opt/network/deploy ]; then
  echo "ERROR: /opt/network/deploy does not exist"
  exit 1
fi

if [ ! -f /opt/network/deploy/network-api.tar.gz ]; then
  echo "ERROR: /opt/network/deploy/network-api.tar.gz not found"
  exit 1
fi

if [ ! -f /opt/network/docker-compose.prod.yml ]; then
  echo "ERROR: /opt/network/docker-compose.prod.yml not found"
  exit 1
fi

echo "Loading Docker image"
gunzip -c /opt/network/deploy/network-api.tar.gz | docker load

# Tear down legacy project "network" if it exists (releases port 3000 for network-prod)
echo "Stopping legacy project if present..."
docker compose -p network --project-directory /opt/network -f /opt/network/docker-compose.prod.yml down 2>/dev/null || true

echo "Starting services via docker compose"
docker compose --env-file /opt/network/env/prod.env --project-directory /opt/network -f /opt/network/docker-compose.prod.yml up -d

# Wait for API container and Docker network DNS to be ready (avoids getaddrinfo EAI_AGAIN for "db")
echo "Waiting for services to be ready..."
sleep 10

echo "Running database migrations"
COMPOSE_CMD=(docker compose --env-file /opt/network/env/prod.env --project-directory /opt/network -f /opt/network/docker-compose.prod.yml exec -T api sh -c "cd /app && npx knex --knexfile apps/api/dist/knexfile.js migrate:latest")
for attempt in 1 2 3 4 5; do
  if "${COMPOSE_CMD[@]}"; then
    break
  fi
  if [ "$attempt" -eq 5 ]; then
    echo "ERROR: Migrations failed after 5 attempts"
    exit 1
  fi
  echo "Migration attempt $attempt failed (e.g. DNS not ready), retrying in 5s..."
  sleep 5
done

echo "Running containers:"
docker compose --env-file /opt/network/env/prod.env --project-directory /opt/network -f /opt/network/docker-compose.prod.yml ps

echo "Cleaning up old Docker images..."
docker image prune -f

# Ensure shared Caddy proxy is running (serves frontend from /opt/network/frontend and /api/* to localhost:3000)
if [ -f /opt/network/scripts/setup-shared-proxy.sh ] && [ -f /opt/shared/Caddyfile ]; then
  /opt/network/scripts/setup-shared-proxy.sh
else
  # Reload only if proxy already exists
  if docker ps --format '{{.Names}}' | grep -q '^shared-proxy$'; then
    echo "Reloading shared Caddy proxy..."
    docker exec shared-proxy caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile 2>/dev/null || true
  fi
fi

echo "Deploy complete"
