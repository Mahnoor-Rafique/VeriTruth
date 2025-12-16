# Use official Node.js LTS image
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package files first (better caching)
COPY server/package*.json ./server/

# Install dependencies
WORKDIR /app/server
RUN npm install --production

# Copy server source code
COPY server/ ./server/

# Hugging Face required port
ENV PORT=7860
ENV HOST=0.0.0.0

# Expose HF port
EXPOSE 7860

# Start server
CMD ["node", "server.js"]
