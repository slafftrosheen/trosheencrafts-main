#!/bin/bash
# Trosheen Crafts deploy: pull, rebuild, migrate, verify.
set -e

cd "$(dirname "$0")"

echo "🚀 Deploying Trosheen Crafts..."

# Pull latest changes
git pull origin main

# Build and restart containers
docker compose down
docker compose build
docker compose up -d

# Wait for containers to start
sleep 10

# Apply pending database migrations (tracked in _migrations table)
docker compose exec -T app node scripts/migrate.cjs

# Check health
curl -f http://localhost:5000/api/health

echo "✅ Deployment successful!"
