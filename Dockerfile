# Build stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY .env.local ./

# Install dependencies with force
RUN npm ci --force

# Copy project files
COPY . .

# Build the application with force
RUN npm run build --force

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Install firebase-tools globally
RUN npm install -g firebase-tools

# Copy necessary files from builder
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/.env.local ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/firebase.json ./
COPY --from=builder /app/firestore.rules ./
COPY --from=builder /app/firestore.indexes.json ./
COPY --from=builder /app/.firebaserc ./

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"] 