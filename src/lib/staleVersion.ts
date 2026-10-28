// src/lib/staleVersion.ts
// ============================================================================
// A deploy removes the previous version's files. A page still running that
// version — an open tab, or a phone whose offline copy was just replaced by
// the service worker — then fails to load the next screen it opens, and Vite
// fires `vite:preloadError`. Recovery, one step per failure in a row:
//   1. reload: picks up the new version;
//   2. the phone keeps serving the old offline copy: drop it (service worker
//      and its caches — what clearing the site's data does, but the user stays
//      signed in) and reload from the network;
//   3. still failing: a real error, left to the error screen.
// ============================================================================

const KEY = 'stale-version-recovery';
/** Failures further apart than this are separate incidents (e.g. two deploys). */
const STREAK_MS = 30_000;

let reloading = false;

/** True once a reload for a new version has started (the page is about to go). */
export const isReloadingForNewVersion = (): boolean => reloading;

async function dropOfflineCopy(): Promise<void> {
  try {
    const registrations = (await navigator.serviceWorker?.getRegistrations()) ?? [];
    await Promise.all(registrations.map((r) => r.unregister()));
    if ('caches' in window) await Promise.all((await caches.keys()).map((k) => caches.delete(k)));
  } catch {
    /* best effort: reload anyway */
  }
}

export function reloadOnStaleVersion(): void {
  window.addEventListener('vite:preloadError', () => {
    if (reloading) return;
    let attempt: number;
    try {
      const prev = JSON.parse(sessionStorage.getItem(KEY) || 'null') as { at: number; attempt: number } | null;
      attempt = prev && Date.now() - prev.at < STREAK_MS ? prev.attempt + 1 : 1;
      if (attempt > 2) return;
      sessionStorage.setItem(KEY, JSON.stringify({ at: Date.now(), attempt }));
    } catch {
      // No storage to remember the attempts: don't risk a reload loop.
      return;
    }
    reloading = true;
    if (attempt === 1) window.location.reload();
    else void dropOfflineCopy().then(() => window.location.reload());
  });
}
