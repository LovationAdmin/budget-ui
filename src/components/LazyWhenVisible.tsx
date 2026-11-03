// src/components/LazyWhenVisible.tsx
// ============================================================================
// Renders `children` (typically a React.lazy component) only once its place
// on the page comes near the screen, showing `fallback` until then. Visitors
// who never scroll that far never download its code; those who do find it
// loaded, since it starts `margin` ahead of the screen.
// ============================================================================

import { Suspense, useEffect, useRef, useState, type ReactNode } from 'react';

interface LazyWhenVisibleProps {
  children: ReactNode;
  /** Shown before the section is near the screen and while its code loads. */
  fallback: ReactNode;
  /** How far ahead of the screen loading starts (CSS margin). */
  margin?: string;
}

export function LazyWhenVisible({ children, fallback, margin = '600px' }: LazyWhenVisibleProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(() => typeof IntersectionObserver === 'undefined');

  useEffect(() => {
    const el = ref.current;
    if (near || !el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: margin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [near, margin]);

  return <div ref={ref}>{near ? <Suspense fallback={fallback}>{children}</Suspense> : fallback}</div>;
}
