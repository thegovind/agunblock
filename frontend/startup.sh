#!/bin/bash

# Replace the API URL placeholder in all JavaScript files
if [ -n "$VITE_API_URL" ]; then
    echo "Replacing API URL placeholder with: $VITE_API_URL"
    find /usr/share/nginx/html -name "*.js" -type f -exec sed -i "s|__API_URL_PLACEHOLDER__|$VITE_API_URL|g" {} \;
else
    echo "No VITE_API_URL provided, using default fallback"
    find /usr/share/nginx/html -name "*.js" -type f -exec sed -i "s|__API_URL_PLACEHOLDER__|http://localhost:8000|g" {} \;
fi

# Start nginx
nginx -g "daemon off;" 