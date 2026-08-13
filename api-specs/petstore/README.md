# Swagger Petstore (vendored)

Third-party contracts. **Do not hand-edit** - re-vendor from upstream instead.

| File | Spec version | Operations | Upstream |
|---|---|---:|---|
| `openapi.yaml` | OpenAPI 3.0.4 (`info.version` 1.0.27) | 19 across 13 paths | [swagger-api/swagger-petstore `src/main/resources/openapi.yaml`](https://github.com/swagger-api/swagger-petstore/blob/master/src/main/resources/openapi.yaml) |
| `swagger-2.0.json` | Swagger 2.0 (`info.version` 1.0.7) | 20 across 14 paths | <https://petstore.swagger.io/v2/swagger.json> |

Vendored 2026-08-12.

Two files on purpose: Bruno imports **OpenAPI 2.0 (Swagger) and 3.x, in YAML
or JSON**, so this one directory covers all four combinations - a modern YAML
spec and a legacy JSON one that still describes a live server.

## Re-vendor

```bash
curl -sSL -o openapi.yaml \
  https://raw.githubusercontent.com/swagger-api/swagger-petstore/master/src/main/resources/openapi.yaml

curl -sSL https://petstore.swagger.io/v2/swagger.json | python3 -m json.tool > swagger-2.0.json
```

## Shape

Both specs group operations with three `tags` - `pet`, `store`, `user` - which
is what Bruno's default tag-based import turns into folders.

`openapi.yaml` declares two security schemes:

- `petstore_auth` - OAuth2 implicit flow, scopes `write:pets` / `read:pets`
- `api_key` - API key in the `api_key` header

On import Bruno carries these onto the requests that reference them, so
`PUT /pet` lands with its auth mode already set to OAuth2 rather than "None".

## Live servers

`openapi.yaml` points at `https://petstore3.swagger.io/api/v3`, and
`swagger-2.0.json` at `https://petstore.swagger.io/v2`. Both are public Swagger
sandboxes, so imported requests really execute - but see the reliability note in
[`../README.md`](../README.md#petstore3-is-a-public-sandbox) before you put one
in front of a customer.
