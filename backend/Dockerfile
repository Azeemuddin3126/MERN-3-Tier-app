# Stage 1: Build the application
FROM node:16 AS builder

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .

# Stage 2: Create the production image
FROM node:16-slim

WORKDIR /app
COPY --from=builder /app /app

EXPOSE 5000
CMD ["node", "server.js"]
