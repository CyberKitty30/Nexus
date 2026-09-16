# Stage 1: Build React App with Node
FROM node:20-alpine AS build

WORKDIR /app

# Copy dependency configs
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build production bundle
RUN npm run build

# Stage 2: Serve with NGINX for Serverless Cloud Run
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build artifacts to nginx static folder
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 8080 (Google Cloud Run default port)
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
