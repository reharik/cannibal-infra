#!/usr/bin/env bash
set -euo pipefail

: "${S3_BUCKET:?S3_BUCKET env var is required}"
: "${APP_NAME:?APP_NAME env var is required}"

mkdir -p /opt/network/deploy /opt/network/scripts

aws s3 cp "s3://${S3_BUCKET}/deployments/${APP_NAME}/network-api-latest.tar.gz" \
  /opt/network/deploy/network-api.tar.gz

aws s3 cp "s3://${S3_BUCKET}/deployments/${APP_NAME}/docker-compose.prod.yml" \
  /opt/network/docker-compose.prod.yml

aws s3 cp "s3://${S3_BUCKET}/deployments/${APP_NAME}/deploy-ec2.sh" \
  /opt/network/scripts/deploy-ec2.sh

aws s3 cp "s3://${S3_BUCKET}/deployments/${APP_NAME}/setup-shared-proxy.sh" \
  /opt/network/scripts/setup-shared-proxy.sh 2>/dev/null || true

chmod +x /opt/network/scripts/deploy-ec2.sh
[ -f /opt/network/scripts/setup-shared-proxy.sh ] && chmod +x /opt/network/scripts/setup-shared-proxy.sh

# Shared Caddyfile (used by shared-proxy); may be missing if frontend never deployed
mkdir -p /opt/shared
aws s3 cp "s3://${S3_BUCKET}/deployments/shared/Caddyfile" /opt/shared/Caddyfile 2>/dev/null || true

echo "Backend artifacts downloaded."
