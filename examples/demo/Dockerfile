FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/core/package.json ./packages/core/
COPY packages/client/package.json ./packages/client/
COPY examples/demo/package.json ./examples/demo/

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages/core ./packages/core
COPY packages/client ./packages/client
COPY examples/demo ./examples/demo

# Build packages
RUN pnpm run build

# Expose port
EXPOSE 3001

# Set working directory to demo
WORKDIR /app/examples/demo

# Start the application
CMD ["npm", "run", "start"]
