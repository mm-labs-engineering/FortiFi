FROM node:18-alpine

# Install dependencies for Prisma and native modules
RUN apk add --no-cache openssl

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/core/package.json ./packages/core/
COPY packages/cloud/package.json ./packages/cloud/

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages/core ./packages/core
COPY packages/cloud ./packages/cloud

# Build packages
RUN pnpm run build

# Generate Prisma client
RUN cd packages/cloud && npx prisma generate

# Expose port
EXPOSE 3000

# Set working directory to cloud package
WORKDIR /app/packages/cloud

# Start the application
CMD ["npm", "run", "start"]
