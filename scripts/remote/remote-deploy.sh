#!/usr/bin/env bash
set -euo pipefail

: "${APP_NAME:?APP_NAME required}"
: "${ENV:?ENV required}"
: "${SHA:?SHA required}"
: "${AWS_REGION:?AWS_REGION required}"
: "${S3_BUCKET:?S3_BUCKET required}"

DEPLOY_BACKEND="${DEPLOY_BACKEND:-true}"
DEPLOY_FRONTEND="${DEPLOY_FRONTEND:-true}"

# Conventions (override via env if you want)
APP_ROOT="${APP_ROOT:-/opt/${APP_NAME}}"
FRONTEND_DIR="${FRONTEND_DIR:-${APP_ROOT}/frontend}"
COMPOSE_PROJECT_NAME="${COMPOSE_PROJECT_NAME:-${APP_NAME}-${ENV}}"

# Where deploy.sh uploaded artifacts
S3_PREFIX="${S3_PREFIX:-deployments/${APP_NAME}/${SHA}}"
S3_URI="s3://${S3_BUCKET}/${S3_PREFIX}"

# Artifact names (must match deploy.sh)
BACKEND_TAR="${BACKEND_TAR:-backend.tar.gz}"
FRONTEND_TAR="${FRONTEND_TAR:-frontend.tar.gz}"
REMOTE_COMPOSE_NAME="${REMOTE_COMPOSE_NAME:-docker-compose.yml}"
REMOTE_ENV_NAME="${REMOTE_ENV_NAME:-env.env}"

# Local paths
WORK_DIR="/tmp/${APP_NAME}-${SHA}"
mkdir -p "${WORK_DIR}"

echo "Remote deploy starting"
echo "  APP_NAME=${APP_NAME}"
echo "  ENV=${ENV}"
echo "  SHA=${SHA}"
echo "  APP_ROOT=${APP_ROOT}"
echo "  S3=${S3_URI}"

download_if_exists() {
  local remote_name="$1"
  local local_path="$2"

  if aws s3 ls "${S3_URI}/${remote_name}" --region "${AWS_REGION}" >/dev/null 2>&1; then
    echo "Downloading ${remote_name}"
    aws s3 cp "${S3_URI}/${remote_name}" "${local_path}" --region "${AWS_REGION}"
    return 0
  fi
  return 1
}

# Install optional env file (into the conventional location)
ENV_FILE="${ENV_FILE:-${APP_ROOT}/env/${ENV}.env}"
if download_if_exists "${REMOTE_ENV_NAME}" "${WORK_DIR}/${REMOTE_ENV_NAME}"; then
  echo "Installing env file to ${ENV_FILE}"
  sudo mkdir -p "$(dirname "${ENV_FILE}")"
  sudo install -m 0600 "${WORK_DIR}/${REMOTE_ENV_NAME}" "${ENV_FILE}"
fi

# Install optional compose file
# If present, we install it to ${APP_ROOT}/docker-compose.yml and use it.
COMPOSE_FILE_DEFAULT_1="${APP_ROOT}/docker-compose.${ENV}.yml"
COMPOSE_FILE_DEFAULT_2="${APP_ROOT}/docker-compose.prod.yml"
COMPOSE_FILE_DEFAULT_3="${APP_ROOT}/docker-compose.yml"

COMPOSE_FILE="${COMPOSE_FILE:-${COMPOSE_FILE_DEFAULT_1}}"

if download_if_exists "${REMOTE_COMPOSE_NAME}" "${WORK_DIR}/${REMOTE_COMPOSE_NAME}"; then
  echo "Installing compose file to ${APP_ROOT}/docker-compose.yml"
  sudo install -m 0644 "${WORK_DIR}/${REMOTE_COMPOSE_NAME}" "${APP_ROOT}/docker-compose.yml"
  COMPOSE_FILE="${APP_ROOT}/docker-compose.yml"
else
  # Pick first existing compose file if we didn't download one
  if [[ -f "${COMPOSE_FILE_DEFAULT_1}" ]]; then
    COMPOSE_FILE="${COMPOSE_FILE_DEFAULT_1}"
  elif [[ -f "${COMPOSE_FILE_DEFAULT_2}" ]]; then
    COMPOSE_FILE="${COMPOSE_FILE_DEFAULT_2}"
  elif [[ -f "${COMPOSE_FILE_DEFAULT_3}" ]]; then
    COMPOSE_FILE="${COMPOSE_FILE_DEFAULT_3}"
  fi
fi

# Backend: load docker image from tar.gz (if present)
if [[ "${DEPLOY_BACKEND}" == "true" ]]; then
  if download_if_exists "${BACKEND_TAR}" "${WORK_DIR}/${BACKEND_TAR}"; then
    echo "Loading backend image from ${BACKEND_TAR}"
    gunzip -c "${WORK_DIR}/${BACKEND_TAR}" | sudo docker load
  else
    echo "No backend artifact (${BACKEND_TAR}) found; skipping backend load"
  fi
fi

# Frontend: extract tarball into frontend dir (if present)
if [[ "${DEPLOY_FRONTEND}" == "true" ]]; then
  if download_if_exists "${FRONTEND_TAR}" "${WORK_DIR}/${FRONTEND_TAR}"; then
    echo "Deploying frontend to ${FRONTEND_DIR}"
    sudo mkdir -p "${FRONTEND_DIR}"
    sudo find "${FRONTEND_DIR}" -mindepth 1 -maxdepth 1 -exec rm -rf {} +
    sudo tar -xzf "${WORK_DIR}/${FRONTEND_TAR}" -C "${FRONTEND_DIR}"
  else
    echo "No frontend artifact (${FRONTEND_TAR}) found; skipping frontend deploy"
  fi
fi

# Compose up
ENV_ARGS=()
if [[ -f "${ENV_FILE}" ]]; then
  ENV_ARGS+=(--env-file "${ENV_FILE}")
fi

echo "docker compose up"
echo "  project=${COMPOSE_PROJECT_NAME}"
echo "  file=${COMPOSE_FILE}"

if docker compose version >/dev/null 2>&1; then
  sudo docker compose -p "${COMPOSE_PROJECT_NAME}" -f "${COMPOSE_FILE}" "${ENV_ARGS[@]}" up -d
else
  sudo docker-compose -p "${COMPOSE_PROJECT_NAME}" -f "${COMPOSE_FILE}" "${ENV_ARGS[@]}" up -d
fi

echo "Remote deploy complete"
rm -rf "${WORK_DIR}" || true