#!/usr/bin/env bash
set -euo pipefail

PROXY_NAME="shared-proxy"
CADDY_IMAGE="caddy:2-alpine"

CADDYFILE_HOST="/opt/shared/Caddyfile"
NETWORK_HOST_DIR="/opt/network/frontend"
CHORE_HOST_DIR="/opt/chore-tracker/frontend"

echo "Setting up shared Caddy proxy..."

# --- Preconditions ---
mkdir -p /opt/shared

if [[ ! -f "$CADDYFILE_HOST" ]]; then
  echo "✗ Missing Caddyfile at $CADDYFILE_HOST"
  echo "  (Your deploy should place it there before calling this script.)"
  exit 1
fi

if [[ ! -d "$NETWORK_HOST_DIR" ]]; then
  echo "✗ Missing network frontend dir: $NETWORK_HOST_DIR"
  exit 1
fi

if [[ ! -d "$CHORE_HOST_DIR" ]]; then
  echo "✗ Missing chore-tracker frontend dir: $CHORE_HOST_DIR"
  exit 1
fi

# Optional: warn if index.html missing on host (often indicates build/deploy issue)
if [[ ! -f "$NETWORK_HOST_DIR/index.html" ]]; then
  echo "⚠ Network host dir has no index.html: $NETWORK_HOST_DIR/index.html"
fi
if [[ ! -f "$CHORE_HOST_DIR/index.html" ]]; then
  echo "⚠ Chore-tracker host dir has no index.html: $CHORE_HOST_DIR/index.html"
fi

# --- Ensure volumes exist (persist certs/config) ---
docker volume create caddy_data_shared >/dev/null 2>&1 || true
docker volume create caddy_config_shared >/dev/null 2>&1 || true

# --- Stop any legacy per-app proxies (best effort) ---
echo "Stopping any legacy per-app proxy containers (best effort)..."
for name in $(docker ps --format '{{.Names}}' | grep -E '(network.*proxy|chore-tracker.*proxy)' || true); do
  echo "Stopping $name"
  docker stop "$name" >/dev/null 2>&1 || true
done

# --- Decide whether we need to (re)create the container ---
needs_recreate=false

if docker ps -a --format '{{.Names}}' | grep -q "^${PROXY_NAME}$"; then
  echo "Shared proxy container exists; verifying mounts..."

  # Check for expected content inside container.
  # If these are missing, the container was created when host dirs were empty or mounts were wrong.
  if ! docker exec "$PROXY_NAME" sh -lc 'test -d /srv/network && test -d /srv/chore-tracker' >/dev/null 2>&1; then
    echo "✗ Expected /srv mounts not present in container"
    needs_recreate=true
  fi

  # Strong signal: index.html should exist for SPAs (at least for chores, and likely for network too)
  if ! docker exec "$PROXY_NAME" sh -lc 'test -f /srv/chore-tracker/index.html' >/dev/null 2>&1; then
    echo "✗ /srv/chore-tracker/index.html missing inside container"
    needs_recreate=true
  fi

  # If network index is missing, recreate too (your current issue)
  if ! docker exec "$PROXY_NAME" sh -lc 'test -f /srv/network/index.html' >/dev/null 2>&1; then
    echo "✗ /srv/network/index.html missing inside container"
    needs_recreate=true
  fi
else
  echo "Shared proxy container does not exist; will create it."
  needs_recreate=true
fi

# --- Recreate if needed ---
if [[ "$needs_recreate" == "true" ]]; then
  echo "Recreating shared proxy container (required to update mounts)..."
  docker rm -f "$PROXY_NAME" >/dev/null 2>&1 || true

  docker run -d \
    --name "$PROXY_NAME" \
    --restart unless-stopped \
    --network host \
    -v "$CADDYFILE_HOST":/etc/caddy/Caddyfile:ro \
    -v "$NETWORK_HOST_DIR":/srv/network:ro \
    -v "$CHORE_HOST_DIR":/srv/chore-tracker:ro \
    -v caddy_data_shared:/data \
    -v caddy_config_shared:/config \
    "$CADDY_IMAGE" >/dev/null
else
  echo "Shared proxy container mounts look OK."
  # Ensure it's running
  if ! docker ps --format '{{.Names}}' | grep -q "^${PROXY_NAME}$"; then
    echo "Starting existing shared proxy..."
    docker start "$PROXY_NAME" >/dev/null
  fi
fi

# --- Reload config (best effort) ---
echo "Reloading Caddyfile (best effort)..."
docker exec "$PROXY_NAME" caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile >/dev/null 2>&1 || true

# --- Status / verification ---
echo ""
echo "Shared proxy status:"
docker ps --filter "name=^/${PROXY_NAME}$" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "Verifying mounts inside container:"
docker exec "$PROXY_NAME" sh -lc 'ls -la /srv/network | head -5' || echo "✗ Network frontend not mounted"
docker exec "$PROXY_NAME" sh -lc 'ls -la /srv/chore-tracker | head -5' || echo "✗ ChoreTracker frontend not mounted"

echo ""
echo "Done."
