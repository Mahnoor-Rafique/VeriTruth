# Use official Node.js LTS as base image
FROM node:20-slim

# Set working directory inside the container
WORKDIR /app

# Copy server package files first (for caching dependencies)
COPY server/package*.json ./server/

# Install server dependencies
WORKDIR /app/server
RUN npm install

# Copy all server files
COPY server/ ./server/

# If you have a client folder (React frontend), copy and build it
# Uncomment these lines if using React
# COPY client/package*.json ./client/
# WORKDIR /app/client
# RUN npm install
# RUN npm run build

# Set environment variables
ENV PORT=7860

# Expose the port Hugging Face uses
EXPOSE 7860

# Start your server
WORKDIR /app/server
CMD ["node", "server.js"]
