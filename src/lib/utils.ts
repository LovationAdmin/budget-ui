import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type GraphemeSegmenter = { segment(input: string): Iterable<{ segment: string }> };
type SegmenterCtor = new (locale?: string, options?: { granularity: 'grapheme' }) => GraphemeSegmenter;

/**
 * First visible character of a name, upper-cased: "🌻" for "🌻 Maëlle", "É" for
 * "élise", "?" when empty. `charAt(0)` would cut an emoji in half.
 */
export function initialOf(name: string): string {
  const s = name.trim();
  if (!s) return "?";
  const Segmenter = (Intl as unknown as { Segmenter?: SegmenterCtor }).Segmenter;
  let first: string | undefined;
  if (Segmenter) {
    for (const g of new Segmenter(undefined, { granularity: "grapheme" }).segment(s)) {
      first = g.segment;
      break;
    }
  }
  return (first ?? Array.from(s)[0]).toUpperCase();
}
