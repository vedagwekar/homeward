#!/usr/bin/env bash
# One command, the builder's deposit on Stellar Testnet: it comes back, or goes to the family.
# Needs a .env file in the repo root (see .env.example).
set -euo pipefail
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [ ! -f "$root/packages/homeward-client/dist/index.js" ]; then
  (cd "$root/packages/homeward-client" && npm install --silent && npm run build --silent)
fi
[ -d "$root/backend/node_modules" ] || (cd "$root/backend" && npm install --silent)
[ -d "$root/scripts/node_modules" ] || (cd "$root/scripts" && npm ci --silent)

cd "$root/scripts"
exec npx tsx security.ts
