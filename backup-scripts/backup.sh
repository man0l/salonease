#!/bin/bash

# Set the base directory
BASE_DIR="/app/salonease"
BACKUP_DIR="$BASE_DIR/database-backups"
COMPOSE_FILE="$BASE_DIR/docker-compose.prod.yml"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Generate timestamp for the backup file
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/salonease_backup_$TIMESTAMP.sql"

# Check if docker compose file exists
if [ ! -f "$COMPOSE_FILE" ]; then
    echo "Error: Docker compose file not found at $COMPOSE_FILE"
    exit 1
fi

# List running containers for debugging
echo "Checking running containers..."
docker ps | grep "postgres"

# Check if database container is running (using the correct container name pattern)
if ! docker ps --format '{{.Names}}' | grep -q "salonease-db-"; then
    echo "Error: Database container is not running"
    echo "Current directory: $(pwd)"
    echo "Docker compose file: $COMPOSE_FILE"
    echo "Available containers:"
    docker ps
    exit 1
fi

# Create the backup
echo "Creating backup..."
if docker compose -f $COMPOSE_FILE exec -T db pg_dump -U postgres salonease > "$BACKUP_FILE"; then
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