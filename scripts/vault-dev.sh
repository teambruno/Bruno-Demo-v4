#!/usr/bin/env bash
# Local HashiCorp Vault for the "03 - Secrets and Vaults" demo.
#
# Starts `vault server -dev` on 127.0.0.1:8200 with a FIXED root token and
# seeds the KV v2 path the Demo-HashiCorp environment binds to
# (secret/data/bruno-demo-vault) with the four keys the requests read.
#
#   ./scripts/vault-dev.sh          start (or re-seed if already running)
#   ./scripts/vault-dev.sh stop     stop the dev server
#   ./scripts/vault-dev.sh status   show the seeded secret
#
# Bruno app -> Preferences -> Secret Providers -> HashiCorp Vault:
#   Address: http://127.0.0.1:8200   Auth: Token   Token: $VAULT_ROOT_TOKEN
# Dev mode is in-memory; everything is gone on stop. Never use this outside a demo.
set -euo pipefail

export VAULT_ADDR="${VAULT_ADDR:-http://127.0.0.1:8200}"
VAULT_ROOT_TOKEN="${VAULT_ROOT_TOKEN:-bruno-demo-root}"
SECRET_PATH="secret/bruno-demo-vault"            # CLI path; API path is secret/data/bruno-demo-vault
LOG="${TMPDIR:-/tmp}/bruno-vault-dev.log"
PIDFILE="${TMPDIR:-/tmp}/bruno-vault-dev.pid"

# Values match the Azure/AWS demo stores so the same requests pass everywhere.
BASIC_AUTH_PASSWORD="${BASIC_AUTH_PASSWORD:-passwd}"                 # request 3: digest gate in the URL
DUMMYJSON_PASSWORD="${DUMMYJSON_PASSWORD:-jamesdpass}"               # request 4: real dummyjson login for user jamesd
OAUTH_CLIENT_SECRET="${OAUTH_CLIENT_SECRET:-demo-client-secret}"     # request 2: httpfaker client-credentials
WEBHOOK_SIGNING_SECRET="${WEBHOOK_SIGNING_SECRET:-whsec_9c2f7ab3e14d5680bf3a1e2c4d8b60f7}"  # request 5: only the HMAC goes on the wire

command -v vault >/dev/null || { echo "vault CLI not found (brew install hashicorp/tap/vault)"; exit 1; }

is_up() { curl -sf "$VAULT_ADDR/v1/sys/health" >/dev/null 2>&1; }

seed() {
  export VAULT_TOKEN="$VAULT_ROOT_TOKEN"
  vault kv put "$SECRET_PATH" \
    basic-auth-password="$BASIC_AUTH_PASSWORD" \
    dummyjson-password="$DUMMYJSON_PASSWORD" \
    oauth-client-secret="$OAUTH_CLIENT_SECRET" \
    webhook-signing-secret="$WEBHOOK_SIGNING_SECRET" >/dev/null
  echo
  echo "Seeded $SECRET_PATH (KV v2):"
  vault kv get -format=json "$SECRET_PATH" | python3 -c 'import json,sys; [print(f"  {k} = {v}") for k,v in json.load(sys.stdin)["data"]["data"].items()]'
}

case "${1:-start}" in
  start)
    if is_up; then
      echo "Vault already up at $VAULT_ADDR - re-seeding."
    else
      nohup vault server -dev \
        -dev-root-token-id="$VAULT_ROOT_TOKEN" \
        -dev-listen-address="${VAULT_ADDR#http://}" \
        >"$LOG" 2>&1 &
      echo $! >"$PIDFILE"
      for _ in $(seq 1 30); do is_up && break; sleep 0.2; done
      is_up || { echo "Vault did not start; see $LOG"; exit 1; }
      echo "Vault dev server up at $VAULT_ADDR (pid $(cat "$PIDFILE"), log $LOG)"
    fi
    seed
    cat <<MSG

Bruno -> Preferences -> Secret Providers -> HashiCorp Vault
  Address : $VAULT_ADDR
  Auth    : Token
  Token   : $VAULT_ROOT_TOKEN
Then pick the Demo-HashiCorp environment in "03 - Secrets and Vaults".

Shell:  export VAULT_ADDR=$VAULT_ADDR VAULT_TOKEN=$VAULT_ROOT_TOKEN
Stop:   $0 stop
MSG
    ;;
  stop)
    if [[ -f "$PIDFILE" ]] && kill "$(cat "$PIDFILE")" 2>/dev/null; then
      echo "Stopped vault dev server (pid $(cat "$PIDFILE"))."
    else
      pkill -f "vault server -dev" && echo "Stopped vault dev server." || echo "No vault dev server running."
    fi
    rm -f "$PIDFILE"
    ;;
  status)
    is_up || { echo "Vault is not running at $VAULT_ADDR"; exit 1; }
    VAULT_TOKEN="$VAULT_ROOT_TOKEN" vault kv get "$SECRET_PATH"
    ;;
  *) echo "usage: $0 [start|stop|status]"; exit 2 ;;
esac
