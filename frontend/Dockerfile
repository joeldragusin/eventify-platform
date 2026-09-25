# ---------- Stage 1: build ----------
# Compiles the React app into plain static files (HTML/JS/CSS). This stage is
# thrown away afterwards; only the compiled output is shipped.
FROM node:22-slim AS build
WORKDIR /app

# Copy only the dependency manifests first so "npm ci" stays cached
# until package*.json actually changes.
COPY package*.json ./
RUN npm ci

COPY . .

# Vite reads VITE_* variables at BUILD time and bakes them into the JS files,
# so the API address must be known here, not when the container starts.
# The default is the address the BROWSER uses to reach the backend
# (the host machine's published port), not a Docker-internal name.
ARG VITE_API_URL=http://localhost:5000/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# ---------- Stage 2: runtime ----------
# A tiny nginx image that only serves the compiled files from /app/dist.
FROM nginx:1.27-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

# Same idea as the backend: ask the server itself if it is serving.
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -q --spider http://127.0.0.1/ || exit 1
