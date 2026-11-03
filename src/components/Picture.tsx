// src/components/Picture.tsx
// ============================================================================
// An <img> for a .jpg/.png that also has .avif and .webp versions next to it
// (same path, other extension): browsers pick the lightest format they
// support (AVIF ≈ 40 % of the JPEG here, WebP ≈ 50 %), the others keep the
// original. The <picture> wrapper is `display: contents`, so the <img> lays
// out exactly as it would on its own.
// ============================================================================

import type { ImgHTMLAttributes } from 'react';

const withExt = (src: string, ext: string) => src.replace(/\.(jpe?g|png)$/i, `.${ext}`);

export function Picture({ src, ...img }: ImgHTMLAttributes<HTMLImageElement> & { src: string }) {
  return (
    <picture className="contents">
      <source type="image/avif" srcSet={withExt(src, 'avif')} />
      <source type="image/webp" srcSet={withExt(src, 'webp')} />
      <img src={src} {...img} />
    </picture>
  );
}
