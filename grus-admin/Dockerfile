# Build stage
FROM node:20-alpine as build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN yarn install

# Copy source code
COPY . .

# Build the app
RUN yarn build

# Copy config.js to nginx html directory
COPY public/config.js /usr/share/nginx/html/config.js

# Production stage
FROM nginx:alpine

# Copy built assets from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Add this before nginx config
COPY docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh

# Create custom nginx config
RUN rm /etc/nginx/conf.d/default.conf
RUN echo 'server { \
    listen 80; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    # Gzip compression \
    gzip on; \
    gzip_vary on; \
    gzip_min_length 10240; \
    gzip_proxied expired no-cache no-store private auth; \
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml; \
    gzip_disable "MSIE [1-6]\\."; \
    \
    location / { \
        try_files $uri $uri/ /index.html; \
        expires -1; \
    } \
    \
    # Cache static assets \
    location /static/ { \
        expires 1y; \
        add_header Cache-Control "public, no-transform"; \
    } \
    \
    # Cache other assets \
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg)$ { \
        expires 1y; \
        add_header Cache-Control "public, no-transform"; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Change the CMD to use our entrypoint script
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
