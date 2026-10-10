// scripts/test-budget-engine.mjs
// Runs the test-suites (budget engine, tools) without adding a test framework:
// esbuild (already installed with Vite) bundles the TypeScript tests, then
// Node runs them. Usage: `npm test` (optionally TZ=Europe/Paris npm test).
import { build } from 'esbuild';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dir = mkdtempSync(join(tmpdir(), 'budget-tests-'));
const SUITES = [
  'src/lib/budget/__tests__/budget.test.ts',
  'src/lib/tools/__tests__/resteAVivre.test.ts',
  'src/lib/tools/__tests__/colocation.test.ts',
  'src/lib/tools/__tests__/mariage.test.ts',
  'src/lib/tools/__tests__/budgetPerso.test.ts',
];

try {
  let failures = 0;
  for (const [i, suite] of SUITES.entries()) {
    const outfile = join(dir, `tests-${i}.mjs`);
    await build({
      entryPoints: [join(root, suite)],
      bundle: true,
      platform: 'node',
      format: 'esm',
      target: 'node18',
      outfile,
      alias: { '@': join(root, 'src') },
      logLevel: 'warning',
    });
    console.log(`\n${suite}`);
    const mod = await import(pathToFileURL(outfile).href);
    failures += await mod.run();
  }
  process.exitCode = failures > 0 ? 1 : 0;
} finally {
  rmSync(dir, { recursive: true, force: true });
}
