# ---------- Stage 1: build ----------
# "AS build" names this stage so we can copy FROM it later. This whole stage
# is a throwaway "messy kitchen" — none of it ships to production.
FROM node:22-slim AS build
WORKDIR /app

# Prisma's engine needs OpenSSL to generate the client.
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy ONLY the dependency manifests first, install, THEN copy source.
# This ordering keeps the expensive npm ci layer cached across code changes.
COPY package*.json ./
RUN npm ci

# Generate the Prisma client (respects the custom output path in schema.prisma).
COPY prisma ./prisma
RUN npx prisma generate

# Bring in the rest of the source (no build/compile step — it's plain JS).
COPY . .

# ---------- Stage 2: runtime ----------
# A FRESH image. Nothing from the build stage is here unless we explicitly copy it.
FROM node:22-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app

# Prisma's query engine ALSO needs OpenSSL at runtime, not just at generate time.
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Install ONLY production dependencies (drops dev deps -> smaller, less surface).
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy the app source and the generated Prisma client from the build stage.
# Copying the whole /app/node_modules is the robust way to bring the generated
# client across regardless of whether it lives in node_modules/.prisma or a
# custom generated/ path.
COPY --from=build /app .

# The app writes temp files to /app/tmp; make sure the non-root user owns it.
RUN mkdir -p /app/tmp && chown -R node:node /app

# Drop root. "node" is a built-in unprivileged user in the official image.
USER node

EXPOSE 5000

# Ask the app itself "are you serving?" — not just "is the process alive?"
HEALTHCHECK --interval=30s --timeout=3s --start-period=20s \
  CMD node -e "fetch('http://localhost:5000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["npm", "start"]