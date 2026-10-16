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

# Health is not instantaneous after container recreation. This is used only
# during an explicit manual deployment, never in source-only coding passes.
healthy=0
for attempt in $(seq 1 30); do
  if curl --fail --silent --show-error http://localhost:5000/api/health >/dev/null 2>&1; then
    healthy=1
    break
  fi
  sleep 2
done
if [ "$healthy" -ne 1 ]; then
  echo "Deployment failed: the app did not become healthy." >&2
  docker compose logs --tail=80 app >&2
  exit 1
fi

echo "Trosheen deployment complete."
