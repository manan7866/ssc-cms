# Multi-stage optimized Dockerfile for CMS
# Stage 1: Dependencies stage (build-time dependencies)
FROM node:20-alpine AS deps

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy package files
COPY package.json package-lock.json ./

# Install ALL dependencies (including dev dependencies for building)
RUN npm ci --prefer-offline --no-audit --no-fund || npm ci --no-audit --no-fund

# Stage 2: Builder stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./

# Copy source code
COPY . .
ARG NEXT_PUBLIC_BACKEND_URL
ARG NEXT_PUBLIC_WEBSITE_URL

ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_WEBSITE_URL=$NEXT_PUBLIC_WEBSITE_URL

# Build the application
RUN npm run build

# Stage 3: Production dependencies stage (runtime dependencies only)
FROM node:20-alpine AS production-deps

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install only production dependencies
RUN npm ci --production --prefer-offline --no-audit --no-fund || npm ci --production --no-audit --no-fund

# Stage 4: Final production stage - smallest possible image
FROM node:20-alpine AS production

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy only production dependencies
COPY --from=production-deps /app/node_modules ./node_modules

# Copy built application
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

# Switch to non-root user
USER nodejs:nodejs

# Expose port (default is 3010 as seen in package.json)
EXPOSE 3010

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3010 || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]