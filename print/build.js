/* =====================================================================
   pD-Day 2026 · PRINTOUTS
   ---------------------------------------------------------------------
   Makes the PDFs in print/pdf/:
     Station-Labels-A4.pdf        one bilingual table label per station (A4 landscape)
     Station-N-Guide-EN.pdf       each station's guide on paper, in English
     Station-N-Guide-AR.pdf       … and in Arabic
   The guides are the real station guides (each index.html + ar.js), and the
   labels and the Station 6 guide come from game/content.js, so the printouts
   always say what the screens say. Edit those files, then run:

     node print/build.js            everything
     node print/build.js labels 3   only the labels and Station 3's guides

   It needs Playwright with Chromium (npm install playwright) and the internet
   for the Google Fonts.
   ===================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const http = require('http');

function load(name) {
  try { return require(name); } catch (e) {
    const g = require('child_process').execSync('npm root -g').toString().trim();
    return require(path.join(g, name));
  }
}
const { chromium } = load('playwright');
const { STATIONS } = require('./stations.js');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(__dirname, 'pdf');
const ONLY = process.argv.slice(2);
const wanted = what => !ONLY.length || ONLY.includes(String(what));
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg', '.png': 'image/png', '.json': 'application/json' };

// A small web server for the repository, so the pages load exactly as on GitHub Pages
function serve() {
  const server = http.createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p.endsWith('/')) p += 'index.html';
    const file = path.join(ROOT, path.normalize(p));
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise(r => server.listen(0, '127.0.0.1', () => r(server)));
}

async function ready(page) {
  await page.evaluate(async () => {
    document.querySelectorAll('img[loading="lazy"]').forEach(i => { i.loading = 'eager'; });
    await Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; })));
    await document.fonts.ready;
    await window.PRINT_READY;
  });
}

async function pdf(page, file) {
  await ready(page);
  await page.pdf({ path: path.join(OUT, file), preferCSSPageSize: true, printBackground: true });
  console.log('  ' + file);
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const server = await serve();
  const base = 'http://127.0.0.1:' + server.address().port + '/';
  const browser = await chromium.launch();
  // Reduced motion: the guide animations settle on their final frame
  const ctx = await browser.newContext({ colorScheme: 'light', reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.emulateMedia({ media: 'print', colorScheme: 'light', reducedMotion: 'reduce' });
  let problems = 0;
  page.on('console', m => { if (m.type() === 'error') { problems++; console.warn('  [page] ' + m.text()); } });
  page.on('pageerror', e => { problems++; console.warn('  [page] ' + e.message); });

  if (wanted('labels')) {
    console.log('Station labels');
    await page.goto(base + 'print/labels.html', { waitUntil: 'networkidle' });
    await pdf(page, 'Station-Labels-A4.pdf');
  }

  console.log('Station guides');
  for (const s of STATIONS.filter(s => wanted(s.n))) {
    for (const lang of ['en', 'ar']) {
      const file = `Station-${s.n}-Guide-${lang.toUpperCase()}.pdf`;
      if (s.dir) {
        await page.goto(base + s.dir + '/index.html?lang=' + lang, { waitUntil: 'networkidle' });
        await page.addStyleTag({ path: path.join(__dirname, 'guide-print.css') });
        await page.addScriptTag({ path: path.join(__dirname, 'guide-print.js') });
        await page.evaluate(q => window.PRINT_GUIDE({ qr: q }), base + `print/qr/station-${s.n}-${lang}.svg`);
        const missing = await page.evaluate(() => (window.GL && GL.missing || []).length);
        if (missing) console.warn(`  ${missing} text(s) on the ${lang} page have no Arabic yet`);
      } else {
        // Station 6's own guide is on another site, so its printed guide is made from game/content.js
        await page.goto(base + `print/guide-6.html?lang=${lang}`, { waitUntil: 'networkidle' });
      }
      await pdf(page, file);
    }
  }

  await browser.close();
  server.close();
  if (problems) { console.warn(problems + ' page error(s); check the PDFs'); process.exitCode = 1; }
})();
