# Use the official Node.js Alpine image (Lightweight)
FROM node:22-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package files first (to cache dependencies)
COPY package*.json ./

# Install dependencies (including devDependencies for tsx)
RUN npm install

# Copy the Prisma schema and generate the client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy the rest of the application code
COPY . .

# Expose the API port
EXPOSE 5000

# Start the server using tsx (same as your local dev)
CMD ["npx", "tsx", "server.ts"]
