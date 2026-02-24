# infra/scripts/deploy/common.sh
# Sourced by deploy scripts. Do not include `set -euo pipefail` here.

: "${APP_NAME:?APP_NAME required}"
: "${ENV:?ENV required}"
: "${SHA:?SHA required}"

# Conventions (override by exporting before sourcing if needed)
APP_ROOT="${APP_ROOT:-/opt/${APP_NAME}}"
SHARED_ROOT="${SHARED_ROOT:-/opt/shared}"
FRONTEND_DIR="${FRONTEND_DIR:-${APP_ROOT}/frontend}"

COMPOSE_PROJECT_NAME="${COMPOSE_PROJECT_NAME:-${APP_NAME}-${ENV}}"

# Compose file convention:
# Prefer docker-compose.<env>.yml, fallback to docker-compose.prod.yml, then docker-compose.yml
COMPOSE_FILE_DEFAULT_1="${APP_ROOT}/docker-compose.${ENV}.yml"
COMPOSE_FILE_DEFAULT_2="${APP_ROOT}/docker-compose.prod.yml"
COMPOSE_FILE_DEFAULT_3="${APP_ROOT}/docker-compose.yml"
COMPOSE_FILE="${COMPOSE_FILE:-${COMPOSE_FILE_DEFAULT_1}}"

ENV_FILE_DEFAULT="${APP_ROOT}/env/${ENV}.env"
ENV_FILE="${ENV_FILE:-${ENV_FILE_DEFAULT}}"

# S3 conventions
S3_PREFIX="${S3_PREFIX:-deployments/${APP_NAME}/${SHA}}"

# Artifact names in S3 (all optional)
BACKEND_TAR="${BACKEND_TAR:-backend.tar.gz}"
FRONTEND_TAR="${FRONTEND_TAR:-frontend.tar.gz}"
REMOTE_COMPOSE_NAME="${REMOTE_COMPOSE_NAME:-docker-compose.yml}"
REMOTE_ENV_NAME="${REMOTE_ENV_NAME:-env.env}"

# If you want migrations, set MIGRATIONS_CMD (string) in env or config.
MIGRATIONS_CMD="${MIGRATIONS_CMD:-}"

# Helper to pick first existing compose file
pick_compose_file() {
  if [[ -f "${COMPOSE_FILE_DEFAULT_1}" ]]; then
    echo "${COMPOSE_FILE_DEFAULT_1}"
  elif [[ -f "${COMPOSE_FILE_DEFAULT_2}" ]]; then
    echo "${COMPOSE_FILE_DEFAULT_2}"
  elif [[ -f "${COMPOSE_FILE_DEFAULT_3}" ]]; then
    echo "${COMPOSE_FILE_DEFAULT_3}"
  else
    # Use whatever COMPOSE_FILE is set to (may be a path that will be created via download)
    echo "${COMPOSE_FILE}"
  fi
}