# PMPLearningManagement Dockerfile
# Multi-stage build for optimized production image

# Build stage
FROM node:20.11.0-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY .nvmrc ./

# Install all dependencies (including devDependencies needed for build)
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Build the application
RUN npm run build:production

# Production stage
FROM nginx:1.25.3-alpine AS production

# Install security updates
RUN apk update && apk upgrade && apk add --no-cache \
    curl \
    && rm -rf /var/cache/apk/*

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S pmpapp -u 1001 -G nodejs

# Set permissions
RUN chown -R pmpapp:nodejs /usr/share/nginx/html && \
    chown -R pmpapp:nodejs /var/cache/nginx && \
    chown -R pmpapp:nodejs /var/log/nginx && \
    chown -R pmpapp:nodejs /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R pmpapp:nodejs /var/run/nginx.pid

# Switch to non-root user
USER pmpapp

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:80/ || exit 1

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]