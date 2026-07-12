#!/bin/bash

echo "🚀 Deploying Trosheen Crafts..."

# Pull latest changes
git pull origin main

# Build and restart containers
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Wait for containers to start
sleep 10

# Run database migrations
docker-compose exec -T app npm run db:push

# Check health
curl -f http://localhost:5000/api/health || exit 1

echo "✅ Deployment successful!"
