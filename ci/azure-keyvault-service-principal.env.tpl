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
# Unlike the CLI-auth file, this path needs no `az` binary and no login
# session, so it also works inside the usebruno/cli container.
BRUNO_AZURE_TENANT_ID=${AZURE_TENANT_ID}
BRUNO_AZURE_CLIENT_ID=${AZURE_CLIENT_ID}
BRUNO_AZURE_CLIENT_SECRET=${AZURE_CLIENT_SECRET}
