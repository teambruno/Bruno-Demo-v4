/**
 * 06-Reusable-Scripts/pokemonAsserts.js
 *
 * A COLLECTION-LOCAL JS module: it lives inside this collection, so any request
 * in this collection can require() it with no configuration and no special
 * sandbox. Requests in OTHER collections cannot reach it.
 *
 * Contrast with /shared-scripts/*.js at the workspace root, which every
 * collection can reach - but only because each opencollection.yml lists that
 * directory under extensions.bruno.scripts.additionalContextRoots, and only
 * under the developer sandbox.
 *
 * Note the arguments. Bruno's runtime globals (res, req, bru, expect, test) are
 * NOT injected into a required module, so anything a helper needs is passed in.
 * Helpers throw plain Errors; the test() around the call turns that into a
 * named failure.
 */

const REQUIRED_FIELDS = ['id', 'name', 'height', 'weight', 'types', 'stats', 'abilities'];

/** Every field this collection's Pokemon requests rely on. */
function assertPokemonShape(body) {
  if (!body || typeof body !== 'object') {
    throw new Error(`Expected a Pokemon object but got ${typeof body}`);
  }
  const missing = REQUIRED_FIELDS.filter((f) => body[f] === undefined || body[f] === null);
  if (missing.length > 0) {
    throw new Error(`Pokemon payload is missing: ${missing.join(', ')}`);
  }
  if (!Array.isArray(body.types) || body.types.length === 0) {
    throw new Error('Pokemon has no types');
  }
}

/** stats[] -> { hp: 35, attack: 55, ... } */
function statMap(body) {
  return Object.fromEntries((body.stats ?? []).map((s) => [s.stat.name, s.base_stat]));
}

/** All six base stats present and within the values the games can produce. */
function assertStatsInRange(body, { min = 1, max = 255 } = {}) {
  const stats = statMap(body);
  const expected = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];

  const missing = expected.filter((name) => stats[name] === undefined);
  if (missing.length > 0) {
    throw new Error(`Missing base stat(s): ${missing.join(', ')}`);
  }

  const outOfRange = expected
    .filter((name) => stats[name] < min || stats[name] > max)
    .map((name) => `${name}=${stats[name]}`);
  if (outOfRange.length > 0) {
    throw new Error(`Base stat(s) outside ${min}-${max}: ${outOfRange.join(', ')}`);
  }
}

function primaryType(body) {
  return body.types[0].type.name;
}

/** One line worth logging on a call. */
function describe(body) {
  const stats = statMap(body);
  const total = Object.values(stats).reduce((a, b) => a + b, 0);
  return `#${body.id} ${body.name} - ${primaryType(body)}, ${body.weight / 10}kg, ${total} total base stats`;
}

module.exports = {
  REQUIRED_FIELDS,
  assertPokemonShape,
  statMap,
  assertStatsInRange,
  primaryType,
  describe
};
