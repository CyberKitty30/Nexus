# ================================================================
# NEXUS AI — Multi-Stage Docker Build (Production)
# Google Cloud Run / Serverless Deployment
# ================================================================

# Stage 1: Build the Vite React Application
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Copy dependency manifests first for Docker layer caching
COPY package.json package-lock.json* ./

# Install all dependencies (including devDeps for build)
RUN npm ci --prefer-offline

# Copy the full source code
COPY . .

# Build the production bundle
RUN npm run build

# ================================================================
# Stage 2: Serve with NGINX (production-grade static server)
# ================================================================
FROM nginx:1.27-alpine AS production

# Copy custom NGINX config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose HTTP port
EXPOSE 8080

# Health check for Cloud Run
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:8080/ || exit 1

# Start NGINX in foreground mode (required for Docker / Cloud Run)
CMD ["nginx", "-g", "daemon off;"]
