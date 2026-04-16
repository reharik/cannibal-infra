#!/usr/bin/env bash
# App-owned: extra production images using infra Dockerfile + APP_WORKSPACE_PATH only
# (npm workspace and nx project are derived inside the Dockerfile from basename(path)).
set -euo pipefail

: "${APP_NAME:?}"
: "${GITHUB_SHA:?}"
: "${DOCKER_NODE_VERSION:?}"

mkdir -p artifacts
: > artifacts/extra-image-tags.txt

docker buildx build \
  --load \
  --platform linux/arm64 \
  -f infra/docker/api/Dockerfile \
  --target production \
  --build-arg "NODE_VERSION=${DOCKER_NODE_VERSION}" \
  --build-arg APP_WORKSPACE_PATH=apps/media-worker \
  -t "${APP_NAME}-media-worker:${GITHUB_SHA}" \
  -t "${APP_NAME}-media-worker:latest" \
  .

echo "${APP_NAME}-media-worker:${GITHUB_SHA}" >> artifacts/extra-image-tags.txt
echo "${APP_NAME}-media-worker:latest" >> artifacts/extra-image-tags.txt
