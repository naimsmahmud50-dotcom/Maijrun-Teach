#!/usr/bin/env bash
# ==============================================================================
# MAIJRUN Tech — Automated Encrypted Database Backup Script
# Encryption: GPG AES-256 Symmetric
# Retention: 14 Days rolling retention
# ==============================================================================

set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/var/backups/maijrun}"
TIMESTAMP="$(date +'%Y%m%d_%H%M%S')"
CONTAINER_NAME="${PG_CONTAINER:-maijrun-postgres}"
DB_NAME="${POSTGRES_DB:-maijrun_prod}"
DB_USER="${POSTGRES_USER:-maijrun_user}"
PASSPHRASE="${BACKUP_ENCRYPTION_PASSPHRASE:-}"

if [ -z "$PASSPHRASE" ]; then
  echo "❌ Error: BACKUP_ENCRYPTION_PASSPHRASE environment variable is required."
  exit 1
fi

mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"

RAW_BACKUP="$BACKUP_DIR/backup_${DB_NAME}_${TIMESTAMP}.sql.gz"
ENCRYPTED_BACKUP="${RAW_BACKUP}.gpg"

echo "💾 Starting database backup for '$DB_NAME'..."

# 1. Dump database from running docker container & compress on the fly
docker exec -t "$CONTAINER_NAME" pg_dump -U "$DB_USER" "$DB_NAME" | gzip -9 > "$RAW_BACKUP"

# 2. Encrypt with AES-256 symmetric cipher using GPG
echo "🔐 Encrypting backup with AES-256 GPG..."
gpg --batch --yes --symmetric --cipher-algo AES256 --passphrase "$PASSPHRASE" -o "$ENCRYPTED_BACKUP" "$RAW_BACKUP"

# 3. Securely wipe unencrypted raw dump
rm -f "$RAW_BACKUP"
chmod 600 "$ENCRYPTED_BACKUP"

BACKUP_SIZE="$(du -h "$ENCRYPTED_BACKUP" | cut -f1)"
echo "✅ Backup successfully created and encrypted: $ENCRYPTED_BACKUP ($BACKUP_SIZE)"

# 4. Prune backups older than 14 days
echo "🧹 Pruning backups older than 14 days..."
find "$BACKUP_DIR" -type f -name "backup_${DB_NAME}_*.sql.gz.gpg" -mtime +14 -exec rm -f {} \;

echo "🎉 Backup routine finished successfully at $(date)."
