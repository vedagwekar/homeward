#!/usr/bin/env bash
# Keeps the contract's data alive on Stellar. Entries expire if nobody touches them, and a build lasts months.
# Run it weekly (a Railway cron, or by hand). Needs the stellar CLI and a funded key named "ved" (or set SOURCE).
set -euo pipefail
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
[ -f "$root/.env" ] && set -a && . "$root/.env" && set +a
: "${CONTRACT_ID:?CONTRACT_ID is not set}"
SOURCE="${SOURCE:-ved}"
LEDGERS="${LEDGERS:-535679}"   # about 31 days, the most a single call allows

# The contract itself (its settings and its code).
stellar contract extend --id "$CONTRACT_ID" --source-account "$SOURCE" --network testnet \
  --ledgers-to-extend "$LEDGERS" --durability persistent
stellar contract extend --id "$CONTRACT_ID" --source-account "$SOURCE" --network testnet \
  --ledgers-to-extend "$LEDGERS" --durability instance 2>/dev/null || true
echo "Extended $CONTRACT_ID by $LEDGERS ledgers."
