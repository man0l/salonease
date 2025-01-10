#!/bin/bash

# Create backup directory if it doesn't exist
BACKUP_DIR="database-backups"
mkdir -p $BACKUP_DIR

# Generate timestamp for the backup file
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/salonease_backup_$TIMESTAMP.sql"

# Check if docker compose services are running
if ! docker compose -f docker-compose.prod.yml ps | grep -q "db.*running"; then
    echo "Error: Database container is not running"
    exit 1
fi

# Create the backup
echo "Creating backup..."
if docker compose -f docker-compose.prod.yml exec db pg_dump -U postgres salonease > "$BACKUP_FILE"; then
    # Compress the backup
    echo "Compressing backup..."
    gzip "$BACKUP_FILE"

    # Keep only last 7 days of backups
    find "$BACKUP_DIR" -name "*.sql.gz" -type f -mtime +7 -delete

    echo "Backup completed successfully: ${BACKUP_FILE}.gz"
else
    echo "Error: Backup failed"
    rm -f "$BACKUP_FILE"
    exit 1
fi 