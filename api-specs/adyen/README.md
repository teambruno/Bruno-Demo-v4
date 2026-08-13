# Adyen Checkout API (vendored)

Third-party contract. **Do not hand-edit** - re-vendor from upstream instead.

| File | Spec version | Operations | Upstream |
|---|---|---:|---|
| `checkout-v71.json` | OpenAPI 3.1.0 (Checkout API v71) | 28 across 26 paths | [Adyen/adyen-openapi `json/CheckoutService-v71.json`](https://github.com/Adyen/adyen-openapi/blob/main/json/CheckoutService-v71.json) |

Vendored 2026-08-13. MIT licensed. 932 KB.

## Why this one: examples on every request

This is the spec to reach for when the question is **"does the import bring
examples with it?"** Measured through `@usebruno/converters` (the same
conversion the app runs on Import → OpenAPI):

| Spec | Requests | Examples | Named? | Request bodies |
|---|---:|---:|---|---:|
| **Adyen Checkout v71** | **28** | **283** | human-readable | **24** |
| Petstore `openapi.yaml` | 19 | 75 | generic (`200 Response`) | 6 |
| Open-Meteo `forecast.yml` | 1 | 2 | generic | 0 |

**28 of 28 requests arrive with examples** - about ten each - and they carry
names a person wrote rather than a status code:

```
Payment session data for Apple Pay
Example response for request 'basic'
Response code 400. Bad request. (Get origin keys)
Response code 401. Unauthorized. (Get origin keys)
```

Each example holds a real response body, not a schema-shaped placeholder:

```json
{ "status": 400, "errorCode": "702",
  "message": "Unexpected input: \", expected: }", "errorType": "validation" }
```

24 of the 28 requests also import with their **request body pre-filled** from
the spec's examples - real payment payloads with amounts, currencies and
merchant accounts - so the requests look ready to send rather than like empty
shells.

## Re-vendor

```bash
curl -sSL https://raw.githubusercontent.com/Adyen/adyen-openapi/main/json/CheckoutService-v71.json \
  | python3 -m json.tool > checkout-v71.json
```

Adyen publishes one file per service and version. Swap `CheckoutService-v71`
for `BalancePlatformService`, `PaymentService`, or a different `-vNN` to demo a
different surface, or to show a customer two versions of the same API
side by side.

## Shape

Seven tags become seven folders on a tag-based import: `Payments`, `Donations`,
`Payment links`, `Modifications`, `Recurring`, `Orders`, `Utility`.

Note `Payment links` - Bruno replaces the space, so it arrives as
`Payment_links`. A real spec doing the thing the docs warn about.

Two security schemes, `ApiKeyAuth` (an `X-API-Key` header) and `BasicAuth`, so
imported requests land with an auth mode set rather than a blank tab.

## It will not run without credentials

`servers` points at `https://checkout-test.adyen.com/v71` - Adyen's **test**
environment, but still one that needs a real merchant account and API key.
Every request will 401 until you supply them.

That is fine for what this spec is here for. Use Petstore when you want
requests that actually execute on a call; use this one to show what a
well-documented enterprise API brings across on import - the examples, the
pre-filled bodies, the folder structure. If a prospect wants to see it send,
import *their* spec instead, which is a better demo anyway.
