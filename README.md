# Bruno — Conference 2026 kit

A deliberately small Bruno workspace for running a demo at a busy table:
**three collections**, numbered folders, and every request verified live.

The full demo kit — protocol matrix, every auth flow, four collections, the
whole CI story — is on the `main` branch. This branch is the version you can
navigate while someone is talking to you.

```
01 - Core                  11 requests   what an API client has to do
02 - Advanced              25 requests   what people don't expect it to do
03 - Secrets and OpenAPI    7 requests   what decides whether they can adopt it
```

Everything runs against public APIs with **no key and no signup**: PokéAPI,
JSONPlaceholder, DummyJSON, Wikimedia EventStreams, and Bruno's own
`httpfaker.org` / `echo.usebruno.com`.

---

## The five-minute walk

| # | Open this | Say this |
|---|-----------|----------|
| 1 | `01 - Core / 01-Requests / 01-Get Pokemon` | "Plain GET. Tests, assertions and docs all in one file." |
| 2 | the same file in a text editor | "That file **is** the request. YAML, in git, reviewable in a PR. No cloud account." |
| 3 | `01 - Core / 02-Tests-and-Scripts / 01-Tests and Assertions` | "JS tests for your engineers, a no-code assertion table for everyone else." |
| 4 | `02 - Advanced / 01-Chaining` → **Run folder** | "Four requests. It picked a Pokémon, followed the species link, walked the evolution chain. Zero hardcoded ids." |
| 5 | `02 - Advanced / 02-Data-Driven` + open `pokemon.csv` | "Same request, eight rows of a spreadsheet, eight runs." |
| 6 | `02 - Advanced / 06-Reusable-Scripts` | "Reusable modules: a local `.js` file, one shared across collections, and an **npm package** — your own libraries, in your tests." |
| 7 | `02 - Advanced / 04-Auth / 02-Bearer-and-Inheritance` | "The token is configured **once, on the folder**. Every request under it inherits — and this one overrides it and asserts a 401 to prove the override won." |
| 8 | `03 - Secrets and OpenAPI / 01-Secret-Manager / 02-OAuth2 Client Secret` | "The client secret comes from Azure Key Vault. Switch the dropdown to AWS — same request, no edits." |

If they only get one thing, make it **step 4**. It is the most visual and the
hardest to dismiss.

### Two crowd-pleasers to keep on a second screen

- `02 - Advanced / 05-Beyond-REST / 03-SSE - Wikimedia Firehose` — every page
  created across Wikimedia, streaming live. Costs nothing, looks busy.
- `02 - Advanced / 05-Beyond-REST / 01-GraphQL - PokéAPI` — a real query
  editor with schema autocomplete, not a JSON body with a `query` string in it.

---

## What each collection covers

### 01 - Core
Requests (every verb), tests **and** declarative assertions, pre/post-request
scripts, `bru.visualize()` rendering the response as HTML, variable precedence
across four scopes, typed variables, prompt variables, and per-request docs.
Everything runs under the default `safe` sandbox — no flags.
Environments: **Demo** (booth default), Production.

`bru run --env Demo` → **10 passed, 1 skipped, 29 tests**. The skip is
`03-Variables/03-Prompt Variables`, which uses `{{?pokemonName}}` — the CLI
cannot prompt, so it skips rather than fails, and the run stays green.

### 02 - Advanced
Script chaining (a four-request PokéAPI evolution walk), data files (CSV and
JSON), the collection runner with tag filtering, auth in four subfolders (JWT
capture, Bearer inherited from a folder, API key as header or query param, and
OAuth2 client credentials both inherited and referenced by variable), non-REST
protocols (GraphQL, WebSocket, SSE, gRPC), and reusable JS modules —
collection-local, workspace-shared, and a third-party **npm package**, side by
side. Environments: **Demo**, CI.

`bru run --env Demo --exclude-tags app-only,data-driven --sandbox=developer` →
**20 passed, 66 tests**. The other five requests are the three app-only
protocols, the query-placed API key (app-only on bru 4.0.0), and the
data-driven one, which needs its own command.

### 03 - Secrets and OpenAPI
Run this one **folder by folder** — the three vault environments do not define
the endpoints `02-Local-Secrets` uses, and vice versa, so a whole-collection
run mixes incompatible environments. External secret managers behind one provider-neutral alias — the same four
requests run against Azure Key Vault, AWS Secrets Manager or HashiCorp Vault
by switching the environment dropdown. Plus `.env` and keychain-backed
secrets, and the OpenAPI story: import, Sync (Beta), export, and a spec-drift
contract test. Environments: **Demo-Azure**, Demo-AWS, Demo-HashiCorp,
Demo-Local.

Each collection's `opencollection.yml` and every `folder.yml` carries its own
docs, visible in the app — including the exact `bru run` commands.

---

## CLI cheat sheet

Run these from inside a collection directory.

```bash
cd "collections/01 - Core"

bru run --env Demo                                   # everything
bru run "01-Requests" --env Demo                     # one folder
bru run "01-Requests/01-Get Pokemon.yml" --env Demo   # one request
bru run "01-Requests/01-Get Pokemon.yml" --env Demo --env-var pokemonName=snorlax
```

```bash
cd "collections/02 - Advanced"

bru run "01-Chaining" --env Demo
bru run "02-Data-Driven" --env Demo --csv-file-path "02-Data-Driven/pokemon.csv"
bru run "02-Data-Driven" --env Demo --json-file-path "02-Data-Driven/pokemon.json"

bru run --env Demo --tags smoke                       # 9 requests
bru run --env Demo --tags regression --exclude-tags slow

# reusable JS modules — 01 needs no flag; 02 and 03 do
bru run "06-Reusable-Scripts" --env Demo --sandbox=developer

# whole collection — the flags matter, see below
bru run --env Demo --exclude-tags app-only,data-driven --sandbox=developer

bru run --env Demo --tags smoke \
  --reporter-html  ../../reports/smoke.html \
  --reporter-json  ../../reports/smoke.json \
  --reporter-junit ../../reports/smoke.xml
```

```bash
cd "collections/03 - Secrets and OpenAPI"

bru run "02-Local-Secrets" --env Demo-Local           # no cloud credentials
bru run "03-OpenAPI" --env Demo-Local                 # no credentials at all
bru run "01-Secret-Manager" --env Demo-Azure --verbose # needs `az login`
```

### Four flags worth memorising before the doors open

- **`--exclude-tags` takes one comma-separated value.** Repeating the flag
  fails with `excludeTags.split is not a function` on bru 4.0.0. Use
  `--exclude-tags app-only,data-driven`.
- **`--verbose` on any secret-manager run.** The CLI *swallows* vault fetch
  errors, so a failed fetch looks like an ordinary 401 from the API under
  test and you debug the wrong thing.
- **`--sandbox=developer`** for anything that `require()`s a file *outside* its
  own collection (`/shared-scripts/`) or an npm package from `node_modules`. A
  `.js` file **inside** the collection needs no flag, and neither do Bruno's
  inbuilt libraries (`ajv`, `crypto-js`, `jsonwebtoken`, `axios`, `chai`,
  `uuid`, `moment`, …). The default has been `safe` since CLI 3.0.0.
- **`--workspace-path ../..`** if you use `--global-env`, so the workspace
  `environments/` resolve from a collection directory.

### Why a whole-collection run of `02 - Advanced` needs flags

Three requests fail without them, two of them on purpose:

- **`app-only`** — the CLI cannot execute WebSocket or gRPC requests, and an
  SSE stream has no final response to assert against.
- **`data-driven`** — `02-Data-Driven` is *designed* to fail when no data file
  is attached, so forgetting `--csv-file-path` is loud rather than silent.
- **`--sandbox=developer`** — `06-Reusable-Scripts/02-Shared JS File` reaches
  outside the collection for `/shared-scripts/`, and `03-NPM Module` reaches
  into `node_modules`. The default `safe` sandbox blocks both.

The first two are correct behaviour that still looks bad at a table. Use the
flags.

---

## Setup

One symlink, once, so the CLI can read `.env` for `02-Local-Secrets`. The app
reads `.env` from the workspace root; `bru run` reads it from the collection
root.

```bash
cp .env.example .env      # then fill in real values
ln -s ../../.env "collections/03 - Secrets and OpenAPI/.env"
```

Both are covered by `.gitignore`, so they stay local. Only `.env.example` is
committed, with fake values.

And one `npm install`, for the npm-package demo in
`02 - Advanced / 06-Reusable-Scripts / 03-NPM Module`:

```bash
cd "collections/02 - Advanced" && npm install
```

`package.json` is committed, `node_modules` is not. Skip it and that one
request fails with an instruction to run it — nothing else is affected.

The Azure vault (`bruno-demo-kv`) is already populated. Seeding commands for
all three providers are in
`collections/03 - Secrets and OpenAPI/01-Secret-Manager/folder.yml`.

---

## OpenAPI

[`api-specs/`](api-specs/) holds OpenAPI contracts to demo against. Every spec
is **vendored from upstream, unmodified** — so "is that a real spec?" has a
one-word answer.

| Directory | Spec | Good for showing |
|---|---|---|
| [`api-specs/petstore/`](api-specs/petstore/) | Swagger Petstore, OAS **3.0.4 YAML** + **Swagger 2.0 JSON** | the main import demo, and legacy Swagger 2 still importing |
| [`api-specs/adyen/`](api-specs/adyen/) | Adyen Checkout v71, OAS 3.1.0 | 283 named examples arriving with the import |
| [`api-specs/open-meteo/`](api-specs/open-meteo/) | Open-Meteo, three OAS 3.1.0 documents | 3.1, and the no-`servers` snag customers hit |

Only Petstore is registered in `workspace.yml` under `specs:`, to keep the
sidebar clean. The rest are importable from the file picker.

Import **live on the call** — the audience should watch the requests appear.
Full recipes (import, Sync, forcing drift, export, generating in CI) are in
[`api-specs/README.md`](api-specs/README.md) and in
`03 - Secrets and OpenAPI/03-OpenAPI/folder.yml`.

> **Checked 2026-08-19:** `petstore3.swagger.io` serves its spec reliably, but
> `POST /pet` and `GET /pet/{petId}` are **500ing**. Import from the spec and
> sync against it — but do not click Send on the imported Petstore requests.
> That is why this kit tests the spec *document* rather than the Petstore API.

---

## Endpoint status

Verified **2026-08-19** from this workspace unless noted.

| Endpoint | Used by | Status |
|---|---|---|
| `pokeapi.co/api/v2` | 01, 02 | ✅ |
| `beta.pokeapi.co/graphql/v1beta` | 02 | ✅ |
| `jsonplaceholder.typicode.com` | 01 | ✅ |
| `dummyjson.com` | 02, 03 | ✅ |
| `www.httpfaker.org` | 02, 03 | ✅ Bruno-owned |
| `echo.usebruno.com` | 01, 03 | ✅ Bruno-owned (POST only) |
| `stream.wikimedia.org` | 02 | ✅ |
| `petstore3.swagger.io/api/v3/openapi.json` | 03 | ✅ spec only — API write path 500s |
| Azure Key Vault `bruno-demo-kv` | 03 | ✅ all four keys resolve |
| `wss://echo.websocket.org` | 02 | ✅ DNS resolves — **test in the app first** |
| `grpcb.in` | 02 | ⚠️ community sandbox, least reliable thing here |

`httpbin.org` is **banned from this workspace** — it is Postman-owned, so its
outages take our demos down. Everything echo-shaped uses `httpfaker.org` or
`echo.usebruno.com`, which Bruno owns.

---

## Known CLI behaviour this kit works around

Found while building this branch and verified against **bru 4.0.0**. Each one
is documented in the request that exercises it.

| Behaviour | Where it matters |
|---|---|
| Request-level vars are `bru.getRequestVar()`, **not** `bru.getVar()` | `01 - Core / 03-Variables / 02-Typed Variables` |
| Data-file rows reach the **request** but not the script scope — no getter reads them; read them back with `req.getHeader()` / `req.getUrl()` | `02 - Advanced / 02-Data-Driven` |
| `req.getHeader()` is **case-sensitive** (`"x-foo"` returns `null`) | same |
| Query params listed only in the params table can miss the wire — write them inline in the URL too | `01 - Core / 01-Requests / 02-List Pokemon` |
| `--exclude-tags` cannot be repeated; use one comma-separated value | everywhere |
| Vault fetch failures are swallowed without `--verbose` | `03 / 01-Secret-Manager` |
| `settings.timeout: 0` on an SSE request makes `bru run` hang until the socket dies | `02 / 05-Beyond-REST / 03-SSE` (set to 30s) |
| Bruno secret variables resolve to `""` under the CLI (keychain is local-only) | `03 / 02-Local-Secrets / 02` |
| `require()` resolves from the **collection root**, not the request file — a `.js` file next to a request still needs the folder in its path | `02 / 06-Reusable-Scripts / 01` |
| npm packages resolve from the **collection's own** `node_modules`; Node built-ins (`fs`, `os`, `crypto`, `child_process`) are blocked in both sandboxes | `02 / 06-Reusable-Scripts / 03` |

## Bruno V4 features covered

Typed variables and descriptions, `externalSecrets` in the environment file
with `{{alias.keyname}}` references, `setVar` vs `setEnvVar` disk persistence,
multiple saved WebSocket messages, and shared scripts across collections via
`additionalContextRoots` (`02 - Advanced / 06-Reusable-Scripts`).
Release notes: <https://www.usebruno.com/v4-release>
