#!/bin/bash
# Database backup script for EC2 deployment
# Supports both S3 and local-only backups
# Note: Configured for us-east-1 region

set -e

BACKUP_DIR="/opt/network/backups"
S3_BUCKET="${S3_BACKUP_BUCKET:-}"  # Set via environment variable or leave empty for local-only
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="network_db_${TIMESTAMP}.sql.gz"
COMPOSE_FILE="/opt/network/docker-compose.prod.yml"

# Create backup directory
mkdir -p "$BACKUP_DIR"

echo "Starting database backup..."

# Create backup
docker compose -f "$COMPOSE_FILE" exec -T db \
  pg_dump -U postgres network_prod | gzip > "$BACKUP_DIR/$BACKUP_FILE"

if [ ! -f "$BACKUP_DIR/$BACKUP_FILE" ]; then
  echo "ERROR: Backup file was not created"
  exit 1
fi

BACKUP_SIZE=$(du -h "$BACKUP_DIR/$BACKUP_FILE" | cut -f1)
echo "Backup created: $BACKUP_FILE ($BACKUP_SIZE)"

# Upload to S3 if bucket is configured
if [ -n "$S3_BUCKET" ]; then
  echo "Uploading to S3: s3://$S3_BUCKET/"
  if aws s3 cp --region us-east-1 "$BACKUP_DIR/$BACKUP_FILE" "s3://$S3_BUCKET/" 2>/dev/null; then
    echo "✓ Uploaded to S3"
    
    # Clean up old S3 backups (keep last 30 days)
    echo "Cleaning up old S3 backups..."
    aws s3 ls --region us-east-1 "s3://$S3_BUCKET/" 2>/dev/null | while read -r line; do
      BACKUP_DATE=$(echo "$line" | awk '{print $1" "$2}')
      BACKUP_NAME=$(echo "$line" | awk '{print $4}')
      if [ -n "$BACKUP_NAME" ] && [[ "$BACKUP_NAME" == network_db_*.sql.gz ]]; then
        BACKUP_AGE=$(($(date +%s) - $(date -d "$BACKUP_DATE" +%s 2>/dev/null || echo 0)))
        if [ $BACKUP_AGE -gt 2592000 ]; then  # 30 days in seconds
          echo "Deleting old backup: $BACKUP_NAME"
          aws s3 rm --region us-east-1 "s3://$S3_BUCKET/$BACKUP_NAME" 2>/dev/null || true
        fi
      fi
    done
  else
    echo "WARNING: Failed to upload to S3 (check IAM role or credentials)"
  fi
else
  echo "S3_BACKUP_BUCKET not set, skipping S3 upload"
fi

# Keep last 7 days locally
echo "Cleaning up old local backups..."
find "$BACKUP_DIR" -name "network_db_*.sql.gz" -mtime +7 -delete

echo "Backup completed successfully: $BACKUP_FILE"
