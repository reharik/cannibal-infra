#!/usr/bin/env bash
set -euo pipefail

cd /opt/network
sudo /opt/network/scripts/deploy-ec2.sh

rm -f /opt/network/deploy/network-api.tar.gz || true
echo "Backend deployed."
