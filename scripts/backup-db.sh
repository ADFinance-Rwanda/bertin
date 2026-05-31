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

TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_DIR="$ROOT_DIR/backups"
BACKUP_FILE="$BACKUP_DIR/task-manager-$TIMESTAMP.sql"

mkdir -p "$BACKUP_DIR"

echo "[backup] Starting pg_dump into $BACKUP_FILE ..."

docker exec tm_postgres pg_dump \
  -U "$POSTGRES_USER" \
  -d "$POSTGRES_DB" \
  --no-password \
  --clean \
  --if-exists \
  > "$BACKUP_FILE"

echo "[backup] Done."
echo "[backup] File: $BACKUP_FILE"
echo "[backup] Size: $(du -sh "$BACKUP_FILE" | cut -f1)"
