# syntax=docker/dockerfile:1.5
FROM node:18-alpine as build

# Enable pnpm
RUN corepack enable pnpm

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application with a placeholder API URL
ENV VITE_API_URL=__API_URL_PLACEHOLDER__
RUN pnpm run build

# Production stage with nginx
FROM nginx:alpine

# Copy built files to nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy and make startup script executable
COPY startup.sh /usr/local/bin/startup.sh
RUN sed -i 's/\r$//' /usr/local/bin/startup.sh && \
    sed -i '1s|.*|#!/bin/sh|' /usr/local/bin/startup.sh && \
    chmod +x /usr/local/bin/startup.sh

# Expose port 80
EXPOSE 80

CMD ["/bin/sh", "/usr/local/bin/startup.sh"] 