// src/lib/staleVersion.ts
// ============================================================================
// A deploy removes the previous version's files. A page still running that
// version — an open tab, or a phone whose offline copy was just replaced by
// the service worker — then fails to load the next screen it opens, and Vite
// fires `vite:preloadError`. Reloading once picks up the new version; a second
// failure within a few seconds is a real error, left to the error screen.
// ============================================================================

const KEY = 'stale-version-reload-at';
const RETRY_WINDOW_MS = 10_000;

let reloading = false;

/** True once a reload for a new version has started (the page is about to go). */
export const isReloadingForNewVersion = (): boolean => reloading;

export function reloadOnStaleVersion(): void {
  window.addEventListener('vite:preloadError', () => {
    if (reloading) return;
    try {
      const last = Number(sessionStorage.getItem(KEY) || 0);
      if (Date.now() - last < RETRY_WINDOW_MS) return;
      sessionStorage.setItem(KEY, String(Date.now()));
    } catch {
      // No storage to remember the attempt: don't risk a reload loop.
      return;
    }
    reloading = true;
    window.location.reload();
  });
}
