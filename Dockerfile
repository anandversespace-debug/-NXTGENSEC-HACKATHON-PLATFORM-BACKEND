# Use a slim Node.js base image
FROM node:18-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (production only)
RUN npm install --omit=dev

# Copy the rest of the application code
COPY . .

# Expose the server port
EXPOSE 5000

# Set environment variables (defaults, should be overridden in production)
ENV NODE_ENV=production
ENV PORT=5000

# Start the application
CMD ["npm", "start"]
