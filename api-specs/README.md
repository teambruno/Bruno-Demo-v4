# api-specs

OpenAPI contracts, versioned in git next to the collections that test them.

Every spec here is **vendored from upstream, unmodified**. Nothing in this
directory is hand-written for the demo - if a customer asks "is that a real
spec?", the answer is yes, and the provenance table in each subdirectory says
where it came from and when.

```
api-specs/
├── petstore/            Swagger Petstore - the canonical teaching spec
│   ├── openapi.yaml         OpenAPI 3.0.4, 19 operations, 3 tags, live server
│   └── swagger-2.0.json     Swagger 2.0 in JSON, same API
├── adyen/               Enterprise spec - the one with examples everywhere
│   └── checkout-v71.json    OpenAPI 3.1.0, 28 operations, 283 named examples
├── open-meteo/          Real published specs for an API this kit already calls
│   ├── forecast.yml         OpenAPI 3.1.0, ~80 params on one operation
│   ├── elevation.yml        OpenAPI 3.1.0, the smallest useful spec
│   └── air-quality.yml      OpenAPI 3.1.0, different host to the other two
└── tools/
    └── oas-to-bruno.mjs     Generate a collection from a spec, in CI
```

Between them these cover every import combination Bruno supports - **2.0 and
3.x, YAML and JSON** - which is the point of having more than one.

### Which one to open

| If you want to show... | Use |
|---|---|
| Requests that actually **send** on a call | `petstore/openapi.yaml` |
| **Examples and pre-filled bodies** arriving with the import | `adyen/checkout-v71.json` |
| Legacy **Swagger 2.0** still importing | `petstore/swagger-2.0.json` |
| **3.1**, and the no-`servers` snag customers hit | `open-meteo/forecast.yml` |

There is deliberately **no checked-in collection** built from these. Importing
live is the demo - the audience should watch the requests appear, not be shown
a folder that was already there.

## What Bruno does with a spec

| Capability | Where |
|---|---|
| **Import** a spec into a collection, from file or URL | right-click collection → Import → OpenAPI |
| **OpenAPI Sync (Beta)** - keep the collection tracking a remote spec | right-click collection → OpenAPI Sync (Beta) |
| **View / design** a spec inside Bruno | dropdown → Create API Spec, then the sidebar |
| **Export** a collection back out as OAS 3 | collection → Share → OpenAPI Specification |
| **Convert** programmatically | [`@usebruno/converters`](tools/) |

Docs: <https://docs.usebruno.com/open-api/overview>

## Demo recipes

### 1. Import (90 seconds, the one to lead with)

Right-click a collection → **Import** → **OpenAPI** → pick
`api-specs/petstore/openapi.yaml`.

Choose **tag-based** grouping (the default): 19 operations land in three
folders - `pet`, `store`, `user` - matching the spec's `tags`. Choose
**path-based** instead and you get folders mirroring the URL structure, which
is what people migrating from Postman usually expect.

Worth pointing out on the way past, because it is the part that saves real
time: request bodies arrive pre-filled from the schema examples, and
`PUT /pet` arrives with its auth mode already set to **OAuth2** - Bruno read
`petstore_auth` out of `components.securitySchemes` rather than leaving you a
blank auth tab.

Then import `swagger-2.0.json` to make the "and your old Swagger 2 files too"
point without leaving the room.

### 2. Examples come across too

Import `api-specs/adyen/checkout-v71.json` when someone asks what else survives
the trip. **All 28 requests arrive with examples - 283 of them, about ten
each** - and they keep the names Adyen wrote:

```
Payment session data for Apple Pay
Response code 401. Unauthorized. (Get origin keys)
```

Open one and it holds a real response body, not a schema-shaped placeholder.
24 of the 28 requests also land with their **request body pre-filled** from the
spec's examples - real payment payloads with amounts and currencies.

How Bruno builds these is worth knowing, because it decides what a customer's
own spec will produce:

- a response with a named `examples:` map keeps those names (`Apple Pay`)
- a response with a single `example:` or just a schema becomes `200 Response`,
  `400 Response`, and so on

So a spec with named examples imports better than one without - a concrete,
non-obvious reason for a team to invest in their OpenAPI document. Petstore
still gets 75 examples across 19 requests with no named examples at all,
because Bruno falls back to the response schemas.

> Adyen's `servers` block points at their test environment, which needs a real
> merchant account - every request 401s without credentials. Import it for the
> examples, run Petstore.

### 3. Import from URL, then Sync (Beta)

Right-click → **OpenAPI Sync (Beta)** → **Add URL**:

```
https://petstore3.swagger.io/api/v3/openapi.json
```

Tick **Check for Spec Updates**. The spec is cached under
`<collection>/resources/spec/` so it keeps working offline, and Bruno re-checks
every 5 minutes (adjustable via the context menu next to **View spec** →
**Edit connection settings**).

The line that matters to anyone who has maintained a collection by hand:
**syncing updates URLs, parameters, request bodies and folder structure, and
leaves your tests, scripts and assertions intact.** To make that concrete, add
a test to one of the imported requests before you sync, then sync and show it
still there - that is the objection this feature answers, and it lands better
demonstrated than asserted.

> Sync overwrites the collection from the spec and cannot be undone. Demo it on
> a throwaway import, not on a collection you spent the morning building.

### 4. Show drift without waiting for upstream to change

Sync polls a URL, so serve the specs locally and edit the copy:

```bash
cd api-specs && python3 -m http.server 8080
# point Sync at http://localhost:8080/petstore/openapi.yaml
# then edit that file - add a path, add a required param - and re-check
```

The same idea works as a test rather than a UI gesture: a request that GETs
`{{specUrl}}` and asserts its operation set still matches what is committed
here will fail a pipeline the day upstream changes the contract. No Node, no
extra tooling - one request and a `test()` block.

### 5. Export, the other direction

Collection → **Share** → **OpenAPI Specification** → **Create**. A collection
someone built request-by-request comes back out as an OAS 3 document with
endpoints, methods, parameters, headers and responses. Pairs well with a
customer who has no spec at all and wants one.

### 6. Generate collections in CI

[`tools/oas-to-bruno.mjs`](tools/) does the import headlessly with
`@usebruno/converters`, so the collection can be a build artifact of the spec
instead of something a human re-imports. See [`tools/README.md`](tools/README.md).

## Reliability notes before you demo live

### petstore3 is a public sandbox

`petstore3.swagger.io` is a shared demo server and parts of it are frequently
broken. Measured 2026-08-12:

| Works | Intermittently 500s |
|---|---|
| `POST /pet`, `GET /pet/{id}`, `PUT /pet`, `DELETE /pet/{id}` | `GET /pet/findByTags` |
| `GET /pet/findByStatus` | `POST /user`, `GET /user/{username}` |
| `GET /user/login` | all of `/store/*`, including `GET /store/inventory` |

Stay in the left-hand column when clicking around after a live import. If you
open `/store/inventory`, expect a 500 - it is the server, not Bruno, and a fine
moment to move to a `pet` request instead.

A working flow to click through after importing: `POST /pet` (send an explicit
`id`, the server will not assign one), `GET /pet/{petId}`, `PUT /pet`,
`DELETE /pet/{petId}`, then `GET /pet/{petId}` again for a clean 404. Verified
against the live server 2026-08-12.

Data also resets periodically, so a pet created in the morning may be gone by
the afternoon. Every request in collection 05 creates what it needs.

Open-Meteo has been stable and needs no API key, so lead with Petstore for the
import story and fall back to Open-Meteo if Swagger's sandbox is having a bad
day.
