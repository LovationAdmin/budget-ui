// scripts/test-budget-engine.mjs
// Runs the budget engine test-suite without adding a test framework:
// esbuild (already installed with Vite) bundles the TypeScript tests, then
// Node runs them. Usage: `npm test` (optionally TZ=Europe/Paris npm test).
import { build } from 'esbuild';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dir = mkdtempSync(join(tmpdir(), 'budget-tests-'));
const outfile = join(dir, 'tests.mjs');

try {
  await build({
    entryPoints: [join(root, 'src/lib/budget/__tests__/budget.test.ts')],
    bundle: true,
    platform: 'node',
    format: 'esm',
    target: 'node18',
    outfile,
    alias: { '@': join(root, 'src') },
    logLevel: 'warning',
  });
  const mod = await import(pathToFileURL(outfile).href);
  const failures = await mod.run();
  process.exitCode = failures > 0 ? 1 : 0;
} finally {
  rmSync(dir, { recursive: true, force: true });
}
