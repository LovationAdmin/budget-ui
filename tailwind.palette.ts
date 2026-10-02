// tailwind.palette.ts
// ============================================================================
// Theme-aware Tailwind palette.
//
// The app uses ~1,400 hard-coded palette classes (bg-indigo-50, text-gray-600…).
// Instead of adding a `dark:` twin to each of them, every palette colour goes
// through a CSS variable whose value depends on the ROLE of the utility:
//
//   role        light   dark (shade used)                        why
//   bg / from…  as is   50→950 100→900 200→800 300→700, rest kept  pale tints become
//                                                                   dark tinted surfaces;
//                                                                   solid fills (≥400)
//                                                                   keep their white text
//   text / svg  as is   500,600→400 700→300 800→200 900→100        dark ink becomes light ink
//                       950→50, ≤400 kept                          (light ink stays light)
//   border      as is   50→950 100→900 200→800 300→700             hairlines stay subtle
//
// `.dark` (set by next-themes on <html>) swaps the variables; :root keeps the
// stock Tailwind values, so light mode is pixel-identical.
// ============================================================================

import stock from 'tailwindcss/colors';

// Palettes the app uses (others keep Tailwind's stock, non-adaptive values).
const PALETTES = [
  'slate', 'gray', 'stone', 'red', 'orange', 'amber', 'yellow', 'green', 'emerald',
  'teal', 'sky', 'blue', 'indigo', 'violet', 'purple', 'pink', 'rose',
] as const;
const SHADES = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'] as const;
type Shade = (typeof SHADES)[number];
type Role = 'bg' | 'fg' | 'bd';

const DARK: Record<Role, Partial<Record<Shade, Shade>>> = {
  bg: { '50': '950', '100': '900', '200': '800', '300': '700' },
  fg: { '500': '400', '600': '400', '700': '300', '800': '200', '900': '100', '950': '50' },
  bd: { '50': '950', '100': '900', '200': '800', '300': '700' },
};

const rgb = (hex: string): string => {
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
};
const hexOf = (p: string, s: Shade): string => (stock as unknown as Record<string, Record<string, string>>)[p][s];
const varName = (role: Role, p: string, s: string) => `--pc-${role}-${p}-${s}`;

/** Tailwind colour map for one role: `indigo.50` → `rgb(var(--pc-bg-indigo-50) / <alpha-value>)`. */
export function paletteFor(role: Role): Record<string, Record<string, string>> {
  const out: Record<string, Record<string, string>> = {};
  for (const p of PALETTES) {
    out[p] = {};
    for (const s of SHADES) out[p][s] = `rgb(var(${varName(role, p, s)}) / <alpha-value>)`;
  }
  return out;
}

/** CSS variables for :root (stock values) and .dark (role mapping). */
export function paletteVars(): Record<string, Record<string, string>> {
  const light: Record<string, string> = {};
  const dark: Record<string, string> = {};
  for (const role of ['bg', 'fg', 'bd'] as Role[]) {
    for (const p of PALETTES) {
      for (const s of SHADES) {
        light[varName(role, p, s)] = rgb(hexOf(p, s));
        const mapped = DARK[role][s];
        if (mapped) dark[varName(role, p, s)] = rgb(hexOf(p, mapped));
      }
    }
  }
  return { ':root': light, '.dark': dark };
}
