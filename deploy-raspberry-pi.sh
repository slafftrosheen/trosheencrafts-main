#!/bin/bash

echo "Deploying Trosheen Crafts to Raspberry Pi..."

# Stop existing process
pm2 stop trosheencrafts || true

# Pull latest code
git pull origin main

# Install dependencies
npm install --production

# Build application
npm run build

# Push database schema
npm run db:push

# Start with PM2
pm2 start ecosystem.config.cjs
pm2 save

echo "Deployment complete!"
echo "Application running on http://localhost:5000"
