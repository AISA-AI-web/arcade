/* =====================================================================
   pD-Day 2026 · GAME ENGINE
   Rendering, movement, Leo, quests, badges, sound and the interface.
   ===================================================================== */
(function () {
  'use strict';
  var PD = window.PD;
  var WD = PD.world, T = WD.T, H = WD.helpers;
  var CS = 8; // chunk size in tiles

  /* =================================================================
     LANGUAGE
     ================================================================= */
  PD.lang = 'en';
  function fmt(s, vars) {
    if (!vars) return s;
    return s.replace(/\{(\w+)\}/g, function (m, k) { return vars[k] != null ? vars[k] : m; });
  }
  function t(o, vars) {
    if (o == null) return '';
    if (typeof o === 'string') return fmt(o, vars);
    var s = o[PD.lang];
    if (s == null || s === '') s = o.en;
    return fmt(s || '', vars);
  }
  PD.t = t;
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function rich(o, vars) {
    return esc(t(o, vars)).replace(/\*\*(.+?)\*\*/g, '<b class="ui"><bdi>$1</bdi></b>').replace(/\n/g, '<br>');
  }
  function ui(k, vars) { return t(PD.ui[k], vars); }
  function uiH(k, vars) { return esc(ui(k, vars)); }

  /* =================================================================
     SAVE DATA (this laptop only)
     ================================================================= */
  var KEY = PD.config.saveKey || 'pdday2026';
  function fresh() {
    return { v: 1, lang: null, sound: true, name: '', look: null, introDone: false, q: {}, secrets: {}, meta: {}, counters: { pats: 0, copier: 0, bonk: 0, obj: {}, npc: {} }, visited: {}, pos: null };
  }
  var S = fresh();
  try { var raw = localStorage.getItem(KEY); if (raw) { var parsed = JSON.parse(raw); if (parsed && parsed.v === 1) S = Object.assign(fresh(), parsed); } } catch (e) { /* storage blocked: play without saving */ }
  S.counters = Object.assign(fresh().counters, S.counters || {});
  var saveTimer = null;
  function save() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } }, 120);
  }
  function saveNow() { clearTimeout(saveTimer); try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } }
  window.addEventListener('pagehide', saveNow);
  // Another tab (e.g. one opened from the station guides) saved newer progress: adopt it,
  // so this tab never writes its older copy back over badges earned there.
  window.addEventListener('storage', function (e) {
    if (e.key !== KEY || !e.newValue) return;
    try {
      var p = JSON.parse(e.newValue); if (!p || p.v !== 1) return;
      var lang = S.lang;
      S = Object.assign(fresh(), p); S.counters = Object.assign(fresh().counters, S.counters || {}); S.lang = lang;
      if (S.look) player.look = S.look;
      if (mode === 'title') keepFocus(titleEl, renderTitle);
      else if (mode === 'play') keepFocus(hud, buildHUD);
      rerenderModal();
    } catch (err) { }
  });
  function qs(id) { if (!S.q[id]) S.q[id] = { m: {}, coop: false, quiz: false, qi: 0, badge: false, seen: false }; return S.q[id]; }
  function questDone(q) { return !!(S.q[q.id] && S.q[q.id].badge); }
  function missionsDone(q) { var st = qs(q.id); return q.missions.filter(function (m) { return st.m[m.id]; }).length; }
  function badgeCount() { return PD.quests.filter(questDone).length; }

  /* =================================================================
     SOUND (tiny synth, no files)
     ================================================================= */
  var Sound = {
    ctx: null, master: null,
    init: function () {
      if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
      try {
        var AC = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AC(); this.master = this.ctx.createGain(); this.master.gain.value = 0.55; this.master.connect(this.ctx.destination);
      } catch (e) { this.ctx = null; }
    },
    tone: function (f, dur, type, vol, when, slide) {
      if (!S.sound || !this.ctx) return;
      var c = this.ctx, t0 = c.currentTime + (when || 0);
      var o = c.createOscillator(), g = c.createGain();
      o.type = type || 'square'; o.frequency.setValueAtTime(f, t0);
      if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, slide), t0 + dur);
      g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol || 0.05, t0 + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g); g.connect(this.master); o.start(t0); o.stop(t0 + dur + 0.02);
    },
    play: function (name) {
      if (!S.sound) return;
      this.init(); if (!this.ctx) return;
      var s = this;
      switch (name) {
        case 'blip': s.tone(740, 0.06, 'square', 0.025); break;
        case 'open': s.tone(523, 0.08, 'triangle', 0.06); s.tone(784, 0.12, 'triangle', 0.06, 0.07); break;
        case 'close': s.tone(659, 0.07, 'triangle', 0.04); s.tone(440, 0.1, 'triangle', 0.04, 0.06); break;
        case 'tick': s.tone(880, 0.06, 'square', 0.035); s.tone(1320, 0.1, 'square', 0.035, 0.05); break;
        case 'untick': s.tone(440, 0.08, 'square', 0.03); break;
        case 'correct': [523, 659, 784, 1047].forEach(function (f, i) { s.tone(f, 0.14, 'triangle', 0.07, i * 0.07); }); break;
        case 'wrong': s.tone(260, 0.25, 'sawtooth', 0.035, 0, 140); break;
        case 'badge':
          [523, 659, 784, 1047, 784, 1047, 1319].forEach(function (f, i) { s.tone(f, 0.18, 'square', 0.045, i * 0.09); });
          [523, 659, 784].forEach(function (f) { s.tone(f, 0.8, 'triangle', 0.05, 0.65); });
          break;
        case 'achieve': [784, 988, 1175, 1568].forEach(function (f, i) { s.tone(f, 0.1, 'triangle', 0.05, i * 0.06); }); break;
        case 'bonk': s.tone(140, 0.09, 'sine', 0.08, 0, 90); break;
        case 'bell': for (var i = 0; i < 6; i++) { s.tone(1568, 0.12, 'square', 0.04, i * 0.12); s.tone(2093, 0.12, 'sine', 0.03, i * 0.12 + 0.06); } break;
        case 'roar': s.tone(220, 0.45, 'sawtooth', 0.05, 0, 110); s.tone(330, 0.35, 'square', 0.02, 0.02, 160); break;
        case 'voice': s.tone(380 + Math.random() * 160, 0.045, 'triangle', 0.018); break;
        case 'step': s.tone(90, 0.03, 'sine', 0.02); break;
        case 'zoom': s.tone(260, 0.3, 'square', 0.035, 0, 980); s.tone(520, 0.22, 'triangle', 0.03, 0.12, 1560); break;
      }
    }
  };

  /* =================================================================
     ART FALLBACKS (if art.js failed to load)
     ================================================================= */
  var ART = PD.art || {};
  function leoSVG(expr) {
    if (ART.leo) return ART.leo(expr || 'happy');
    return '<svg viewBox="0 0 200 200" width="100%" height="100%"><circle cx="100" cy="100" r="90" fill="#B8652A"/><circle cx="100" cy="105" r="62" fill="#E8B85C"/><circle cx="78" cy="95" r="8" fill="#2A1A12"/><circle cx="122" cy="95" r="8" fill="#2A1A12"/><ellipse cx="100" cy="128" rx="22" ry="15" fill="#F7E3B5"/><path d="M92 120 h16 l-8 9z" fill="#5A2E1A"/></svg>';
  }
  function badgeSVG(def, locked) {
    if (ART.badge) return ART.badge(def, { locked: !!locked });
    var c = locked ? '#9A97A8' : def.color;
    return '<svg viewBox="0 0 120 120" width="100%" height="100%"><circle cx="60" cy="60" r="56" fill="#D8B664"/><circle cx="60" cy="60" r="46" fill="' + c + '"/><text x="60" y="72" font-size="34" text-anchor="middle" fill="#fff" font-family="sans-serif">' + (locked ? '?' : '★') + '</text></svg>';
  }
  function icon(name) { return ART.icon ? ART.icon(name) : ''; }
  function stationBadgeDef(q) { return { icon: q.badge.icon, color: q.color, tier: 'station' }; }
  function svgImage(svg, size) {
    var img = new Image();
    svg = svg.replace(/<svg([^>]*?)\swidth="[^"]*"/, '<svg$1').replace(/<svg([^>]*?)\sheight="[^"]*"/, '<svg$1').replace('<svg', '<svg width="' + size + '" height="' + size + '"');
    if (svg.indexOf('xmlns=') < 0) svg = svg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    return img;
  }
  var badgeImgs = {};
  function badgeImg(q, locked) {
    var k = q.id + (locked ? ':l' : '');
    if (!badgeImgs[k]) badgeImgs[k] = svgImage(badgeSVG(stationBadgeDef(q), locked), 128);
    return badgeImgs[k];
  }

  /* =================================================================
     DOM HELPERS
     ================================================================= */
  function $(s, root) { return (root || document).querySelector(s); }
  function $$(s, root) { return Array.prototype.slice.call((root || document).querySelectorAll(s)); }
  function show(el, on) { if (on === false) el.setAttribute('hidden', ''); else el.removeAttribute('hidden'); }
  function hide(el) { show(el, false); }

  /* =================================================================
     WORLD, CAMERA, CANVAS
     ================================================================= */
  var world = WD.build(PD.quests);
  var canvas = $('#game'), ctx = canvas.getContext('2d');
  var V = { w: 0, h: 0, dpr: 1, scale: 2, tilePx: 64 };
  var cam = { x: 0, y: 0 };
  var chunks = {}, sprites = {};
  var flatProps = world.props.filter(function (p) { return p.layer === 'flat'; });
  var overProps = world.props.filter(function (p) { return p.layer === 'over'; });
  var standProps = world.props.filter(function (p) { return p.layer === 'stand'; });

  function clearCaches() { chunks = {}; sprites = {}; }
  function resize() {
    V.dpr = Math.min(window.devicePixelRatio || 1, 2);
    V.w = window.innerWidth; V.h = window.innerHeight;
    canvas.width = Math.round(V.w * V.dpr); canvas.height = Math.round(V.h * V.dpr);
    canvas.style.width = V.w + 'px'; canvas.style.height = V.h + 'px';
    var tilesAcross = V.w < 760 ? 12 : 22, tilesDown = V.w < 760 ? 11 : 12.5;
    V.scale = Math.max(1.3, Math.min(3, V.w / (tilesAcross * T), V.h / (tilesDown * T)));
    V.tilePx = Math.min(Math.round(T * V.scale * V.dpr), 112);
    clearCaches();
    drawMiniBase();
  }

  function getChunk(cx, cy) {
    var key = cx + ',' + cy, ch = chunks[key];
    if (ch) return ch;
    var cv = document.createElement('canvas'), size = Math.ceil(CS * V.tilePx);
    cv.width = size; cv.height = size;
    var c = cv.getContext('2d'), k = V.tilePx / T;
    c.setTransform(k, 0, 0, k, -cx * CS * T * k, -cy * CS * T * k);
    for (var y = cy * CS; y < (cy + 1) * CS; y++) for (var x = cx * CS; x < (cx + 1) * CS; x++) {
      if (x < 0 || y < 0 || x >= world.W || y >= world.H) continue;
      WD.drawTile(c, world, x, y);
    }
    var x0 = cx * CS - 1, y0 = cy * CS - 1, x1 = (cx + 1) * CS + 1, y1 = (cy + 1) * CS + 1;
    flatProps.forEach(function (p) {
      if (p.x > x1 || p.x + p.w < x0 || p.y > y1 || p.y + p.h < y0) return;
      var painter = WD.painters[p.kind]; if (!painter) return;
      c.save(); c.translate(p.x * T, p.y * T); painter(c, p, 0, null); c.restore();
    });
    chunks[key] = cv;
    return cv;
  }

  function getSprite(p) {
    var s = sprites[p.id];
    if (s) return s;
    var top = Math.max(p.top || 0, WD.KIND_TOP[p.kind] || 0), pad = WD.KIND_PAD[p.kind] || 0.4;
    var wT = p.w + pad * 2, hT = p.h + top + pad * 2;
    var cv = document.createElement('canvas');
    cv.width = Math.ceil(wT * V.tilePx); cv.height = Math.ceil(hT * V.tilePx);
    var c = cv.getContext('2d'), k = V.tilePx / T;
    c.setTransform(k, 0, 0, k, pad * T * k, (top + pad) * T * k);
    var painter = WD.painters[p.kind];
    if (painter) painter(c, p, 0, null);
    s = sprites[p.id] = { cv: cv, ox: p.x - pad, oy: p.y - top - pad, w: wT, h: hT };
    return s;
  }

  function propState(p) {
    if (p.kind === 'kiosk') { var d = questDone(p.quest); return { done: d, badgeImg: badgeImg(p.quest, !d) }; }
    if (p.kind === 'trophycase') return { badgeImgs: PD.quests.map(function (q) { var d = questDone(q); return { img: badgeImg(q, !d), earned: d }; }) };
    if (p.kind === 'questboard') { var done = {}; PD.quests.forEach(function (q) { done[q.id] = questDone(q); }); return { done: done }; }
    return null;
  }

  /* =================================================================
     CHARACTERS
     ================================================================= */
  var SKINS = ['#F7DCC8', '#EDC4A0', '#D7A27A', '#B57D54', '#7E5336'];
  var HAIR_COLORS = ['#1E1E1E', '#3B2417', '#7A4A28', '#C98E58', '#E8C77E', '#A3A3A3', '#21076C', '#2F6FD6', '#D1477A', '#2E9E6B', '#FFFFFF', '#D8B664'];
  var OUTFIT_COLORS = ['#21076C', '#D8B664', '#2E9E6B', '#E5733A', '#D1477A', '#2F6FD6', '#7B4FD6', '#1A1A1A', '#F4F4F2'];
  var HAIRS = ['short', 'long', 'bun', 'curly', 'hijab', 'ghutra', 'bald'];

  function drawCharacter(c, x, y, look, dir, phase, moving, now, blink) {
    var skin = SKINS[look.skin] || SKINS[1], hc = look.hairColor || '#3B2417', oc = look.color || '#21076C';
    var robe = look.outfit === 'robe', hair = look.hair || 'short';
    var bob = moving ? Math.abs(Math.sin(phase)) * 1.6 : Math.sin(now / 520) * 0.35;
    var sw = moving ? Math.sin(phase) : 0;
    var side = dir === 'left' ? -1 : dir === 'right' ? 1 : 0, up = dir === 'up';
    H.shadow(c, x, y, 9, 3.4, 0.2);
    c.save(); c.translate(x, y - bob);
    var dark = H.shade(oc, -0.18);
    var covered = hair === 'hijab' || hair === 'ghutra';

    // hair or cloth that sits behind the body
    if (!up && hair === 'long') H.fillRR(c, -10, -36, 20, 23, 8, H.shade(hc, -0.1));
    if (!up && covered) { c.fillStyle = H.shade(hc, -0.06); c.beginPath(); c.moveTo(-11, -32); c.lineTo(-12.5, -16); c.lineTo(12.5, -16); c.lineTo(11, -32); c.fill(); }

    // legs / feet
    if (!robe) {
      var pants = '#34304A', shoe = '#1E1B2C';
      if (side) {
        H.fillRR(c, -3 + sw * 3, -11, 5, 10, 2, pants); H.fillRR(c, -2 - sw * 3, -11, 5, 10, 2, H.shade(pants, -0.15));
        H.fillRR(c, -3 + sw * 3 + side, -3, 6, 3, 1.5, shoe); H.fillRR(c, -2 - sw * 3 + side, -3, 6, 3, 1.5, shoe);
      } else {
        H.fillRR(c, -6, -11 + sw * 1.6, 5, 10 - sw * 1.6, 2, pants); H.fillRR(c, 1, -11 - sw * 1.6, 5, 10 + sw * 1.6, 2, pants);
        H.fillRR(c, -6.5, -3 + Math.max(0, sw) * 0, 6, 3, 1.5, shoe); H.fillRR(c, 0.5, -3, 6, 3, 1.5, shoe);
      }
    } else {
      H.fillRR(c, -6 + (side ? sw * 2 : 0), -3 + (side ? 0 : sw), 5, 3, 1.5, '#1E1B2C');
      H.fillRR(c, 1 + (side ? -sw * 2 : 0), -3 - (side ? 0 : sw), 5, 3, 1.5, '#1E1B2C');
    }

    // body
    var bw = side ? 13 : 16;
    if (!robe) {
      H.fillRR(c, -bw / 2, -24, bw, 15, 5, oc);
      c.fillStyle = dark; c.fillRect(-bw / 2 + 1, -12, bw - 2, 3);
    } else {
      c.fillStyle = oc; c.beginPath();
      c.moveTo(-bw / 2 + 1, -24); c.quadraticCurveTo(-bw / 2 - 1, -24, -bw / 2 - 2, -12); c.lineTo(-bw / 2 - 2.5, -2.5); c.lineTo(bw / 2 + 2.5, -2.5); c.lineTo(bw / 2 + 2, -12); c.quadraticCurveTo(bw / 2 + 1, -24, bw / 2 - 1, -24); c.closePath(); c.fill();
      c.fillStyle = 'rgba(0,0,0,0.08)'; c.fillRect(-bw / 2 - 2.5, -6, bw + 5, 3.5);
      if (!up && !side) { c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(-0.5, -22, 1, 18); }
    }
    c.fillStyle = 'rgba(255,255,255,0.18)'; c.fillRect(-bw / 2 + 3, -23, bw - 6, 1.5);
    // lanyard
    if (!up && !side) {
      c.strokeStyle = '#21076C'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-4, -24); c.lineTo(0, -16); c.lineTo(4, -24); c.stroke();
      H.fillRR(c, -2.6, -17, 5.2, 6, 1, '#D8B664'); c.fillStyle = '#FFFFFF'; c.fillRect(-1.6, -15.8, 3.2, 1.5);
    }
    // arms
    var armC = robe ? H.shade(oc, -0.1) : dark;
    if (side) {
      c.save(); c.translate(0, -22); c.rotate(-sw * 0.6 * side);
      H.fillRR(c, -2, 0, 4.5, 12, 2, armC); H.circle(c, 0.2, 12, 2.4, skin); c.restore();
    } else {
      H.fillRR(c, -bw / 2 - 3.2, -23 + sw * 1.4, 4.2, 12, 2, armC); H.circle(c, -bw / 2 - 1.1, -10.5 + sw * 1.4, 2.3, skin);
      H.fillRR(c, bw / 2 - 1, -23 - sw * 1.4, 4.2, 12, 2, armC); H.circle(c, bw / 2 + 1.1, -10.5 - sw * 1.4, 2.3, skin);
    }

    // head
    var hx = side * 1.5, hy = -32;
    if (covered) {
      // cloth around the head; seen from behind it drapes over the shoulders
      if (up) {
        c.fillStyle = H.shade(hc, -0.05); c.beginPath();
        c.moveTo(hx - 10, hy); c.quadraticCurveTo(hx - 13, hy + 9, hx - 12.5, hy + 15); c.lineTo(hx + 12.5, hy + 15); c.quadraticCurveTo(hx + 13, hy + 9, hx + 10, hy); c.closePath(); c.fill();
        c.strokeStyle = 'rgba(0,0,0,0.14)'; c.lineWidth = 1; c.beginPath(); c.moveTo(hx - 4, hy + 8); c.quadraticCurveTo(hx, hy + 12, hx + 4, hy + 8); c.stroke();
      }
      H.circle(c, hx, hy + 0.5, 11.4, hc);
      if (up) { c.strokeStyle = 'rgba(0,0,0,0.12)'; c.lineWidth = 1.1; c.beginPath(); c.arc(hx, hy + 6, 7, Math.PI * 1.15, Math.PI * 1.85); c.stroke(); c.fillStyle = 'rgba(255,255,255,0.18)'; c.beginPath(); c.ellipse(hx - 4, hy - 5, 3.5, 1.6, -0.4, 0, 7); c.fill(); }
      c.strokeStyle = 'rgba(0,0,0,0.12)'; c.lineWidth = 1; c.beginPath(); c.arc(hx, hy + 0.5, 11, 0, 7); c.stroke();
      if (!up) {
        c.fillStyle = skin; c.beginPath(); c.ellipse(hx + side * 3, hy + 1.6, side ? 5.4 : 6.8, 7.6, 0, 0, 7); c.fill();
      }
      if (hair === 'ghutra') {
        c.strokeStyle = '#1A1A1A'; c.lineWidth = 1.8;
        c.beginPath(); c.ellipse(hx, hy - 6.5, 8.6, 2.4, 0, 0, 7); c.stroke();
        c.beginPath(); c.ellipse(hx, hy - 4.6, 8.8, 2.4, 0, Math.PI * 1.05, Math.PI * 1.95); c.stroke();
      }
    } else {
      H.circle(c, hx, hy, 9, skin);
      if (!up) { c.fillStyle = 'rgba(0,0,0,0.06)'; c.beginPath(); c.arc(hx, hy, 9, 0.2, Math.PI - 0.2); c.fill(); }
      // ears
      if (!side && !up) { H.circle(c, hx - 9, hy + 1, 2, skin); H.circle(c, hx + 9, hy + 1, 2, skin); }
      drawHair(c, hair, hc, hx, hy, side, up);
    }
    // face
    if (!up) {
      var ex = hx + side * 3, ey = hy + 1.5 + (covered ? 0.8 : 0);
      var e1 = ex - (side ? 0 : 3.5) + (side ? -1.5 * side : 0), e2 = ex + (side ? 2.5 * side : 3.5);
      c.fillStyle = '#2A1A12';
      if (blink) { c.fillRect(e1 - 1.4, ey, 2.8, 0.9); c.fillRect(e2 - 1.4, ey, 2.8, 0.9); }
      else { H.circle(c, e1, ey, 1.35, '#2A1A12'); H.circle(c, e2, ey, 1.35, '#2A1A12'); H.circle(c, e1 + 0.45, ey - 0.45, 0.45, '#FFFFFF'); H.circle(c, e2 + 0.45, ey - 0.45, 0.45, '#FFFFFF'); }
      c.fillStyle = 'rgba(240,120,110,0.35)'; H.circle(c, ex - 5.6 + side * 1.5, ey + 2.8, 1.6, 'rgba(240,120,110,0.35)'); if (!side) H.circle(c, ex + 5.6, ey + 2.8, 1.6, 'rgba(240,120,110,0.35)');
      c.strokeStyle = '#7A3B2A'; c.lineWidth = 0.9; c.lineCap = 'round';
      c.beginPath(); c.arc(ex + side * 1.5, ey + 3.4, 1.9, 0.2 * Math.PI, 0.8 * Math.PI); c.stroke();
      if (look.glasses) {
        c.strokeStyle = '#2B2052'; c.lineWidth = 0.9;
        c.beginPath(); c.arc(e1, ey, 2.7, 0, 7); c.stroke(); c.beginPath(); c.arc(e2, ey, 2.7, 0, 7); c.stroke();
        c.beginPath(); c.moveTo(e1 + 2.7, ey); c.lineTo(e2 - 2.7, ey); c.stroke();
      }
    }
    c.restore();
  }
  function drawHair(c, hair, hc, hx, hy, side, up) {
    c.fillStyle = hc;
    if (hair === 'bald') { c.fillStyle = 'rgba(255,255,255,0.35)'; c.beginPath(); c.ellipse(hx - 3, hy - 5, 3, 1.6, -0.4, 0, 7); c.fill(); return; }
    if (up) { H.circle(c, hx, hy - 0.5, 9.6, hc); if (hair === 'long') H.fillRR(c, hx - 9.6, hy - 2, 19.2, 16, 7, hc); if (hair === 'bun') H.circle(c, hx, hy - 9, 4.4, H.shade(hc, -0.08)); if (hair === 'curly') for (var i = 0; i < 10; i++) { var a = i / 10 * Math.PI * 2; H.circle(c, hx + Math.cos(a) * 9, hy - 1 + Math.sin(a) * 9, 3.6, hc); } return; }
    if (hair === 'curly') {
      for (var k = 0; k < 9; k++) { var a2 = Math.PI + k / 8 * Math.PI; H.circle(c, hx + Math.cos(a2) * 9 - side * 1.5, hy - 1.5 + Math.sin(a2) * 8.6, 3.7, hc); }
      H.circle(c, hx - side * 2, hy - 6, 6, hc);
      return;
    }
    c.beginPath();
    c.arc(hx - side * 1.2, hy - 0.5, 9.8, Math.PI * 0.92, Math.PI * 2.08);
    if (side) { c.lineTo(hx + side * 7, hy - 3); c.quadraticCurveTo(hx, hy - 7, hx - side * 9, hy + 3); }
    else { c.lineTo(hx + 8.5, hy - 2); c.quadraticCurveTo(hx + 4, hy - 7.5, hx - 1, hy - 4.6); c.quadraticCurveTo(hx - 6, hy - 7, hx - 9, hy - 0.5); }
    c.closePath(); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.16)'; c.beginPath(); c.ellipse(hx - 3 - side, hy - 6.5, 3.5, 1.4, -0.3, 0, 7); c.fill();
    if (hair === 'long') {
      c.fillStyle = hc;
      if (side) H.fillRR(c, hx - side * 9 - 3, hy - 2, 6, 15, 3, hc);
      else { H.fillRR(c, hx - 11, hy - 3, 5, 16, 2.5, hc); H.fillRR(c, hx + 6, hy - 3, 5, 16, 2.5, hc); }
    }
    if (hair === 'bun') { H.circle(c, hx - side * 2, hy - 10.5, 4.6, H.shade(hc, -0.06)); c.fillStyle = 'rgba(255,255,255,0.15)'; c.beginPath(); c.arc(hx - side * 2 - 1.5, hy - 12, 1.4, 0, 7); c.fill(); }
  }

  /* Leo, the lion */
  var FUR = '#E8B85C', FUR_D = '#D49E3F', MANE = '#B8652A', MANE_D = '#8E4A1C', MANE_H = '#D9822B', MUZ = '#F7E3B5';
  function drawLeo(c, x, y, dir, phase, moving, state, now) {
    var side = dir === 'left' ? -1 : dir === 'right' ? 1 : 0, up = dir === 'up';
    var bob = moving ? Math.abs(Math.sin(phase)) * 1.4 : 0;
    var wag = Math.sin(now / 260) * (state === 'sleep' ? 0.1 : 0.45);
    var hop = state === 'hop' ? Math.abs(Math.sin(now / 90)) * 5 : 0;
    H.shadow(c, x, y, 13, 4, 0.22);
    c.save(); c.translate(x, y - bob - hop);
    if (state === 'sleep') {
      var sd = side || 1;
      tail(c, -sd * 12, -6, -sd * 20, -4, wag);
      c.fillStyle = FUR; c.beginPath(); c.ellipse(0, -6.5, 13, 6.5, 0, 0, 7); c.fill();
      c.fillStyle = FUR_D; c.beginPath(); c.ellipse(0, -3, 12, 3, 0, 0, Math.PI); c.fill();
      maneRing(c, sd * 9, -9, 10.5, 9);
      H.circle(c, sd * 9, -9, 7.2, FUR);
      H.circle(c, sd * 9 - 5, -15, 2.6, FUR); H.circle(c, sd * 9 + 5, -15, 2.6, FUR);
      c.strokeStyle = '#2A1A12'; c.lineWidth = 1.1; c.lineCap = 'round';
      c.beginPath(); c.arc(sd * 9 - 2.6, -9.6, 1.6, 0.1, Math.PI - 0.1); c.stroke(); c.beginPath(); c.arc(sd * 9 + 2.6, -9.6, 1.6, 0.1, Math.PI - 0.1); c.stroke();
      c.fillStyle = MUZ; c.beginPath(); c.ellipse(sd * 9, -5.8, 3.8, 2.4, 0, 0, 7); c.fill();
      H.circle(c, sd * 9, -7, 1.1, '#5A2E1A');
      scarf(c, sd * 6, -3.5, 6);
      c.restore();
      return;
    }
    if (side) {
      tail(c, -side * 11, -10, -side * 18, -20, wag);
      var lp = moving ? Math.sin(phase) * 2.5 : 0;
      H.fillRR(c, -9 + lp, -7, 4.5, 7, 2, FUR_D); H.fillRR(c, 4 - lp, -7, 4.5, 7, 2, FUR_D);
      c.fillStyle = FUR; c.beginPath(); c.ellipse(0, -10, 12, 7.5, 0, 0, 7); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.18)'; c.beginPath(); c.ellipse(-2, -14, 7, 2, 0, 0, 7); c.fill();
      H.fillRR(c, -7 - lp, -6, 4.5, 6.5, 2, FUR); H.fillRR(c, 6 + lp, -6, 4.5, 6.5, 2, FUR);
      var hx = side * 9, hy = -18;
      maneRing(c, hx - side * 1.5, hy, 11.5, 10);
      H.circle(c, hx + side * 1.5 - 4, hy - 7.5, 3, FUR); H.circle(c, hx + side * 1.5 - 4, hy - 7.5, 1.5, '#F2A7A0');
      H.circle(c, hx + side * 1.5 + 4, hy - 7.5, 3, FUR); H.circle(c, hx + side * 1.5 + 4, hy - 7.5, 1.5, '#F2A7A0');
      H.circle(c, hx + side * 1.5, hy, 8, FUR);
      c.fillStyle = MUZ; c.beginPath(); c.ellipse(hx + side * 6, hy + 3, 4.6, 3.6, 0, 0, 7); c.fill();
      H.circle(c, hx + side * 8.6, hy + 1.2, 1.6, '#5A2E1A');
      leoEye(c, hx + side * 4, hy - 1.5, now);
      scarf(c, hx - side * 1, hy + 7.5, 6.5);
      c.restore();
      return;
    }
    if (up) {
      H.fillRR(c, -8, -7, 5, 7, 2, FUR_D); H.fillRR(c, 3, -7, 5, 7, 2, FUR_D);
      c.fillStyle = FUR; c.beginPath(); c.ellipse(0, -10, 10.5, 8.5, 0, 0, 7); c.fill();
      maneRing(c, 0, -19, 12, 11);
      H.circle(c, -6.8, -27.5, 3.2, FUR); H.circle(c, 6.8, -27.5, 3.2, FUR);
      c.strokeStyle = MANE_D; c.lineWidth = 1.4; c.lineCap = 'round';
      for (var tf = 0; tf < 5; tf++) { var ta = -Math.PI / 2 + (tf - 2) * 0.5; c.beginPath(); c.moveTo(Math.cos(ta) * 2.5, -19 + Math.sin(ta) * 2.5); c.lineTo(Math.cos(ta) * 8.5, -19 + Math.sin(ta) * 8.5); c.stroke(); }
      c.fillStyle = 'rgba(255,255,255,0.16)'; c.beginPath(); c.ellipse(-3, -24, 4, 1.8, -0.3, 0, 7); c.fill();
      scarf(c, 0, -10.5, 7.5);
      tail(c, 2, -4, 8, 3, wag);
      c.restore();
      return;
    }
    // facing down (towards the camera)
    tail(c, 8, -10, 16, -21, wag);
    H.fillRR(c, -9, -8, 5, 7, 2, FUR_D); H.fillRR(c, 4, -8, 5, 7, 2, FUR_D);
    c.fillStyle = FUR; c.beginPath(); c.ellipse(0, -9.5, 10.5, 8, 0, 0, 7); c.fill();
    var lp2 = moving ? Math.sin(phase) * 1.8 : 0;
    H.fillRR(c, -6.5, -7 + lp2, 4.5, 7.5 - lp2, 2, FUR); H.fillRR(c, 2, -7 - lp2, 4.5, 7.5 + lp2, 2, FUR);
    H.circle(c, -4.2, -0.4 + lp2 * 0.2, 2.2, MUZ); H.circle(c, 4.2, -0.4, 2.2, MUZ);
    maneRing(c, 0, -20, 12, 11);
    H.circle(c, -6.8, -27.5, 3.2, FUR); H.circle(c, -6.8, -27.5, 1.6, '#F2A7A0');
    H.circle(c, 6.8, -27.5, 3.2, FUR); H.circle(c, 6.8, -27.5, 1.6, '#F2A7A0');
    H.circle(c, 0, -20, 8.6, FUR);
    c.fillStyle = 'rgba(255,255,255,0.18)'; c.beginPath(); c.ellipse(-3, -25, 3.5, 1.6, -0.3, 0, 7); c.fill();
    leoEye(c, -3.3, -21, now); leoEye(c, 3.3, -21, now);
    c.fillStyle = MUZ; c.beginPath(); c.ellipse(-2, -16.2, 2.9, 2.2, 0, 0, 7); c.fill(); c.beginPath(); c.ellipse(2, -16.2, 2.9, 2.2, 0, 0, 7); c.fill();
    c.fillStyle = '#5A2E1A'; c.beginPath(); c.moveTo(-1.8, -18.4); c.lineTo(1.8, -18.4); c.lineTo(0, -16.6); c.closePath(); c.fill();
    H.circle(c, -5.6, -17.5, 1.3, 'rgba(240,140,106,0.4)'); H.circle(c, 5.6, -17.5, 1.3, 'rgba(240,140,106,0.4)');
    scarf(c, 0, -12, 7);
    c.restore();
  }
  function maneRing(c, x, y, r, n) {
    for (var i = 0; i < n; i++) { var a = i / n * Math.PI * 2; H.circle(c, x + Math.cos(a) * r * 0.82, y + Math.sin(a) * r * 0.82, r * 0.42, i % 2 ? MANE : MANE_D); }
    H.circle(c, x, y, r * 0.86, MANE);
    for (var k = 0; k < 4; k++) { var b = -Math.PI / 2 + (k - 1.5) * 0.5; H.circle(c, x + Math.cos(b) * r * 0.7, y + Math.sin(b) * r * 0.7, r * 0.18, MANE_H); }
  }
  function tail(c, x0, y0, x1, y1, wag) {
    c.strokeStyle = FUR_D; c.lineWidth = 2.6; c.lineCap = 'round';
    var mx = (x0 + x1) / 2 + wag * 8, my = (y0 + y1) / 2;
    c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(mx, my + 4, x1 + wag * 6, y1); c.stroke();
    H.circle(c, x1 + wag * 6, y1, 3.2, MANE_D);
  }
  function scarf(c, x, y, w) {
    c.fillStyle = '#21076C'; c.beginPath(); c.ellipse(x, y, w, 2.6, 0, 0, 7); c.fill();
    c.fillStyle = '#D8B664'; c.fillRect(x - w + 1.5, y + 0.6, w * 2 - 3, 1);
    c.fillStyle = '#21076C'; c.beginPath(); c.moveTo(x + 1, y); c.lineTo(x + 5, y + 6); c.lineTo(x + 1.5, y + 6.5); c.closePath(); c.fill();
  }
  function leoEye(c, x, y, now) {
    var blink = (now % 4200) < 130;
    if (blink) { c.fillStyle = '#2A1A12'; c.fillRect(x - 1.5, y, 3, 0.9); return; }
    H.circle(c, x, y, 1.6, '#2A1A12'); H.circle(c, x + 0.5, y - 0.6, 0.6, '#FFFFFF');
  }

  /* =================================================================
     ENTITIES
     ================================================================= */
  var defaultLook = { skin: 1, hair: 'short', hairColor: '#3B2417', outfit: 'shirt', color: '#21076C', glasses: false };
  var player = { x: world.spawn.x, y: world.spawn.y, dir: 'up', moving: false, phase: 0, look: S.look || defaultLook, idle: 0 };
  function footClear(x, y) {
    var hw = 0.27, hh = 0.2;
    return !world.isSolid(x - hw, y - hh) && !world.isSolid(x + hw, y - hh) && !world.isSolid(x - hw, y - 0.02) && !world.isSolid(x + hw, y - 0.02);
  }
  if (S.pos) {
    // older saves rounded the position, which can land a hair inside a wall: try tiny nudges
    var NUDGES = [[0, 0], [-0.01, 0], [0, -0.01], [-0.01, -0.01], [0.01, 0], [0, 0.01], [0.01, 0.01], [-0.01, 0.01], [0.01, -0.01]];
    for (var ni = 0; ni < NUDGES.length; ni++) {
      var nx = S.pos.x + NUDGES[ni][0], ny = S.pos.y + NUDGES[ni][1];
      if (footClear(nx, ny)) { player.x = nx; player.y = ny; break; }
    }
  }
  var leo = { x: world.leoSpawn.x, y: world.leoSpawn.y, dir: 'down', moving: false, phase: 0, state: 'sit', trail: [], hopUntil: 0 };
  var npcs = (PD.npcs || []).map(function (n) {
    var L = world.L, cz = world.zones.corridor, pos;
    switch (n.zone) {
      case 'lounge': pos = { x: L.loungeX + 2.5, y: L.yTop + 3.4 }; break;
      case 'lobby': pos = { x: L.lobbyX + 2, y: L.yTop + 9.4 }; break;
      case 'corridor': pos = { x: cz.x + 7.5, y: L.yCor + 2.9 }; break;
      default: pos = { x: cz.x + cz.w - 9.5, y: L.yCor + 3.6 };
    }
    return { def: n, x: pos.x, y: pos.y, dir: 'down', look: n.look, turnAt: 0 };
  });
  if (S.pos) { leo.x = player.x + 1; leo.y = player.y + 0.4; }

  /* =================================================================
     INPUT
     ================================================================= */
  var keys = {};
  var path = null, pendingTarget = null, clickMark = null;
  var paused = true; // true while a menu or dialog is open
  var mode = 'title';

  function typing(e) { var tg = e.target; return tg && (tg.tagName === 'INPUT' || tg.tagName === 'TEXTAREA' || tg.isContentEditable); }
  // Letter shortcuts follow the physical key when the layout isn't Latin (e.g. Arabic),
  // but keep the printed letter on Latin layouts such as AZERTY.
  var KEYCODE = { KeyW: 'w', KeyA: 'a', KeyS: 's', KeyD: 'd', KeyE: 'e', KeyQ: 'q', KeyB: 'b', KeyM: 'm' };
  function keyOf(e) {
    var k = (e.key || '').toLowerCase();
    if (!/^[a-z]$/.test(k) && KEYCODE[e.code]) k = KEYCODE[e.code];
    return k;
  }
  window.addEventListener('keydown', function (e) {
    if (typing(e)) return;
    var k = keyOf(e), act = k === 'e' || k === ' ' || k === 'enter';
    if (k === 'escape') { if (closeTopLayer()) e.preventDefault(); return; }
    if (dialog.open) { if (act) { e.preventDefault(); if (!e.repeat) dialog.advance(); } return; }
    if (mode !== 'play') return;
    if (modal.open || awardEl.classList.contains('on') || !$('#cert').hasAttribute('hidden') || !$('#lightbox').hasAttribute('hidden')) return;
    // a focused button (HUD, prompt pill) handles its own Enter/Space
    var onControl = e.target && e.target.closest && e.target.closest('button, a, [role="button"]');
    if (onControl && (k === ' ' || k === 'enter')) return;
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].indexOf(k) >= 0) e.preventDefault();
    keys[k] = true;
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].indexOf(k) >= 0) { path = null; pendingTarget = null; }
    if (e.repeat) return;
    if (act) { if (near) { Sound.init(); interact(near); } }
    if (k === 'q') openQuestLog();
    if (k === 'b') openBadges();
    if (k === 'm') openMap();
  });
  window.addEventListener('keyup', function (e) { keys[keyOf(e)] = false; });
  window.addEventListener('blur', function () { keys = {}; });

  canvas.addEventListener('pointerdown', function (e) {
    if (mode !== 'play' || paused) return;
    Sound.init();
    var wx = cam.x + e.clientX / V.scale, wy = cam.y + e.clientY / V.scale;
    var tx = wx / T, ty = wy / T;
    var hit = pickTarget(tx, ty);
    if (hit) { goTo(hit); return; }
    var gx = Math.floor(tx), gy = Math.floor(ty);
    if (world.isSolid(gx, gy)) {
      var best = null, bd = 9;
      for (var j = -2; j <= 2; j++) for (var i = -2; i <= 2; i++) if (!world.isSolid(gx + i, gy + j)) { var d = i * i + j * j; if (d < bd) { bd = d; best = [gx + i, gy + j]; } }
      if (!best) return; gx = best[0]; gy = best[1];
    }
    var p = findPath(Math.floor(player.x), Math.floor(player.y - 0.1), function (x, y) { return x === gx && y === gy; });
    if (p) { path = p; pendingTarget = null; clickMark = { x: gx + 0.5, y: gy + 0.5, t: performance.now() }; }
  });

  /* ---------------- path finding (BFS on tiles) ---------------- */
  function findPath(sx, sy, goal) {
    var Wd = world.W, Hd = world.H, prev = new Int32Array(Wd * Hd).fill(-1);
    var start = sy * Wd + sx, q = [start], head = 0;
    prev[start] = start;
    var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
    while (head < q.length) {
      var cur = q[head++], cx = cur % Wd, cy = (cur / Wd) | 0;
      if (goal(cx, cy)) {
        var out = [], n = cur;
        while (n !== start) { out.push({ x: (n % Wd) + 0.5, y: ((n / Wd) | 0) + 0.6 }); n = prev[n]; }
        out.reverse();
        return out.length ? out : [{ x: cx + 0.5, y: cy + 0.6 }];
      }
      for (var k = 0; k < 8; k++) {
        var nx = cx + dirs[k][0], ny = cy + dirs[k][1];
        if (nx < 0 || ny < 0 || nx >= Wd || ny >= Hd) continue;
        var ni = ny * Wd + nx;
        if (prev[ni] !== -1 || world.isSolid(nx, ny) || npcAt(nx + 0.5, ny + 0.5)) continue;
        if (k >= 4 && (world.isSolid(cx + dirs[k][0], cy) || world.isSolid(cx, cy + dirs[k][1]))) continue;
        prev[ni] = cur; q.push(ni);
      }
      if (q.length > 6000) break;
    }
    return null;
  }

  /* =================================================================
     TARGETS & INTERACTION
     ================================================================= */
  function rectDist(px, py, r) {
    var dx = Math.max(r.x - px, 0, px - (r.x + r.w)), dy = Math.max(r.y - py, 0, py - (r.y + r.h));
    return Math.sqrt(dx * dx + dy * dy);
  }
  function npcAt(x, y) { for (var i = 0; i < npcs.length; i++) if (Math.abs(npcs[i].x - x) < 0.55 && Math.abs(npcs[i].y - y) < 0.45) return npcs[i]; return null; }
  function allTargets() {
    var list = world.interactables.map(function (p) { return { type: 'prop', p: p, rect: { x: p.x, y: p.y, w: p.w, h: p.h }, range: p.kind === 'kiosk' ? 1.15 : 0.8 }; });
    npcs.forEach(function (n) { list.push({ type: 'npc', n: n, rect: { x: n.x - 0.35, y: n.y - 0.35, w: 0.7, h: 0.4 }, range: 0.9 }); });
    list.push({ type: 'leo', rect: { x: leo.x - 0.5, y: leo.y - 0.45, w: 1, h: 0.5 }, range: 0.75 });
    return list;
  }
  var near = null;
  function findNear() {
    var best = null, bd = 999;
    allTargets().forEach(function (tg) {
      var d = rectDist(player.x, player.y - 0.15, tg.rect);
      if (d <= tg.range) {
        // prefer things in front of the player
        var cx = tg.rect.x + tg.rect.w / 2, cy = tg.rect.y + tg.rect.h / 2;
        var fx = player.dir === 'left' ? -1 : player.dir === 'right' ? 1 : 0, fy = player.dir === 'up' ? -1 : player.dir === 'down' ? 1 : 0;
        var facing = ((cx - player.x) * fx + (cy - player.y) * fy) > 0 ? -0.3 : 0;
        if (tg.type === 'leo') facing += 50; // Leo is always nearby: only pick him when nothing else is in reach
        if (d + facing < bd) { bd = d + facing; best = tg; }
      }
    });
    return best;
  }
  function pickTarget(tx, ty) {
    var hit = null;
    // characters first
    if (Math.abs(tx - leo.x) < 0.7 && ty > leo.y - 1.3 && ty < leo.y + 0.2) return { type: 'leo', rect: { x: leo.x - 0.5, y: leo.y - 0.45, w: 1, h: 0.5 }, range: 0.75 };
    npcs.forEach(function (n) { if (Math.abs(tx - n.x) < 0.6 && ty > n.y - 1.5 && ty < n.y + 0.2) hit = { type: 'npc', n: n, rect: { x: n.x - 0.35, y: n.y - 0.35, w: 0.7, h: 0.4 }, range: 0.9 }; });
    if (hit) return hit;
    for (var ri = 0; ri < world.rooms.length; ri++) {
      var kp = world.rooms[ri].kiosk;
      var colTop = questDone(world.rooms[ri].quest) ? kp.y - 2.7 : kp.y - 3.6;
      if (Math.abs(tx - (kp.x + kp.w / 2)) <= 0.6 && ty >= colTop && ty <= kp.y + kp.h) return { type: 'prop', p: kp, rect: { x: kp.x, y: kp.y, w: kp.w, h: kp.h }, range: 1.15 };
    }
    world.interactables.forEach(function (p) {
      var top = p.layer === 'stand' ? Math.max(p.top || 0, WD.KIND_TOP[p.kind] || 0) : 0;
      if (tx >= p.x && tx <= p.x + p.w && ty >= p.y - top && ty <= p.y + p.h) hit = { type: 'prop', p: p, rect: { x: p.x, y: p.y, w: p.w, h: p.h }, range: p.kind === 'kiosk' ? 1.15 : 0.8 };
    });
    return hit;
  }
  function goTo(tg) {
    if (rectDist(player.x, player.y - 0.15, tg.rect) <= tg.range) { interact(tg); return; }
    var r = tg.rect, range = tg.range - 0.15;
    var p = findPath(Math.floor(player.x), Math.floor(player.y - 0.1), function (x, y) { return rectDist(x + 0.5, y + 0.5, r) <= range; });
    if (p) { path = p; pendingTarget = tg; clickMark = null; }
  }
  function travelToQuest(q) {
    var z = world.rooms.filter(function (r) { return r.quest === q; })[0];
    if (!z) return;
    closeModal();
    goTo({ type: 'prop', p: z.kiosk, rect: { x: z.kiosk.x, y: z.kiosk.y, w: z.kiosk.w, h: z.kiosk.h }, range: 0.8 });
  }
  function targetLabel(tg) {
    if (tg.type === 'leo') return ui('pat');
    if (tg.type === 'npc') return ui('talk') + ' · ' + t(tg.n.def.role);
    var p = tg.p, it = p.interact;
    if (it.type === 'quest') return ui('openQuest') + ' · ' + ui('station') + ' ' + it.quest.station;
    if (it.type === 'board') return ui('quests');
    if (it.type === 'trophy') return ui('badges');
    var o = PD.objects[it.obj];
    return ui('interact') + ' · ' + (o ? t(o.name) : '');
  }
  function interact(tg) {
    path = null; pendingTarget = null;
    if (tg.type === 'leo') return patLeo();
    if (tg.type === 'npc') {
      var n = tg.n, lines = n.def.lines, k = (S.counters.npc[n.def.id] || 0);
      S.counters.npc[n.def.id] = k + 1; save();
      n.dir = faceToward(n, player);
      say([lines[k % lines.length]], { portrait: 'npc', look: n.look, name: n.def.role });
      return;
    }
    var it = tg.p.interact;
    if (it.type === 'quest') return openQuest(it.quest);
    if (it.type === 'board') return openQuestLog();
    if (it.type === 'trophy') return openBadges();
    if (it.type === 'object') return useObject(it.obj);
  }
  function faceToward(a, b) {
    var dx = b.x - a.x, dy = b.y - a.y;
    return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
  }
  function useObject(id) {
    var o = PD.objects[id]; if (!o) return;
    var c = S.counters.obj[id] || 0; S.counters.obj[id] = c + 1; save();
    var line = o.lines ? o.lines[c % o.lines.length] : null;
    if (id === 'coffee') { unlockSecret('coffee'); startBoost(); }
    if (id === 'fridge') unlockSecret('fridge');
    if (id === 'copier') { S.counters.copier = (S.counters.copier || 0) + 1; if (S.counters.copier >= 3) unlockSecret('jam'); }
    if (id === 'bell') { Sound.play('bell'); shake = 0.5; unlockSecret('bell'); }
    else Sound.play('blip');
    if (line) say([line], { portrait: null, name: o.name });
  }
  function patLeo() {
    S.counters.pats = (S.counters.pats || 0) + 1; save();
    leo.hopUntil = performance.now() + 700; leo.state = 'hop';
    hearts.push({ x: leo.x, y: leo.y - 1.4, t: performance.now() });
    Sound.play('roar');
    if (S.counters.pats >= 5) unlockSecret('bestie');
    var next = PD.quests.filter(function (q) { return !questDone(q); })[0];
    if (!next) { bubble(t(PD.leo.allDone), 4200); return; }
    if (S.counters.pats % 3 === 0) { bubble(t(PD.leo.hint, { n: next.station, room: t(next.room) }), 4200); return; }
    bubble(t(PD.leo.pats[(S.counters.pats - 1) % PD.leo.pats.length], { name: S.name }), 3600);
  }

  /* =================================================================
     ACHIEVEMENTS & BADGES
     ================================================================= */
  function unlockSecret(id) {
    if (S.secrets[id]) return;
    var def = PD.secrets.filter(function (s) { return s.id === id; })[0]; if (!def) return;
    S.secrets[id] = Date.now(); save();
    Sound.play('achieve');
    toast('<div class="toast-badge">' + badgeSVG({ icon: def.icon, color: def.color, tier: 'secret' }) + '</div><div><div class="toast-eyebrow">' + uiH('achievement') + '</div><b>' + esc(t(def.name)) + '</b></div>', 4200);
  }
  function checkMeta() {
    var earned = [];
    var coop = PD.quests.filter(function (q) { return S.q[q.id] && S.q[q.id].coop; }).length;
    if (coop >= 3 && !S.meta['pride-player']) { S.meta['pride-player'] = Date.now(); earned.push('pride-player'); }
    if (badgeCount() === PD.quests.length && !S.meta['pride-leader']) { S.meta['pride-leader'] = Date.now(); earned.push('pride-leader'); }
    if (earned.length) save();
    return earned.map(function (id) { return PD.metaBadges.filter(function (b) { return b.id === id; })[0]; });
  }
  function claimBadge(q) {
    var st = qs(q.id);
    if (st.badge) return;
    st.badge = Date.now(); save();
    closeModal(true);
    updateHUD();
    var queue = [{ svg: badgeSVG(stationBadgeDef(q)), name: t(q.badge.name), flavor: t(q.badge.flavor), line: t(q.done), expr: 'proud' }];
    checkMeta().forEach(function (m) { queue.push({ svg: badgeSVG({ icon: m.icon, color: m.color, tier: 'meta' }), name: t(m.name), flavor: t(m.flavor), line: m.id === 'pride-leader' ? t(PD.leo.allDone) : t(m.how), expr: 'wow' }); });
    showAwards(queue);
  }

  /* =================================================================
     UPDATE LOOP
     ================================================================= */
  var last = performance.now(), shake = 0, hearts = [], currentZone = null;
  var bumpState = false, bumpCooldown = 0, stepTimer = 0, posDirty = false;
  /* ---- coffee: walk 50% faster for 30 seconds ---- */
  var BOOST_MS = 30000, BOOST_MULT = 1.5, boostUntil = 0, boostShown = -1;
  function boosted(now) { return (now || performance.now()) < boostUntil; }
  function startBoost() {
    var refill = boosted();
    boostUntil = performance.now() + BOOST_MS;
    Sound.play('zoom');
    toast('<div class="toast-cup" aria-hidden="true">☕</div><div><div class="toast-eyebrow">' + uiH(refill ? 'coffeeRefillTitle' : 'coffeeBoostTitle') + '</div><b>' + uiH(refill ? 'coffeeRefill' : 'coffeeBoost') + '</b></div>', 3800);
  }
  var boostEl = $('#boost');
  function updateBoost(now) {
    var left = boostUntil - now;
    if (left <= 0) {
      if (boostShown !== -1) { boostShown = -1; boostEl.classList.remove('on'); if (mode === 'play') bubble(ui('coffeeOver'), 3600); }
      return;
    }
    var secs = Math.ceil(left / 1000);
    if (secs !== boostShown) {
      boostShown = secs;
      boostEl.innerHTML = '<span class="boost-cup" aria-hidden="true">☕</span><span class="boost-label">' + uiH('boostLabel') + '</span><b>' + uiH('seconds', { s: secs }) + '</b><i style="--p:' + (left / BOOST_MS) + '"></i>';
      boostEl.setAttribute('aria-label', ui('boostLabel') + ' ' + ui('seconds', { s: secs }));
      boostEl.classList.add('on');
    } else boostEl.querySelector('i').style.setProperty('--p', left / BOOST_MS);
  }
  function canStand(x, y) {
    if (!footClear(x, y)) return false;
    for (var i = 0; i < npcs.length; i++) if (Math.abs(npcs[i].x - x) < 0.5 && Math.abs(npcs[i].y - y) < 0.32) return false;
    return true;
  }
  function update(dt, now) {
    var mult = boosted(now) ? BOOST_MULT : 1;
    var mx = 0, my = 0, speed = 4.8 * mult;
    if (mode === 'play' && !paused) {
      if (keys.arrowleft || keys.a) mx -= 1;
      if (keys.arrowright || keys.d) mx += 1;
      if (keys.arrowup || keys.w) my -= 1;
      if (keys.arrowdown || keys.s) my += 1;
      if (!mx && !my && path && path.length) {
        var wp = path[0], dx = wp.x - player.x, dy = wp.y - player.y, d = Math.sqrt(dx * dx + dy * dy);
        if (d < 0.08) { path.shift(); if (!path.length) { path = null; if (pendingTarget) { var tg = pendingTarget; pendingTarget = null; if (rectDist(player.x, player.y - 0.15, tg.rect) <= tg.range + 0.25) interact(tg); } } }
        else { speed = 6.2 * mult; var stepLen = Math.min(speed * dt, d); mx = dx / d * stepLen / (speed * dt); my = dy / d * stepLen / (speed * dt); }
      }
    }
    var len = Math.sqrt(mx * mx + my * my);
    var moved = false;
    if (len > 0) {
      if (len > 1) { mx /= len; my /= len; }
      var sx = mx * speed * dt, sy = my * speed * dt;
      var nx = player.x + sx, ny = player.y + sy;
      var okx = false, oky = false;
      if (sx) { okx = canStand(nx, player.y); if (okx) player.x = nx; }
      if (sy) { oky = canStand(player.x, ny); if (oky) player.y = ny; }
      moved = okx || oky;
      if (Math.abs(mx) > Math.abs(my) + 0.05) player.dir = mx > 0 ? 'right' : 'left'; else player.dir = my > 0 ? 'down' : 'up';
      var blocked = !moved;
      if (blocked && !path) {
        if (!bumpState && bumpCooldown <= 0) {
          bumpState = true; bumpCooldown = 0.45; Sound.play('bonk');
          S.counters.bonk = (S.counters.bonk || 0) + 1; save();
          if (S.counters.bonk >= 15) unlockSecret('bonk');
        }
      } else bumpState = false;
      if (blocked && path) { path = null; pendingTarget = null; }
    } else bumpState = false;
    bumpCooldown -= dt;
    player.moving = moved;
    if (moved) { player.phase += dt * 13 * mult; player.idle = 0; stepTimer -= dt; if (stepTimer <= 0) { stepTimer = 0.32; } }
    else { player.idle += dt; player.phase = 0; }

    // Leo follows a trail of the player's footsteps
    var tl = leo.trail, lastP = tl[tl.length - 1];
    if (!lastP || Math.hypot(lastP.x - player.x, lastP.y - player.y) > 0.12) { tl.push({ x: player.x, y: player.y }); if (tl.length > 40) tl.shift(); }
    var target = null, acc = 0;
    for (var i = tl.length - 1; i > 0; i--) { acc += Math.hypot(tl[i].x - tl[i - 1].x, tl[i].y - tl[i - 1].y); if (acc > 1.25) { target = tl[i - 1]; break; } }
    var ld = Math.hypot(player.x - leo.x, player.y - leo.y);
    if (ld > 9) { leo.x = player.x + 0.8; leo.y = player.y + 0.3; tl.length = 0; }
    leo.moving = false;
    if (target && ld > 1.05) {
      var ldx = target.x - leo.x, ldy = target.y - leo.y, l2 = Math.hypot(ldx, ldy);
      if (l2 > 0.05) {
        var ls = Math.min(l2 * 6, 7.5 * mult) * dt;
        leo.x += ldx / l2 * Math.min(ls, l2); leo.y += ldy / l2 * Math.min(ls, l2);
        leo.moving = true; leo.phase += dt * 14;
        leo.dir = Math.abs(ldx) > Math.abs(ldy) ? (ldx > 0 ? 'right' : 'left') : (ldy > 0 ? 'down' : 'up');
      }
    }
    if (now < leo.hopUntil) leo.state = 'hop';
    else if (player.idle > 32 && mode === 'play') leo.state = 'sleep';
    else { leo.state = 'sit'; if (!leo.moving) leo.dir = faceToward(leo, player) === 'up' ? 'up' : (Math.abs(player.x - leo.x) > 0.6 ? faceToward(leo, player) : 'down'); }

    // NPCs glance at the player
    npcs.forEach(function (n) {
      var d = Math.hypot(player.x - n.x, player.y - n.y);
      if (d < 3) n.dir = faceToward(n, player);
      else if (now > n.turnAt) { n.dir = ['down', 'left', 'right', 'down'][Math.floor(Math.random() * 4)]; n.turnAt = now + 2500 + Math.random() * 4000; }
    });

    if (mode === 'play') {
      near = paused ? null : findNear();
      var z = world.zoneAt(player.x, player.y - 0.1);
      if (z && z !== currentZone) { enterZone(z, currentZone); currentZone = z; }
      if (moved) { S.pos = { x: player.x, y: player.y }; posDirty = true; }
    }
    hearts = hearts.filter(function (h) { return now - h.t < 1200; });
    if (shake > 0) shake = Math.max(0, shake - dt);
  }

  function enterZone(z, prev) {
    if (!S.visited[z]) { S.visited[z] = 1; save(); }
    var zone = world.zones[z];
    var allZones = Object.keys(world.zones);
    if (allZones.every(function (k) { return S.visited[k]; })) unlockSecret('explorer');
    if (!zone) return;
    if (zone.type === 'room') {
      var q = zone.quest;
      showBanner(ui('station') + ' ' + q.station, t(q.room), t(q.tagline), q.color);
    } else if (zone.type === 'lounge' && prev) showBanner('', ui('lounge'), '', '#D8B664');
    else if (zone.type === 'lobby' && prev) showBanner('', ui('lobby'), '', '#21076C');
  }

  /* =================================================================
     RENDER
     ================================================================= */
  function render(now) {
    var c = ctx;
    var k = V.scale * V.dpr;
    // camera
    var tx, ty;
    if (mode === 'title' || mode === 'setup') {
      var tt = now / 1000;
      tx = (world.W * T) / 2 + Math.sin(tt * 0.07) * world.W * T * 0.32 - V.w / V.scale / 2;
      ty = (world.H * T) / 2 + Math.sin(tt * 0.11) * world.H * T * 0.25 - V.h / V.scale / 2;
      cam.x = tx; cam.y = ty;
    } else {
      tx = player.x * T - V.w / V.scale / 2; ty = (player.y - 0.6) * T - V.h / V.scale / 2;
      var f = 1 - Math.exp(-dtLast * 7);
      cam.x += (tx - cam.x) * f; cam.y += (ty - cam.y) * f;
    }
    var vwW = V.w / V.scale, vhW = V.h / V.scale, mapW = world.W * T, mapH = world.H * T;
    cam.x = vwW >= mapW ? (mapW - vwW) / 2 : Math.max(0, Math.min(mapW - vwW, cam.x));
    cam.y = vhW >= mapH ? (mapH - vhW) / 2 : Math.max(0, Math.min(mapH - vhW, cam.y));
    var sxs = shake > 0 ? (Math.random() - 0.5) * 6 * shake : 0, sys = shake > 0 ? (Math.random() - 0.5) * 6 * shake : 0;
    var cx = Math.round((cam.x + sxs) * k) / k, cy = Math.round((cam.y + sys) * k) / k;

    c.setTransform(1, 0, 0, 1, 0, 0);
    c.fillStyle = '#86BF66'; c.fillRect(0, 0, canvas.width, canvas.height);
    c.setTransform(k, 0, 0, k, -cx * k, -cy * k);
    c.imageSmoothingEnabled = true;

    // static chunks
    var c0 = Math.floor(cx / (CS * T)), c1 = Math.floor((cx + vwW) / (CS * T));
    var r0 = Math.floor(cy / (CS * T)), r1 = Math.floor((cy + vhW) / (CS * T));
    for (var gy = r0; gy <= r1; gy++) for (var gx = c0; gx <= c1; gx++) {
      if (gx < 0 || gy < 0 || gx * CS >= world.W || gy * CS >= world.H) continue;
      c.drawImage(getChunk(gx, gy), gx * CS * T, gy * CS * T, CS * T + 0.06, CS * T + 0.06);
    }
    // click marker
    if (clickMark && now - clickMark.t < 700) {
      var a = 1 - (now - clickMark.t) / 700;
      c.strokeStyle = 'rgba(216,182,100,' + a + ')'; c.lineWidth = 2;
      c.beginPath(); c.ellipse(clickMark.x * T, clickMark.y * T, 10 + (1 - a) * 8, 5 + (1 - a) * 4, 0, 0, 7); c.stroke();
    }
    // wall items that change (clocks)
    overProps.forEach(function (p) { c.save(); c.translate(p.x * T, p.y * T); WD.painters[p.kind](c, p, now, null); c.restore(); });

    // y-sorted props and characters
    var list = [];
    var vx0 = cx / T - 3, vx1 = (cx + vwW) / T + 3, vy0 = cy / T - 2, vy1 = (cy + vhW) / T + 5;
    for (var i = 0; i < standProps.length; i++) {
      var p = standProps[i];
      if (p.x + p.w < vx0 || p.x > vx1 || p.y + p.h < vy0 || p.y - 4 > vy1) continue;
      list.push({ y: p.y + p.h, id: p.id, p: p });
    }
    if (mode !== 'title') {
      list.push({ y: player.y, id: 100000, ch: 'player' });
      list.push({ y: leo.y, id: 100001, ch: 'leo' });
    }
    npcs.forEach(function (n, j) { list.push({ y: n.y, id: 100002 + j, ch: 'npc', n: n }); });
    list.sort(function (a, b) { return a.y - b.y || a.id - b.id; });
    var blink = (now % 3900) < 120;
    list.forEach(function (it) {
      if (it.p) {
        var pp = it.p;
        if (pp.anim || WD.DYNAMIC[pp.kind]) { c.save(); c.translate(pp.x * T, pp.y * T); WD.painters[pp.kind](c, pp, now, propState(pp)); c.restore(); }
        else { var s = getSprite(pp); c.drawImage(s.cv, s.ox * T, s.oy * T, s.w * T, s.h * T); }
      } else if (it.ch === 'player') drawCharacter(c, player.x * T, player.y * T, player.look, player.dir, player.phase, player.moving, now, blink);
      else if (it.ch === 'leo') drawLeo(c, leo.x * T, leo.y * T, leo.dir, leo.phase, leo.moving, leo.state, now);
      else if (it.ch === 'npc') drawCharacter(c, it.n.x * T, it.n.y * T, it.n.look, it.n.dir, 0, false, now + it.id * 777, (now + it.id * 1300) % 4700 < 120);
    });

    // quest markers and sparkles
    world.rooms.forEach(function (z) {
      var kp = z.kiosk, mx = (kp.x + kp.w / 2) * T, my = kp.y * T;
      if (mx < cx - 60 || mx > cx + vwW + 60 || my < cy - 160 || my > cy + vhW + 60) return;
      var done = questDone(z.quest);
      for (var s2 = 0; s2 < 6; s2++) {
        var ph = ((now / 1000) * 0.45 + s2 / 6) % 1;
        var sx2 = mx + Math.sin(s2 * 2.3 + now / 900) * 22, sy2 = my - 6 - ph * 60;
        c.globalAlpha = (1 - ph) * 0.8; H.circle(c, sx2, sy2, 1.6, done ? '#D8B664' : z.quest.color); c.globalAlpha = 1;
      }
      if (!done) {
        var bob = Math.sin(now / 260) * 3, by = my - 100 + bob;
        H.circle(c, mx, by + 2, 9, 'rgba(30,16,60,0.25)');
        H.circle(c, mx, by, 9, '#D8B664');
        c.strokeStyle = '#FFFFFF'; c.lineWidth = 1.5; c.beginPath(); c.arc(mx, by, 9, 0, 7); c.stroke();
        H.text(c, '!', mx, by + 0.5, 13, '#21076C', 900);
      }
    });
    // coffee boost: little dust puffs behind the player
    if (boosted(now) && player.moving && mode === 'play') {
      var bx = player.dir === 'left' ? 1 : player.dir === 'right' ? -1 : 0, by = player.dir === 'up' ? 1 : player.dir === 'down' ? -1 : 0;
      for (var pf = 0; pf < 4; pf++) {
        var pph = ((now / 260) + pf / 4) % 1;
        c.globalAlpha = (1 - pph) * 0.55;
        H.circle(c, player.x * T + bx * (6 + pph * 16) + Math.sin(pf * 2.1) * 4, player.y * T - 2 + by * (4 + pph * 12) - pph * 6, 2.5 + pph * 3.5, '#FFFFFF');
      }
      c.globalAlpha = 1;
    }
    // hearts from patting Leo
    hearts.forEach(function (h) {
      var a = (now - h.t) / 1200;
      c.globalAlpha = 1 - a; H.text(c, '♥', h.x * T + Math.sin(a * 8) * 4, (h.y - a * 1.2) * T, 12, '#E0567A', 900); c.globalAlpha = 1;
    });
    if (leo.state === 'sleep') {
      for (var z2 = 0; z2 < 3; z2++) {
        var ph2 = ((now / 1600) + z2 / 3) % 1;
        c.globalAlpha = 1 - ph2; H.text(c, 'z', leo.x * T + 10 + ph2 * 10, leo.y * T - 22 - ph2 * 22, 7 + ph2 * 5, '#21076C', 800); c.globalAlpha = 1;
      }
    }
    // interaction pointer
    if (near && mode === 'play' && !paused) {
      var r = near.rect, px = (r.x + r.w / 2) * T, py;
      if (near.type === 'prop') { var top = near.p.layer === 'stand' ? Math.max(near.p.top || 0, WD.KIND_TOP[near.p.kind] || 0) : 0; py = (r.y - top) * T - 8; if (near.p.kind === 'kiosk') py -= 8; }
      else py = (r.y - (near.type === 'leo' ? 0.9 : 1.35)) * T;
      py += Math.sin(now / 180) * 2.5;
      c.fillStyle = '#FFFFFF'; c.strokeStyle = '#21076C'; c.lineWidth = 1.5;
      c.beginPath(); c.moveTo(px - 6, py - 7); c.lineTo(px + 6, py - 7); c.lineTo(px, py); c.closePath(); c.fill(); c.stroke();
    }
    positionBubbles();
  }

  /* =================================================================
     MINIMAP & MAP
     ================================================================= */
  var mini = $('#minimap'), miniCtx = mini.getContext('2d'), miniBase = null;
  function zoneColor(z) {
    var zone = world.zones[z];
    if (!zone) return '#CFC6E2';
    if (zone.type === 'room') return H.mix(zone.quest.color, '#FFFFFF', 0.45);
    if (zone.type === 'lounge') return '#F2DDB0';
    if (zone.type === 'corridor') return '#E9E3F4';
    return '#DCD3F0';
  }
  function drawMapBase(cv, px) {
    cv.width = world.W * px; cv.height = world.H * px;
    var c = cv.getContext('2d');
    c.fillStyle = '#9CCB7F'; c.fillRect(0, 0, cv.width, cv.height);
    for (var y = 0; y < world.H; y++) for (var x = 0; x < world.W; x++) {
      var tt = world.get(x, y);
      if (tt === WD.TILE.OUT) continue;
      c.fillStyle = tt === WD.TILE.WALL ? '#3F3170' : zoneColor(world.zoneOf[world.idx(x, y)]);
      c.fillRect(x * px, y * px, px, px);
    }
    return c;
  }
  function drawMiniBase() {
    miniBase = document.createElement('canvas');
    drawMapBase(miniBase, 3);
  }
  function drawMini(now) {
    if (!miniBase || mode !== 'play') return;
    var L = world.L, x0 = (L.x0 - 1) * 3, y0 = (L.y0 - 1) * 3, w = (world.W - 2 * L.OUT + 2) * 3, h = (world.H - 2 * L.OUT + 2) * 3;
    var dpr = V.dpr, cssW = 190, cssH = Math.round(cssW * h / w);
    var pw = Math.round(cssW * dpr);
    if (mini.width !== pw) { mini.width = pw; mini.height = Math.round(cssH * dpr); mini.style.width = cssW + 'px'; mini.style.height = cssH + 'px'; }
    var c = miniCtx, sc = mini.width / w;
    c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, mini.width, mini.height);
    c.imageSmoothingEnabled = false;
    c.drawImage(miniBase, x0, y0, w, h, 0, 0, mini.width, mini.height);
    c.setTransform(sc, 0, 0, sc, -x0 * sc, -y0 * sc);
    world.rooms.forEach(function (z) {
      var kx = (z.kiosk.x + 1) * 3, ky = (z.kiosk.y + 0.5) * 3;
      H.circle(c, kx, ky, 3.4, questDone(z.quest) ? '#D8B664' : z.quest.color);
      c.fillStyle = '#FFFFFF'; c.font = '800 4px ' + WD.FONT; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(questDone(z.quest) ? '✓' : String(z.quest.station), kx, ky + 0.3);
    });
    H.circle(c, leo.x * 3, leo.y * 3, 1.8, '#B8652A');
    var pulse = 2.2 + Math.sin(now / 200) * 0.5;
    H.circle(c, player.x * 3, player.y * 3, pulse + 1, '#FFFFFF'); H.circle(c, player.x * 3, player.y * 3, pulse, '#E5333A');
  }
  mini.addEventListener('click', function () { openMap(); });

  /* =================================================================
     UI: HUD
     ================================================================= */
  var hud = $('#hud');
  function buildHUD() {
    hud.innerHTML =
      '<div class="hud-me" role="group">' +
      '<canvas class="hud-avatar" width="96" height="96" aria-hidden="true"></canvas>' +
      '<div class="hud-me-text"><b class="hud-name"></b><div class="hud-badges"></div></div>' +
      '</div>' +
      '<div class="hud-actions">' +
      hudBtn('quests', 'quests', 'Q') + hudBtn('badges', 'badges', 'B') + hudBtn('map', 'map', 'M') +
      '<button class="hud-btn hud-lang" data-act="lang" type="button" aria-label="' + uiH('langLabel') + '">' + icon('globe') + '<span>' + (PD.lang === 'ar' ? 'English' : 'العربية') + '</span></button>' +
      '<button class="hud-btn icon-only" data-act="sound" type="button" aria-label="' + uiH('sound') + '">' + icon(S.sound ? 'sound-on' : 'sound-off') + '</button>' +
      '<button class="hud-btn icon-only" data-act="help" type="button" aria-label="' + uiH('help') + '">' + icon('help') + '</button>' +
      '</div>';
    mini.title = ui('map');
    updateHUD();
  }
  function hudBtn(act, ic, key) {
    return '<button class="hud-btn" data-act="' + act + '" type="button" aria-label="' + uiH(act) + '" title="' + uiH(act) + ' (' + key + ')">' + icon(ic) + '<span aria-hidden="true">' + uiH(act) + '</span><kbd aria-hidden="true">' + key + '</kbd></button>';
  }
  hud.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]'); if (!b) return;
    if (e.detail) b.blur();
    Sound.init(); Sound.play('blip');
    var a = b.getAttribute('data-act');
    if (a === 'quests') openQuestLog();
    if (a === 'badges') openBadges();
    if (a === 'map') openMap();
    if (a === 'help') openHelp();
    if (a === 'lang') setLang(PD.lang === 'ar' ? 'en' : 'ar');
    if (a === 'sound') { S.sound = !S.sound; save(); keepFocus(hud, buildHUD); }
  });
  function updateHUD() {
    var name = $('.hud-name', hud); if (!name) return;
    name.textContent = S.name || '';
    var n = badgeCount();
    $('.hud-badges', hud).innerHTML = PD.quests.map(function (q) {
      var d = questDone(q);
      return '<span class="mini-badge' + (d ? ' on' : '') + '" title="' + esc(t(q.badge.name)) + '">' + badgeSVG(stationBadgeDef(q), !d) + '</span>';
    }).join('') + '<span class="hud-count">' + esc(ui('badgeCount', { d: n, n: PD.quests.length })) + '</span>';
    var av = $('.hud-avatar', hud);
    if (av) drawAvatar(av, player.look, 'down', 0, true);
  }
  // bust = head and shoulders (HUD, portraits); otherwise the whole body
  function drawAvatar(cv, look, dir, now, bust) {
    var c = cv.getContext('2d');
    c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, cv.width, cv.height);
    var span = bust ? 26 : 50, s = cv.width / span;
    c.setTransform(s, 0, 0, s, 0, 0);
    if (bust) drawCharacter(c, 13, 44, look, 'down', 0, false, 0, false);
    else drawCharacter(c, 25, 47, look, dir || 'down', now ? now / 90 : 0, !!now, now || 0, false);
  }

  /* ---------------- prompt pill ---------------- */
  var promptEl = $('#prompt'), lastPrompt = '';
  function updatePrompt() {
    var txt = (near && mode === 'play' && !paused) ? targetLabel(near) : '';
    if (txt === lastPrompt) return;
    lastPrompt = txt;
    if (!txt) { promptEl.classList.remove('on'); return; }
    promptEl.innerHTML = '<kbd>E</kbd><span>' + esc(txt) + '</span>';
    promptEl.classList.add('on');
  }
  promptEl.addEventListener('click', function (e) { if (e.detail) promptEl.blur(); if (near) interact(near); });

  /* ---------------- banner ---------------- */
  var bannerEl = $('#banner'), bannerTimer = null;
  function showBanner(eyebrow, title, sub, color) {
    bannerEl.style.setProperty('--bc', color || '#21076C');
    bannerEl.innerHTML = (eyebrow ? '<div class="banner-eyebrow">' + esc(eyebrow) + '</div>' : '') + '<div class="banner-title">' + esc(title) + '</div>' + (sub ? '<div class="banner-sub">' + esc(sub) + '</div>' : '');
    bannerEl.classList.remove('on'); void bannerEl.offsetWidth; bannerEl.classList.add('on');
    clearTimeout(bannerTimer); bannerTimer = setTimeout(function () { bannerEl.classList.remove('on'); }, 3200);
  }

  /* ---------------- speech bubble over Leo ---------------- */
  var bubbleEl = $('#bubble'), bubbleUntil = 0;
  function bubble(text, ms) {
    bubbleEl.textContent = text;
    bubbleEl.classList.add('on');
    bubbleUntil = performance.now() + (ms || 3000);
  }
  function positionBubbles() {
    if (!bubbleEl.classList.contains('on')) return;
    if (performance.now() > bubbleUntil || mode !== 'play') { bubbleEl.classList.remove('on'); return; }
    var sx = (leo.x * T - cam.x) * V.scale, sy = ((leo.y - 1.25) * T - cam.y) * V.scale;
    bubbleEl.style.transform = 'translate(' + Math.round(sx) + 'px,' + Math.round(sy) + 'px) translate(-50%,-100%)';
  }

  /* ---------------- toasts ---------------- */
  var toastsEl = $('#toasts');
  function toast(html, ms) {
    var d = document.createElement('div'); d.className = 'toast'; d.innerHTML = html;
    toastsEl.appendChild(d);
    requestAnimationFrame(function () { d.classList.add('on'); });
    setTimeout(function () { d.classList.remove('on'); setTimeout(function () { d.remove(); }, 400); }, ms || 3000);
  }

  /* =================================================================
     UI: DIALOG (Leo, colleagues, objects)
     ================================================================= */
  var dialogEl = $('#dialog');
  var dialog = {
    open: false, lines: [], i: 0, opts: null, typing: false, full: '', timer: null,
    start: function (lines, opts) {
      this.lines = lines; this.i = 0; this.opts = opts || {}; this.open = true; paused = true;
      show(dialogEl); dialogEl.classList.add('on');
      var por = $('.dlg-portrait', dialogEl);
      dialogEl.classList.toggle('no-portrait', !this.opts.portrait);
      if (this.opts.portrait === 'leo') por.innerHTML = leoSVG(this.opts.expr || 'happy');
      else if (this.opts.portrait === 'npc') { por.innerHTML = '<canvas width="128" height="128"></canvas>'; drawAvatarPortrait($('canvas', por), this.opts.look); }
      else por.innerHTML = '';
      show($('.dlg-skip', dialogEl), lines.length > 1);
      this.show();
    },
    show: function () {
      var self = this, line = this.lines[this.i];
      var html = rich(line, { name: S.name });
      var txtEl = $('.dlg-text', dialogEl);
      $('.dlg-name', dialogEl).textContent = t(this.opts.name || PD.ui.leo);
      $('.dlg-skip', dialogEl).textContent = ui('skip');
      // the same character in both languages: bidi mirroring points it the right way in RTL
      $('.dlg-next', dialogEl).textContent = this.i < this.lines.length - 1 ? ui('next') + ' ›' : ui('close');
      if (this.opts.portrait === 'leo' && this.opts.exprs && this.opts.exprs[this.i]) $('.dlg-portrait', dialogEl).innerHTML = leoSVG(this.opts.exprs[this.i]);
      var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce) { txtEl.innerHTML = html; this.typing = false; return; }
      // type the text out while keeping markup intact
      txtEl.innerHTML = html;
      var walker = document.createTreeWalker(txtEl, NodeFilter.SHOW_TEXT), nodes = [], n;
      while ((n = walker.nextNode())) { nodes.push({ node: n, text: n.nodeValue }); n.nodeValue = ''; }
      var ni = 0, ci = 0, count = 0;
      this.typing = true;
      clearInterval(this.timer);
      this.timer = setInterval(function () {
        for (var step = 0; step < 2; step++) {
          if (ni >= nodes.length) { clearInterval(self.timer); self.typing = false; return; }
          var it = nodes[ni]; ci++; it.node.nodeValue = it.text.slice(0, ci);
          if (ci >= it.text.length) { ni++; ci = 0; }
        }
        if (self.opts.portrait === 'leo' && (count++ % 3 === 0)) Sound.play('voice');
      }, 22);
      this.finish = function () { clearInterval(self.timer); nodes.forEach(function (x) { x.node.nodeValue = x.text; }); self.typing = false; };
    },
    advance: function () {
      if (this.typing) { this.finish(); return; }
      Sound.play('blip');
      if (this.i < this.lines.length - 1) { this.i++; this.show(); return; }
      this.close();
    },
    close: function () {
      clearInterval(this.timer);
      this.open = false; dialogEl.classList.remove('on'); hide(dialogEl);
      paused = !!modal.open;
      var cb = this.opts && this.opts.onDone; this.opts = null;
      if (cb) cb();
    }
  };
  function say(lines, opts) { dialog.start(lines, opts); }
  dialogEl.addEventListener('click', function (e) {
    if (e.target.closest('.dlg-skip')) { dialog.i = dialog.lines.length - 1; dialog.typing = false; dialog.close(); return; }
    dialog.advance();
  });
  function drawAvatarPortrait(cv, look) { drawAvatar(cv, look, 'down', 0, true); }

  /* =================================================================
     UI: MODALS
     ================================================================= */
  var modalEl = $('#modal'), modalCard = $('.modal-card', modalEl);
  var modal = { open: null, render: null };
  function openModal(kind, renderFn, cls) {
    var wasOpen = !!modal.open;
    modal.open = kind; modal.render = renderFn; modal.cls = cls || '';
    modalCard.className = 'modal-card ' + (cls || '');
    modalCard.onclick = null;
    renderFn(modalCard);
    show(modalEl);
    requestAnimationFrame(function () { modalEl.classList.add('on'); });
    paused = true; keys = {};
    if (!wasOpen) Sound.play('open');
    modalCard.focus({ preventScroll: true });
  }
  function closeModal(silent) {
    if (!modal.open) return;
    modal.open = null; modal.render = null;
    modalEl.classList.remove('on');
    setTimeout(function () { if (!modal.open) hide(modalEl); }, 180);
    paused = dialog.open || mode !== 'play';
    if (!silent) Sound.play('close');
    canvas.focus && canvas.focus();
  }
  function rerenderModal() {
    if (!modal.open || !modal.render) return;
    var sc = $('.scroll', modalCard), top = sc ? sc.scrollTop : 0;
    keepFocus(modalCard, function () { modal.render(modalCard); });
    var sc2 = $('.scroll', modalCard); if (sc2) sc2.scrollTop = top;
  }
  // Re-rendering replaces buttons; put keyboard focus back on the same control.
  var FOCUS_ATTRS = ['data-toggle', 'data-tab', 'data-how', 'data-opt', 'data-coop', 'data-next', 'data-claim', 'data-copy', 'data-k', 'data-v', 'data-act', 'data-q', 'data-open', 'data-walk', 'data-go-play', 'data-cert', 'data-lang', 'data-l'];
  function focusKey(el) {
    if (!el || !el.getAttribute || !window.CSS || !CSS.escape) return null;
    var parts = FOCUS_ATTRS.filter(function (a) { return el.hasAttribute(a); }).map(function (a) { return '[' + a + '="' + CSS.escape(el.getAttribute(a)) + '"]'; });
    return parts.length ? el.tagName.toLowerCase() + (el.classList[0] ? '.' + CSS.escape(el.classList[0]) : '') + parts.join('') : null;
  }
  function keepFocus(root, fn, fallback) {
    var a = document.activeElement, key = a && a !== root && root.contains(a) ? focusKey(a) : null;
    fn();
    if (!key) return;
    var el = root.querySelector(key) || (fallback && root.querySelector(fallback));
    if (el && !el.disabled) el.focus({ preventScroll: true });
  }
  modalEl.addEventListener('click', function (e) {
    if (e.target === modalEl || e.target.closest('[data-close]')) closeModal();
  });
  function closeTopLayer() {
    if (!$('#lightbox').hasAttribute('hidden')) { closeLightbox(); return true; }
    if (!$('#cert').hasAttribute('hidden')) { hide($('#cert')); return true; }
    if (awardEl.classList.contains('on')) { nextAward(); return true; }
    if (dialog.open) { dialog.close(); return true; }
    if (modal.open) { closeModal(); return true; }
    return false;
  }
  function closeBtn() { return '<button class="close-x" type="button" data-close aria-label="' + uiH('close') + '">' + (icon('close') || '×') + '</button>'; }

  /* ---------------- QUEST PANEL ---------------- */
  var questTab = {};
  function openQuest(q, tab) {
    var st = qs(q.id); st.seen = true; save();
    if (tab) questTab[q.id] = tab;
    if (!questTab[q.id]) questTab[q.id] = st.badge ? 'missions' : (missionsDone(q) ? 'missions' : 'briefing');
    openModal('quest:' + q.id, function (root) { renderQuest(root, q); }, 'quest');
  }
  function guideUrl(q, anchor) {
    var g = q.guide || '';
    var base = /^https?:/.test(g) ? g : (q.dir || '') + g;
    return base + (anchor || '');
  }
  function renderQuest(root, q) {
    var st = qs(q.id), tab = questTab[q.id] || 'briefing';
    var md = missionsDone(q), mt = q.missions.length, done = st.badge;
    var html = '<div class="qp" style="--qc:' + q.color + '">' +
      '<header class="qp-head">' +
      '<div class="qp-badge' + (done ? ' earned' : '') + '">' + badgeSVG(stationBadgeDef(q), !done) + '</div>' +
      '<div class="qp-titles"><div class="eyebrow">' + uiH('station') + ' ' + q.station + ' · ' + esc(t(q.room)) + '</div>' +
      '<h2>' + esc(t(q.title)) + '</h2><p class="qp-tag">' + esc(t(q.tagline)) + '</p>' +
      '<div class="chips"><span class="chip">⏱ ' + esc(t(q.time)) + '</span><span class="chip"><bdi>' + esc(t(q.tools)) + '</bdi></span>' + (done ? '<span class="chip gold">' + icon('check') + ' ' + uiH('questComplete') + '</span>' : '') + '</div></div>' +
      closeBtn() + '</header>' +
      '<nav class="tabs" role="tablist">' +
      tabBtn('briefing', ui('tabBriefing'), '1', tab) +
      tabBtn('missions', ui('tabMissions') + ' <span class="count">' + md + '/' + mt + '</span>', '2', tab) +
      tabBtn('quiz', ui('tabQuiz') + (st.quiz ? ' <span class="count ok">✓</span>' : ''), '3', tab) +
      '</nav><div class="scroll qp-body">';
    if (tab === 'briefing') html += renderBriefing(q, st);
    else if (tab === 'missions') html += renderMissions(q, st);
    else html += renderQuiz(q, st);
    html += '</div></div>';
    root.innerHTML = html;
    bindQuest(root, q);
  }
  function tabBtn(id, label, n, cur) {
    return '<button class="tab' + (cur === id ? ' on' : '') + '" role="tab" aria-selected="' + (cur === id) + '" data-tab="' + id + '" type="button"><span class="tab-n">' + n + '</span><span>' + label + '</span></button>';
  }
  function renderBriefing(q, st) {
    var h = '<div class="leo-says"><div class="portrait">' + leoSVG(q.theme === 'vault' ? 'wink' : 'happy') + '</div><div class="speech"><div class="speech-name">' + uiH('leo') + '</div>' +
      q.briefing.map(function (l) { return '<p>' + rich(l, { name: S.name }) + '</p>'; }).join('') + '</div></div>';
    var external = /^https?:/.test(q.guide);
    h += '<section class="goto"><div class="goto-pin">' + (icon('pin') || '📍') + '<span>' + q.station + '</span></div><div class="goto-main">' +
      '<div class="eyebrow">' + uiH('station') + ' ' + q.station + '</div>' +
      '<h3>' + uiH('goTo', { n: q.station }) + '</h3><p>' + uiH('goToText', { n: q.station }) + '</p>' +
      '<div class="btn-row"><a class="btn primary" href="' + esc(guideUrl(q)) + '" target="_blank" rel="noopener">' + (external && q.guideLabel ? esc(t(q.guideLabel)) : uiH('openGuide', { n: q.station })) + ' ' + icon('external') + '</a></div>' +
      (external ? '' : '<p class="small muted">' + uiH('guideNote') + '</p>') + '</div></section>';
    h += '<div class="grid2"><section class="card"><h4>' + icon('check') + ' ' + uiH('kit') + '</h4><ul class="kit">' +
      q.kit.map(function (k) { return '<li>' + rich(k) + '</li>'; }).join('') + '</ul>' +
      (q.theme !== 'vault' ? '<p class="tip vault-tip">' + (icon('lock') || '🔒') + '<span>' + uiH('privacyTip') + '</span></p>' : '') + '</section>' +
      '<section class="card"><h4>' + icon('external') + ' ' + uiH('usefulLinks') + '</h4><div class="link-list">' +
      q.links.map(function (l) { return '<a href="' + esc(l.url) + '" target="_blank" rel="noopener"><span>' + esc(t(l.label)) + '</span>' + icon('external') + '</a>'; }).join('') + '</div></section></div>';
    if (q.copy) {
      h += '<section class="copybox"><div class="copybox-head"><span class="eyebrow">' + esc(t(q.copy.label)) + '</span><button class="btn small" data-copy type="button">' + icon('copy') + ' <span>' + uiH('copy') + '</span></button></div><p class="copytext">' + esc(t(q.copy.text)) + '</p></section>';
    }
    h += '<div class="cta-row"><button class="btn primary big" data-tab="missions" type="button">' + uiH('startMissions') + ' <span class="arrow">' + (icon(PD.lang === 'ar' ? 'arrow-left' : 'arrow-right') || '→') + '</span></button></div>';
    return h;
  }
  function renderMissions(q, st) {
    var md = missionsDone(q), mt = q.missions.length;
    var h = '<div class="progress"><div class="bar"><i style="width:' + Math.round(md / mt * 100) + '%"></i></div><span dir="ltr">' + md + ' / ' + mt + '</span></div>' +
      '<p class="muted intro">' + uiH('missionsIntro') + '</p><ol class="missions">';
    q.missions.forEach(function (m, i) {
      var on = !!st.m[m.id];
      h += '<li class="mission' + (on ? ' done' : '') + '" data-m="' + m.id + '">' +
        '<button class="check" type="button" data-toggle="' + m.id + '" aria-pressed="' + on + '" aria-label="' + uiH('markDone') + '">' + (icon('check') || '✓') + '</button>' +
        '<div class="m-main"><div class="m-num">' + (i + 1) + '</div><h4>' + esc(t(m.title)) + '</h4><p>' + rich(m.goal) + '</p>' +
        '<button class="link-btn" type="button" data-how="' + m.id + '">' + uiH('showHow') + '</button>' +
        '<div class="how" hidden><ol class="steps">' + m.how.map(function (s) { return '<li>' + rich(s) + '</li>'; }).join('') + '</ol>' +
        (m.imgs && m.imgs.length ? '<div class="shots">' + m.imgs.map(function (src, k) { return '<button class="shot" type="button" data-shot="' + esc(m.id) + '" data-k="' + k + '"><img loading="lazy" src="' + esc((q.dir || '') + src) + '" alt=""></button>'; }).join('') + '</div>' : '') +
        (m.anchor || /^https?:/.test(q.guide) ? '<a class="guide-link" href="' + esc(guideUrl(q, m.anchor)) + '" target="_blank" rel="noopener">' + uiH('inGuide') + ' ' + icon('external') + '</a>' : '') +
        '</div></div>' +
        '<button class="done-btn" type="button" data-toggle="' + m.id + '">' + (on ? icon('check') + ' ' : '') + uiH('markDone') + '</button>' +
        '</li>';
    });
    h += '</ol>';
    h += '<section class="coop' + (st.coop ? ' done' : '') + '"><div class="coop-icon">' + badgeSVG({ icon: 'paw', color: '#C0392B', tier: 'secret' }, !st.coop) + '</div><div class="coop-main"><div class="eyebrow">' + uiH('coop') + '</div><p>' + rich(q.coop) + '</p><p class="small muted">' + uiH('coopNote') + '</p></div>' +
      '<button class="btn' + (st.coop ? ' gold' : '') + '" type="button" data-coop>' + (st.coop ? icon('check') + ' ' : '') + uiH('coopDone') + '</button></section>';
    h += '<div class="cta-row"><button class="btn primary big" data-tab="quiz" type="button">' + uiH('toQuiz') + ' <span class="arrow">' + (icon(PD.lang === 'ar' ? 'arrow-left' : 'arrow-right') || '→') + '</span></button></div>';
    return h;
  }
  var quizUI = {}; // per quest: { wrong: {i:true}, answered: bool }
  function renderQuiz(q, st) {
    var n = q.quiz.length;
    if (st.quiz) return renderQuizDone(q, st);
    var qi = Math.min(st.qi || 0, n - 1), item = q.quiz[qi], u = quizUI[q.id];
    if (!u || u.qi !== qi) u = quizUI[q.id] = { wrong: {}, answered: false, quip: null, qi: qi };
    var expr = u.answered ? 'proud' : (Object.keys(u.wrong).length ? 'think' : 'happy');
    var h = '<div class="quiz"><div class="quiz-top"><span class="eyebrow">' + uiH('question', { i: qi + 1, n: n }) + '</span><div class="dots">' +
      q.quiz.map(function (x, i) { return '<i class="' + (i < qi || (i === qi && u.answered) ? 'ok' : i === qi ? 'cur' : '') + '"></i>'; }).join('') + '</div></div>';
    if (qi === 0 && !u.answered && !Object.keys(u.wrong).length) h += '<p class="muted intro">' + uiH('quizIntro') + '</p>';
    h += '<div class="quiz-q"><div class="portrait">' + leoSVG(expr) + '</div><div class="q-bubble"><p>' + rich(item.q) + '</p></div></div><div class="options">';
    item.options.forEach(function (o, i) {
      var cls = 'opt';
      if (u.wrong[i]) cls += ' wrong';
      if (u.answered && i === item.answer) cls += ' right';
      h += '<button class="' + cls + '" type="button" data-opt="' + i + '"' + (u.wrong[i] || u.answered ? ' disabled' : '') + '><span class="letter">' + (PD.lang === 'ar' ? 'أبجدهو' : 'ABCDEF')[i] + '</span><span>' + rich(o) + '</span></button>';
    });
    h += '</div>';
    if (u.quip) {
      h += '<div class="feedback ' + (u.answered ? 'ok' : 'no') + '" role="status"><b>' + esc(t(PD.leo[u.quip.k][u.quip.i])) + '</b>' + (u.answered ? '<p>' + rich(item.why) + '</p><button class="btn primary" type="button" data-next>' + (qi < n - 1 ? uiH('nextQuestion') : uiH('quizPassed')) + ' ' + (icon(PD.lang === 'ar' ? 'arrow-left' : 'arrow-right') || '→') + '</button>' : '<p>' + uiH('tryAgain') + '</p>') + '</div>';
    }
    h += '</div>';
    return h;
  }
  function renderQuizDone(q, st) {
    var md = missionsDone(q), mt = q.missions.length;
    var h = '<div class="quiz-done"><div class="portrait big">' + leoSVG(st.badge ? 'proud' : 'wow') + '</div>';
    if (st.badge) {
      h += '<div class="earned-badge">' + badgeSVG(stationBadgeDef(q)) + '</div><div class="eyebrow">' + uiH('questComplete') + '</div><h3>' + esc(t(q.badge.name)) + '</h3><p>' + esc(t(q.done)) + '</p>';
    } else {
      h += '<div class="eyebrow">' + uiH('quizPassed') + '</div><h3>' + esc(t(q.badge.name)) + '</h3>';
      if (md >= mt) h += '<button class="btn primary big shine" type="button" data-claim>' + uiH('claim') + '</button>';
      else h += '<p>' + uiH('needMissions', { d: md, n: mt }) + '</p><button class="btn primary" type="button" data-tab="missions">' + uiH('tabMissions') + '</button>';
    }
    return h + '</div>';
  }
  function bindQuest(root, q) {
    var st = qs(q.id);
    root.onclick = function (e) {
      var b;
      if ((b = e.target.closest('[data-tab]'))) { questTab[q.id] = b.getAttribute('data-tab'); Sound.play('blip'); keepFocus(root, function () { renderQuest(root, q); }, '.tab.on'); var sc = $('.scroll', root); if (sc) sc.scrollTop = 0; return; }
      if ((b = e.target.closest('[data-toggle]'))) {
        var id = b.getAttribute('data-toggle'); st.m[id] = !st.m[id]; save();
        Sound.play(st.m[id] ? 'tick' : 'untick');
        rerenderModal();
        if (st.m[id]) { var li = $('[data-m="' + id + '"]', root); if (li) li.classList.add('pop'); }
        return;
      }
      if ((b = e.target.closest('[data-how]'))) {
        var how = b.nextElementSibling, open = how.hasAttribute('hidden');
        show(how, open); b.textContent = open ? ui('hideHow') : ui('showHow'); Sound.play('blip'); return;
      }
      if ((b = e.target.closest('[data-shot]'))) {
        var m = q.missions.filter(function (x) { return x.id === b.getAttribute('data-shot'); })[0];
        openLightbox(m.imgs.map(function (s) { return (q.dir || '') + s; }), +b.getAttribute('data-k'), t(m.title));
        return;
      }
      if (e.target.closest('[data-coop]')) {
        st.coop = !st.coop; save(); Sound.play(st.coop ? 'tick' : 'untick'); rerenderModal();
        if (st.coop) { var meta = checkMeta(); if (meta.length) { updateHUD(); showAwards(meta.map(function (m) { return { svg: badgeSVG({ icon: m.icon, color: m.color, tier: 'meta' }), name: t(m.name), flavor: t(m.flavor), line: t(m.how), expr: 'wow' }; })); } }
        return;
      }
      if ((b = e.target.closest('[data-copy]'))) {
        var txt = t(q.copy.text);
        copyText(txt).then(function () { $('span', b).textContent = ui('copied'); setTimeout(function () { var s = $('span', b); if (s) s.textContent = ui('copy'); }, 1800); });
        Sound.play('tick'); return;
      }
      if ((b = e.target.closest('[data-opt]'))) { answer(q, +b.getAttribute('data-opt'), root); return; }
      if (e.target.closest('[data-next]')) {
        var u = quizUI[q.id];
        if (st.qi < q.quiz.length - 1) { st.qi++; quizUI[q.id] = { wrong: {}, answered: false, quip: null, qi: st.qi }; }
        else { st.quiz = true; quizUI[q.id] = null; Sound.play('achieve'); }
        save(); Sound.play('blip'); renderQuest(root, q);
        var nf = $('.opt:not([disabled])', root) || $('[data-claim]', root) || $('.quiz-done [data-tab]', root); if (nf && document.activeElement === document.body) nf.focus({ preventScroll: true });
        return;
      }
      if (e.target.closest('[data-claim]')) { claimBadge(q); return; }
    };
  }
  function answer(q, i, root) {
    var st = qs(q.id), item = q.quiz[st.qi || 0], u = quizUI[q.id];
    if (u.answered) return;
    if (i === item.answer) {
      u.answered = true; u.quip = { k: 'correct', i: Math.floor(Math.random() * PD.leo.correct.length) };
      Sound.play('correct');
    } else {
      u.wrong[i] = true; u.quip = { k: 'wrong', i: Math.floor(Math.random() * PD.leo.wrong.length) };
      Sound.play('wrong');
    }
    renderQuest(root, q);
    var fb = $('.feedback', root); if (fb) fb.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    if (!u.answered) { var w = $('[data-opt="' + i + '"]', root); if (w) w.classList.add('shake'); }
    var nf = u.answered ? $('[data-next]', root) : $('.opt:not([disabled])', root);
    if (nf) nf.focus({ preventScroll: true });
  }
  function copyText(s) {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(s).catch(fallback);
    return fallback();
    function fallback() { var ta = document.createElement('textarea'); ta.value = s; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (e) { } ta.remove(); return Promise.resolve(); }
  }

  /* ---------------- QUEST LOG ---------------- */
  function openQuestLog() {
    openModal('log', function (root) {
      var h = '<div class="panel"><header class="panel-head"><div><div class="eyebrow">' + esc(PD.config.title) + '</div><h2>' + uiH('questLogTitle') + '</h2><p class="muted">' + uiH('questLogIntro') + '</p></div>' + closeBtn() + '</header><div class="scroll"><ul class="log">';
      PD.quests.forEach(function (q) {
        var st = S.q[q.id] || {}, md = missionsDone(q), mt = q.missions.length, d = questDone(q);
        var status = d ? 'complete' : (md || st.quiz || st.seen ? 'inProgress' : 'notStarted');
        h += '<li class="log-item ' + status + '" style="--qc:' + q.color + '"><div class="log-badge">' + badgeSVG(stationBadgeDef(q), !d) + '</div>' +
          '<div class="log-main"><div class="eyebrow">' + uiH('station') + ' ' + q.station + ' · ' + esc(t(q.room)) + '</div><h3>' + esc(t(q.title)) + '</h3>' +
          '<div class="log-meta"><span class="pill ' + status + '">' + uiH(status) + '</span><span class="muted">' + uiH('tabMissions') + ' ' + md + '/' + mt + '</span><span class="muted">⏱ ' + esc(t(q.time)) + '</span></div></div>' +
          '<div class="log-actions"><button class="btn small" type="button" data-walk="' + q.id + '">' + (icon('pin') || '') + ' ' + uiH('travel') + '</button><button class="btn small primary" type="button" data-open="' + q.id + '">' + uiH('openQuest') + '</button></div></li>';
      });
      h += '</ul></div></div>';
      root.innerHTML = h;
      root.onclick = function (e) {
        var b = e.target.closest('[data-open],[data-walk]'); if (!b) return;
        var id = b.getAttribute('data-open') || b.getAttribute('data-walk');
        var q = PD.quests.filter(function (x) { return x.id === id; })[0];
        if (b.hasAttribute('data-open')) openQuest(q); else travelToQuest(q);
      };
    }, 'wide');
  }

  /* ---------------- BADGE CASE ---------------- */
  function openBadges() {
    openModal('badges', function (root) {
      var n = badgeCount();
      var h = '<div class="panel"><header class="panel-head"><div><div class="eyebrow">' + esc(S.name || '') + '</div><h2>' + uiH('badgeCase') + '</h2><p class="muted">' + uiH('badgeCount', { d: n, n: PD.quests.length }) + '</p></div>' + closeBtn() + '</header><div class="scroll">';
      h += '<h3 class="sec-title">' + uiH('stationBadges') + '</h3><div class="badge-grid">';
      PD.quests.forEach(function (q) {
        var d = questDone(q);
        h += '<button class="badge-tile' + (d ? ' on' : '') + '" type="button" data-q="' + q.id + '"><div class="bt-img">' + badgeSVG(stationBadgeDef(q), !d) + '</div><b>' + esc(t(q.badge.name)) + '</b><span>' + (d ? esc(t(q.badge.flavor)) : uiH('station') + ' ' + q.station + ' · ' + uiH('locked')) + '</span></button>';
      });
      h += '</div><h3 class="sec-title">' + uiH('specialBadges') + '</h3><div class="badge-grid two">';
      PD.metaBadges.forEach(function (m) {
        var d = !!S.meta[m.id];
        h += '<div class="badge-tile meta' + (d ? ' on' : '') + '"><div class="bt-img">' + badgeSVG({ icon: m.icon, color: m.color, tier: 'meta' }, !d) + '</div><b>' + esc(t(m.name)) + '</b><span>' + esc(t(d ? m.flavor : m.how)) + '</span></div>';
      });
      h += '</div><h3 class="sec-title">' + uiH('secretBadges') + '</h3><div class="badge-grid small">';
      PD.secrets.forEach(function (s) {
        var d = !!S.secrets[s.id];
        h += '<div class="badge-tile secret' + (d ? ' on' : '') + '"><div class="bt-img">' + badgeSVG({ icon: s.icon, color: s.color, tier: 'secret' }, !d) + '</div><b>' + (d ? esc(t(s.name)) : '???') + '</b><span>' + (d ? esc(t(s.how)) : uiH('secretHidden')) + '</span></div>';
      });
      h += '</div><div class="cta-row"><button class="btn primary big" type="button" data-cert' + (n ? '' : ' disabled') + '>' + icon('print') + ' ' + uiH('certificate') + '</button></div></div></div>';
      root.innerHTML = h;
      root.onclick = function (e) {
        var b = e.target.closest('[data-q]');
        if (b) { openQuest(PD.quests.filter(function (x) { return x.id === b.getAttribute('data-q'); })[0]); return; }
        if (e.target.closest('[data-cert]')) openCertificate();
      };
    }, 'wide');
  }

  /* ---------------- MAP ---------------- */
  function openMap() {
    openModal('map', function (root) {
      root.innerHTML = '<div class="panel"><header class="panel-head"><div><h2>' + uiH('mapTitle') + '</h2><p class="muted">' + uiH('mapHint') + '</p></div>' + closeBtn() + '</header><div class="map-wrap"><canvas class="bigmap"></canvas></div></div>';
      var cv = $('.bigmap', root), L = world.L;
      var px = 14, x0 = L.x0 - 1, y0 = L.y0 - 1, w = world.W - 2 * L.OUT + 2, h = world.H - 2 * L.OUT + 2;
      var base = document.createElement('canvas'); drawMapBase(base, px);
      var dpr = V.dpr;
      cv.width = w * px * dpr; cv.height = h * px * dpr;
      var c = cv.getContext('2d');
      c.setTransform(dpr, 0, 0, dpr, -x0 * px * dpr, -y0 * px * dpr);
      c.drawImage(base, 0, 0);
      function label(txt, x, y, size, color, weight) { H.text(c, txt, x, y, size, color, weight || 800, 'center'); }
      world.rooms.forEach(function (z) {
        var q = z.quest, cx = (z.x + z.w / 2) * px, cy = (z.y + z.h / 2) * px;
        var d = questDone(q);
        H.circle(c, cx, cy - 10, 16, d ? '#D8B664' : q.color);
        c.strokeStyle = '#FFFFFF'; c.lineWidth = 3; c.beginPath(); c.arc(cx, cy - 10, 16, 0, 7); c.stroke();
        label(d ? '✓' : String(q.station), cx, cy - 9, 15, '#FFFFFF');
        label(t(q.room), cx, cy + 20, 13, '#21076C');
      });
      label(ui('lobby'), (L.lobbyX + L.LW / 2) * px, (L.yTop + 4) * px, 14, '#21076C');
      label(ui('lounge'), (L.loungeX + L.LGW / 2) * px, (L.yTop + 4) * px, 14, '#7A4A28');
      label(ui('corridor'), (world.zones.corridor.x + world.zones.corridor.w / 2) * px, (L.yCor + 3) * px, 12, '#6E6A80', 700);
      H.circle(c, player.x * px, player.y * px, 9, '#FFFFFF'); H.circle(c, player.x * px, player.y * px, 7, '#E5333A');
      label(ui('you'), player.x * px, player.y * px - 18, 12, '#E5333A');
      H.circle(c, leo.x * px, leo.y * px, 5, '#B8652A');
      cv.onclick = function (e) {
        var r = cv.getBoundingClientRect();
        var mx = (e.clientX - r.left) / r.width * w + x0, my = (e.clientY - r.top) / r.height * h + y0;
        var z = world.zoneAt(mx, my), zone = z && world.zones[z];
        if (!zone) return;
        if (zone.type === 'room') { travelToQuest(zone.quest); return; }
        closeModal();
        var gx = Math.floor(mx), gy = Math.floor(my);
        var p = findPath(Math.floor(player.x), Math.floor(player.y - 0.1), function (x, y) { return Math.abs(x - gx) <= 1 && Math.abs(y - gy) <= 1 && !world.isSolid(x, y); });
        if (p) { path = p; pendingTarget = null; }
      };
    }, 'wide map');
  }

  /* ---------------- HELP ---------------- */
  function openHelp() {
    openModal('help', function (root) {
      var rows = [['helpMove', 'helpMoveKeys'], ['helpAct', 'helpActKeys'], ['helpPanels', 'helpPanelsKeys'], ['helpClose', 'helpCloseKeys']];
      root.innerHTML = '<div class="panel"><header class="panel-head"><div><div class="eyebrow">' + esc(PD.config.title) + '</div><h2>' + uiH('helpTitle') + '</h2></div>' + closeBtn() + '</header><div class="scroll">' +
        '<div class="leo-says"><div class="portrait">' + leoSVG('wink') + '</div><div class="speech"><p>' + uiH('helpHow') + '</p></div></div>' +
        '<table class="keys">' + rows.map(function (r) { return '<tr><th>' + uiH(r[0]) + '</th><td>' + uiH(r[1]) + '</td></tr>'; }).join('') + '</table>' +
        '<div class="btn-row"><a class="btn" href="' + esc(PD.config.stationsPage) + '" target="_blank" rel="noopener">' + icon('book') + ' ' + uiH('allStations') + '</a>' +
        '<button class="btn" type="button" data-lang>' + icon('globe') + ' ' + (PD.lang === 'ar' ? 'English' : 'العربية') + '</button>' +
        '<button class="btn danger" type="button" data-reset>' + icon('refresh') + ' ' + uiH('reset') + '</button></div></div></div>';
      root.onclick = function (e) {
        if (e.target.closest('[data-lang]')) setLang(PD.lang === 'ar' ? 'en' : 'ar');
        if (e.target.closest('[data-reset]')) { if (window.confirm(ui('confirmReset'))) resetGame(); }
      };
    }, '');
  }
  function resetGame() {
    var lang = S.lang, sound = S.sound;
    S = fresh(); S.lang = lang; S.sound = sound;
    saveNow();
    location.reload();
  }

  /* ---------------- LIGHTBOX ---------------- */
  var lb = { imgs: [], i: 0 };
  function openLightbox(imgs, i, caption) {
    lb.imgs = imgs; lb.i = i; lb.caption = caption;
    var el = $('#lightbox'); show(el); renderLightbox();
  }
  function renderLightbox() {
    var el = $('#lightbox');
    el.innerHTML = '<figure><img src="' + esc(lb.imgs[lb.i]) + '" alt=""><figcaption>' + esc(lb.caption || '') + (lb.imgs.length > 1 ? ' · ' + (lb.i + 1) + '/' + lb.imgs.length : '') + '</figcaption></figure>' +
      (lb.imgs.length > 1 ? '<button class="lb-prev" type="button" aria-label="‹">' + (icon('arrow-left') || '‹') + '</button><button class="lb-next" type="button" aria-label="›">' + (icon('arrow-right') || '›') + '</button>' : '') + closeBtn();
  }
  function closeLightbox() { hide($('#lightbox')); }
  $('#lightbox').addEventListener('click', function (e) {
    if (e.target.closest('.lb-prev')) { lb.i = (lb.i - 1 + lb.imgs.length) % lb.imgs.length; renderLightbox(); return; }
    if (e.target.closest('.lb-next')) { lb.i = (lb.i + 1) % lb.imgs.length; renderLightbox(); return; }
    if (e.target.tagName !== 'IMG') closeLightbox();
  });

  /* ---------------- AWARDS ---------------- */
  var awardEl = $('#award'), awardQueue = [];
  function showAwards(list) { awardQueue = awardQueue.concat(list); if (!awardEl.classList.contains('on')) nextAward(true); }
  function nextAward(first) {
    if (!first) Sound.play('blip');
    var a = awardQueue.shift();
    if (!a) { awardEl.classList.remove('on'); hide(awardEl); paused = !!modal.open || dialog.open; return; }
    paused = true;
    awardEl.innerHTML = '<div class="rays"></div><div class="award-card"><div class="eyebrow">' + uiH('badgeEarned') + '</div><div class="award-badge">' + a.svg + '</div><h2>' + esc(a.name) + '</h2><p class="flavor">' + esc(a.flavor) + '</p>' +
      '<div class="leo-says compact"><div class="portrait">' + leoSVG(a.expr || 'proud') + '</div><div class="speech"><p>' + esc(a.line) + '</p></div></div>' +
      '<button class="btn primary big" type="button" data-award-ok>' + uiH('awesome') + '</button></div>';
    show(awardEl); awardEl.classList.remove('on'); void awardEl.offsetWidth; awardEl.classList.add('on');
    Sound.play('badge');
    confetti();
    var ok = $('[data-award-ok]', awardEl); if (ok) setTimeout(function () { ok.focus({ preventScroll: true }); }, 0);
  }
  awardEl.addEventListener('click', function (e) { if (e.target.closest('[data-award-ok]')) nextAward(); });

  /* ---------------- CONFETTI ---------------- */
  var confCv = $('#confetti'), confCtx = confCv.getContext('2d'), parts = [], confRunning = false;
  function confetti() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    confCv.width = innerWidth * V.dpr; confCv.height = innerHeight * V.dpr;
    var cols = ['#21076C', '#D8B664', '#2E9E6B', '#E5733A', '#D1477A', '#2F6FD6', '#7B4FD6', '#FFFFFF'];
    for (var i = 0; i < 160; i++) parts.push({ x: innerWidth / 2 + (Math.random() - 0.5) * 120, y: innerHeight * 0.42, vx: (Math.random() - 0.5) * 16, vy: -Math.random() * 15 - 4, r: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.4, s: 5 + Math.random() * 6, c: cols[i % cols.length], life: 0 });
    if (!confRunning) { confRunning = true; requestAnimationFrame(confStep); }
  }
  function confStep() {
    var c = confCtx; c.setTransform(V.dpr, 0, 0, V.dpr, 0, 0); c.clearRect(0, 0, innerWidth, innerHeight);
    parts.forEach(function (p) { p.vy += 0.38; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.life++; c.save(); c.translate(p.x, p.y); c.rotate(p.r); c.fillStyle = p.c; c.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); c.restore(); });
    parts = parts.filter(function (p) { return p.y < innerHeight + 30 && p.life < 400; });
    if (parts.length) requestAnimationFrame(confStep); else { confRunning = false; c.clearRect(0, 0, innerWidth, innerHeight); }
  }

  /* ---------------- CERTIFICATE ---------------- */
  function openCertificate() {
    var el = $('#cert');
    var earned = PD.quests.filter(questDone);
    var meta = PD.metaBadges.filter(function (m) { return S.meta[m.id]; });
    var date = new Date().toLocaleDateString(PD.lang === 'ar' ? 'ar-AE-u-nu-latn' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    el.innerHTML = '<div class="cert-toolbar"><button class="btn primary" type="button" data-print>' + icon('print') + ' ' + uiH('print') + '</button>' + closeBtn() + '</div>' +
      '<div class="cert-page" dir="' + (PD.lang === 'ar' ? 'rtl' : 'ltr') + '"><div class="cert-inner">' +
      '<div class="cert-top"><span class="cert-aisa">AISA</span><span class="cert-school">' + esc(t(PD.config.school)) + '</span></div>' +
      '<div class="cert-leo">' + leoSVG('proud') + '</div>' +
      '<div class="eyebrow">' + esc(PD.config.title) + ' · ' + esc(t(PD.config.dates)) + '</div>' +
      '<h1>' + uiH('certTitle') + '</h1><p class="cert-line">' + uiH('certLine') + '</p><div class="cert-name">' + esc(S.name || '') + '</div>' +
      '<p class="cert-body">' + uiH('certBody') + '</p>' +
      '<div class="cert-badges">' + earned.map(function (q) { return '<div><div class="cb-img">' + badgeSVG(stationBadgeDef(q)) + '</div><span>' + esc(t(q.badge.name)) + '</span></div>'; }).join('') +
      meta.map(function (m) { return '<div><div class="cb-img">' + badgeSVG({ icon: m.icon, color: m.color, tier: 'meta' }) + '</div><span>' + esc(t(m.name)) + '</span></div>'; }).join('') + '</div>' +
      '<div class="cert-foot"><div><span class="sig">' + uiH('leo') + '</span><small>' + uiH('certSign') + '</small></div><div><span class="date">' + esc(date) + '</span><small>' + uiH('certTeam') + '</small></div></div>' +
      '</div></div>';
    show(el);
    el.onclick = function (e) {
      if (e.target.closest('[data-print]')) window.print();
      if (e.target.closest('[data-close]')) hide(el);
    };
  }

  /* =================================================================
     LANGUAGE SWITCH
     ================================================================= */
  function setLang(l) {
    PD.lang = l === 'ar' ? 'ar' : 'en';
    S.lang = PD.lang; save();
    document.documentElement.lang = PD.lang;
    document.documentElement.dir = PD.lang === 'ar' ? 'rtl' : 'ltr';
    document.title = PD.config.title + ' · ' + (PD.lang === 'ar' ? 'رحلة AISA' : 'AISA');
    clearCaches();
    keepFocus(titleEl, renderTitle); renderSetup();
    if (mode === 'play') { keepFocus(hud, buildHUD); lastPrompt = '#'; }
    rerenderModal();
    if (dialog.open) dialog.show();
    if (!$('#cert').hasAttribute('hidden')) openCertificate();
  }

  /* =================================================================
     TITLE & SETUP SCREENS
     ================================================================= */
  var titleEl = $('#screen-title'), setupEl = $('#screen-setup');
  function renderTitle() {
    var hasSave = !!S.name;
    var parts = PD.config.title.split(' ');
    titleEl.innerHTML =
      '<div class="title-inner">' +
      '<div class="title-top"><span class="aisa-mark">AISA</span><div class="seg" role="group" aria-label="' + uiH('langLabel') + '">' +
      '<button type="button" data-l="en" class="' + (PD.lang === 'en' ? 'on' : '') + '" lang="en">English</button><button type="button" data-l="ar" class="' + (PD.lang === 'ar' ? 'on' : '') + '" lang="ar">العربية</button></div></div>' +
      '<div class="title-hero"><div class="title-leo">' + leoSVG('happy') + '</div>' +
      '<div class="title-text"><div class="eyebrow">' + esc(t(PD.config.subtitle)) + '</div>' +
      '<h1 class="logo"><span class="logo-a">' + esc(parts[0]) + '</span> <span class="logo-b">' + esc(parts.slice(1).join(' ')) + '</span></h1>' +
      '<p class="title-sub">' + uiH('pressStart') + ' · ' + esc(t(PD.config.dates)) + '</p>' +
      '<div class="title-badges">' + PD.quests.map(function (q, i) { return '<span style="animation-delay:' + (i * 0.12) + 's">' + badgeSVG(stationBadgeDef(q)) + '</span>'; }).join('') + '</div>' +
      '<div class="title-cta">' + (hasSave ? '<button class="btn primary big" type="button" data-go="continue">' + uiH('continue') + (S.name ? ' · ' + esc(S.name) : '') + '</button><button class="btn ghost" type="button" data-go="new">' + uiH('newGame') + '</button>' : '<button class="btn primary big" type="button" data-go="start">' + uiH('start') + ' ' + (icon(PD.lang === 'ar' ? 'arrow-left' : 'arrow-right') || '→') + '</button>') +
      '<button class="btn ghost icon-only" type="button" data-go="sound" aria-label="' + uiH('sound') + '">' + icon(S.sound ? 'sound-on' : 'sound-off') + '</button></div></div></div>' +
      '<div class="title-foot">' + uiH('footer') + ' · ' + esc(t(PD.config.school)) + '</div></div>';
  }
  titleEl.addEventListener('click', function (e) {
    var b = e.target.closest('[data-l],[data-go]'); if (!b) return;
    Sound.init();
    if (b.hasAttribute('data-l')) { setLang(b.getAttribute('data-l')); Sound.play('blip'); return; }
    var go = b.getAttribute('data-go');
    if (go === 'sound') { S.sound = !S.sound; save(); renderTitle(); Sound.play('blip'); return; }
    Sound.play('open');
    if (go === 'continue') startPlay(false);
    else if (go === 'new') { if (window.confirm(ui('confirmReset'))) resetGame(); }
    else openSetup();
  });

  var draft = null, setupAnim = null;
  function openSetup() {
    mode = 'setup';
    draft = JSON.parse(JSON.stringify(S.look || defaultLook));
    draft.name = S.name || '';
    titleEl.classList.add('out');
    setTimeout(function () { hide(titleEl); }, 350);
    show(setupEl); renderSetup();
    setTimeout(function () { var i = $('#setup-name'); if (i) i.focus(); }, 60);
  }
  function renderSetup() {
    if (!draft) return;
    var rows = [
      ['skin', SKINS.map(function (c, i) { return { v: i, sw: c }; })],
      ['hair', HAIRS.map(function (h) { return { v: h, label: t(PD.ui.hairStyles[h]) }; })],
      ['hairColor', HAIR_COLORS.map(function (c) { return { v: c, sw: c }; })],
      ['outfit', ['shirt', 'robe'].map(function (o) { return { v: o, label: t(PD.ui.outfits[o]) }; })],
      ['color', OUTFIT_COLORS.map(function (c) { return { v: c, sw: c }; })],
      ['glasses', [{ v: false, label: ui('no') }, { v: true, label: ui('yes') }]]
    ];
    var labels = { skin: 'skin', hair: 'hair', hairColor: 'hairColor', outfit: 'outfit', color: 'colour', glasses: 'glasses' };
    setupEl.innerHTML = '<div class="setup-card"><div class="setup-preview"><canvas id="setup-avatar" width="320" height="320" aria-hidden="true"></canvas><div class="setup-leo">' + leoSVG('wink') + '</div></div>' +
      '<div class="setup-form"><div class="eyebrow">' + esc(PD.config.title) + '</div><h2>' + uiH('setupTitle') + '</h2>' +
      '<label class="field"><span>' + uiH('nameLabel') + '</span><input id="setup-name" maxlength="20" autocomplete="given-name" placeholder="' + uiH('namePlaceholder') + '" value="' + esc(draft.name) + '"></label>' +
      '<p class="small muted">' + uiH('nameHint') + '</p>' +
      rows.map(function (r) {
        return '<div class="opt-row"><span class="opt-label">' + uiH(labels[r[0]]) + '</span><div class="opt-choices">' + r[1].map(function (o) {
          var on = draft[r[0]] === o.v;
          return '<button type="button" class="' + (o.sw ? 'sw' : 'tag') + (on ? ' on' : '') + '" data-k="' + r[0] + '" data-v="' + esc(JSON.stringify(o.v)) + '"' + (o.sw ? ' style="--sw:' + o.sw + '" aria-label="' + esc(o.sw) + '"' : '') + '>' + (o.label ? esc(o.label) : '') + '</button>';
        }).join('') + '</div></div>';
      }).join('') +
      '<div class="cta-row"><button class="btn primary big" type="button" data-go-play>' + uiH('letsGo') + ' ' + (icon(PD.lang === 'ar' ? 'arrow-left' : 'arrow-right') || '→') + '</button></div></div></div>';
    var input = $('#setup-name');
    input.addEventListener('input', function () { draft.name = input.value; input.classList.remove('err'); });
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') finishSetup(); });
    if (!setupAnim) {
      setupAnim = function (now) {
        if (mode !== 'setup') { setupAnim = null; return; }
        var cv = $('#setup-avatar');
        if (cv && draft) { var dirs = ['down', 'right', 'up', 'left']; drawAvatar(cv, draft, dirs[Math.floor(now / 1400) % 4], now); }
        requestAnimationFrame(setupAnim);
      };
      requestAnimationFrame(setupAnim);
    }
  }
  setupEl.addEventListener('click', function (e) {
    var b = e.target.closest('[data-k]');
    if (b) {
      draft[b.getAttribute('data-k')] = JSON.parse(b.getAttribute('data-v'));
      if (b.getAttribute('data-k') === 'hair' && (draft.hair === 'ghutra') && draft.hairColor !== '#FFFFFF') draft.hairColor = '#FFFFFF';
      if (b.getAttribute('data-k') === 'hair' && draft.hair === 'hijab' && draft.hairColor === '#FFFFFF') draft.hairColor = '#21076C';
      Sound.play('blip');
      var nm = draft.name; keepFocus(setupEl, renderSetup); var inp = $('#setup-name'); if (inp) inp.value = nm;
      return;
    }
    if (e.target.closest('[data-go-play]')) finishSetup();
  });
  function finishSetup() {
    var input = $('#setup-name');
    var name = (draft.name || '').trim().replace(/\s+/g, ' ');
    if (!name) { input.classList.add('err'); input.focus(); Sound.play('wrong'); return; }
    S.name = name.slice(0, 20);
    S.look = { skin: draft.skin, hair: draft.hair, hairColor: draft.hairColor, outfit: draft.outfit, color: draft.color, glasses: draft.glasses };
    player.look = S.look; save();
    hide(setupEl);
    startPlay(true);
  }

  function startPlay(isNew) {
    mode = 'play';
    titleEl.classList.add('out');
    setTimeout(function () { hide(titleEl); }, 350);
    hide(setupEl);
    show(hud); buildHUD();
    show(mini);
    cam.x = player.x * T - V.w / V.scale / 2; cam.y = (player.y - 0.6) * T - V.h / V.scale / 2;
    currentZone = world.zoneAt(player.x, player.y - 0.1);
    if (currentZone && !S.visited[currentZone]) { S.visited[currentZone] = 1; save(); }
    if (!S.introDone) {
      setTimeout(function () {
        Sound.play('roar');
        say(PD.leo.intro, {
          portrait: 'leo', exprs: ['wow', 'happy', 'wink', 'proud', 'happy'], name: PD.ui.leo,
          onDone: function () {
            S.introDone = true; save();
            showBanner('', t(PD.config.title), ui('roomQuest'), '#21076C');
          }
        });
      }, 450);
    } else {
      paused = false;
      setTimeout(function () { bubble(t(PD.leo.welcomeBack, { name: S.name }), 3800); }, 500);
    }
    if (isNew && !S.introDone) paused = true;
  }

  /* =================================================================
     MAIN LOOP
     ================================================================= */
  var dtLast = 0.016;
  function frame(now) {
    var dt = Math.min(0.05, (now - last) / 1000); last = now; dtLast = dt;
    update(dt, now);
    render(now);
    if (mode === 'play') { drawMini(now); updatePrompt(); updateBoost(now); }
    if (mode === 'play' && posDirty && Math.floor(now / 2000) !== Math.floor((now - dt * 1000) / 2000)) { posDirty = false; save(); }
    requestAnimationFrame(frame);
  }

  /* =================================================================
     BOOT
     ================================================================= */
  function boot() {
    var startLang = S.lang || ((navigator.language || '').toLowerCase().indexOf('ar') === 0 ? 'ar' : 'en');
    var urlLang = /[?&]lang=(ar|en)/.exec(location.search); if (urlLang) startLang = urlLang[1];
    PD.lang = startLang;
    setLang(startLang);
    resize();
    window.addEventListener('resize', function () { resize(); });
    hide(hud); hide(mini);
    show(titleEl);
    requestAnimationFrame(function (n) { last = n; requestAnimationFrame(frame); });
    // redraw canvas text once web fonts arrive
    if (document.fonts && document.fonts.ready) {
      Promise.all([document.fonts.load('800 16px "DM Sans"'), document.fonts.load('700 16px Cairo', 'ب')]).catch(function () { }).then(function () { clearCaches(); });
      document.fonts.ready.then(function () { clearCaches(); });
    }
    document.body.classList.add('ready');
  }
  boot();

  // a tiny debug hook for testing in the browser console
  PD.game = { S: function () { return S; }, player: player, world: world, cam: cam, V: V, openQuest: openQuest, setLang: setLang, claimBadge: claimBadge, boostLeft: function () { return Math.max(0, boostUntil - performance.now()); } };
})();
