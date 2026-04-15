#!/usr/bin/env bash
set -euo pipefail

DEPLOY_ROLE_NAME="photoshare-deploy-role"
DEPLOY_POLICY_NAME="photoshare-deploy-inline"
EC2_ROLE_NAME="network-api-ec2"
EC2_POLICY_NAME="photoshare-shared-ec2-additions"

BASE_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Applying GitHub OIDC trust policy to deploy role: $DEPLOY_ROLE_NAME"
aws iam update-assume-role-policy \
  --role-name "$DEPLOY_ROLE_NAME" \
  --policy-document "file://$BASE_DIR/trust-policy-github-oidc.json"

echo "Applying deploy permissions policy to deploy role: $DEPLOY_ROLE_NAME"
aws iam put-role-policy \
  --role-name "$DEPLOY_ROLE_NAME" \
  --policy-name "$DEPLOY_POLICY_NAME" \
  --policy-document "file://$BASE_DIR/deploy-policy.json"

echo "Applying shared EC2 additions policy to EC2 role: $EC2_ROLE_NAME"
aws iam put-role-policy \
  --role-name "$EC2_ROLE_NAME" \
  --policy-name "$EC2_POLICY_NAME" \
  --policy-document "file://$BASE_DIR/shared-ec2-additions-policy.json"

echo "Done."
