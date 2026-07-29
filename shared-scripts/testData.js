/**
 * shared-scripts/testData.js
 *
 * Shared test-data factory. Same module, all three collections - no
 * copy/paste of the "generate a unique email" snippet into every request.
 */

function isoDate(date = new Date()) {
  return new Date(date).toISOString();
}

function today() {
  return isoDate().slice(0, 10);
}

/**
 * Correlation ID for tracing one demo run across requests and collections.
 * Pass a prefix so you can tell which collection emitted the call.
 */
function correlationId(prefix = 'bruno') {
  const stamp = Date.now().toString(36);
  const noise = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${stamp}-${noise}`;
}

function uniqueEmail(domain = 'usebruno.test') {
  return `demo+${Date.now()}@${domain}`;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickOne(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('pickOne() needs a non-empty array');
  }
  return items[randomInt(0, items.length - 1)];
}

/**
 * A whole user payload, ready to POST.
 */
function buildUser(overrides = {}) {
  return {
    name: `Demo User ${randomInt(100, 999)}`,
    email: uniqueEmail(),
    role: pickOne(['admin', 'editor', 'viewer']),
    createdAt: isoDate(),
    ...overrides
  };
}

module.exports = {
  isoDate,
  today,
  correlationId,
  uniqueEmail,
  randomInt,
  pickOne,
  buildUser
};
