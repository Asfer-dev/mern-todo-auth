# Stage 1: Build the Vite app
FROM node:18 AS builder

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the app
COPY . .

# Build the Vite project
RUN npm run build

# Stage 2: Serve with NGINX
FROM nginx:alpine

# Remove default NGINX config
RUN rm /etc/nginx/conf.d/default.conf

# Add custom config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose the default NGINX port
EXPOSE 80

# Start NGINX
CMD ["nginx", "-g", "daemon off;"]
