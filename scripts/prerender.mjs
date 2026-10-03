// scripts/prerender.mjs
// Runs after `vite build`: writes one HTML file per public page (from
// src/seo/prerender.tsx) and the sitemap. dist/index.html becomes the home
// page; dist/app.html stays the neutral shell for every other route.
import { build } from 'esbuild';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const SITE = 'https://www.budgetfamille.com';
const tmp = mkdtempSync(join(tmpdir(), 'prerender-'));

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const abs = (p) => (p === '/' ? `${SITE}/` : `${SITE}${p}`);

function setTag(html, re, tag) {
  if (!re.test(html)) throw new Error(`prerender: tag not found ${re}`);
  return html.replace(re, tag);
}

function render(template, page) {
  const title = page.title.includes('Budget Famille') ? page.title : `${page.title} – Budget Famille`;
  let html = template;
  html = setTag(html, /<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`);
  html = setTag(html, /<meta name="description"[^>]*>/, `<meta name="description" content="${esc(page.description)}" />`);
  html = html.replace(/\s*<meta name="keywords"[^>]*>/, '');
  html = setTag(html, /<meta name="robots"[^>]*>/, `<meta name="robots" content="${page.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large, max-snippet:-1'}" />`);
  html = setTag(html, /<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${abs(page.canonical)}" />`);
  html = setTag(html, /<meta property="og:type"[^>]*>/, `<meta property="og:type" content="${page.type}" />`);
  html = setTag(html, /<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${abs(page.canonical)}" />`);
  html = setTag(html, /<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${esc(title)}" />`);
  html = setTag(html, /<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${esc(page.description)}" />`);
  html = setTag(html, /<meta property="og:image"[^>]*>/, `<meta property="og:image" content="${SITE}/og-image.png" />`);
  html = setTag(html, /<meta name="twitter:url"[^>]*>/, `<meta name="twitter:url" content="${abs(page.canonical)}" />`);
  html = setTag(html, /<meta name="twitter:title"[^>]*>/, `<meta name="twitter:title" content="${esc(title)}" />`);
  html = setTag(html, /<meta name="twitter:description"[^>]*>/, `<meta name="twitter:description" content="${esc(page.description)}" />`);
  html = setTag(html, /<meta name="twitter:image"[^>]*>/, `<meta name="twitter:image" content="${SITE}/og-image.png" />`);
  const ld = page.jsonLd.map((o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`).join('\n  ');
  html = html.replace('</head>', `  ${ld}\n</head>`);
  html = setTag(html, /<div id="root"><\/div>/, `<div id="root">${page.body}</div>`);
  return html;
}

try {
  const outfile = join(tmp, 'prerender.mjs');
  await build({
    entryPoints: [join(root, 'src/seo/prerender.tsx')],
    bundle: true,
    platform: 'node',
    format: 'esm',
    target: 'node18',
    jsx: 'automatic',
    outfile,
    alias: { '@': join(root, 'src') },
    loader: { '.png': 'empty', '.jpg': 'empty', '.svg': 'empty', '.css': 'empty' },
    logLevel: 'warning',
    // react-dom/server requires Node built-ins (stream…) from an ESM bundle.
    banner: { js: "import { createRequire as __cr } from 'module'; const require = __cr(import.meta.url);" },
    define: { 'process.env.NODE_ENV': '"production"' },
  });
  const { buildPages } = await import(pathToFileURL(outfile).href);
  const template = readFileSync(join(dist, 'index.html'), 'utf8');
  const pages = buildPages();
  for (const page of pages) {
    const file = page.path === '/' ? join(dist, 'index.html') : join(dist, page.path.slice(1), 'index.html');
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, render(template, page));
  }
  const today = new Date().toISOString().slice(0, 10);
  const urls = pages
    .filter((p) => p.sitemap)
    .map((p) => `  <url>\n    <loc>${abs(p.path)}</loc>\n    <lastmod>${p.sitemap.lastmod ?? today}</lastmod>\n    <changefreq>${p.sitemap.changefreq}</changefreq>\n    <priority>${p.sitemap.priority}</priority>\n  </url>`);
  writeFileSync(join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`);
  console.log(`prerender: ${pages.length} pages, ${urls.length} sitemap URLs`);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
