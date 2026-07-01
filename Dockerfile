FROM node:20-alpine AS frontend-builder

WORKDIR /tmp/frontend

# Copy frontend package files
COPY frontend/package*.json .

# Install frontend dependencies
RUN npm ci

# Copy frontend source files
COPY frontend/ .

# Build frontend
RUN npm run build -- --outDir dist

FROM node:20-alpine AS backend-builder

WORKDIR /tmp/backend

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source files
COPY src/ ./src/
COPY database/ ./database/
COPY tsconfig.build.json ./

# Build the backend
RUN npm run build -- --outDir dist

FROM node:20-alpine AS production

WORKDIR /noteit

# Copy from frontend builder
COPY --from=frontend-builder /tmp/frontend/dist ./frontend

# Copy from backend builder
COPY --from=backend-builder /tmp/backend/dist/* ./
COPY --from=backend-builder /tmp/backend/package*.json ./

RUN npm ci --omit dev

# Create non-root user
RUN adduser -S noteit

# Change ownership
RUN chown -R noteit /noteit

# Switch to non-root user
USER noteit

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start the application
CMD ["node", "dist/src/main"]
