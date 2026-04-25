# Step 1: Build Vite app
FROM node:20 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build


# Step 2: Serve with nginx
FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Create new nginx config for port 8080
RUN printf "server { \
    listen 8080; \
    location / { \
    root /usr/share/nginx/html; \
    index index.html; \
    try_files \$uri \$uri/ /index.html; \
    } \
    }" > /etc/nginx/conf.d/default.conf

# Copy build files
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]