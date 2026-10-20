import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

// Web fonts never make the page jump: a font that isn't there when the text
// is first drawn (the block period, ~100 ms) is skipped for that page view
// instead of swapped in (font-display: optional). Every page preloads them
// (scripts/prerender.mjs), so they're nearly always on time; then cached.
const fontDisplayOptional = {
  postcssPlugin: 'font-display-optional',
  AtRule: {
    'font-face': (rule) => {
      rule.walkDecls('font-display', (decl) => {
        decl.value = 'optional';
      });
    },
  },
};

export default {
  plugins: [fontDisplayOptional, tailwindcss, autoprefixer],
}
