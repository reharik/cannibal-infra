#!/usr/bin/env bash
# Load infra app config: merge infra-owned defaults with consumer infra.app.config.json
# and output KEY=VALUE lines for GITHUB_ENV (or source for local use).
#
# Usage (from repo root):
#   ./infra/scripts/deploy/load-infra-app-config.sh >> "$GITHUB_ENV"   # in Actions
#   eval "$(./infra/scripts/deploy/load-infra-app-config.sh)"          # local export
#
# Consumer config: repo root infra.app.config.json (optional). Any key overrides defaults.
# Defaults: infra/config/infra.app.config.defaults.json
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INFRA_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
DEFAULTS="${INFRA_ROOT}/config/infra.app.config.defaults.json"
CONSUMER="${1:-infra.app.config.json}"

if [[ ! -f "$DEFAULTS" ]]; then
  echo "Defaults not found: $DEFAULTS" >&2
  exit 1
fi

# Merge: defaults first, then consumer overrides (deep merge)
if [[ -f "$CONSUMER" ]]; then
  MERGED=$(jq -s '.[0] * .[1]' "$DEFAULTS" "$CONSUMER")
else
  MERGED=$(jq . "$DEFAULTS")
fi

# Output env vars for GITHUB_ENV (one KEY=VALUE per line; empty values allowed)
# Normalize so missing .ssm / .ssmPoll / .docker get defaults, then output
echo "$MERGED" | jq -r '
  ( . | .ssm = (.ssm // {}) | .ssmPoll = (.ssmPoll // {}) | .docker = (.docker // {}) ) as $c |
  "APP_NAME=" + ($c.appName // "myapp"),
  "ENV_NAME=" + ($c.env // "prod"),
  "AWS_REGION=" + ($c.awsRegion // "us-east-1"),
  "S3_BUCKET=" + ($c.s3Bucket // ""),
  "SSM_TAG_HOST=" + (($c.ssm.tagHost // "prod-shared") | tostring),
  "SSM_TAG_ENV=" + (($c.ssm.tagEnv // "prod") | tostring),
  "SSM_POLL_DELAY_SECONDS=" + (($c.ssmPoll.delaySeconds // 2) | tostring),
  "SSM_POLL_MAX_ATTEMPTS=" + (($c.ssmPoll.maxAttempts // 120) | tostring),
  "DOCKER_NODE_VERSION=" + (($c.docker.nodeVersion // 22) | tostring),
  "DOCKER_API_WORKSPACE_PATH=" + ($c.docker.apiWorkspacePath // "apps/api"),
  "DOCKER_NX_PROJECT=" + ($c.docker.nxProject // "api"),
  "DOCKER_DEV_WORKSPACE=" + ($c.docker.devWorkspaceName // "@app/api"),
  "DOCKER_NODE_ENTRYPOINT=" + ($c.docker.nodeEntrypoint // "apps/api/dist/index.js")
'
