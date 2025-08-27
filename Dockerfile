# Multi-stage build for the DCA Bot Website
FROM node:18-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage with NGINX
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy app config for runtime configuration
COPY --from=builder /app/public/app-config.json /usr/share/nginx/html/app-config.json

# Create data directory for mounting bot data files
RUN mkdir -p /usr/share/nginx/html/data

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost || exit 1

# Expose port
EXPOSE 80

# Labels for metadata
LABEL org.opencontainers.image.title="DCA Bot Website"
LABEL org.opencontainers.image.description="Web interface for the Crypto DCA Bot portfolio tracker"
LABEL org.opencontainers.image.version="1.0.0"
LABEL org.opencontainers.image.source="https://github.com/bocchi-the-crypto/crypto-dca-bot"

CMD ["nginx", "-g", "daemon off;"]