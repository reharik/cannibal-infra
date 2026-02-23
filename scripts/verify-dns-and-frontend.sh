#!/usr/bin/env bash
# Run locally (from repo) to check why chores.backintouch.net works but backintouch.net doesn't.
# Uses dig + curl only; no need to run anything on the server.
set -euo pipefail

echo "=== DNS (both should return the same IP) ==="
APEX_IP=$(dig +short backintouch.net A 2>/dev/null | head -1)
CHORES_IP=$(dig +short chores.backintouch.net A 2>/dev/null | head -1)
echo "  backintouch.net         -> ${APEX_IP:-<no A record>}"
echo "  chores.backintouch.net  -> ${CHORES_IP:-<no A record>}"
if [ -n "$CHORES_IP" ] && [ -n "$APEX_IP" ] && [ "$APEX_IP" != "$CHORES_IP" ]; then
  echo "  >>> FIX: Point backintouch.net A record to $CHORES_IP"
fi

echo ""
echo "=== HTTP/HTTPS (ping is often blocked on EC2; use curl) ==="
echo -n "  https://backintouch.net         -> "
STATUS_APEX=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 https://backintouch.net 2>/dev/null || echo "failed")
echo "${STATUS_APEX}"
echo -n "  https://chores.backintouch.net  -> "
STATUS_CHORES=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 https://chores.backintouch.net 2>/dev/null || echo "failed")
echo "${STATUS_CHORES}"

if [ "$STATUS_APEX" = "failed" ] || [ "$STATUS_APEX" = "000" ]; then
  echo ""
  echo "  >>> backintouch.net not reachable. Check: security group allows 80/443 from your IP; Caddy is running (shared-proxy container)."
elif [ "$STATUS_APEX" = "200" ]; then
  echo "  backintouch.net is serving (200)."
elif [ "$STATUS_APEX" = "404" ]; then
  echo "  >>> backintouch.net returns 404 — frontend not deployed. Run a frontend deploy so /opt/network/frontend has index.html on the server."
fi
