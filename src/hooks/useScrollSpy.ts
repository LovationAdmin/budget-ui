// src/hooks/useScrollSpy.ts
// ============================================================================
// 🎯 useScrollSpy — Active nav item based on visible section
// ============================================================================
// Fixes P0 #1 (partial — for the "single page" fallback).
// IntersectionObserver-based, no scroll listeners, GPU-friendly.
//
// Usage:
//   const active = useScrollSpy(['overview', 'charges', 'projects'], { offset: 80 });
//   <Nav currentSection={active} />
// ============================================================================

import { useEffect, useState, useRef } from 'react';

interface ScrollSpyOptions {
  /** Top offset in pixels (typically the height of a sticky navbar). Default: 80. */
  offset?: number;
  /** Bottom margin in vh — section is considered "active" while in this band. Default: 60. */
  bottomMarginVh?: number;
  /** Default to first id if nothing intersecting. Default: true. */
  fallbackToFirst?: boolean;
}

export function useScrollSpy(
  ids: string[],
  options: ScrollSpyOptions = {}
): string | undefined {
  const { offset = 80, bottomMarginVh = 60, fallbackToFirst = true } = options;
  const [active, setActive] = useState<string | undefined>(
    fallbackToFirst ? ids[0] : undefined
  );

  // Cache visibility ratios so we always pick the most-visible section
  const visibilityRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    if (typeof window === 'undefined' || ids.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = (entry.target as HTMLElement).id;
          if (entry.isIntersecting) {
            visibilityRef.current.set(id, entry.intersectionRatio);
          } else {
            visibilityRef.current.delete(id);
          }
        });

        // Pick the section with the highest visibility ratio
        let topId: string | undefined;
        let topRatio = 0;
        visibilityRef.current.forEach((ratio, id) => {
          if (ratio > topRatio) {
            topRatio = ratio;
            topId = id;
          }
        });

        if (topId) {
          setActive(topId);
        }
      },
      {
        rootMargin: `-${offset}px 0px -${bottomMarginVh}% 0px`,
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
      }
    );

    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
      observer.disconnect();
      visibilityRef.current.clear();
    };
  }, [ids, offset, bottomMarginVh]);

  return active;
}
