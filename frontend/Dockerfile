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

# Create nginx configuration
RUN echo 'server {' > /etc/nginx/conf.d/default.conf && \
    echo '    listen 80;' >> /etc/nginx/conf.d/default.conf && \
    echo '    server_name localhost;' >> /etc/nginx/conf.d/default.conf && \
    echo '    ' >> /etc/nginx/conf.d/default.conf && \
    echo '    root /usr/share/nginx/html;' >> /etc/nginx/conf.d/default.conf && \
    echo '    index index.html;' >> /etc/nginx/conf.d/default.conf && \
    echo '    ' >> /etc/nginx/conf.d/default.conf && \
    echo '    # Gzip compression' >> /etc/nginx/conf.d/default.conf && \
    echo '    gzip on;' >> /etc/nginx/conf.d/default.conf && \
    echo '    gzip_vary on;' >> /etc/nginx/conf.d/default.conf && \
    echo '    gzip_min_length 1024;' >> /etc/nginx/conf.d/default.conf && \
    echo '    gzip_proxied expired no-cache no-store private must-revalidate auth;' >> /etc/nginx/conf.d/default.conf && \
    echo '    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;' >> /etc/nginx/conf.d/default.conf && \
    echo '    ' >> /etc/nginx/conf.d/default.conf && \
    echo '    # Handle React Router' >> /etc/nginx/conf.d/default.conf && \
    echo '    location / {' >> /etc/nginx/conf.d/default.conf && \
    echo '        try_files $uri $uri/ /index.html;' >> /etc/nginx/conf.d/default.conf && \
    echo '    }' >> /etc/nginx/conf.d/default.conf && \
    echo '    ' >> /etc/nginx/conf.d/default.conf && \
    echo '    # Cache static assets' >> /etc/nginx/conf.d/default.conf && \
    echo '    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {' >> /etc/nginx/conf.d/default.conf && \
    echo '        expires 1y;' >> /etc/nginx/conf.d/default.conf && \
    echo '        add_header Cache-Control "public, immutable";' >> /etc/nginx/conf.d/default.conf && \
    echo '    }' >> /etc/nginx/conf.d/default.conf && \
    echo '    ' >> /etc/nginx/conf.d/default.conf && \
    echo '    # Security headers' >> /etc/nginx/conf.d/default.conf && \
    echo '    add_header X-Frame-Options "SAMEORIGIN" always;' >> /etc/nginx/conf.d/default.conf && \
    echo '    add_header X-Content-Type-Options "nosniff" always;' >> /etc/nginx/conf.d/default.conf && \
    echo '    add_header X-XSS-Protection "1; mode=block" always;' >> /etc/nginx/conf.d/default.conf && \
    echo '}' >> /etc/nginx/conf.d/default.conf

# Create startup script
RUN echo '#!/bin/bash' > /usr/local/bin/startup.sh && \
    echo '' >> /usr/local/bin/startup.sh && \
    echo '# Replace the API URL placeholder in all JavaScript files' >> /usr/local/bin/startup.sh && \
    echo 'if [ -n "$VITE_API_URL" ]; then' >> /usr/local/bin/startup.sh && \
    echo '    echo "Replacing API URL placeholder with: $VITE_API_URL"' >> /usr/local/bin/startup.sh && \
    echo '    find /usr/share/nginx/html -name "*.js" -type f -exec sed -i "s|__API_URL_PLACEHOLDER__|$VITE_API_URL|g" {} \;' >> /usr/local/bin/startup.sh && \
    echo 'else' >> /usr/local/bin/startup.sh && \
    echo '    echo "No VITE_API_URL provided, using default fallback"' >> /usr/local/bin/startup.sh && \
    echo '    find /usr/share/nginx/html -name "*.js" -type f -exec sed -i "s|__API_URL_PLACEHOLDER__|http://localhost:8000|g" {} \;' >> /usr/local/bin/startup.sh && \
    echo 'fi' >> /usr/local/bin/startup.sh && \
    echo '' >> /usr/local/bin/startup.sh && \
    echo '# Start nginx' >> /usr/local/bin/startup.sh && \
    echo 'nginx -g "daemon off;"' >> /usr/local/bin/startup.sh

# Make startup script executable
RUN chmod +x /usr/local/bin/startup.sh

# Expose port 80
EXPOSE 80

CMD ["/usr/local/bin/startup.sh"] 