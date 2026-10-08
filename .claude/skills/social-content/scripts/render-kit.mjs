#!/usr/bin/env node
// Builds the « kit à copier » of a week: one mobile-first page with every post,
// its visual and one-tap buttons (copy, share the image to the app, open X with
// the text prefilled), for the networks the team publishes by hand.
// Served by the site next to the visuals, so the page and the images share an
// origin (the share sheet needs to fetch the image) and the link works from the
// end-of-routine notification. noindex: it is a tool, not content.
// Usage: node .claude/skills/social-content/scripts/render-kit.mjs docs/social/posts/<week>-<slug>.md [out.html]
//        (default out: public/social/<slug>/kit.html)
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const [postsFile, outArg] = process.argv.slice(2);
if (!postsFile) {
  console.error('Usage: render-kit.mjs <posts.md> [out.html]');
  process.exit(2);
}

// maxTags: Instagram refuses more than 5 hashtags since late 2025; the others
// follow the skill's rule (as many relevant hashtags as the network rewards).
const NETWORKS = {
  linkedin: { label: 'LinkedIn', limit: 3000, maxTags: 5 },
  facebook: { label: 'Facebook', limit: 63206, maxTags: 5 },
  instagram: { label: 'Instagram', limit: 2200, maxTags: 5 },
  twitter: { label: 'X', limit: 280, maxTags: 3 },
};
const DAYS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
const SITE = 'https://www.budgetfamille.com';

// ---- posts file -----------------------------------------------------------
const src = readFileSync(postsFile, 'utf8').replace(/\r\n/g, '\n');
const front = Object.fromEntries(
  (src.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '')
    .split('\n')
    .map((l) => l.match(/^(\w+):\s*(.*)$/))
    .filter(Boolean)
    .map((m) => [m[1], m[2].trim()]),
);
const { slug, week } = front;
if (!slug || !/^\d{4}-\d{2}-\d{2}$/.test(week ?? '')) {
  console.error(`${postsFile}: front matter needs slug and week (AAAA-MM-JJ)`);
  process.exit(1);
}

const posts = [];
let post = null;
let net = null;
for (const line of src.slice(src.indexOf('\n---', 3) + 4).split('\n')) {
  const h2 = line.match(/^## (.+)$/);
  const h3 = line.match(/^### (\w+)\s*$/);
  if (h2) {
    const [id, kind, day] = h2[1].split('·').map((s) => s.trim());
    post = { id, kind, day: day?.toLowerCase(), meta: {}, texts: {} };
    posts.push(post);
    net = null;
  } else if (h3 && post) {
    net = h3[1].toLowerCase();
    post.texts[net] = [];
  } else if (post && net) {
    post.texts[net].push(line);
  } else if (post) {
    const m = line.match(/^(media|alt|link):\s*(.+)$/);
    if (m) post.meta[m[1]] = m[2].trim();
  }
}
for (const p of posts) {
  for (const n of Object.keys(p.texts)) p.texts[n] = p.texts[n].join('\n').trim();
}
const unknown = posts.flatMap((p) => Object.keys(p.texts)).filter((n) => !NETWORKS[n]);
if (posts.length === 0 || unknown.length) {
  console.error(`${postsFile}: ${posts.length ? `unknown network(s): ${unknown.join(', ')}` : 'no "## A · …" section'}`);
  process.exit(1);
}

// ---- config: which networks Metricool publishes, default hours ------------
const config = readFileSync(path.join(root, 'docs/social/config.md'), 'utf8');
const auto = new Set(
  (config.match(/^- \*\*metricool\*\* *: *(.+)$/m)?.[1] ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase().replace(/^x$/, 'twitter').replace(/\s.*$/, ''))
    .filter((s) => NETWORKS[s]),
);
const linkedinUrl = config.match(/^- \*\*page LinkedIn\*\* *: *(https:\/\/\S+)/m)?.[1] ?? 'https://www.linkedin.com/feed/';
const hours = {};
for (const m of config.matchAll(/^\| *(LinkedIn|Facebook|Instagram|X) *\|(.+)\|\s*$/gm)) {
  const key = m[1] === 'X' ? 'twitter' : m[1].toLowerCase();
  hours[key] = m[2].split('|').map((c) => c.trim().match(/^\d{1,2}:\d{2}$/)?.[0] ?? null);
}

// ---- article title (src/data/blog-articles.tsx) ---------------------------
let title = slug;
const articles = readFileSync(path.join(root, 'src/data/blog-articles.tsx'), 'utf8').split('\n');
const at = articles.findIndex((l) => l.includes(`slug: "${slug}"`) || l.includes(`slug: '${slug}'`));
for (let i = at - 1; at > 0 && i >= at - 4; i--) {
  const m = articles[i].match(/^\s*title:\s*("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/);
  if (m) {
    title = m[1].startsWith('"') ? JSON.parse(m[1]) : m[1].slice(1, -1).replace(/\\'/g, "'");
    break;
  }
}

// ---- helpers --------------------------------------------------------------
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const monday = new Date(`${week}T12:00:00Z`);
const dateOf = (day) => {
  const i = DAYS.indexOf(day);
  if (i < 0) return null;
  const d = new Date(monday);
  d.setUTCDate(d.getUTCDate() + i);
  return d;
};
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const fmt = (d, opts) => d.toLocaleDateString('fr-FR', { timeZone: 'UTC', ...opts });
// Same-origin path, so the page can fetch the image in production and in the Vercel preview.
const local = (url) => (url?.startsWith(SITE) ? url.slice(SITE.length) : url);
// X counts every link as 23 characters.
const xLength = (t) => [...t.replace(/https?:\/\/\S+/g, 'x'.repeat(23))].length;
const count = (n, t) => (n === 'twitter' ? xLength(t) : [...t].length);
const hashtags = (t) => (t.replace(/https?:\/\/\S+/g, '').match(/(^|\s)#[\p{L}\p{N}_]+/gu) ?? []).length;

const manualTotal = posts.reduce((s, p) => s + Object.keys(p.texts).filter((n) => !auto.has(n)).length, 0);

function card(p, pi, n) {
  const text = p.texts[n];
  const { label, limit, maxTags } = NETWORKS[n];
  const len = count(n, text);
  const tags = hashtags(text);
  const over = len > limit;
  const id = `${p.id}-${n}`;
  const hour = hours[n]?.[pi];
  const when = dateOf(p.day);
  const whenLabel = when ? `${fmt(when, { weekday: 'long', day: 'numeric', month: 'short' })}${hour && !auto.has(n) ? ` · vers ${hour.replace(/^0?(\d+):(\d+)$/, (_, h, m) => `${h} h ${m === '00' ? '' : m}`).trim()}` : ''}` : '';
  const actions = [];
  if (n === 'twitter') {
    actions.push(`<a class="btn primary" href="https://x.com/intent/tweet?text=${encodeURIComponent(text)}" target="_blank" rel="noopener" data-copy>Ouvrir X avec le texte</a>`);
  } else if (n === 'linkedin') {
    actions.push(`<a class="btn primary" href="${esc(linkedinUrl)}" target="_blank" rel="noopener" data-copy>Copier et ouvrir LinkedIn</a>`);
  }
  actions.push(`<button type="button" class="btn${actions.length ? '' : ' primary'}" data-share hidden>Copier le texte et partager l'image</button>`);
  actions.push(`<button type="button" class="btn" data-copy-only>Copier le texte</button>`);
  const body = `
      <p class="text" data-text>${esc(text)}</p>
      <p class="count${over || tags > maxTags ? ' over' : ''}">${len.toLocaleString('fr-FR')} / ${limit.toLocaleString('fr-FR')} caractères${n === 'twitter' ? ' (un lien compte 23)' : ''} · ${tags} / ${maxTags} hashtags${n === 'instagram' ? ' · le lien de la bio mène au blog' : ''}</p>
      <div class="actions">${actions.join('')}</div>`;
  if (auto.has(n)) {
    return `
    <details class="card auto" data-network="${n}">
      <summary><span class="net">${label}</span><span class="badge ok">Programmé dans Metricool</span><span class="when">Rien à faire · texte de secours</span></summary>${body}
    </details>`;
  }
  return `
    <article class="card" data-network="${n}" data-id="${esc(id)}">
      <header><span class="net">${label}</span><span class="badge todo">À publier</span><span class="when">${esc(whenLabel)}</span></header>${body}
      <label class="done"><input type="checkbox" data-done> Publié</label>
    </article>`;
}

const sections = posts.map((p, pi) => {
  const when = dateOf(p.day);
  const order = Object.keys(NETWORKS).filter((n) => p.texts[n]).sort((a, b) => auto.has(a) - auto.has(b));
  const media = local(p.meta.media);
  const file = media?.split('/').pop();
  return `
  <section class="post" data-media="${esc(media ?? '')}">
    <h2><span class="tag">${esc(p.id)}</span> ${esc(cap(p.kind ?? ''))}${when ? ` · ${esc(fmt(when, { weekday: 'long', day: 'numeric', month: 'long' }))}` : ''}</h2>
    ${media ? `<figure>
      <img src="${esc(media)}" alt="${esc(p.meta.alt ?? '')}" width="1080" height="1350" loading="lazy">
      <figcaption><a class="btn" href="${esc(media)}" download="${esc(`${slug}-${file}`)}">Enregistrer l'image</a>${p.meta.link ? ` <a class="btn ghost" href="${esc(p.meta.link)}" target="_blank" rel="noopener">Voir la page liée</a>` : ''}</figcaption>
    </figure>` : ''}
    ${order.map((n) => card(p, pi, n)).join('')}
  </section>`;
});

const html = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Kit réseaux · ${esc(title)}</title>
<style>
  :root { --bg:#f6f7f9; --surface:#fff; --ink:#0f1720; --muted:#5b6675; --line:#e2e6ec; --primary:hsl(200 75% 38%); --on-primary:#fff; --ok:#15803d; --ok-bg:#e7f6ec; --todo:#9a5b00; --todo-bg:#fff4e0; --warn:#b91c1c; }
  @media (prefers-color-scheme: dark) { :root { --bg:#0e141b; --surface:#16202a; --ink:#e8edf2; --muted:#9aa7b4; --line:#26323e; --primary:hsl(200 75% 55%); --on-primary:#0b1218; --ok:#5dd28a; --ok-bg:#143021; --todo:#f0b45a; --todo-bg:#33260f; --warn:#f87171; } }
  * { box-sizing: border-box; }
  body { margin:0; background:var(--bg); color:var(--ink); font:16px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif; }
  main { max-width:680px; margin:0 auto; padding:16px 16px 96px; }
  .top { padding:8px 0 0; }
  .eyebrow { margin:0; color:var(--muted); font-size:14px; }
  h1 { margin:2px 0 6px; font-size:22px; line-height:1.25; }
  .progress { position:sticky; top:0; z-index:2; display:flex; align-items:center; gap:10px; margin:0 -16px; padding:10px 16px; background:var(--bg); border-bottom:1px solid var(--line); font-size:14px; color:var(--muted); }
  .bar { flex:1; height:6px; border-radius:3px; background:var(--line); overflow:hidden; }
  .bar i { display:block; height:100%; width:0; background:var(--ok); transition:width .2s; }
  .how { margin:14px 0 0; padding:12px 14px; border-radius:10px; background:var(--surface); border:1px solid var(--line); font-size:14px; color:var(--muted); }
  .how ol { margin:4px 0 0; padding-left:20px; }
  .post { margin-top:28px; }
  h2 { font-size:18px; margin:0 0 10px; display:flex; align-items:center; gap:8px; }
  .tag { display:inline-grid; place-items:center; min-width:28px; height:28px; border-radius:8px; background:var(--primary); color:var(--on-primary); font-size:14px; }
  figure { margin:0 0 12px; }
  figure img { display:block; width:100%; max-width:320px; height:auto; border-radius:12px; border:1px solid var(--line); }
  figcaption { margin-top:8px; display:flex; flex-wrap:wrap; gap:8px; }
  .card { background:var(--surface); border:1px solid var(--line); border-radius:12px; padding:14px; margin-top:10px; }
  .card header, .card summary { display:flex; flex-wrap:wrap; align-items:center; gap:6px 10px; }
  .card summary { cursor:pointer; list-style:none; }
  .card summary::-webkit-details-marker { display:none; }
  .card.auto summary .when::after { content:" ▾"; }
  .card.auto[open] summary .when::after { content:" ▴"; }
  .net { font-weight:700; }
  .badge { font-size:12px; font-weight:600; padding:2px 8px; border-radius:999px; }
  .badge.ok { color:var(--ok); background:var(--ok-bg); }
  .badge.todo { color:var(--todo); background:var(--todo-bg); }
  .card.is-done .badge.todo { color:var(--ok); background:var(--ok-bg); }
  .when { color:var(--muted); font-size:14px; }
  .text { white-space:pre-wrap; overflow-wrap:anywhere; margin:12px 0 4px; padding:12px; border-radius:8px; background:var(--bg); font-size:15px; }
  .count { margin:0 0 10px; font-size:13px; color:var(--muted); }
  .count.over { color:var(--warn); font-weight:600; }
  .actions { display:flex; flex-wrap:wrap; gap:8px; }
  .btn { display:inline-flex; align-items:center; justify-content:center; min-height:44px; padding:0 16px; border-radius:10px; border:1px solid var(--line); background:var(--surface); color:var(--ink); font-family:inherit; font-size:15px; font-weight:600; line-height:1.2; text-decoration:none; cursor:pointer; }
  .btn.primary { background:var(--primary); border-color:var(--primary); color:var(--on-primary); }
  .btn.ghost { border-color:transparent; color:var(--primary); padding:0 8px; }
  .btn:focus-visible, summary:focus-visible, input:focus-visible { outline:3px solid var(--primary); outline-offset:2px; }
  .btn[hidden] { display:none; }
  .done { display:flex; align-items:center; gap:10px; margin-top:12px; min-height:44px; font-weight:600; cursor:pointer; }
  .done input { width:22px; height:22px; accent-color:var(--ok); }
  .card.is-done { border-color:var(--ok); }
  .card.is-done .text { opacity:.6; }
  .toast { position:fixed; left:50%; bottom:20px; transform:translate(-50%,20px); opacity:0; padding:10px 16px; border-radius:10px; background:var(--ink); color:var(--bg); font-weight:600; transition:all .2s; pointer-events:none; max-width:calc(100% - 32px); text-align:center; }
  .toast.show { opacity:1; transform:translate(-50%,0); }
</style>
</head>
<body>
<main>
  <div class="top">
    <p class="eyebrow">Kit réseaux sociaux · semaine du ${esc(fmt(monday, { day: 'numeric', month: 'long' }))}</p>
    <h1>${esc(title)}</h1>
  </div>
  ${manualTotal ? `<div class="progress"><span class="bar"><i data-bar></i></span><span data-progress>0 / ${manualTotal} publiés</span></div>` : ''}
  <div class="how">
    <strong>En 30 secondes par post</strong>
    <ol>
      <li>Touchez le bouton bleu : le texte est copié (sur téléphone, l'appli s'ouvre aussi avec le visuel).</li>
      <li>Collez le texte s'il n'est pas déjà là.</li>
      <li>Publiez, puis cochez « Publié ».</li>
    </ol>
    ${auto.size ? `<p style="margin:8px 0 0">${[...auto].map((n) => NETWORKS[n].label).join(' et ')} : programmés automatiquement dans Metricool, rien à faire.</p>` : ''}
  </div>
  ${sections.join('')}
  <p class="eyebrow" style="margin-top:32px">Article : <a href="/blog/${esc(slug)}" target="_blank" rel="noopener">budgetfamille.com/blog/${esc(slug)}</a></p>
</main>
<div class="toast" role="status" aria-live="polite" data-toast></div>
<script>
(() => {
  const slug = ${JSON.stringify(slug)};
  const toastEl = document.querySelector('[data-toast]');
  let timer;
  const toast = (msg) => {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(timer);
    timer = setTimeout(() => toastEl.classList.remove('show'), 2200);
  };
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { v ? localStorage.setItem(k, '1') : localStorage.removeItem(k); } catch {} },
  };
  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const ta = Object.assign(document.createElement('textarea'), { value: text });
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;opacity:0';
      document.body.append(ta);
      ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      return ok;
    }
  }
  const textOf = (el) => el.closest('.card').querySelector('[data-text]').textContent;

  document.querySelectorAll('[data-copy-only]').forEach((b) => b.addEventListener('click', async () => {
    toast(await copy(textOf(b)) ? 'Texte copié' : 'Copie impossible : sélectionnez le texte');
  }));
  document.querySelectorAll('[data-copy]').forEach((a) => a.addEventListener('click', () => {
    copy(textOf(a)).then((ok) => ok && toast('Texte copié : collez-le dans la publication'));
  }));

  // Share sheet with the image (phones): the image is fetched up front so the
  // tap goes straight to navigator.share, inside the user gesture.
  document.querySelectorAll('.post').forEach(async (section) => {
    const url = section.dataset.media;
    if (!url || !navigator.canShare) return;
    try {
      const blob = await (await fetch(url)).blob();
      const file = new File([blob], url.split('/').pop(), { type: blob.type || 'image/png' });
      if (!navigator.canShare({ files: [file] })) return;
      section.querySelectorAll('[data-share]').forEach((b) => {
        b.hidden = false;
        // Phones: the share sheet (image + text, straight into the app) is the main action.
        b.parentElement.querySelectorAll('.btn.primary').forEach((x) => x.classList.remove('primary'));
        b.classList.add('primary');
        b.parentElement.prepend(b);
        b.addEventListener('click', () => {
          const text = textOf(b);
          copy(text);
          navigator.share({ files: [file], text }).then(
            () => toast('Partagé : collez le texte s\\'il manque'),
            (e) => e.name !== 'AbortError' && toast('Partage impossible : enregistrez l\\'image'),
          );
        });
      });
    } catch {}
  });

  const cards = [...document.querySelectorAll('article.card[data-id]')];
  const bar = document.querySelector('[data-bar]');
  const label = document.querySelector('[data-progress]');
  const refresh = () => {
    const done = cards.filter((c) => c.classList.contains('is-done')).length;
    if (bar) bar.style.width = (cards.length ? (100 * done) / cards.length : 0) + '%';
    if (label) label.textContent = done + ' / ' + cards.length + ' publiés';
  };
  cards.forEach((c) => {
    const key = 'kit:' + slug + ':' + c.dataset.id;
    const box = c.querySelector('[data-done]');
    box.checked = !!store.get(key);
    c.classList.toggle('is-done', box.checked);
    box.addEventListener('change', () => {
      store.set(key, box.checked);
      c.classList.toggle('is-done', box.checked);
      refresh();
      if (box.checked && cards.every((x) => x.classList.contains('is-done'))) toast('Tout est publié, merci !');
    });
  });
  refresh();
})();
</script>
</body>
</html>
`;

const out = path.resolve(outArg ?? path.join(root, 'public/social', slug, 'kit.html'));
mkdirSync(path.dirname(out), { recursive: true });
writeFileSync(out, html);
const over = posts.flatMap((p) => Object.entries(p.texts).filter(([n, t]) => count(n, t) > NETWORKS[n].limit).map(([n]) => `${p.id}/${n}`));
const tooManyTags = posts.flatMap((p) => Object.entries(p.texts).filter(([n, t]) => hashtags(t) > NETWORKS[n].maxTags).map(([n, t]) => `${p.id}/${n} (${hashtags(t)} > ${NETWORKS[n].maxTags})`));
console.log(`${path.relative(process.cwd(), out)}: ${posts.length} post(s), ${manualTotal} à publier à la main${auto.size ? `, ${[...auto].join(' + ')} via Metricool` : ''}`);
if (over.length || tooManyTags.length) {
  if (over.length) console.error(`trop long : ${over.join(', ')}`);
  if (tooManyTags.length) console.error(`trop de hashtags : ${tooManyTags.join(', ')}`);
  process.exit(1);
}
