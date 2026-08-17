# Template only - every value is a placeholder, so this file is safe to commit.
#
#   https://docs.usebruno.com/bru-cli/secret-managers
#
# CI renders it with `envsubst` from GitHub Actions secrets and writes the
# result to $RUNNER_TEMP (outside the checkout), then passes that path to
# `bru run --secrets-env-file`. See the `vault` job in
# .github/workflows/bruno-cli.yml.
#
# Locally, copy it and fill in real values - the rendered name is gitignored:
#
#   cp ci/azure-keyvault-service-principal.env.tpl \
#      ci/azure-keyvault-service-principal.env
#
# This path needs no `az` binary and no login session, so unlike the Azure CLI
# credential it also works inside the usebruno/cli container.
#
# The key names are not free-form. The CLI matches on the BRUNO_AZURE_KEY_VAULT_
# prefix and ignores anything else, so a near-miss like BRUNO_AZURE_TENANT_ID
# yields "No recognised BRUNO_* secrets provider keys found in: <file>" and the
# run then silently falls back to the Azure CLI credential. These three names
# come from SECRET_PROVIDER_ENV_KEYS['azure-key-vault'] in @usebruno/common -
# they are exactly what the app writes out under
# Preferences > Secret Manager > Export as .env.
BRUNO_AZURE_KEY_VAULT_TENANT_ID=${AZURE_TENANT_ID}
BRUNO_AZURE_KEY_VAULT_CLIENT_ID=${AZURE_CLIENT_ID}
BRUNO_AZURE_KEY_VAULT_CLIENT_SECRET=${AZURE_CLIENT_SECRET}
