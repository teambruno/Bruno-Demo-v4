# shared-scripts

JS modules shared by **every** collection in this workspace, wired up with
Bruno's `additionalContextRoots`.
Docs: https://docs.usebruno.com/testing/script/js-file

| Module | What's in it |
| --- | --- |
| `httpAsserts.js` | `assertStatus`, `assertOk`, `assertJson`, `assertResponseUnder`, `assertRequiredFields`, `assertEachHas`, `assertHealthyJsonResponse` |
| `testData.js` | `isoDate`, `today`, `correlationId`, `uniqueEmail`, `randomInt`, `pickOne`, `buildUser` |

## How it's wired

By default a `require()` in a script can only reach files inside its own
collection. `additionalContextRoots` adds extra directories to that sandbox.
Each collection's `opencollection.yml` in this workspace ends with:

```yml
extensions:
  bruno:
    scripts:
      additionalContextRoots:
        - "../../shared-scripts"
```

The path is relative to the collection root, and collections here live at
`collections/<name>/`, hence `../../`.

Then in any pre-request / post-response / tests script:

```js
const { assertHealthyJsonResponse } = require('../../shared-scripts/httpAsserts.js');
const { correlationId } = require('../../shared-scripts/testData.js');
```

## Requirements (both matter)

- **App:** Developer Mode must be on, or the `require()` is blocked by the
  sandbox — Collection Settings → Scripts (or Preferences) → set the JS
  sandbox to **Developer Mode**. In Safe Mode the require fails at runtime.
- **CLI:** Bruno CLI v3.0.0+ with `--sandbox=developer`:

  ```bash
  bru run --env Production --sandbox=developer
  ```

  Leave the flag off and the same request fails with a module-resolution
  error — a useful thing to show on purpose during a demo.

## Writing shared modules

Runtime globals (`res`, `req`, `bru`, `expect`, `test`) are **not** injected
into a required module. Pass what the helper needs as arguments and throw a
plain `Error` on failure — the calling `test()` block turns that into a
failed test:

```js
// shared module
function assertStatus(res, expected) {
  if (res.getStatus() !== expected) throw new Error(`...`);
}

// request tests tab
test('status is 200', () => {
  assertStatus(res, 200);   // res comes from the request scope
});
```

## Where it's used in this workspace

- `01 - Fundamentals/05-Shared-Scripts/01-Shared Asserts.yml`
- `02 - Auth and Scripting/02-Scripting/11-Shared Scripts Across Collections.yml`
- `04 - CLI CI and V4 Features/03-v4 Updates/05-Shared Scripts via additionalContextRoots.yml`

Contrast with `02 - Auth and Scripting/02-Scripting/contractTests.js`, which
is a **collection-local** JS file — no config needed, but only reachable from
inside that one collection.
