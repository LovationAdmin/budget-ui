#!/usr/bin/env node
// Waits until a merged article and its visuals are live on www.budgetfamille.com.
// Vercel answers 200 for any path (SPA fallback to app.html), so « live » means:
// the article page is the prerendered one (its HTML contains its own path) and
// every visual is served as an image, not as the HTML fallback.
// curl, not fetch: Node's fetch ignores HTTPS_PROXY in Claude Code containers.
// Usage: node .claude/skills/social-content/scripts/wait-live.mjs <slug> <media-url>... [--timeout=1200]
import { execFileSync } from 'node:child_process';
import { setTimeout as wait } from 'node:timers/promises';

const args = process.argv.slice(2);
const timeoutArg = args.find((a) => a.startsWith('--timeout='));
const timeoutMs = (timeoutArg ? Number(timeoutArg.split('=')[1]) : 1200) * 1000;
const [slug, ...media] = args.filter((a) => !a.startsWith('--'));
if (!slug) {
  console.error('Usage: wait-live.mjs <slug> <media-url>... [--timeout=seconds]');
  process.exit(2);
}
const page = `https://www.budgetfamille.com/blog/${slug}`;

const curl = (...a) => {
  try {
    return execFileSync('curl', ['-sS', '--max-time', '20', ...a], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch {
    return '';
  }
};

function missing() {
  const out = [];
  if (!curl(`${page}?live=${Date.now()}`).includes(`/blog/${slug}`)) out.push(page);
  for (const url of media) {
    const type = curl('-o', '/dev/null', '-w', '%{http_code} %{content_type}', `${url}?live=${Date.now()}`);
    if (!/^200 image\//.test(type)) out.push(url);
  }
  return out;
}

const deadline = Date.now() + timeoutMs;
for (;;) {
  const left = missing();
  if (left.length === 0) {
    console.log(`live: ${page} and ${media.length} visual(s)`);
    process.exit(0);
  }
  if (Date.now() > deadline) {
    console.error(`not live after ${timeoutMs / 1000}s:\n${left.join('\n')}`);
    process.exit(1);
  }
  await wait(20000);
}
