#!/bin/sh
set -e

# Set production environment
export NODE_ENV=production

# Run migrations
echo "Running database migrations..."
npx sequelize-cli db:migrate

# Start the application
echo "Starting the application..."
exec node src/server.js
