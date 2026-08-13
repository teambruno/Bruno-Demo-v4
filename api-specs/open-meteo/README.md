# Open-Meteo (vendored)

Third-party contracts. **Do not hand-edit** - re-vendor from upstream instead.

Open-Meteo is the weather API this workspace already calls in
`02 - Auth and Scripting` (`weatherUrl`), so these are the published contracts
for an API the demo kit uses for real.

| File | Spec version | Operation | Live server |
|---|---|---|---|
| `forecast.yml` | OpenAPI 3.1.0 | `GET /v1/forecast` | `https://api.open-meteo.com` |
| `elevation.yml` | OpenAPI 3.1.0 | `GET /v1/elevation` | `https://api.open-meteo.com` |
| `air-quality.yml` | OpenAPI 3.1.0 | `GET /v1/air-quality` | `https://air-quality-api.open-meteo.com` |

Vendored 2026-08-12 from
[open-meteo/open-meteo `/openapi`](https://github.com/open-meteo/open-meteo/tree/main/openapi).
The upstream directory has six more specs (climate, ensemble, flood, marine,
seasonal, historical-weather); we vendor only what we test.

## Re-vendor

```bash
B=https://raw.githubusercontent.com/open-meteo/open-meteo/main/openapi
for f in forecast elevation air-quality; do curl -sSL -o "$f.yml" "$B/$f.yml"; done
```

## Why these are here as well as Petstore

Petstore is the clean teaching spec. These are what real published specs
actually look like, and they exercise three things Petstore does not:

**1. OpenAPI 3.1** - Petstore is 3.0.4. Bruno imports 2.0 and 3.x, and
`forecast.yml` is the 3.1 half of that claim.

**2. Tags containing spaces.** The tag here is `Weather Forecast APIs`. Bruno's
tag-based import replaces spaces with underscores, so the folder arrives as
`Weather_Forecast_APIs`. Worth showing rather than being surprised by.

**3. No `servers` block.** Upstream omits it, so imported requests have no
host - the URL comes in as `/v1/forecast`. This is the single most common
real-world import snag, and the fix is the same one customers will use: put the
host in a Bruno environment variable and prefix the URL with it. After
importing, add an environment with:

```yml
- name: baseUrl
  value: https://api.open-meteo.com
```

and change the URL to `{{baseUrl}}/v1/forecast`. Note `air-quality.yml` is
served from `https://air-quality-api.open-meteo.com` instead - three specs from
one vendor, two hosts, and neither document says so, which is the argument for
keeping hosts in environments rather than URLs.

`forecast.yml` is also a genuinely large document - 3,600+ lines, ~80 query
parameters on one operation - which is a fairer test of the spec viewer and the
importer than a 13-path sample.
