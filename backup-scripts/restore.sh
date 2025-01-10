#!/bin/bash

if [ -z "$1" ]; then
    echo "Usage: $0 <backup-file.sql.gz>"
    exit 1
fi

BACKUP_FILE=$1

if [ ! -f "$BACKUP_FILE" ]; then
    echo "Error: Backup file not found: $BACKUP_FILE"
    exit 1
fi

# Uncompress the backup file if it's compressed
if [[ "$BACKUP_FILE" == *.gz ]]; then
    echo "Uncompressing backup file..."
    gunzip -c "$BACKUP_FILE" > "${BACKUP_FILE%.gz}"
    BACKUP_FILE="${BACKUP_FILE%.gz}"
fi

# Stop the backend service to prevent active connections
echo "Stopping backend service..."
docker compose -f docker-compose.prod.yml stop backend

# Drop and recreate the database
echo "Recreating database..."
docker compose -f docker-compose.prod.yml exec db psql -U postgres -c "DROP DATABASE IF EXISTS salonease;"
docker compose -f docker-compose.prod.yml exec db psql -U postgres -c "CREATE DATABASE salonease;"

# Restore the database
echo "Restoring backup..."
cat "$BACKUP_FILE" | docker compose -f docker-compose.prod.yml exec -T db psql -U postgres -d salonease

# Start the backend service
echo "Starting backend service..."
docker compose -f docker-compose.prod.yml start backend

# Clean up uncompressed backup if we created it
if [[ "$1" == *.gz ]]; then
    rm -f "${BACKUP_FILE}"
fi

echo "Database restore completed successfully" 