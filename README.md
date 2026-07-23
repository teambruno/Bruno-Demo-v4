# Bruno V4 Demo Kit

A cleaned-up, narrative version of the Bruno Demo Day workspace, restructured
so a live demo runs top-to-bottom in three collections.

## Flow

1. **01 - Fundamentals** - CRUD basics, variable precedence, chained
   requests, a CSV data-driven run.
2. **02 - Auth and Scripting** - Basic/Bearer/OAuth2 auth, pre/post-request
   scripting, contract testing, a product-update flow.
3. **03 - CLI CI and V4 Features** - CLI runner + reporters, protocols
   beyond REST (SOAP/SSE/gRPC/GraphQL/WebSocket), and a dedicated tour of
   what's new in Bruno V4 (secrets manager migration, variable
   persistence, descriptions/types, multi-message WebSocket, JUnit
   classname change).

Each collection folder has its own docs (visible in the Bruno app, or in
each `opencollection.yml` / `folder.yml`) with the relevant `bru run`
commands.

## What changed from the old workspace

- `workspace.yml` used to reference four collections that didn't exist on
  disk (New Collection, Swagger Petstore, Zscaler OneAPI x2) - dropped.
- Committed `secrets.json`, `.env`, and `node_modules/` have been removed
  and gitignored. Secrets now use Bruno V4's `externalSecrets` /
  `{{name.keyname}}` pattern instead of a root-level `secrets.json`.
- Known-dead endpoints replaced:
  - `graphql-pokeapi.graphcdn.app` (GraphCDN/Stellate shut down) -> official
    `beta.pokeapi.co/graphql/v1beta`
  - `wss://echo.websocket.org` (deprecated by Postman) ->
    `wss://echo.websocket.events`
  - `reqres.in` (now gated/paid) -> `dummyjson.com`
  - `api.example.com` (reserved, non-routable domain) -> `httpbin.org`
- **Verify before a live demo** (couldn't confirm liveness from this
  environment - test in the app first): `www.httpfaker.org` /
  `www.httpfaker.com` (OAuth2 client-credentials demo), `grpcb.in`
  (community-run gRPC sandbox), `echo.websocket.events` (WebSocket echo
  successor), `newsapi.org` (free tier blocks non-localhost production
  traffic, fine for a local live demo).

## Bruno V4 features covered

See `03 - CLI CI and V4 Features/03-V4-New-Features` for runnable examples
of: secrets manager migration, `bru.setVar()` vs `bru.setEnvVar()`
persistence, descriptions + typed variables, multiple WebSocket messages
(in `02-Additional-Request-Types/echo-websocket.yml`), and the CLI JUnit
`classname` change. Full release notes: https://www.usebruno.com/v4-release
