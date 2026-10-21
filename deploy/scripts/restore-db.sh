#!/usr/bin/env bash
# ==============================================================================
# MAIJRUN Tech — Production Database Restore Runbook Script
# Usage: ./restore-db.sh /var/backups/maijrun/backup_maijrun_prod_YYYYMMDD_HHMMSS.sql.gz.gpg
# ==============================================================================

set -euo pipefail

BACKUP_FILE="${1:-}"
CONTAINER_NAME="${PG_CONTAINER:-maijrun-postgres}"
DB_NAME="${POSTGRES_DB:-maijrun_prod}"
DB_USER="${POSTGRES_USER:-maijrun_user}"
PASSPHRASE="${BACKUP_ENCRYPTION_PASSPHRASE:-}"

if [ -z "$BACKUP_FILE" ] || [ ! -f "$BACKUP_FILE" ]; then
  echo "❌ Usage: $0 <path_to_encrypted_backup_file.gpg>"
  exit 1
fi

if [ -z "$PASSPHRASE" ]; then
  echo -n "🔑 Enter backup encryption passphrase: "
  read -s PASSPHRASE
  echo ""
fi

echo "⚠️  WARNING: You are about to restore database '$DB_NAME' in container '$CONTAINER_NAME'."
echo "    This will overwrite existing data with the snapshot from $BACKUP_FILE."
read -p "Type 'RESTORE' to continue: " CONFIRM

if [ "$CONFIRM" != "RESTORE" ]; then
  echo "Aborted by operator."
  exit 0
fi

echo "🔓 Decrypting and restoring database..."
TEMP_PIPE="/tmp/maijrun_restore_pipe_$$"
mkfifo "$TEMP_PIPE"
trap 'rm -f "$TEMP_PIPE"' EXIT

# Decrypt in memory and stream to psql
gpg --batch --yes --decrypt --passphrase "$PASSPHRASE" "$BACKUP_FILE" | gunzip | docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME"

echo "✅ Database restore successfully completed from $BACKUP_FILE!"
