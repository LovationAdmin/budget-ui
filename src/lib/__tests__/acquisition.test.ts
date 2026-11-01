// src/lib/__tests__/acquisition.test.ts
// Where a visit comes from (run with `npm test`): the category sent to the API
// with a template download or a signup (src/lib/acquisition.ts).

import { classifySource } from '../acquisition';

type Fn = () => void;
const tests: Array<{ name: string; fn: Fn }> = [];
const test = (name: string, fn: Fn) => tests.push({ name, fn });
class Fail extends Error {}
function eq(actual: unknown, expected: unknown, msg = '') {
  if (actual !== expected) throw new Fail(`${msg}\n    got      ${String(actual)}\n    expected ${String(expected)}`);
}

test('search engines, by referrer', () => {
  eq(classifySource('https://www.bing.com/', ''), 'bing');
  eq(classifySource('https://cn.bing.com/search?q=x', ''), 'bing');
  eq(classifySource('https://www.google.fr/', ''), 'google');
  eq(classifySource('https://www.google.co.uk/', ''), 'google');
  eq(classifySource('android-app://com.google.android.googlequicksearchbox/', ''), 'google');
  eq(classifySource('https://duckduckgo.com/', ''), 'duckduckgo');
  eq(classifySource('https://www.ecosia.org/', ''), 'ecosia');
  eq(classifySource('https://www.qwant.com/', ''), 'qwant');
  eq(classifySource('https://fr.search.yahoo.com/', ''), 'yahoo');
  eq(classifySource('https://yandex.ru/', ''), 'other_search');
});

test('AI assistants: referrer or their utm_source', () => {
  eq(classifySource('https://chatgpt.com/', ''), 'chatgpt');
  eq(classifySource('', '?utm_source=chatgpt.com'), 'chatgpt');
  eq(classifySource('https://copilot.microsoft.com/', ''), 'copilot', 'Copilot before Bing');
  eq(classifySource('https://www.perplexity.ai/', ''), 'perplexity');
});

test('our campaign links: utm first', () => {
  eq(classifySource('https://www.linkedin.com/', '?utm_source=linkedin&utm_medium=social'), 'social');
  eq(classifySource('', '?utm_source=facebook'), 'social');
  eq(classifySource('', '?utm_source=email&utm_medium=monthly_recap'), 'email');
  eq(classifySource('https://mail.google.com/', '?utm_medium=email'), 'email', 'not Google search');
  eq(classifySource('https://mail.google.com/', ''), 'email', 'Gmail without utm');
  eq(classifySource('https://outlook.live.com/', ''), 'email');
});

test('social networks, other sites, direct', () => {
  eq(classifySource('https://l.facebook.com/', ''), 'social');
  eq(classifySource('https://t.co/abc', ''), 'social');
  eq(classifySource('https://www.forum-famille.fr/topic/1', ''), 'referral');
  eq(classifySource('', ''), 'direct');
  eq(classifySource('https://www.budgetfamille.com/blog', ''), 'direct', 'a page of the site is not a source');
  eq(classifySource('https://budgetfamille.com/', ''), 'direct');
  eq(classifySource('https://www.bing.com/', '?utm_source=newsletter-x'), 'bing', 'unknown utm: the referrer decides');
});

export async function run(): Promise<number> {
  let failures = 0;
  for (const t of tests) {
    try {
      t.fn();
      console.log(`  ok   ${t.name}`);
    } catch (e) {
      failures++;
      console.log(`  FAIL ${t.name}\n    ${(e as Error).message}`);
    }
  }
  console.log(failures ? `\n${failures} failing test(s) out of ${tests.length}` : `\nAll ${tests.length} tests passed`);
  return failures;
}
