FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copy frontend package files
COPY frontend/package*.json ./frontend/

# Install frontend dependencies
RUN cd frontend && \
    npm ci && \
    npm cache clean --force

# Copy frontend source files
COPY frontend/ ./frontend/

# Build frontend
RUN cd frontend && \
    npm run build

FROM node:20-alpine AS backend-builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy source files
COPY src/ ./src/
COPY database/ ./database/
COPY tsconfig.build.json ./

# Build the backend
RUN npm run build

FROM node:20-alpine AS production

WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache --virtual .gyp python3 make g++

# Copy from frontend builder
COPY --from=frontend-builder /app/frontend/dist ./dist/frontend

# Copy from backend builder
COPY --from=backend-builder /app/node_modules ./node_modules
COPY --from=backend-builder /app/package*.json ./
COPY --from=backend-builder /app/dist ./dist/backend
COPY --from=backend-builder /app/database ./database

# Remove build dependencies
RUN apk del .gyp python3 make g++

# Create non-root user
RUN addgroup -S appgroup && \
    adduser -S appuser -G appgroup

# Change ownership
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start the application
CMD ["node", "dist/backend/main"]
