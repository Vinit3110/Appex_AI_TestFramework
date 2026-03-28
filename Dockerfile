# ─────────────────────────────────────────────────────────────────────────────
# Stage 1 — Build the React frontend into static files
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-slim AS frontend-build

WORKDIR /app/frontend

# Install frontend dependencies first (cache-efficient layer)
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

# Copy frontend source and build
COPY frontend/ ./

# Set API_BASE to empty string so the built frontend uses relative URLs
# (same origin as the backend when served from Express)
ENV VITE_API_BASE=""
RUN npm run build


# ─────────────────────────────────────────────────────────────────────────────
# Stage 2 — Production image with Playwright + Backend + Built Frontend
# ─────────────────────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/playwright:v1.43.0-jammy

WORKDIR /app

# Copy root package files and install ALL dependencies
# (Playwright is in devDependencies but needed for test execution)
COPY package.json package-lock.json ./
# Install ALL deps (devDependencies includes Playwright)
RUN npm ci --include=dev

# Copy backend source
COPY backend/ ./backend/

# Copy firebase helpers (used by backend at runtime)
COPY firebase/ ./firebase/

# Copy Playwright config and test files
COPY playwright.config.js ./

# Copy the .env.example as a fallback (real .env injected at runtime)
COPY .env.example ./.env.example

# Copy the built frontend from Stage 1
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

# Create the reports directory so the backend can write to it
RUN mkdir -p backend/reports/artifacts

# Expose the backend port
EXPOSE 3001

# Start the Express backend (which also serves the frontend)
CMD ["node", "backend/server.js"]
