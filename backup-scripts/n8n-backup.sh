#!/bin/bash

# Set the base directory
BASE_DIR="/app/salonease"
BACKUP_DIR="$BASE_DIR/database-backups"
COMPOSE_FILE="$BASE_DIR/docker-compose.prod.yml"
S3_BUCKET="n8n-backup-manol"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Generate timestamp for the backup file
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/n8n_backup_$TIMESTAMP.tar.gz"

# Check if docker compose file exists
if [ ! -f "$COMPOSE_FILE" ]; then
    echo "Error: Docker compose file not found at $COMPOSE_FILE"
    exit 1
fi

# Check if n8n container is running
if ! docker ps --format '{{.Names}}' | grep -q "salonease-n8n-"; then
    echo "Error: n8n container is not running"
    echo "Current directory: $(pwd)"
    echo "Docker compose file: $COMPOSE_FILE"
    echo "Available containers:"
    docker ps
    exit 1
fi

# Create the backup
echo "Creating n8n backup..."
if docker compose -f $COMPOSE_FILE stop n8n; then
    # Create tar archive of the n8n data volume
    docker run --rm \
        --volumes-from $(docker ps -aqf "name=salonease-n8n-") \
        -v $BACKUP_DIR:/backup \
        alpine tar czf /backup/$(basename $BACKUP_FILE) /home/node/.n8n

    # Start n8n service again
    docker compose -f $COMPOSE_FILE start n8n

    # Upload to S3
    echo "Uploading backup to S3..."
    if aws s3 cp $BACKUP_FILE s3://$S3_BUCKET/; then
        echo "Backup successfully uploaded to S3"
    else
        echo "Error: Failed to upload backup to S3"
        exit 1
    fi

    # Keep only last 7 days of local backups
    find "$BACKUP_DIR" -name "n8n_backup_*.tar.gz" -type f -mtime +7 -delete

    echo "Backup completed successfully: $BACKUP_FILE"
    echo "Backup uploaded to s3://$S3_BUCKET/$(basename $BACKUP_FILE)"
else
    echo "Error: Backup failed"
    # Try to ensure n8n is running even if backup failed
    docker compose -f $COMPOSE_FILE start n8n
    rm -f "$BACKUP_FILE"
    exit 1
fi 