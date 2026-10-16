#!/bin/bash
# Manual production deployment. Do not invoke during source-only coding.
# Additive migrations are applied BEFORE the updated application is served.
set -euo pipefail
cd "$(dirname "$0")"

echo "Deploying Trosheen..."
git pull --ff-only origin main

# Build does not alter live containers. Postgres must be available to the migrator.
docker compose build app
docker compose up -d postgres

# Abort deployment if a SQL migration fails. Real customer/R2 data is preserved.
docker compose run --rm --no-deps -T app node scripts/migrate.cjs

# Restart only after successful database migration.
docker compose up -d --remove-orphans
curl --fail --silent --show-error http://localhost:5000/api/health

echo "Trosheen deployment complete."
