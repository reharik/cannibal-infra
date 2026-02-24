name: Deploy to EC2 (SSM + S3 + OIDC)

on:
  push:
    branches: [main]
  workflow_dispatch:
    inputs:
      deploy_backend:
        description: "Deploy backend"
        required: false
        default: true
        type: boolean
      deploy_frontend:
        description: "Deploy frontend"
        required: false
        default: true
        type: boolean

permissions:
  contents: read
  actions: write
  id-token: write

env:
  AWS_REGION: us-east-1
  S3_BUCKET: network-deploy-709865789463-us-east-1
  APP_NAME: network
  ENV_NAME: prod

  # SSM tag targeting defaults (used by infra/scripts/deploy/ssm-run.sh)
  SSM_TAG_HOST: prod-shared
  SSM_TAG_ENV: prod

  # Keep waits bounded
  SSM_POLL_DELAY_SECONDS: "2"
  SSM_POLL_MAX_ATTEMPTS: "120"

jobs:
  detect-changes:
    name: Detect changes
    runs-on: ubuntu-latest
    outputs:
      backend_changed: ${{ steps.manual.outputs.backend_changed || steps.prev_run.outputs.deploy_both || steps.filter.outputs.backend_changed }}
      frontend_changed: ${{ steps.manual.outputs.frontend_changed || steps.prev_run.outputs.deploy_both || steps.filter.outputs.frontend_changed }}
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 2

      - name: Set changes (manual run)
        if: github.event_name == 'workflow_dispatch'
        id: manual
        run: |
          echo "backend_changed=${{ github.event.inputs.deploy_backend }}" >> "$GITHUB_OUTPUT"
          echo "frontend_changed=${{ github.event.inputs.deploy_frontend }}" >> "$GITHUB_OUTPUT"

      - name: Deploy both if previous run failed (push)
        if: github.event_name == 'push'
        id: prev_run
        env:
          GH_TOKEN: ${{ github.token }}
        run: |
          PREV_CONCLUSION=$(gh run list \
            --workflow="${{ github.workflow }}.yml" \
            --branch="${{ github.ref_name }}" \
            --limit=10 \
            --json databaseId,conclusion | \
            jq -r --arg rid "${{ github.run_id }}" 'map(select((.databaseId | tostring) != $rid)) | .[0].conclusion // empty')
          if [ "$PREV_CONCLUSION" = "failure" ] || [ "$PREV_CONCLUSION" = "cancelled" ]; then
            echo "Previous run was $PREV_CONCLUSION; will deploy both backend and frontend."
            echo "deploy_both=true" >> "$GITHUB_OUTPUT"
          else
            echo "deploy_both=false" >> "$GITHUB_OUTPUT"
          fi

      - name: Set changes (push – path filter)
        if: github.event_name == 'push'
        id: filter
        uses: dorny/paths-filter@v3
        with:
          filters: |
            backend_changed:
              - 'apps/api/**'
              - 'apps/api/Dockerfile'
              - 'docker-compose*.yml'
              - 'infra/**'
            frontend_changed:
              - 'apps/web/**'
              - 'Caddyfile'
              - 'Caddyfile.shared'
              - 'docker-compose*.yml'
              - 'infra/**'
          base: ${{ github.event.before }}
          ref: ${{ github.sha }}

  deploy-backend:
    name: Deploy backend
    runs-on: ubuntu-latest
    needs: [detect-changes]
    if: needs.detect-changes.outputs.backend_changed == 'true'
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Build Docker image for ARM64
        uses: docker/build-push-action@v6
        with:
          context: .
          file: apps/api/Dockerfile
          target: production
          platforms: linux/arm64
          tags: |
            ${{
              format('{0}-api:{1}', env.APP_NAME, github.sha)
            }}
            ${{
              format('{0}-api:latest', env.APP_NAME)
            }}
          load: true
          cache-from: type=gha
          cache-to: type=gha,mode=max
          provenance: false

      - name: Save Docker image to artifacts/backend.tar.gz
        shell: bash
        run: |
          set -euo pipefail
          mkdir -p artifacts
          docker save "${APP_NAME}-api:${GITHUB_SHA}" "${APP_NAME}-api:latest" | gzip > artifacts/backend.tar.gz

      - name: Configure AWS credentials (OIDC)
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
          role-session-name: GitHubActions-Deploy-Backend
          aws-region: ${{ env.AWS_REGION }}

      - name: Verify AWS identity
        run: aws sts get-caller-identity

      - name: Check if backend already uploaded for this SHA
        id: check_backend
        shell: bash
        run: |
          set -euo pipefail
          KEY="deployments/${APP_NAME}/${GITHUB_SHA}/backend.tar.gz"
          if aws s3 ls "s3://${S3_BUCKET}/${KEY}" --region "${AWS_REGION}" >/dev/null 2>&1; then
            echo "skip=true" >> "$GITHUB_OUTPUT"
          else
            echo "skip=false" >> "$GITHUB_OUTPUT"
          fi

      - name: Deploy backend (upload + SSM remote deploy)
        if: steps.check_backend.outputs.skip != 'true'
        shell: bash
        run: |
          set -euo pipefail
          ./infra/scripts/deploy/deploy.sh \
            --app "${APP_NAME}" \
            --env "${ENV_NAME}" \
            --sha "${GITHUB_SHA}" \
            --bucket "${S3_BUCKET}" \
            --region "${AWS_REGION}" \
            --deploy-backend true \
            --deploy-frontend false

  deploy-frontend:
    name: Deploy frontend
    runs-on: ubuntu-latest
    needs: [detect-changes]
    if: needs.detect-changes.outputs.frontend_changed == 'true'
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
          cache-dependency-path: package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: Set default contact message
        id: default-message
        shell: bash
        run: |
          if [ -z "${{ secrets.VITE_DEFAULT_CONTACT_MESSAGE }}" ]; then
            echo "message=Hi {{firstName}}, just checking in to see how you're doing." >> "$GITHUB_OUTPUT"
          else
            echo "message=${{ secrets.VITE_DEFAULT_CONTACT_MESSAGE }}" >> "$GITHUB_OUTPUT"
          fi

      - name: Build frontend
        run: npm run build:web:production
        env:
          VITE_API: /api
          VITE_DEFAULT_INTERVAL_DAYS: ${{ secrets.VITE_DEFAULT_INTERVAL_DAYS || '14' }}
          VITE_DEFAULT_CONTACT_MESSAGE: ${{ steps.default-message.outputs.message }}

      - name: Package frontend to artifacts/frontend.tar.gz
        shell: bash
        run: |
          set -euo pipefail
          mkdir -p artifacts
          tar -czf artifacts/frontend.tar.gz -C apps/web/dist .

      - name: Configure AWS credentials (OIDC)
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
          role-session-name: GitHubActions-Deploy-Frontend
          aws-region: ${{ env.AWS_REGION }}

      - name: Verify AWS identity
        run: aws sts get-caller-identity

      - name: Check if frontend already uploaded for this SHA
        id: check_frontend
        shell: bash
        run: |
          set -euo pipefail
          KEY="deployments/${APP_NAME}/${GITHUB_SHA}/frontend.tar.gz"
          if aws s3 ls "s3://${S3_BUCKET}/${KEY}" --region "${AWS_REGION}" >/dev/null 2>&1; then
            echo "skip=true" >> "$GITHUB_OUTPUT"
          else
            echo "skip=false" >> "$GITHUB_OUTPUT"
          fi

      - name: Upload shared Caddyfile to S3 (optional)
        if: steps.check_frontend.outputs.skip != 'true'
        shell: bash
        run: |
          set -euo pipefail
          # App-specific Caddyfile (if you still use it)
          if [ -f Caddyfile ]; then
            aws s3 cp Caddyfile "s3://${S3_BUCKET}/deployments/${APP_NAME}/${GITHUB_SHA}/Caddyfile" --region "${AWS_REGION}"
          fi
          # Shared Caddyfile used by shared proxy
          if [ -f Caddyfile.shared ]; then
            aws s3 cp Caddyfile.shared "s3://${S3_BUCKET}/deployments/shared/Caddyfile" --region "${AWS_REGION}"
          fi

      - name: Deploy shared Caddyfile to EC2 (SSM)
        if: steps.check_frontend.outputs.skip != 'true'
        shell: bash
        run: |
          set -euo pipefail
          export APP_NAME ENV="${ENV_NAME}" SHA="${GITHUB_SHA}"
          source ./infra/scripts/deploy/ssm-run.sh
          ssm_run "Deploy shared Caddyfile" ./infra/scripts/remote/deploy-shared-caddyfile.sh

      - name: Deploy frontend (upload + SSM remote deploy)
        if: steps.check_frontend.outputs.skip != 'true'
        shell: bash
        run: |
          set -euo pipefail
          ./infra/scripts/deploy/deploy.sh \
            --app "${APP_NAME}" \
            --env "${ENV_NAME}" \
            --sha "${GITHUB_SHA}" \
            --bucket "${S3_BUCKET}" \
            --region "${AWS_REGION}" \
            --deploy-backend false \
            --deploy-frontend true