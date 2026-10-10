// src/components/SocialLinks.tsx
// Links to the official Budget Famille accounts (list in src/seo/site.ts).
import type { ComponentType } from 'react';
import { Facebook, Instagram, Linkedin } from 'lucide-react';
import { SOCIAL_PROFILES, type SocialNetwork } from '@/seo/site';
import { cn } from '@/lib/utils';

function XLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

const ICONS: Record<SocialNetwork, ComponentType<{ className?: string }>> = {
  facebook: Facebook,
  instagram: Instagram,
  linkedin: Linkedin,
  x: XLogo,
};

interface SocialLinksProps {
  /** Show the network name next to the icon (default: icon only) */
  withLabels?: boolean;
  className?: string;
}

export function SocialLinks({ withLabels = false, className }: SocialLinksProps) {
  return (
    <ul className={cn('flex flex-wrap items-center gap-2', className)}>
      {SOCIAL_PROFILES.map(({ network, label, url }) => {
        const Icon = ICONS[network];
        return (
          <li key={network}>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer me"
              aria-label={withLabels ? undefined : `Budget Famille sur ${label}`}
              className={cn(
                'inline-flex items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                withLabels ? 'h-11 gap-2 px-4 text-sm font-medium' : 'h-11 w-11'
              )}
            >
              <Icon className="h-5 w-5" />
              {withLabels && label}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
