// src/seo/identity.ts
// The site's identity online: its canonical host, name, default share image
// and official social accounts (footer, Help page, Organization sameAs).
// Apart from the pages' metadata (src/seo/site.ts) so the footer and the head
// updates (src/seo/head.ts) don't download every page's texts.

/** Canonical host: the bare domain redirects here. */
export const SITE = 'https://www.budgetfamille.com';
export const SITE_NAME = 'Budget Famille';
export const DEFAULT_IMAGE = `${SITE}/og-image.png`;

export const absolute = (path: string) => (path.startsWith('http') ? path : `${SITE}${path === '/' ? '/' : path}`);

export type SocialNetwork = 'facebook' | 'instagram' | 'linkedin' | 'x';

export const SOCIAL_PROFILES: ReadonlyArray<{ network: SocialNetwork; label: string; url: string }> = [
  { network: 'facebook', label: 'Facebook', url: 'https://www.facebook.com/1459022953950331' },
  { network: 'instagram', label: 'Instagram', url: 'https://www.instagram.com/budgetfamille_lovation/' },
  { network: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/in/lovation-corp-238b99442/' },
  { network: 'x', label: 'X', url: 'https://x.com/LovationLibasse' },
];
