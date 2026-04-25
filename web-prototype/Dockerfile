# Step 1: Build React app (Use Node 20)
FROM node:20 AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Build Vite project
RUN npm run build

# Step 2: Serve using nginx
FROM nginx:alpine

# Remove default files
RUN rm -rf /usr/share/nginx/html/*

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Force nginx to run on 8080
RUN sed -i 's/listen 80;/listen 8080;/' /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]