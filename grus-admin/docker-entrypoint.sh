#!/bin/sh

# Replace API_URL in config.js
sed -i "s|\${API_URL}|$API_URL|g" /usr/share/nginx/html/config.js
sed -i "s|\${WS_URL}|$WS_URL|g" /usr/share/nginx/html/config.js

# Execute CMD
exec "$@" 