/* Printed station guides: print/build.js loads this into a station guide and
   calls PRINT_GUIDE() just before saving the PDF. Styles: guide-print.css. */
window.PRINT_GUIDE = function (opt) {
  'use strict';
  var t = window.GL ? GL.t : function (en) { return en; };
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function each(sel, fn) { [].forEach.call(document.querySelectorAll(sel), fn); }

  // Every step at once
  each('.step', function (s) { s.hidden = false; });

  // Flipbooks become their frames, numbered, each with its caption
  each('.flip', function (f) {
    var box = document.createElement('div');
    box.className = 'pr-frames';
    [].forEach.call(f.querySelectorAll('.fstage img'), function (im, k) {
      var fig = document.createElement('figure'), b = document.createElement('button'), img = new Image();
      fig.className = 'shot';
      img.src = im.src;
      img.alt = im.alt;
      b.appendChild(img);
      fig.appendChild(b);
      if (im.dataset.cap) {
        var c = document.createElement('figcaption');
        c.innerHTML = '<b>' + (k + 1) + '.</b> ' + esc(im.dataset.cap);
        fig.appendChild(c);
      }
      box.appendChild(fig);
    });
    f.replaceWith(box);
  });

  // Two or more pictures in a step: text across the top, pictures in a row below
  each('.step', function (s) {
    var n = s.querySelectorAll('.shot img').length;
    if (n < 2) return;
    s.classList.add('pr-wide');
    s.style.setProperty('--cols', n === 2 || n === 4 ? 2 : 3);
  });

  // Links show their address, when it is short enough to type
  each('.links a', function (a) {
    var shown = a.querySelector('span:last-child'), href = a.getAttribute('href') || '';
    var plain = href.replace(/^https?:\/\//, '').replace(/\/$/, '');
    if (shown && /^https?:/.test(href) && plain.length <= 60) shown.textContent = plain;
  });

  // A QR code in the station band that opens this guide online
  var wrap = document.querySelector('header.band .wrap');
  if (wrap && opt && opt.qr) {
    var head = document.createElement('div'), left = document.createElement('div'), qr = document.createElement('div');
    head.className = 'pr-head';
    while (wrap.firstChild) left.appendChild(wrap.firstChild);
    qr.className = 'pr-qr';
    qr.innerHTML = '<img src="' + opt.qr + '" alt=""><span>' + t('Scan to open this guide online', 'امسح لفتح هذا الدليل على الإنترنت') + '</span>';
    head.append(left, qr);
    wrap.appendChild(head);
  }
};
