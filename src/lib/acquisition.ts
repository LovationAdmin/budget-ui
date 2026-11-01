// src/lib/acquisition.ts
// ============================================================================
// Where visitors come from, counted without identifying anyone. On the first
// visit, the site notes in the browser a category of the referring site
// ("bing", "google", "chatgpt"…) and the landing page, for 30 days. When the
// visitor downloads a free template or creates an account, that category is
// sent to the API, which only counts it (budget-api handlers/acquisition.go):
// no account, IP or identifier is stored with it. The admin page shows what
// each source brings. Production site only, like Google Analytics.
// ============================================================================

export type Source =
  | 'google' | 'bing' | 'chatgpt' | 'copilot' | 'perplexity' | 'duckduckgo' | 'ecosia' | 'qwant' | 'yahoo'
  | 'other_search' | 'social' | 'email' | 'referral' | 'direct';

export interface FirstTouch {
  source: Source;
  landing: string;
}

const KEY = 'bf_first_touch';
const TTL_MS = 30 * 24 * 3600 * 1000;
// Guarded: import.meta.env only exists in the Vite build, not in the tests.
const API_URL: string = (import.meta as { env?: Record<string, string> }).env?.VITE_API_URL || 'http://localhost:8080/api/v1';

/** Search engines, AI assistants and social networks, by host (suffix match). */
const HOSTS: Array<[RegExp, Source]> = [
  // Webmail first: mail.google.com is Gmail, not Google search.
  [/^(mail|webmail)\.|(^|\.)outlook\.(live|office|office365)\.com$|^com\.google\.android\.gm$/, 'email'],
  [/(^|\.)google\.[a-z.]+$|^com\.google\.android/, 'google'],
  [/^copilot\.microsoft\.com$|(^|\.)copilot\.com$/, 'copilot'],
  [/(^|\.)bing\.com$/, 'bing'],
  [/(^|\.)chatgpt\.com$|(^|\.)openai\.com$/, 'chatgpt'],
  [/(^|\.)perplexity\.ai$/, 'perplexity'],
  [/(^|\.)duckduckgo\.com$/, 'duckduckgo'],
  [/(^|\.)ecosia\.org$/, 'ecosia'],
  [/(^|\.)qwant\.com$/, 'qwant'],
  [/(^|\.)yahoo\.[a-z.]+$/, 'yahoo'],
  [/(^|\.)(yandex\.[a-z.]+|baidu\.com|naver\.com|seznam\.cz|search\.brave\.com|startpage\.com|lilo\.org)$/, 'other_search'],
  [/(^|\.)(facebook\.com|fb\.com|instagram\.com|linkedin\.com|lnkd\.in|t\.co|x\.com|twitter\.com|pinterest\.[a-z.]+|reddit\.com|youtube\.com|tiktok\.com|whatsapp\.com|threads\.net)$/, 'social'],
];

const OWN_SITE = /(^|\.)budgetfamille\.com$/;

function fromHost(host: string): Source | null {
  for (const [re, source] of HOSTS) if (re.test(host)) return source;
  return null;
}

/**
 * The category of a visit, from its utm_source / utm_medium (our campaign
 * links, ChatGPT's « utm_source=chatgpt.com ») or else its referrer.
 */
export function classifySource(referrer: string, search: string): Source {
  const params = new URLSearchParams(search);
  const utm = (params.get('utm_source') ?? '').toLowerCase();
  const medium = (params.get('utm_medium') ?? '').toLowerCase();
  if (utm === 'email' || medium === 'email' || medium === 'monthly_recap') return 'email';
  if (utm) {
    const byName = fromHost(utm.includes('.') ? utm : `${utm}.com`);
    if (byName) return byName;
    if (/^(facebook|instagram|linkedin|x|twitter|pinterest|reddit|youtube|tiktok|whatsapp|threads)$/.test(utm)) return 'social';
  }
  let host = '';
  try {
    host = new URL(referrer).hostname.toLowerCase();
  } catch {
    // An app referrer (android-app://com.google.android.googlequicksearchbox).
    host = referrer.replace(/^android-app:\/\//, '').split('/')[0].toLowerCase();
  }
  if (!host || OWN_SITE.test(host)) return 'direct';
  return fromHost(host) ?? 'referral';
}

function enabled(): boolean {
  return typeof window !== 'undefined' && OWN_SITE.test(window.location.hostname);
}

function read(): (FirstTouch & { at: number }) | null {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? 'null');
    return v && typeof v.source === 'string' && Date.now() - v.at < TTL_MS ? v : null;
  } catch {
    return null;
  }
}

/** Notes the first visit's source and landing page (once per 30 days). */
export function rememberFirstTouch(): void {
  if (!enabled() || read()) return;
  const touch = {
    source: classifySource(document.referrer, window.location.search),
    landing: window.location.pathname,
    at: Date.now(),
  };
  try {
    localStorage.setItem(KEY, JSON.stringify(touch));
  } catch {
    // Storage blocked (private mode): nothing is counted, nothing breaks.
  }
}

/** The first visit's source and landing page, sent with a signup. */
export function firstTouch(): FirstTouch | undefined {
  if (!enabled()) return undefined;
  const v = read();
  return v ? { source: v.source, landing: v.landing } : undefined;
}

/** Counts a free-template download, without waiting for an answer. */
export function countDownload(file: string): void {
  if (!enabled()) return;
  const body = JSON.stringify({ file, source: read()?.source ?? 'direct' });
  const url = `${API_URL}/track/download`;
  try {
    // text/plain: a "simple" request, no CORS preflight; it survives the page
    // changing while the file opens.
    if (navigator.sendBeacon?.(url, new Blob([body], { type: 'text/plain' }))) return;
    void fetch(url, { method: 'POST', body, keepalive: true, mode: 'no-cors' }).catch(() => {});
  } catch {
    // Counting is optional.
  }
}

/** Every link to a free template, wherever it is (page, article, footer). */
export function listenForDownloads(): void {
  if (!enabled()) return;
  document.addEventListener('click', (e) => {
    const a = (e.target as Element | null)?.closest?.('a[href*="/telechargements/"]');
    if (!a) return;
    const path = new URL((a as HTMLAnchorElement).href, window.location.href).pathname;
    countDownload(path.slice(path.lastIndexOf('/') + 1));
  }, { capture: true });
}
