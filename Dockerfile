# Stage 1: Build Frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /usr/src/frontend

# Copy frontend package files and install dependencies
COPY frontend/package*.json ./
RUN npm ci

# Copy the rest of the frontend source code
COPY frontend/ .

# Build the frontend (generate CSS, copy assets to dist)
RUN npm run build

# Stage 2: Build Backend
FROM node:18-alpine AS backend-builder

WORKDIR /usr/src/backend

# Copy backend package files and install all dependencies
COPY ./backend/package*.json ./
RUN npm ci

# Copy the rest of the backend source code
COPY ./backend/ .

# Final Stage: Combine Frontend and Backend
FROM node:18-alpine

WORKDIR /usr/src/app

# Copy production backend dependencies and code from backend-builder
COPY --from=backend-builder /usr/src/backend .

# Copy built frontend assets from frontend-builder into a public directory
COPY --from=frontend-builder /usr/src/frontend/dist ./public

# Expose the port the app runs on (Cloud Run will set this via PORT env var)
EXPOSE 8080

# Define environment variable
ENV NODE_ENV production

# Run the backend server (which will also serve frontend)
CMD [ "node", "server.js" ] 