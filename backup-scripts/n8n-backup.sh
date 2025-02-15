#!/bin/bash

# Set the base directory
BASE_DIR="/app/salonease"
BACKUP_DIR="$BASE_DIR/database-backups"
COMPOSE_FILE="$BASE_DIR/docker-compose.prod.yml"
ENV_FILE="$BASE_DIR/salonease-mvp/backend/.env"
S3_BUCKET="n8n-backup-manol"

# Source the .env file for database credentials
if [ ! -f "$ENV_FILE" ]; then
    echo "Error: Environment file not found at $ENV_FILE"
    exit 1
fi

# Load environment variables from .env file
source "$ENV_FILE"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR
mkdir -p $BACKUP_DIR/workflows
mkdir -p $BACKUP_DIR/credentials
mkdir -p $BACKUP_DIR/database

# Generate timestamp for the backup files
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
VOLUME_BACKUP_FILE="$BACKUP_DIR/n8n_volume_backup_$TIMESTAMP.tar.gz"
WORKFLOWS_BACKUP_FILE="$BACKUP_DIR/workflows/n8n_workflows_$TIMESTAMP.json"
CREDENTIALS_BACKUP_FILE="$BACKUP_DIR/credentials/n8n_credentials_$TIMESTAMP.json"
DATABASE_BACKUP_FILE="$BACKUP_DIR/database/n8n_db_backup_$TIMESTAMP.sql.gz"

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
echo "Creating n8n backups..."

# 1. Export workflows using n8n CLI
echo "Exporting workflows..."
if docker compose -f $COMPOSE_FILE exec -T n8n n8n export:workflow --all --pretty --output=/home/node/.n8n/workflows_backup.json; then
    # Copy the file from container to host
    docker compose -f $COMPOSE_FILE cp n8n:/home/node/.n8n/workflows_backup.json "$WORKFLOWS_BACKUP_FILE"
    echo "Workflows exported successfully"
else
    echo "Error: Failed to export workflows"
    exit 1
fi

# 2. Export credentials using n8n CLI
echo "Exporting credentials..."
if docker compose -f $COMPOSE_FILE exec -T n8n n8n export:credentials --all --pretty --output=/home/node/.n8n/credentials_backup.json; then
    # Copy the file from container to host
    docker compose -f $COMPOSE_FILE cp n8n:/home/node/.n8n/credentials_backup.json "$CREDENTIALS_BACKUP_FILE"
    echo "Credentials exported successfully"
else
    echo "Error: Failed to export credentials"
    exit 1
fi

# 3. Create database backup
echo "Creating database backup..."
if PGPASSWORD="${DB_POSTGRESDB_PASSWORD}" docker compose -f $COMPOSE_FILE exec -T db pg_dump \
    -U "${DB_POSTGRESDB_USER}" \
    -d "${DB_POSTGRESDB_DATABASE}" \
    -h "${DB_POSTGRESDB_HOST:-db}" | gzip > "$DATABASE_BACKUP_FILE"; then
    echo "Database backup created successfully"
else
    echo "Error: Failed to create database backup"
    exit 1
fi

# 4. Create volume backup
echo "Creating volume backup..."
if docker compose -f $COMPOSE_FILE stop n8n; then
    # Create tar archive of the n8n data volume
    docker run --rm \
        --volumes-from $(docker ps -aqf "name=salonease-n8n-") \
        -v $BACKUP_DIR:/backup \
        alpine tar czf /backup/$(basename $VOLUME_BACKUP_FILE) /home/node/.n8n

    # Start n8n service again
    docker compose -f $COMPOSE_FILE start n8n

    # Upload to S3
    echo "Uploading backups to S3..."
    if aws s3 cp $VOLUME_BACKUP_FILE s3://$S3_BUCKET/volumes/ && \
       aws s3 cp $WORKFLOWS_BACKUP_FILE s3://$S3_BUCKET/workflows/ && \
       aws s3 cp $CREDENTIALS_BACKUP_FILE s3://$S3_BUCKET/credentials/ && \
       aws s3 cp $DATABASE_BACKUP_FILE s3://$S3_BUCKET/database/; then
        echo "Backups successfully uploaded to S3"
    else
        echo "Error: Failed to upload backups to S3"
        exit 1
    fi

    # Keep only last 7 days of local backups
    find "$BACKUP_DIR" -name "n8n_volume_backup_*.tar.gz" -type f -mtime +7 -delete
    find "$BACKUP_DIR/workflows" -name "n8n_workflows_*.json" -type f -mtime +7 -delete
    find "$BACKUP_DIR/credentials" -name "n8n_credentials_*.json" -type f -mtime +7 -delete
    find "$BACKUP_DIR/database" -name "n8n_db_backup_*.sql.gz" -type f -mtime +7 -delete

    echo "Backup completed successfully!"
    echo "Volume backup: s3://$S3_BUCKET/volumes/$(basename $VOLUME_BACKUP_FILE)"
    echo "Workflows backup: s3://$S3_BUCKET/workflows/$(basename $WORKFLOWS_BACKUP_FILE)"
    echo "Credentials backup: s3://$S3_BUCKET/credentials/$(basename $CREDENTIALS_BACKUP_FILE)"
    echo "Database backup: s3://$S3_BUCKET/database/$(basename $DATABASE_BACKUP_FILE)"
else
    echo "Error: Backup failed"
    # Try to ensure n8n is running even if backup failed
    docker compose -f $COMPOSE_FILE start n8n
    rm -f $VOLUME_BACKUP_FILE $WORKFLOWS_BACKUP_FILE $CREDENTIALS_BACKUP_FILE $DATABASE_BACKUP_FILE
    exit 1
fi 