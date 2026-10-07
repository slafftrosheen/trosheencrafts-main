FROM node:20-alpine AS builder

WORKDIR /app

ENV NODE_OPTIONS=--max-old-space-size=1536

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production --legacy-peer-deps

# Copy built files from builder
COPY --from=builder /app/dist ./dist
COPY scripts/migrate.cjs ./scripts/migrate.cjs
COPY migrations ./migrations

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

USER nodejs

EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "dist/index.cjs"]
