# oas-to-bruno

Generate a Bruno V4 collection from an OpenAPI spec without opening the app.

Same conversion the app runs on **Import → OpenAPI**, driven by
[`@usebruno/converters`](https://docs.usebruno.com/converters/overview) - the
package Bruno itself uses. The point is that a collection can be a build
artifact of the spec instead of something a human remembers to re-import.

```bash
npm install

npm run generate:petstore      # OpenAPI 3.0.4 YAML -> 19 requests
npm run generate:petstore-v2   # Swagger 2.0 JSON   -> 20 requests
npm run generate:forecast      # OpenAPI 3.1.0 YAML ->  1 request

# or directly
node oas-to-bruno.mjs ../petstore/openapi.yaml ../../generated/petstore --name "Petstore"
```

Output goes to `generated/` at the workspace root, which is **gitignored** -
it is a build artifact, regenerated from the spec rather than committed.

Verified end to end on 2026-08-12 with `@usebruno/converters` 0.22.0 and
Bruno CLI 4.0.0: all three specs convert, and the generated requests run under
`bru run`.

## What it writes

The unbundled layout the rest of this workspace uses - one folder per OpenAPI
tag, one `.yml` per operation:

```
generated/petstore/
├── opencollection.yml
├── environments/
│   └── Environment 1.yml     <- from the spec's `servers` block
├── pet/     folder.yml + 8 requests
├── store/   folder.yml + 4 requests
└── user/    folder.yml + 7 requests
```

`brunoToOpenCollection` can also emit the whole collection as a single bundled
`opencollection.yml`. Bruno reads that fine, but `bru run <folder>` resolves
its argument as a filesystem path, so bundling costs you folder-scoped runs -
and one 80 KB file makes `git diff` useless. Hence the tree.

## Two things worth knowing

**Query parameters need inlining, and this script does it.** The converter
records query parameters under `http.params` but leaves the URL bare. In the
app that is invisible, because the URL bar and the params table stay in sync.
`bru run` builds from the URL string, so an untouched generated
`GET /pet/findByStatus` goes out with no `status` at all and comes back
`400 Input error: missing required query parameter`. `inlineQueryParams()`
folds enabled query params back into the URL, which is what makes the output
runnable headlessly.

**Path parameters arrive empty, by design.** `GET /pet/{petId}` becomes
`{{baseUrl}}/pet/:petId` with `petId` listed and blank. A spec has no value to
supply, so you fill it in - `--env-var petId=10`, a script, or a CSV for a
data-driven run.

## In a pipeline

Regenerate on every spec change and fail the build if the committed collection
has drifted:

```bash
node oas-to-bruno.mjs ../petstore/openapi.yaml /tmp/check --name "Petstore"
diff -r /tmp/check ../../generated/petstore
```

A Bruno request that GETs the live spec and asserts its operation set makes the
same argument from the other end, and needs no Node at all - see the drift
recipe in [`../README.md`](../README.md).
