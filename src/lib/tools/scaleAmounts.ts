// src/lib/tools/scaleAmounts.ts
// The fictitious examples of the calculators in another currency: every
// amount goes through the currency's scale (ToolFormat.example), while
// counts, sizes and months stay as they are.

/** A copy of `value` with every number passed through `scale`, except those under the keys in `keep`. */
export function scaleAmounts<T>(value: T, scale: (n: number) => number, keep: ReadonlyArray<string> = []): T {
  const walk = (v: unknown): unknown => {
    if (typeof v === 'number') return scale(v);
    if (Array.isArray(v)) return v.map(walk);
    if (v && typeof v === 'object') {
      return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, keep.includes(k) ? x : walk(x)]));
    }
    return v;
  };
  return walk(value) as T;
}
