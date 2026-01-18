# ==============================================================================
# Stage 1: Dependencies
# ==============================================================================
FROM node:20-alpine AS dependencies

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (production + dev for build)
RUN npm ci --only=production && \
    npm cache clean --force

# ==============================================================================
# Stage 2: Production
# ==============================================================================
FROM node:20-alpine AS production

# Set working directory
WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Copy dependencies from previous stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy application source code
COPY . .

# Create uploads directory for local image storage
RUN mkdir -p public/uploads && \
    chown -R node:node public/uploads

# Use non-root user for security
USER node

# Expose backend port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the server
CMD ["node", "server.js"]
