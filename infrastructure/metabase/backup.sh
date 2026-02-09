#!/bin/bash
set -euo pipefail

BACKUP_DIR="/opt/metabase/backups"
COMPOSE_FILE="/opt/metabase/docker-compose.yml"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

mkdir -p "$BACKUP_DIR"

echo "[$(date)] Starting Metabase backup..."

# Stop Metabase for consistent backup
docker compose -f "$COMPOSE_FILE" stop metabase

# Backup data volume
docker run --rm \
  -v metabase-data:/data \
  -v "$BACKUP_DIR":/backup \
  alpine \
  tar czf "/backup/metabase-data-${DATE}.tar.gz" /data

# Restart Metabase
docker compose -f "$COMPOSE_FILE" start metabase

# Backup configuration files
tar czf "${BACKUP_DIR}/metabase-config-${DATE}.tar.gz" \
  /opt/metabase/docker-compose.yml \
  /opt/metabase/.env \
  /opt/metabase/Caddyfile

# Cleanup old backups
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +${RETENTION_DAYS} -delete

echo "[$(date)] Backup completed: ${BACKUP_DIR}/metabase-data-${DATE}.tar.gz"
