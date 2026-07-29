/**
 * shared-scripts/httpAsserts.js
 *
 * Reusable response assertions shared by every collection in this workspace
 * via `extensions.bruno.scripts.additionalContextRoots` in each
 * opencollection.yml.
 *
 * These helpers deliberately throw plain Errors instead of relying on chai's
 * `expect`. Globals injected by the Bruno runtime (res, bru, expect, test)
 * are NOT available inside a required module, so anything the helper needs
 * has to be passed in as an argument.
 */

function assertStatus(res, expected) {
  const actual = res.getStatus();
  if (actual !== expected) {
    throw new Error(`Expected status ${expected} but got ${actual}`);
  }
}

function assertOk(res) {
  const status = res.getStatus();
  if (status < 200 || status > 299) {
    throw new Error(`Expected a 2xx status but got ${status}`);
  }
}

function assertJson(res) {
  const headers = res.getHeaders() || {};
  const contentType = headers['content-type'] || headers['Content-Type'];
  if (!contentType || !String(contentType).includes('application/json')) {
    throw new Error(`Expected application/json but got "${contentType}"`);
  }
}

function assertResponseUnder(res, maxMs) {
  const actual = typeof res.getResponseTime === 'function' ? res.getResponseTime() : res.responseTime;
  if (actual > maxMs) {
    throw new Error(`Response took ${actual}ms, budget is ${maxMs}ms`);
  }
}

function assertRequiredFields(body, fields) {
  if (!body || typeof body !== 'object') {
    throw new Error(`Expected an object body but got ${typeof body}`);
  }
  const missing = fields.filter((field) => body[field] === undefined || body[field] === null);
  if (missing.length > 0) {
    throw new Error(`Missing required field(s): ${missing.join(', ')}`);
  }
}

function assertEachHas(items, fields) {
  if (!Array.isArray(items)) {
    throw new Error(`Expected an array but got ${typeof items}`);
  }
  items.forEach((item, index) => {
    const missing = fields.filter((field) => item[field] === undefined || item[field] === null);
    if (missing.length > 0) {
      throw new Error(`Item at index ${index} is missing: ${missing.join(', ')}`);
    }
  });
}

/**
 * Convenience wrapper: the checks almost every request in this workspace wants.
 */
function assertHealthyJsonResponse(res, { status = 200, maxMs = 2000 } = {}) {
  assertStatus(res, status);
  assertJson(res);
  assertResponseUnder(res, maxMs);
}

module.exports = {
  assertStatus,
  assertOk,
  assertJson,
  assertResponseUnder,
  assertRequiredFields,
  assertEachHas,
  assertHealthyJsonResponse
};
