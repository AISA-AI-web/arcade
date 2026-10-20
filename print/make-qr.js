/* Makes the QR codes in print/qr/ that the station labels and printed guides use.
   Run it again only if the web addresses change:
     npm install --no-save qrcode && node print/make-qr.js
   The addresses are in print/stations.js. */
'use strict';
const fs = require('fs');
const path = require('path');
const QR = require('qrcode');
const { SITE, STATIONS } = require('./stations.js');

const out = path.join(__dirname, 'qr');
const svgOpts = { type: 'svg', errorCorrectionLevel: 'M', margin: 0, color: { dark: '#21076C', light: '#FFFFFF' } };

(async () => {
  const jobs = [['game', SITE]];
  for (const s of STATIONS) {
    for (const lang of ['en', 'ar']) jobs.push([`station-${s.n}-${lang}`, s.url(lang)]);
  }
  for (const [name, url] of jobs) {
    fs.writeFileSync(path.join(out, name + '.svg'), await QR.toString(url, svgOpts));
    console.log(name.padEnd(14), url);
  }
})();
