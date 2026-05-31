#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

# Load .env if present
if [ -f "$ROOT_DIR/.env" ]; then
  export $(grep -v '^#' "$ROOT_DIR/.env" | xargs)
fi

POSTGRES_USER="${POSTGRES_USER:-taskuser}"
POSTGRES_DB="${POSTGRES_DB:-taskmanager}"
BACKUP_FILE="${1:-}"

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: $0 <path-to-backup.sql>"
  echo "Example: $0 backups/task-manager-2024-01-15_10-30-00.sql"
  exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
  echo "Error: backup file not found: $BACKUP_FILE"
  exit 1
fi

echo "[restore] Restoring from $BACKUP_FILE ..."
echo "[restore] WARNING: This will drop and recreate all tables in $POSTGRES_DB."
read -rp "[restore] Continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
  echo "[restore] Aborted."
  exit 0
fi

echo "[restore] Running restore ..."

docker exec -i tm_postgres psql \
  -U "$POSTGRES_USER" \
  -d "$POSTGRES_DB" \
  < "$BACKUP_FILE"

echo "[restore] Done."
