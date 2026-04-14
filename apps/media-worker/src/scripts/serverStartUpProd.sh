#!/bin/sh
set -e
# Use NODE_ENV from environment, default to production if not set
export NODE_ENV=${NODE_ENV:-development}
cd /app/media-worker/api/dist
node main.js
