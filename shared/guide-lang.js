/* =====================================================================
   Station guides · English / Arabic
   ---------------------------------------------------------------------
   Every station guide (and stations.html) loads this near the top of the
   page. It picks the language, sets the page direction, adds the
   English / العربية button, and swaps in the Arabic from the page's ar.js.

   Language, first match wins:
     1. ?lang=ar or ?lang=en in the address (the game adds it to every
        guide link, so a guide opens in the game's language)
     2. the language last chosen in the game on this browser
     3. the browser's own language

   ar.js calls GL.ar({ 'English': 'Arabic', … }). Each key is the English
   exactly as it is inside one element of the page (a heading, paragraph,
   list item, tip, button…), tags included; spacing and entities such as
   &middot; don't need to match. The same dictionary covers alt text,
   aria-label, title and data-cap. Text with no entry stays in English and
   is listed in the browser console. Add translate="no" to an element to
   leave it in English on purpose.
   ===================================================================== */
(function () {
  'use strict';
  var SAVE_KEY = 'pdday2026-save-v1'; // PD.config.saveKey in game/content.js
  var ATTRS = ['alt', 'aria-label', 'title', 'data-cap'];
  var SKIP = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, TEMPLATE: 1, TITLE: 1 };
  // Text from the shared guide template, so each ar.js only needs its own page
  var COMMON = {
    'AISA': 'AISA',
    'Close': 'إغلاق',
    'Station sections': 'أقسام المحطة'
  };

  function pick() {
    var m = /[?&]lang=(ar|en)\b/.exec(location.search);
    if (m) return m[1];
    try {
      var s = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
      if (s && (s.lang === 'ar' || s.lang === 'en')) return s.lang;
    } catch (e) { /* storage blocked */ }
    return (navigator.language || '').toLowerCase().indexOf('ar') === 0 ? 'ar' : 'en';
  }
  var lang = pick(), isAr = lang === 'ar', root = document.documentElement;
  root.lang = lang;
  root.dir = isAr ? 'rtl' : 'ltr';
  // Hidden until the Arabic is in, so the English never flashes first
  if (isAr) root.classList.add('gl-wait');
  function reveal() { root.classList.remove('gl-wait'); }
  document.addEventListener('DOMContentLoaded', reveal);

  function norm(s) { return String(s).replace(/\s+/g, ' ').trim(); }
  var tpl = document.createElement('template');
  function asHTML(s) { tpl.innerHTML = s; return norm(tpl.innerHTML); }
  function asText(s) { tpl.innerHTML = s; return norm(tpl.content.textContent); }
  function ownText(el) {
    for (var n = el.firstChild; n; n = n.nextSibling) if (n.nodeType === 3 && /\S/.test(n.nodeValue)) return true;
    return false;
  }
  // Worth translating: has letters and isn't just a web address
  function wordy(s) { return /[A-Za-z]/.test(s) && !/^[\w.-]+\.[a-z]{2,}(\/\S*)?$/i.test(s); }

  function urlFor(l, href) {
    var hash = '', i = href.indexOf('#');
    if (i >= 0) { hash = href.slice(i); href = href.slice(0, i); }
    var j = href.indexOf('?'), path = j >= 0 ? href.slice(0, j) : href;
    var q = (j >= 0 ? href.slice(j + 1) : '').split('&').filter(function (p) { return p && !/^lang=/.test(p); });
    q.push('lang=' + l);
    return path + '?' + q.join('&') + hash;
  }

  var GL = window.GL = {
    lang: lang,
    missing: [],
    // A string for page scripts: GL.t('Next →', 'التالي ←')
    t: function (en, ar) { return isAr && ar != null ? ar : en; },
    // Called by ar.js at the end of the page, before the page's own scripts run
    ar: function (dict) {
      if (!isAr) return;
      var html = {}, text = {}, k, all = {};
      for (k in COMMON) all[k] = COMMON[k];
      for (k in dict) all[k] = dict[k];
      for (k in all) { html[asHTML(k)] = all[k]; text[asText(k)] = all[k]; }
      var missing = GL.missing = [];
      (function walk(el) {
        for (var c = el.firstElementChild; c; c = c.nextElementSibling) {
          if (SKIP[c.tagName] || c.getAttribute('translate') === 'no') continue;
          if (!ownText(c)) { walk(c); continue; }
          var key = norm(c.innerHTML);
          if (html[key] != null) c.innerHTML = html[key];
          else if (wordy(c.textContent)) missing.push(key);
        }
      })(document.body);
      ATTRS.forEach(function (a) {
        [].forEach.call(document.body.querySelectorAll('[' + a + ']'), function (el) {
          if (el.closest('[translate="no"]')) return;
          var key = norm(el.getAttribute(a));
          if (text[key] != null) el.setAttribute(a, text[key]);
          else if (wordy(key)) missing.push('[' + a + '] ' + key);
        });
      });
      var title = norm(document.title);
      if (text[title] != null) document.title = text[title];
      else if (wordy(title)) missing.push('[title] ' + title);
      if (missing.length) console.info('[guide] No Arabic yet for ' + missing.length + ' text(s); they show in English:', missing);
      reveal();
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    // Links to our own pages keep the language
    [].forEach.call(document.querySelectorAll('a[href]'), function (a) {
      var h = a.getAttribute('href');
      if (/^(#|[a-z][a-z0-9+.-]*:|\/\/)/i.test(h) || !/(\.html?|\/)([?#]|$)/.test(h)) return;
      a.setAttribute('href', urlFor(lang, h));
    });
    // The language button, beside the station sign
    var slot = document.querySelector('header .top');
    if (!slot) return;
    var other = isAr ? 'en' : 'ar', b = document.createElement('a');
    b.className = 'gl-switch';
    b.lang = other;
    b.href = urlFor(other, location.pathname + location.search);
    b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>' +
      (isAr ? 'English' : 'العربية');
    b.addEventListener('click', function (e) {
      e.preventDefault();
      location.replace(urlFor(other, location.pathname + location.search + location.hash));
    });
    slot.appendChild(b);
  });
})();
