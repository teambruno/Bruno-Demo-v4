# Bruno V4 Demo Kit

A cleaned-up, narrative version of the Bruno Demo Day workspace, restructured
so a live demo runs top-to-bottom in four collections.

## Flow

1. **01 - Fundamentals** - CRUD basics, variable precedence, chained
   requests.
2. **02 - Auth and Scripting** - Basic/Bearer/OAuth2 auth, pre/post-request
   scripting, contract testing, a product-update flow, and a data-driven run
   iterating one request over a CSV or JSON file.
3. **03 - Secrets and Vaults** - external secret managers. The same requests
   run against Azure Key Vault, AWS Secrets Manager or HashiCorp Vault by
   switching the environment dropdown. Usually comes up late in a call, so
   it lives in one self-contained collection you can jump straight to.
4. **04 - CLI CI and V4 Features** - CLI runner + reporters, protocols
   beyond REST (SOAP/SSE/gRPC/GraphQL/WebSocket), and a dedicated tour of
   what's new in Bruno V4 (secrets manager migration, variable
   persistence, descriptions/types, multi-message WebSocket, JUnit
   classname change).

Each collection folder has its own docs (visible in the Bruno app, or in
each `opencollection.yml` / `folder.yml`) with the relevant `bru run`
commands.

## Shared scripts

`/shared-scripts/` holds JS modules (`httpAsserts.js`, `testData.js`) used by
**all four** collections. Each `opencollection.yml` opts in with:

```yml
extensions:
  bruno:
    scripts:
      additionalContextRoots:
        - "../../shared-scripts"
```

Requires Developer Mode in the app and `--sandbox=developer` on the CLI
(v3.0.0+). Run the whole story in one command:

```bash
bru run --env Production --tags shared-scripts --sandbox=developer
```

Details and the local-vs-shared comparison: [`shared-scripts/README.md`](shared-scripts/README.md).
Docs: https://docs.usebruno.com/testing/script/js-file

## What changed from the old workspace

- `workspace.yml` used to reference four collections that didn't exist on
  disk (New Collection, Swagger Petstore, Zscaler OneAPI x2) - dropped.
- Committed `secrets.json`, `.env`, and `node_modules/` have been removed
  and gitignored. Secrets now use Bruno V4's `externalSecrets` /
  `{{name.keyname}}` pattern instead of a root-level `secrets.json`.
- Every `externalSecrets` binding across the workspace was normalised to the
  single alias **`vault`** (previously a mix of `azure-keys`, `azure-secrets`
  and `secrets`). Two of those never resolved - `05-Get News Articles.yml`
  referenced `azure-keys` while `01 - Fundamentals/environments/Staging.yml`
  bound `azure-secrets`. A provider-neutral alias also means the same request
  works on all three secret managers with no edits.
- Known-dead endpoints replaced:
  - `graphql-pokeapi.graphcdn.app` (GraphCDN/Stellate shut down) -> official
    `beta.pokeapi.co/graphql/v1beta`
  - `wss://echo.websocket.org` (deprecated by Postman) ->
    `wss://echo.websocket.events`
  - `reqres.in` (now gated/paid) -> `dummyjson.com`
  - `api.example.com` (reserved, non-routable domain) -> `www.httpfaker.org`
- **`httpbin.org` is banned from this workspace.** It is Postman-owned, so
  its outages block our demos. Everything moved to `www.httpfaker.org`, which
  Bruno owns and develops. Its surface is smaller, so a few requests changed
  shape rather than just hostname:

  | Was (httpbin) | Now (httpfaker) |
  |---|---|
  | `GET /get` | `POST /api/echo` - POST-only, lowercased header keys, `body` is a raw string, no parsed `args` |
  | `POST /post` | `POST /api/echo` |
  | `GET /basic-auth/user/passwd` | `GET /api/auth/digest/{qop}/{user}/{passwd}` for a real 200/401 gate, or `/api/echo` to assert the `Authorization` header |
  | `GET /xml` | `POST /api/echo/custom` with `{headers, content}` - returns any content-type you ask for |
  | `GET /redirect/1` | **no equivalent** - see below |

  httpfaker has no redirect endpoint, so
  `01 - Fundamentals/01-Basic-Requests/HTTP Redirect.yml` is the one request
  still on httpbin. Worth adding a `/api/redirect/{n}` to httpfaker, since we
  own it.
- **Verify before a live demo** (couldn't confirm liveness from this
  environment - test in the app first): `www.httpfaker.org` /
  `www.httpfaker.com` (OAuth2 client-credentials demo), `grpcb.in`
  (community-run gRPC sandbox), `echo.websocket.events` (WebSocket echo
  successor), `newsapi.org` (free tier blocks non-localhost production
  traffic, fine for a local live demo).

## Bruno V4 features covered

See `04 - CLI CI and V4 Features/03-v4 Updates` for runnable examples
of: secrets manager migration, `bru.setVar()` vs `bru.setEnvVar()`
persistence, descriptions + typed variables, multiple WebSocket messages
(in `02-Additional-Request-Types/echo-websocket.yml`), shared scripts across
collections via `additionalContextRoots`, and the CLI JUnit `classname`
change. Full release notes: https://www.usebruno.com/v4-release
