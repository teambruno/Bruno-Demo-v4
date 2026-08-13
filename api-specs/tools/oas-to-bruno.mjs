#!/usr/bin/env node
/**
 * Generate a Bruno V4 collection from an OpenAPI spec, headlessly.
 *
 * The same conversion the app performs on Import > OpenAPI, done in CI so a
 * collection can be a build artifact of the spec rather than something a human
 * remembers to re-import.
 *
 *   node oas-to-bruno.mjs <spec> <out-dir> [--name "Collection name"]
 *
 * Writes the unbundled layout this workspace uses - opencollection.yml, one
 * folder per OpenAPI tag, one .yml per operation - so `git diff` on the output
 * reads as "what changed in the API" rather than one 80,000-byte blob.
 *
 * Docs: https://docs.usebruno.com/converters/openapi-to-bruno
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import yaml from 'js-yaml';
import { openApiToBruno, brunoToOpenCollection } from '@usebruno/converters';

const argv = process.argv.slice(2);
const flagIndex = argv.indexOf('--name');
const nameOverride = flagIndex === -1 ? null : argv[flagIndex + 1];
const [specPath, outDir] = argv.filter(
  (a, i) => !a.startsWith('--') && i !== flagIndex + 1
);

if (!specPath || !outDir) {
  console.error('usage: node oas-to-bruno.mjs <spec.yaml|spec.json> <out-dir> [--name "Name"]');
  process.exit(1);
}

// Filesystem-safe, but still readable in the sidebar. Bruno itself replaces
// spaces in OpenAPI tag names with underscores; we only strip what a path
// cannot carry.
const safe = (s) =>
  String(s)
    .replace(/[/\\:*?"<>|]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\.+$/, '')
    .slice(0, 120) || 'unnamed';

const writeYaml = (file, doc) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, yaml.dump(doc, { lineWidth: -1, noRefs: true }));
};

/**
 * Put enabled query parameters back into the URL string.
 *
 * The converter records query parameters under `http.params` but leaves the
 * URL bare. The app keeps the URL bar and the params table in sync so it makes
 * no difference there, but `bru run` builds the request from the URL string -
 * so a generated `GET /pet/findByStatus` goes out with no `status` and comes
 * back 400. Path parameters need no equivalent fixup: they arrive in the URL
 * already, as `:petId`, waiting for a value.
 */
function inlineQueryParams(http) {
  if (!http?.url || typeof http.url !== 'string' || http.url.includes('?')) return http;

  const query = (http.params ?? [])
    .filter((p) => p.type === 'query' && !p.disabled && p.value !== '')
    .map((p) => `${p.name}=${p.value}`);

  return query.length ? { ...http, url: `${http.url}?${query.join('&')}` } : http;
}

/** Recursively write an opencollection `items` array as files and folders. */
function writeItems(items, dir) {
  let requests = 0;
  (items ?? []).forEach((item, i) => {
    const name = safe(item.info?.name ?? `item-${i + 1}`);

    if (item.info?.type === 'folder') {
      const folderDir = path.join(dir, name);
      const { items: children, ...folderMeta } = item;
      writeYaml(path.join(folderDir, 'folder.yml'), {
        ...folderMeta,
        info: { ...item.info, seq: item.info.seq ?? i + 1 },
      });
      requests += writeItems(children, folderDir);
      return;
    }

    writeYaml(path.join(dir, `${name}.yml`), {
      ...item,
      info: { ...item.info, seq: item.info?.seq ?? i + 1 },
      ...(item.http ? { http: inlineQueryParams(item.http) } : {}),
    });
    requests += 1;
  });
  return requests;
}

const raw = fs.readFileSync(specPath, 'utf8');
// js-yaml parses JSON too - JSON is a subset of YAML - so .json and .yaml
// specs take the same path here.
const spec = yaml.load(raw);

const collection = brunoToOpenCollection(openApiToBruno(spec));
const { items, config = {}, ...rest } = collection;
const { environments = [], ...restConfig } = config;

fs.mkdirSync(outDir, { recursive: true });

writeYaml(path.join(outDir, 'opencollection.yml'), {
  ...rest,
  info: { ...rest.info, name: nameOverride ?? rest.info?.name },
  config: restConfig,
  // One file per request, the layout the rest of this workspace uses.
  bundled: false,
});

// `--env <name>` resolves against environments/<name>.yml on disk, so the
// servers block has to land as files, not just inside config.environments.
for (const env of environments) {
  writeYaml(path.join(outDir, 'environments', `${safe(env.name)}.yml`), env);
}

const total = writeItems(items, outDir);

console.log(`${specPath} -> ${outDir}`);
console.log(`  ${total} requests, ${environments.length} environment(s)`);
console.log(
  environments.length
    ? `  cd ${outDir} && bru run -r --env "${safe(environments[0].name)}"`
    : // No `servers` block in the spec, so there is no host to run against -
      // see api-specs/open-meteo/README.md.
      `  cd ${outDir} && bru run -r --env-var baseUrl=https://example.com`
);
