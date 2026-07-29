import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildPage } from './builder.js';
import { validate } from './validate.js';
import './widgets/heading.js';
import './widgets/text.js';
import './widgets/button.js';
import './widgets/image.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sitePath = (slug) => resolve(ROOT, 'sites', slug, 'page.json');

export async function loadSpec(slug) {
  const mod = await import(pathToFileURL(resolve(ROOT, 'sites', slug, 'site.js')).href);
  return mod.default;
}

export async function buildSiteAsync(slug) {
  const spec = await loadSpec(slug);
  const page = buildPage(spec);
  const path = sitePath(slug);
  writeFileSync(path, JSON.stringify(page, null, 1));
  return { page, path };
}

export function validateSite(slug) {
  const page = JSON.parse(readFileSync(sitePath(slug), 'utf8'));
  return validate(page);
}

async function main() {
  const [cmd, slug] = process.argv.slice(2);
  if (cmd === 'build') { await buildSiteAsync(slug); console.log(`build ok: ${sitePath(slug)}`); }
  else if (cmd === 'validate' || cmd === 'export') {
    const r = validateSite(slug);
    console.log(r.ok ? `válido: ${sitePath(slug)}` : `INVÁLIDO:\n- ${r.errors.join('\n- ')}`);
    process.exit(r.ok ? 0 : 1);
  } else { console.log('uso: cli.js build|validate|export <slug>'); }
}
if (import.meta.url === pathToFileURL(process.argv[1] || '').href) main();
