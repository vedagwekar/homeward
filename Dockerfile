# Homeward API. Build from the repo root: docker build -t homeward-api .
# Secrets are never baked in: the host passes them as environment variables at run time.
FROM node:22-slim

WORKDIR /app

# The contract client generated from our Soroban contract (its dist/ isn't in git, so build it here).
COPY packages/homeward-client/package*.json packages/homeward-client/
RUN npm ci --prefix packages/homeward-client
COPY packages/homeward-client packages/homeward-client
RUN npm run build --prefix packages/homeward-client

COPY backend/package*.json backend/
RUN npm ci --prefix backend
COPY backend backend

# The two files the API reads from outside backend/: public demo addresses and the homes' display data.
COPY scripts/accounts.json scripts/accounts.json
COPY web/mock/projects.json web/mock/projects.json

# SQLite and uploaded videos go on the host's persistent disk, mounted at /data.
ENV NODE_ENV=production DB_PATH=/data/homeward.sqlite UPLOAD_DIR=/data/uploads PORT=4000
EXPOSE 4000
WORKDIR /app/backend
CMD ["npm", "start"]
