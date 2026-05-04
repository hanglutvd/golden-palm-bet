# Railway deployment Dockerfile
FROM node:20-slim

# Install build dependencies for better-sqlite3 (native module compilation)
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files first for better Docker layer caching
COPY package.json ./

# Install dependencies (better-sqlite3 will compile here)
RUN npm install

# Copy all source code
COPY . .

# Build frontend (vite → dist/public) and backend (esbuild → dist/boot.js)
RUN npm run build

# Create data directory for Railway Volume mount
RUN mkdir -p /data

# Set environment defaults
ENV NODE_ENV=production
ENV PORT=3000
ENV DB_PATH=/data/data.sqlite

EXPOSE 3000

# Start the server
CMD ["npm", "start"]
