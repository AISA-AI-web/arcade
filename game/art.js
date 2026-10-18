/* =====================================================================
   pD-Day 2026 · VECTOR ART
   ---------------------------------------------------------------------
   PD.art.leo(expr, opts)  -> SVG string  Leo the lion (AISA mascot)
       expr: 'happy' (default) | 'wink' | 'wow' | 'proud' | 'think' | 'sleepy'
       opts.roar: true -> wide open roaring mouth
   PD.art.badge(def, opts) -> SVG string  achievement emblem (no text)
       def: { icon, color, tier: 'station' | 'meta' | 'secret' }
       opts.locked: true -> grey "not yet earned" version
   PD.art.icon(name)       -> SVG string  24px line icon (currentColor)

   Every call returns fresh, self-contained markup. Gradient / clip ids
   get a unique suffix per call, so many copies can live on one page.
   ===================================================================== */
window.PD = window.PD || {};

(function () {
  'use strict';

  /* ---------- helpers ------------------------------------------------ */
  var SEED = Math.random().toString(36).slice(2, 6);
  var counter = 0;
  function nextId(prefix) {
    counter += 1;
    return 'pd' + prefix + SEED + counter;
  }
  function n(v) { return String(Math.round(v * 100) / 100); }
  function attrs(o) {
    var s = '';
    for (var k in o) if (o[k] !== undefined && o[k] !== null) s += ' ' + k + '="' + o[k] + '"';
    return s;
  }

  function parseHex(hex) {
    if (typeof hex !== 'string') return null;
    var h = hex.trim().replace(/^#/, '');
    if (/^[0-9a-f]{3}$/i.test(h)) h = h.charAt(0) + h.charAt(0) + h.charAt(1) + h.charAt(1) + h.charAt(2) + h.charAt(2);
    if (!/^[0-9a-f]{6}$/i.test(h)) return null;
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }
  function toHex(rgb) {
    return '#' + rgb.map(function (c) {
      var v = Math.max(0, Math.min(255, Math.round(c))).toString(16);
      return v.length < 2 ? '0' + v : v;
    }).join('');
  }
  function mix(a, b, t) {
    var x = parseHex(a), y = parseHex(b);
    return toHex([x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t]);
  }

  /* closed path of overlapping round lobes around a centre (mane, rims) */
  function lobeRing(cx, cy, R, count, lobeScale, rotDeg, wobble, largeArc) {
    var pts = [], i, a, r;
    for (i = 0; i < count; i++) {
      a = (rotDeg + i * 360 / count) * Math.PI / 180;
      r = R + (wobble ? wobble[i % wobble.length] : 0);
      pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
    var d = 'M' + n(pts[0][0]) + ' ' + n(pts[0][1]);
    for (i = 0; i < count; i++) {
      var p = pts[i], q = pts[(i + 1) % count];
      var lr = Math.sqrt((q[0] - p[0]) * (q[0] - p[0]) + (q[1] - p[1]) * (q[1] - p[1])) / 2 * lobeScale;
      d += 'A' + n(lr) + ' ' + n(lr) + ' 0 ' + (largeArc === false ? 0 : 1) + ' 1 ' + n(q[0]) + ' ' + n(q[1]);
    }
    return d + 'Z';
  }

  /* n-point star */
  function starPath(cx, cy, R, r, points, rotDeg) {
    var d = '', i, a, rad;
    for (i = 0; i < points * 2; i++) {
      rad = i % 2 ? r : R;
      a = ((rotDeg || -90) + i * 180 / points) * Math.PI / 180;
      d += (i ? 'L' : 'M') + n(cx + rad * Math.cos(a)) + ' ' + n(cy + rad * Math.sin(a));
    }
    return d + 'Z';
  }

  /* four-point sparkle */
  function sparkle(cx, cy, r, fill, extra) {
    var k = r * 0.18;
    return '<path d="M' + n(cx) + ' ' + n(cy - r) +
      'Q' + n(cx + k) + ' ' + n(cy - k) + ' ' + n(cx + r) + ' ' + n(cy) +
      'Q' + n(cx + k) + ' ' + n(cy + k) + ' ' + n(cx) + ' ' + n(cy + r) +
      'Q' + n(cx - k) + ' ' + n(cy + k) + ' ' + n(cx - r) + ' ' + n(cy) +
      'Q' + n(cx - k) + ' ' + n(cy - k) + ' ' + n(cx) + ' ' + n(cy - r) + 'Z" fill="' + fill + '"' + (extra || '') + '/>';
  }

  /* polygon with rounded corners */
  function roundedPoly(pts, rad) {
    var d = '', len = pts.length;
    for (var i = 0; i < len; i++) {
      var p0 = pts[(i - 1 + len) % len], p1 = pts[i], p2 = pts[(i + 1) % len];
      var v1 = [p0[0] - p1[0], p0[1] - p1[1]], v2 = [p2[0] - p1[0], p2[1] - p1[1]];
      var l1 = Math.sqrt(v1[0] * v1[0] + v1[1] * v1[1]), l2 = Math.sqrt(v2[0] * v2[0] + v2[1] * v2[1]);
      var r1 = Math.min(rad, l1 / 2), r2 = Math.min(rad, l2 / 2);
      var a = [p1[0] + v1[0] / l1 * r1, p1[1] + v1[1] / l1 * r1];
      var b = [p1[0] + v2[0] / l2 * r2, p1[1] + v2[1] / l2 * r2];
      d += (i ? 'L' : 'M') + n(a[0]) + ' ' + n(a[1]) + 'Q' + n(p1[0]) + ' ' + n(p1[1]) + ' ' + n(b[0]) + ' ' + n(b[1]);
    }
    return d + 'Z';
  }
  function regularPoly(cx, cy, R, sides, rotDeg) {
    var pts = [];
    for (var i = 0; i < sides; i++) {
      var a = (rotDeg + i * 360 / sides) * Math.PI / 180;
      pts.push([cx + R * Math.cos(a), cy + R * Math.sin(a)]);
    }
    return pts;
  }

  /* =====================================================================
     1. LEO
     ===================================================================== */
  var L = {
    fur: '#E8B85C', furShade: '#D49E3F', furLight: '#F7E3B5',
    mane: '#B8652A', maneDark: '#8E4A1C', maneHi: '#D9822B',
    nose: '#5A2E1A', eye: '#2A1A12', ear: '#F2A7A0', blush: '#F08C6A',
    purple: '#21076C', gold: '#D8B664', brow: '#9A4F1F',
    mouth: '#5A2116', tongue: '#F27C7C'
  };
  var EXPRS = { happy: 1, wink: 1, wow: 1, proud: 1, think: 1, sleepy: 1 };

  var EL = [79, 98], ER = [121, 98];   // eye centres

  function stroke(d, color, w, extra) {
    return '<path d="' + d + '" fill="none" stroke="' + color + '" stroke-width="' + w +
      '" stroke-linecap="round" stroke-linejoin="round"' + (extra || '') + '/>';
  }

  function openEye(c, rx, ry, grad, big) {
    var x = c[0], y = c[1];
    var s = '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" fill="url(#' + grad + ')"/>';
    s += '<circle cx="' + n(x + rx * 0.3) + '" cy="' + n(y - ry * 0.36) + '" r="' + n(rx * (big ? 0.46 : 0.42)) + '" fill="#fff"/>';
    s += '<circle cx="' + n(x - rx * 0.34) + '" cy="' + n(y + ry * 0.4) + '" r="' + n(rx * 0.17) + '" fill="#fff" opacity=".85"/>';
    if (big) s += sparkle(x - rx * 0.28, y - ry * 0.45, rx * 0.22, '#fff', ' opacity=".9"');
    return s;
  }
  function happyArc(c, w) {     // closed, smiling eye  ^
    var x = c[0], y = c[1];
    return stroke('M' + n(x - w) + ' ' + n(y + 4) + 'Q' + x + ' ' + n(y - 9) + ' ' + n(x + w) + ' ' + n(y + 4), L.eye, 5);
  }

  function brows(kind, roar) {
    var c = L.brow, w = 4.6;
    if (roar) return stroke('M69 76Q79 77 88 83', c, w) + stroke('M112 83Q121 77 131 76', c, w);
    var d = {
      happy: ['M70 80Q78 74.5 87 78', 'M113 78Q122 74.5 130 80'],
      wink: ['M70 79Q78 73.5 87 77', 'M113 81Q122 79 130 83'],
      wow: ['M69 72Q78 64 87 70', 'M113 70Q122 64 131 72'],
      proud: ['M70 79Q78 73 87 77', 'M113 77Q122 73 130 79'],
      think: ['M70 82Q78 81.5 87 83', 'M113 74Q121 64 131 71'],
      sleepy: ['M70 81Q78 79.5 87 76', 'M113 76Q122 79.5 130 81']
    }[kind];
    return stroke(d[0], c, w) + stroke(d[1], c, w);
  }

  function eyes(kind, grad) {
    switch (kind) {
      case 'wink':
        return openEye(EL, 9, 11.5, grad) + happyArc(ER, 9);
      case 'wow':
        return openEye(EL, 10.5, 13, grad, true) + openEye(ER, 10.5, 13, grad, true);
      case 'proud':
        return happyArc(EL, 9.5) + happyArc(ER, 9.5);
      case 'think': {
        var s = '';
        [EL, ER].forEach(function (c) {
          s += '<ellipse cx="' + c[0] + '" cy="' + c[1] + '" rx="9.5" ry="11.5" fill="#FFFDF6" stroke="' + L.eye + '" stroke-width="2.2"/>';
          s += '<circle cx="' + (c[0] + 3.2) + '" cy="' + (c[1] - 3.6) + '" r="6.2" fill="' + L.eye + '"/>';
          s += '<circle cx="' + (c[0] + 5) + '" cy="' + (c[1] - 5.8) + '" r="2.2" fill="#fff"/>';
        });
        return s;
      }
      case 'sleepy': {
        var t = '';
        [EL, ER].forEach(function (c) {
          var x = c[0], y = c[1] + 2;
          t += '<path d="M' + (x - 9) + ' ' + y + 'A9 7.5 0 0 0 ' + (x + 9) + ' ' + y + 'Z" fill="' + L.eye + '"/>';
          t += '<circle cx="' + (x + 3.6) + '" cy="' + (y + 2.6) + '" r="1.8" fill="#fff" opacity=".85"/>';
          t += stroke('M' + (x - 10.5) + ' ' + (y + 0.8) + 'Q' + x + ' ' + (y - 2.4) + ' ' + (x + 10.5) + ' ' + (y + 0.8), L.eye, 3.8);
          t += stroke('M' + (x - 6) + ' ' + (y + 10.5) + 'Q' + x + ' ' + (y + 13) + ' ' + (x + 6) + ' ' + (y + 10.5), L.furShade, 2, ' opacity=".9"');
        });
        return t;
      }
      default:
        return openEye(EL, 9, 11.5, grad) + openEye(ER, 9, 11.5, grad);
    }
  }

  function mouth(kind, roar, clipId) {
    var M = L.mouth, philtrum = stroke('M100 120V126', L.nose, 3.2);
    var shape, tongue, extra = '';
    if (roar) {
      shape = 'M83 124Q91.5 129 100 125Q108.5 129 117 124Q117 152 100 152Q83 152 83 124Z';
      tongue = '<ellipse cx="100" cy="150" rx="13" ry="8" fill="' + L.tongue + '"/>';
      extra = '<path d="M87.5 126.5L93.5 127.5L90.5 135Z" fill="#fff" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/>' +
        '<path d="M112.5 126.5L106.5 127.5L109.5 135Z" fill="#fff" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/>';
      return philtrum + '<clipPath id="' + clipId + '"><path d="' + shape + '"/></clipPath>' +
        '<path d="' + shape + '" fill="' + M + '"/><g clip-path="url(#' + clipId + ')">' + tongue + '</g>' + extra +
        '<path d="' + shape + '" fill="none" stroke="' + L.nose + '" stroke-width="2.4" stroke-linejoin="round"/>';
    }
    switch (kind) {
      case 'wink':
        return '<path d="M103 129Q103 139.5 108.5 139.5Q114 139.5 114 129Z" fill="' + L.tongue + '" stroke="' + L.nose + '" stroke-width="2.2" stroke-linejoin="round"/>' +
          stroke('M108.5 131V135.5', '#D45F62', 1.6) +
          philtrum + stroke('M86 126Q93 133 100 126.5Q107 133 114 126', L.nose, 3.4);
      case 'wow':
        shape = 'M100 125.5C106 125.5 107.5 131 107.5 134C107.5 138.5 104 141 100 141C96 141 92.5 138.5 92.5 134C92.5 131 94 125.5 100 125.5Z';
        tongue = '<ellipse cx="100" cy="141" rx="6" ry="4.5" fill="' + L.tongue + '"/>';
        break;
      case 'proud':
        shape = 'M82 125Q91 130.5 100 126Q109 130.5 118 125Q116 146 100 146Q84 146 82 125Z';
        tongue = '<ellipse cx="100" cy="146" rx="11" ry="7" fill="' + L.tongue + '"/>';
        extra = '<path d="M87 127L93 128.2L90 133.5Z" fill="#fff" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/>' +
          '<path d="M113 127L107 128.2L110 133.5Z" fill="#fff" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/>';
        break;
      case 'think':
        return stroke('M100 120V125.5', L.nose, 3.2) + stroke('M90 132Q95 128 100 131Q105 134 111 129', L.nose, 3.4);
      case 'sleepy':
        shape = 'M100 127C104 127 105.5 130 105.5 132.5C105.5 135.5 103 137 100 137C97 137 94.5 135.5 94.5 132.5C94.5 130 96 127 100 127Z';
        tongue = '<ellipse cx="100" cy="137" rx="4.5" ry="3" fill="' + L.tongue + '"/>';
        break;
      default: // happy
        shape = 'M86 126Q93 131 100 126.5Q107 131 114 126Q112.5 142 100 142Q87.5 142 86 126Z';
        tongue = '<ellipse cx="100" cy="142" rx="9" ry="6" fill="' + L.tongue + '"/>';
    }
    return philtrum + '<clipPath id="' + clipId + '"><path d="' + shape + '"/></clipPath>' +
      '<path d="' + shape + '" fill="' + M + '"/><g clip-path="url(#' + clipId + ')">' + tongue + '</g>' + extra +
      '<path d="' + shape + '" fill="none" stroke="' + L.nose + '" stroke-width="2.4" stroke-linejoin="round"/>';
  }

  function leo(expr, opts) {
    opts = opts || {};
    var kind = EXPRS[expr] ? expr : 'happy';
    var id = nextId('L');
    var G = function (k) { return id + k; };
    var url = function (k) { return 'url(#' + id + k + ')'; };

    var defs =
      '<radialGradient id="' + G('mo') + '" gradientUnits="userSpaceOnUse" cx="100" cy="94" r="88">' +
        '<stop offset=".6" stop-color="' + L.mane + '"/><stop offset="1" stop-color="' + L.maneDark + '"/></radialGradient>' +
      '<radialGradient id="' + G('mi') + '" gradientUnits="userSpaceOnUse" cx="96" cy="86" r="76">' +
        '<stop offset=".55" stop-color="#CB7530"/><stop offset="1" stop-color="' + L.mane + '"/></radialGradient>' +
      '<radialGradient id="' + G('fc') + '" gradientUnits="userSpaceOnUse" cx="96" cy="84" r="66">' +
        '<stop offset="0" stop-color="#F3CA78"/><stop offset=".62" stop-color="' + L.fur + '"/><stop offset="1" stop-color="' + L.furShade + '"/></radialGradient>' +
      '<linearGradient id="' + G('ea') + '" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#EEC168"/><stop offset="1" stop-color="' + L.furShade + '"/></linearGradient>' +
      '<linearGradient id="' + G('sh') + '" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="' + L.furShade + '"/><stop offset="1" stop-color="' + L.fur + '"/></linearGradient>' +
      '<linearGradient id="' + G('sc') + '" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0" stop-color="#3B2196"/><stop offset=".5" stop-color="' + L.purple + '"/><stop offset="1" stop-color="#16044C"/></linearGradient>' +
      '<radialGradient id="' + G('ey') + '" cx=".5" cy=".8" r=".65">' +
        '<stop offset="0" stop-color="#70482E"/><stop offset=".6" stop-color="' + L.eye + '"/></radialGradient>' +
      '<radialGradient id="' + G('mz') + '" cx=".5" cy=".35" r=".7">' +
        '<stop offset="0" stop-color="#FFF4D8"/><stop offset="1" stop-color="' + L.furLight + '"/></radialGradient>';

    /* -- shoulders -- */
    var body = '<path d="M28 200C30 176 56 160 100 160C144 160 170 176 172 200Z" fill="' + url('sh') + '"/>' +
      stroke('M52 182Q57 191 56 200', L.furShade, 2.6, ' opacity=".9"') + stroke('M148 182Q143 191 144 200', L.furShade, 2.6, ' opacity=".9"');

    /* -- mane: dark back tufts peeking between warmer front tufts -- */
    var back = lobeRing(100, 95, 61, 12, 1.12, -75);
    var front = lobeRing(100, 95, 55, 12, 1.12, -90);
    var mane = '<path d="' + back + '" fill="' + L.maneDark + '" stroke="#6E3410" stroke-width="5" stroke-linejoin="round"/>' +
      '<path d="' + back + '" fill="' + url('mo') + '"/>' +
      '<path d="' + front + '" fill="' + url('mi') + '" stroke="#8E4A1C" stroke-width="1.2" stroke-opacity=".5"/>';
    // a shine stroke on each upper front tuft
    var hi = '';
    (function () {
      var R = 55, cnt = 12, half = Math.PI / cnt;
      var c2 = R * Math.sin(half), lr = c2 * 1.12, h = Math.sqrt(lr * lr - c2 * c2);
      var dist = R * Math.cos(half) + h, sr = lr * 0.62;
      for (var i = 0; i < cnt; i++) {
        var m = (-90 + (i + 0.5) * 360 / cnt) * Math.PI / 180;
        if (Math.sin(m) > 0.45) continue;
        var lx = 100 + dist * Math.cos(m), ly = 95 + dist * Math.sin(m);
        var a0 = m - 0.55, a1 = m + 0.55;
        hi += '<path d="M' + n(lx + sr * Math.cos(a0)) + ' ' + n(ly + sr * Math.sin(a0)) + 'A' + n(sr) + ' ' + n(sr) + ' 0 0 1 ' +
          n(lx + sr * Math.cos(a1)) + ' ' + n(ly + sr * Math.sin(a1)) + '" fill="none" stroke="' + L.maneHi + '" stroke-width="3" stroke-linecap="round" opacity="' +
          (Math.sin(m) < -0.3 ? 0.9 : 0.45) + '"/>';
      }
    })();
    // soft shadow of the head on the mane
    var shade = '<ellipse cx="100" cy="105" rx="60" ry="53" fill="' + L.maneDark + '" opacity=".3"/>';

    /* -- scarf (bandana): band + front flap, each with a gold trim -- */
    var bandD = 'M44 151Q100 177 156 151Q162.5 157.5 158.5 165Q100 190 41.5 165Q37.5 157.5 44 151Z';
    var flapD = 'M58 166Q100 183 142 166L105.5 196.5Q100 201 94.5 196.5Z';
    var scarf = '<path d="' + flapD + '" transform="translate(0 1.4)" fill="#14043F"/>' +
      '<path d="' + flapD + '" fill="' + L.gold + '"/>' +
      '<path d="' + flapD + '" transform="translate(0 -4.2)" fill="' + url('sc') + '"/>' +
      stroke('M80 183L95 195', '#5A3FC0', 2.2, ' opacity=".5"') +
      '<path d="' + bandD + '" transform="translate(0 1.4)" fill="#14043F"/>' +
      '<path d="' + bandD + '" fill="' + L.gold + '"/>' +
      '<path d="' + bandD + '" transform="translate(0 -3.6)" fill="' + url('sc') + '"/>' +
      stroke('M52 161Q74 171 90 174', '#5A3FC0', 2.4, ' opacity=".55"');

    /* -- ears -- */
    var ears = '';
    [[57, 59, -1], [143, 59, 1]].forEach(function (e) {
      ears += '<circle cx="' + e[0] + '" cy="' + e[1] + '" r="17.5" fill="' + url('ea') + '"/>' +
        '<circle cx="' + (e[0] - e[2] * 1) + '" cy="' + (e[1] + 1.5) + '" r="10" fill="' + L.ear + '"/>';
    });

    /* -- face -- */
    var cheekL = 'M62 104Q47 106 40 117Q46 116.5 49.5 118.5Q42 126 44 135Q49 130 54 130.5Q51.5 138 56.5 143.5Q62 135 72 132Z';
    var cheekR = 'M138 104Q153 106 160 117Q154 116.5 150.5 118.5Q158 126 156 135Q151 130 146 130.5Q148.5 138 143.5 143.5Q138 135 128 132Z';
    var face = '<path d="' + cheekL + '" fill="' + url('fc') + '"/><path d="' + cheekR + '" fill="' + url('fc') + '"/>' +
      '<ellipse cx="100" cy="101" rx="54" ry="48" fill="' + url('fc') + '"/>';
    // forehead fringe
    var fringe = '<path d="M82 56Q90 46.5 100 48Q110 46.5 118 56Q113.5 56 110.5 62.5Q106.5 55 100 59.5Q93.5 55 89.5 62.5Q86.5 56 82 56Z" fill="' + url('mi') + '"/>';

    var blush = '<ellipse cx="63" cy="119" rx="9.5" ry="5.8" fill="' + L.blush + '" opacity=".42"/>' +
      '<ellipse cx="137" cy="119" rx="9.5" ry="5.8" fill="' + L.blush + '" opacity=".42"/>';

    var muzzle = '<g fill="' + url('mz') + '">' +
      '<ellipse cx="100" cy="137" rx="14" ry="10"/>' +
      '<circle cx="88" cy="126" r="15"/><circle cx="112" cy="126" r="15"/></g>' +
      (opts.roar ? '<ellipse cx="100" cy="146" rx="18" ry="9" fill="' + L.furLight + '"/>' : '');
    var dots = '';
    [[80, 122], [76, 127.5], [82, 129], [120, 122], [124, 127.5], [118, 129]].forEach(function (p) {
      dots += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="1.5" fill="#C99A4E"/>';
    });

    var nose = '<path d="M89 111Q100 105 111 111Q111.5 116 104 120Q100 122.5 96 120Q88.5 116 89 111Z" fill="' + L.nose + '"/>' +
      '<ellipse cx="96" cy="111" rx="4" ry="2" fill="#fff" opacity=".45"/>';

    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%" aria-hidden="true" focusable="false">' +
      '<defs>' + defs + '</defs>' +
      body + mane + hi + shade + scarf + ears + face + fringe + blush + muzzle + dots +
      '<g class="leo-eyes">' + eyes(kind, G('ey')) + brows(kind, !!opts.roar) + '</g>' +
      '<g class="leo-mouth">' + mouth(kind, !!opts.roar, G('mc')) + '</g>' + nose +
      '</svg>';
  }

  /* =====================================================================
     2. BADGE ICONS — drawn in a 100x100 box. c.w = main (white),
        c.k = cream accent, c.a = cut-out colour (badge colour, darker)
     ===================================================================== */
  function sk(d, col, w, extra) {
    return '<path d="' + d + '" fill="none" stroke="' + col + '" stroke-width="' + w + '" stroke-linecap="round" stroke-linejoin="round"' + (extra || '') + '/>';
  }
  var ICONS = {
    levels: function (c) {
      return '<rect x="12" y="62" width="22" height="26" rx="4" fill="' + c.w + '"/>' +
        '<rect x="39" y="46" width="22" height="42" rx="4" fill="' + c.w + '"/>' +
        '<rect x="66" y="30" width="22" height="58" rx="4" fill="' + c.w + '"/>' +
        '<path d="' + starPath(77, 14, 11, 5, 5) + '" fill="' + c.k + '" stroke="' + c.k + '" stroke-width="2.5" stroke-linejoin="round"/>';
    },
    slides: function (c) {
      return sk('M50 66L30 92M50 66L70 92M50 66V88M50 16V9', c.w, 7) +
        '<rect x="10" y="15" width="80" height="54" rx="7" fill="' + c.w + '"/>' +
        '<rect x="22" y="44" width="10" height="14" rx="2" fill="' + c.a + '"/>' +
        '<rect x="37" y="36" width="10" height="22" rx="2" fill="' + c.a + '"/>' +
        '<rect x="52" y="28" width="10" height="30" rx="2" fill="' + c.a + '"/>' +
        '<rect x="67" y="22" width="10" height="36" rx="2" fill="' + c.a + '" opacity=".55"/>';
    },
    hook: function (c) {
      return '<circle cx="63" cy="19" r="8.5" fill="none" stroke="' + c.w + '" stroke-width="7"/>' +
        sk('M63 28V62A19.5 19.5 0 0 1 24 62V49', c.w, 9.5) +
        '<path d="M19 50L24 31L37.5 48.5H29V50Z" fill="' + c.w + '" stroke="' + c.w + '" stroke-width="3" stroke-linejoin="round"/>' +
        sk('M63 10.5V2', c.k, 4);
    },
    clapper: function (c) {
      var s = '<g transform="rotate(-16 14 42)"><rect x="12" y="27" width="76" height="14" rx="3" fill="' + c.w + '"/>';
      for (var i = 0; i < 4; i++) {
        var x = 22 + i * 18;
        s += '<path d="M' + x + ' 27H' + (x + 9) + 'L' + (x + 3) + ' 41H' + (x - 6) + 'Z" fill="' + c.a + '"/>';
      }
      s += '</g><rect x="12" y="45" width="76" height="43" rx="6" fill="' + c.w + '"/>';
      for (var j = 0; j < 4; j++) {
        var y = 21 + j * 18;
        s += '<path d="M' + y + ' 47H' + (y + 9) + 'L' + (y + 3) + ' 58H' + (y - 6) + 'Z" fill="' + c.a + '"/>';
      }
      s += sk('M24 70H62M24 79H48', c.a, 5, ' opacity=".55"') + '<circle cx="17" cy="42" r="4.5" fill="' + c.k + '"/>';
      return s;
    },
    code: function (c) {
      return sk('M33 27L12 50L33 73M67 27L88 50L67 73', c.w, 10) + sk('M57 20L43 80', c.k, 9);
    },
    vault: function (c) {
      return '<path d="M50 7L84 19V45C84 69 70 84 50 93C30 84 16 69 16 45V19Z" fill="' + c.w + '" stroke="' + c.w + '" stroke-width="4" stroke-linejoin="round"/>' +
        '<path d="M50 7L84 19V45C84 69 70 84 50 93Z" fill="' + c.k + '"/>' +
        '<circle cx="50" cy="42" r="10" fill="' + c.a + '"/>' +
        '<path d="M45 47L41 69H59L55 47Z" fill="' + c.a + '" stroke="' + c.a + '" stroke-width="3" stroke-linejoin="round"/>';
    },
    paw: function (c) {
      return '<path d="M50 50C63 50 78 65 78 77C78 87 69 91 60 89C56 88 53 87 50 87C47 87 44 88 40 89C31 91 22 87 22 77C22 65 37 50 50 50Z" fill="' + c.w + '"/>' +
        '<ellipse cx="20" cy="44" rx="8.5" ry="11" transform="rotate(-24 20 44)" fill="' + c.w + '"/>' +
        '<ellipse cx="38" cy="24" rx="9.5" ry="12.5" transform="rotate(-8 38 24)" fill="' + c.w + '"/>' +
        '<ellipse cx="62" cy="24" rx="9.5" ry="12.5" transform="rotate(8 62 24)" fill="' + c.w + '"/>' +
        '<ellipse cx="80" cy="44" rx="8.5" ry="11" transform="rotate(24 80 44)" fill="' + c.w + '"/>';
    },
    crown: function (c) {
      return '<path d="M15 74L19 32L36 52L50 23L64 52L81 32L85 74Z" fill="' + c.w + '" stroke="' + c.w + '" stroke-width="6" stroke-linejoin="round"/>' +
        '<rect x="12" y="72" width="76" height="16" rx="5" fill="' + c.k + '"/>' +
        '<circle cx="31" cy="80" r="4" fill="' + c.a + '"/><circle cx="50" cy="80" r="4.5" fill="' + c.a + '"/><circle cx="69" cy="80" r="4" fill="' + c.a + '"/>' +
        '<path d="M50 47L56 56L50 65L44 56Z" fill="' + c.a + '"/>' +
        '<circle cx="19" cy="29" r="6" fill="' + c.k + '"/><circle cx="50" cy="19" r="6.5" fill="' + c.k + '"/><circle cx="81" cy="29" r="6" fill="' + c.k + '"/>';
    },
    coffee: function (c) {
      return sk('M34 33C29 27 39 23 34 14M50 33C45 27 55 23 50 12M66 33C61 27 71 23 66 14', c.k, 6) +
        sk('M72 48H76A10.5 10.5 0 0 1 76 69H70', c.w, 7) +
        '<path d="M20 40H72V60C72 76 62 86 46 86C30 86 20 76 20 60Z" fill="' + c.w + '"/>' +
        '<path d="M46 72C46 72 36 66 36 60C36 56 40 54 43 55.5C44.5 56.3 46 58 46 58C46 58 47.5 56.3 49 55.5C52 54 56 56 56 60C56 66 46 72 46 72Z" fill="' + c.a + '"/>' +
        sk('M14 93H78', c.w, 6);
    },
    paper: function (c) {        // paper jammed in the photocopier
      return '<path d="M29 66L38.5 47H77L67.5 66Z" fill="' + c.w + '"/>' +
        '<path d="M38.5 47L24 29H62.5L77 47Z" fill="' + c.k + '"/>' +
        '<path d="M24 29L34 11L44 15.5L53 9L62 14L72 10.5L62.5 29Z" fill="' + c.w + '" stroke="' + c.w + '" stroke-width="2" stroke-linejoin="round"/>' +
        sk('M44 57.5H62M47 21H60', c.a, 3.5, ' opacity=".45"') +
        sk('M80 14L87 9M83 24L91 23', c.k, 4.5) +
        '<rect x="9" y="62" width="82" height="28" rx="8" fill="' + c.w + '"/>' +
        sk('M23 71H77', c.a, 5) +
        sk('M21 81H47', c.a, 3.5, ' opacity=".4"') +
        '<circle cx="78" cy="81" r="4.2" fill="' + c.a + '"/>';
    },
    fridge: function (c) {
      return '<rect x="24" y="7" width="52" height="88" rx="10" fill="' + c.w + '"/>' +
        sk('M24 37H76', c.a, 4) +
        sk('M34 17V28M34 46V62', c.a, 5) +
        '<g transform="translate(59 68)">' + sk('M0 -10V10M-8.7 -5L8.7 5M-8.7 5L8.7 -5', c.a, 3.4) + '</g>' +
        '<circle cx="62" cy="22" r="5" fill="' + c.k + '" stroke="' + c.a + '" stroke-width="2.5"/>';
    },
    heart: function (c) {
      return '<path d="M50 88C22 70 10 54 12 38C14 24 26 15 38 16C44 16.5 48 20 50 25C52 20 56 16.5 62 16C74 15 86 24 88 38C90 54 78 70 50 88Z" fill="' + c.w + '"/>' +
        '<path d="M70 26C77 27 81 32 81.5 38" fill="none" stroke="' + c.a + '" stroke-width="5" stroke-linecap="round" opacity=".35"/>' +
        sparkle(88, 14, 9, c.k);
    },
    compass: function (c) {
      return '<circle cx="50" cy="50" r="40" fill="' + c.w + '"/>' +
        '<circle cx="50" cy="50" r="32" fill="none" stroke="' + c.a + '" stroke-width="2" opacity=".3"/>' +
        sk('M50 14V21M86 50H79M50 86V79M14 50H21', c.a, 4) +
        '<g transform="rotate(40 50 50)"><path d="M50 22L58.5 50H41.5Z" fill="' + c.a + '"/><path d="M41.5 50H58.5L50 78Z" fill="' + c.a + '" opacity=".4"/></g>' +
        '<circle cx="50" cy="50" r="5" fill="' + c.w + '" stroke="' + c.a + '" stroke-width="2.5"/>';
    },
    wall: function (c) {
      var r = function (x, y, w) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="18" rx="3.5" fill="' + c.w + '"/>'; };
      return r(10, 30, 38) + r(52, 30, 38) +
        r(10, 52, 17) + r(31, 52, 38) + r(73, 52, 17) +
        r(10, 74, 38) + r(52, 74, 38) +
        '<path d="' + starPath(77, 17, 15, 7, 8, -90) + '" fill="' + c.k + '" stroke="' + c.k + '" stroke-width="2" stroke-linejoin="round"/>';
    },
    clipboard: function (c) {
      return '<rect x="20" y="17" width="60" height="75" rx="8" fill="' + c.w + '"/>' +
        '<rect x="35" y="8" width="30" height="17" rx="5" fill="' + c.k + '"/>' +
        '<circle cx="50" cy="13.5" r="3.2" fill="' + c.a + '"/>' +
        sk('M31 44L37 50L47 38', c.a, 5) + sk('M55 44H70', c.a, 5, ' opacity=".45"') +
        sk('M31 69L37 75L47 63', c.a, 5) + sk('M55 69H70', c.a, 5, ' opacity=".45"');
    },
    bell: function (c) {
      return '<circle cx="50" cy="14" r="6.5" fill="' + c.w + '"/>' +
        '<path d="M21 72C27 66 28 58 28 46C28 32 38 21 50 21C62 21 72 32 72 46C72 58 73 66 79 72Z" fill="' + c.w + '"/>' +
        '<rect x="15" y="69" width="70" height="11" rx="5.5" fill="' + c.w + '"/>' +
        '<circle cx="50" cy="87" r="7.5" fill="' + c.k + '"/>' +
        sk('M37 47C37 39 40 34 45 31', c.a, 4.5, ' opacity=".35"') +
        sk('M11 38Q6 47 11 56M89 38Q94 47 89 56', c.k, 5);
    }
  };
  var QUESTION = function (c) {
    return sk('M35 36C35 24 43 17 51 17C60 17 66 24 66 32C66 41 59 44 54 48C51 50.5 50 53 50 58V60', c.w, 11) +
      '<circle cx="50" cy="79" r="7" fill="' + c.w + '"/>';
  };

  var STATION_ICONS = { levels: 1, slides: 1, hook: 1, clapper: 1, code: 1, vault: 1 };
  var META_ICONS = { paw: 1, crown: 1 };

  function iconLayer(name, locked, accent, cx, cy, scale) {
    var fn = locked ? QUESTION : (ICONS[name] || QUESTION);
    var tr = 'translate(' + n(cx - 50 * scale) + ' ' + n(cy - 50 * scale) + ') scale(' + scale + ')';
    var shadowCol = '#000000';
    var shadow = '<g transform="translate(0 ' + n(1.6) + ')" opacity="' + (locked ? 0.18 : 0.22) + '"><g transform="' + tr + '">' +
      fn({ w: shadowCol, k: shadowCol, a: shadowCol }) + '</g></g>';
    var main = '<g transform="' + tr + '"' + (locked ? ' opacity=".82"' : '') + '>' +
      fn({ w: '#FFFFFF', k: '#FFF0C7', a: accent }) + '</g>';
    return shadow + main;
  }

  function laurelBranch(cx, cy, R, from, to, count, dir, fill, strokeCol) {
    var s = '', stem = '', i;
    for (i = 0; i <= 24; i++) {
      var aa = (from + (to - from) * i / 24) * Math.PI / 180;
      stem += (i ? 'L' : 'M') + n(cx + R * Math.cos(aa)) + ' ' + n(cy + R * Math.sin(aa));
    }
    s += '<path d="' + stem + '" fill="none" stroke="' + strokeCol + '" stroke-width="2.4" stroke-linecap="round"/>';
    for (i = 0; i < count; i++) {
      var t = (i + 0.6) / count;
      var deg = from + (to - from) * t;
      var a = deg * Math.PI / 180;
      var px = cx + R * Math.cos(a), py = cy + R * Math.sin(a);
      var tang = Math.atan2(Math.cos(a) * dir, -Math.sin(a) * dir) * 180 / Math.PI; // travel direction
      var size = 1 - t * 0.35;
      [1, -1].forEach(function (side) {
        var ang = tang + side * 38 * dir * -1;
        s += '<path d="M0 0Q8 -6.2 16.5 0Q8 6.2 0 0Z" transform="translate(' + n(px) + ' ' + n(py) + ') rotate(' + n(ang) + ') scale(' + n(size) + ')" fill="' + fill + '" stroke="' + strokeCol + '" stroke-width=".9" stroke-linejoin="round"/>';
      });
    }
    // tip leaf
    var ta = to * Math.PI / 180;
    var tx = cx + R * Math.cos(ta), ty = cy + R * Math.sin(ta);
    var tt = Math.atan2(Math.cos(ta) * dir, -Math.sin(ta) * dir) * 180 / Math.PI;
    s += '<path d="M0 0Q6 -3.8 12 0Q6 3.8 0 0Z" transform="translate(' + n(tx) + ' ' + n(ty) + ') rotate(' + n(tt) + ') scale(.7)" fill="' + fill + '" stroke="' + strokeCol + '" stroke-width=".9"/>';
    return s;
  }

  function badge(def, opts) {
    def = def || {};
    opts = opts || {};
    var icon = def.icon;
    var tier = def.tier === 'station' || def.tier === 'meta' || def.tier === 'secret' ? def.tier :
      (STATION_ICONS[icon] ? 'station' : META_ICONS[icon] ? 'meta' : 'secret');
    var locked = !!opts.locked;
    var base = parseHex(def.color) ? def.color : '#21076C';
    var id = nextId('B');
    var G = function (k) { return id + k; };
    var url = function (k) { return 'url(#' + id + k + ')'; };

    var P = locked ? {
      rim0: '#ECEAF2', rim1: '#C9C6D6', rim2: '#9A97A8', rimLine: '#86839A',
      disc0: '#7D798F', disc1: '#6E6A80', disc2: '#5A566C',
      ribbon: '#A9A6B8', ribbonDark: '#86839A', accent: '#6E6A80', leaf: '#C9C6D6'
    } : {
      rim0: '#FBEAB5', rim1: '#D8B664', rim2: '#B8923F', rimLine: '#9C7A2E',
      disc0: mix(base, '#FFFFFF', 0.38), disc1: base, disc2: mix(base, '#000000', 0.34),
      ribbon: mix(base, '#000000', 0.12), ribbonDark: mix(base, '#000000', 0.38), accent: mix(base, '#000000', 0.12), leaf: '#E3C677'
    };
    if (tier === 'secret' && !locked) { P.rim0 = '#FFFFFF'; P.rim1 = '#D4D7E3'; P.rim2 = '#9196AD'; P.rimLine = '#7A7F96'; }

    var defs =
      '<linearGradient id="' + G('r') + '" x1="0" y1="0" x2=".75" y2="1">' +
        '<stop offset="0" stop-color="' + P.rim0 + '"/><stop offset=".45" stop-color="' + P.rim1 + '"/><stop offset="1" stop-color="' + P.rim2 + '"/></linearGradient>' +
      '<linearGradient id="' + G('v') + '" x1="0" y1="0" x2=".75" y2="1">' +
        '<stop offset="0" stop-color="' + P.rim2 + '"/><stop offset=".6" stop-color="' + P.rim1 + '"/><stop offset="1" stop-color="' + P.rim0 + '"/></linearGradient>' +
      '<radialGradient id="' + G('d') + '" cx=".42" cy=".36" r=".72">' +
        '<stop offset="0" stop-color="' + P.disc0 + '"/><stop offset=".55" stop-color="' + P.disc1 + '"/><stop offset="1" stop-color="' + P.disc2 + '"/></radialGradient>' +
      '<linearGradient id="' + G('lf') + '" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0" stop-color="' + (locked ? '#E4E1EC' : '#F7E09C') + '"/><stop offset="1" stop-color="' + (locked ? '#A9A6B8' : '#C49D48') + '"/></linearGradient>' +
      '<linearGradient id="' + G('g') + '" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>';

    var body = '';
    var gloss = '';
    if (tier === 'station') {
      var cx = 60, cy = 54;
      // ribbon tails
      body += '<path d="M44 84L60 92L48 117L41 108L31 112Z" fill="' + P.ribbon + '"/>' +
        '<path d="M76 84L60 92L72 117L79 108L89 112Z" fill="' + P.ribbon + '"/>' +
        '<path d="M44 84L60 92L56 101L42 90Z" fill="' + P.ribbonDark + '" opacity=".6"/>' +
        '<path d="M76 84L60 92L64 101L78 90Z" fill="' + P.ribbonDark + '" opacity=".6"/>';
      // scalloped rim
      var rim = lobeRing(cx, cy, 44, 22, 1.08, -90, null, false);
      body += '<path d="' + rim + '" fill="' + url('r') + '" stroke="' + P.rimLine + '" stroke-width="1.2" stroke-linejoin="round"/>' +
        '<circle cx="' + cx + '" cy="' + cy + '" r="38.5" fill="' + url('v') + '"/>' +
        '<circle cx="' + cx + '" cy="' + cy + '" r="35" fill="' + url('d') + '"/>' +
        '<circle cx="' + cx + '" cy="' + cy + '" r="31" fill="none" stroke="#fff" stroke-width="1.4" opacity=".55"/>';
      body += iconLayer(icon, locked, P.accent, cx, cy, 0.5);
      if (!locked) {
        gloss = '<path d="M26.5 50A33.5 33.5 0 0 1 93.5 50Q60 38 26.5 50Z" fill="' + url('g') + '"/>' +
          '<path d="M24 39A40 40 0 0 1 44 18" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".75"/>' +
          sparkle(90, 22, 6, '#fff');
      }
    } else if (tier === 'meta') {
      var mx = 60, my = 54;
      body += laurelBranch(mx, my, 49, 100, 200, 7, 1, url('lf'), P.rimLine) +
        laurelBranch(mx, my, 49, 80, -20, 7, -1, url('lf'), P.rimLine);
      body += '<path d="' + starPath(mx, my, 47, 39.5, 16, -90) + '" fill="' + url('r') + '" stroke="' + P.rimLine + '" stroke-width="1.2" stroke-linejoin="round"/>' +
        '<circle cx="' + mx + '" cy="' + my + '" r="36" fill="' + url('v') + '"/>' +
        '<circle cx="' + mx + '" cy="' + my + '" r="33" fill="' + url('r') + '"/>' +
        '<circle cx="' + mx + '" cy="' + my + '" r="29" fill="' + url('d') + '"/>' +
        '<circle cx="' + mx + '" cy="' + my + '" r="25.5" fill="none" stroke="#fff" stroke-width="1.2" opacity=".55"/>';
      body += iconLayer(icon, locked, P.accent, mx, my, 0.42);
      // banner across the bottom
      body += '<path d="M34 97L17 99.5L22.5 106.5L17 113.5L34 111Z" fill="' + P.ribbonDark + '"/>' +
        '<path d="M86 97L103 99.5L97.5 106.5L103 113.5L86 111Z" fill="' + P.ribbonDark + '"/>' +
        '<path d="M30 106L34 111V106Z" fill="#000" opacity=".35"/><path d="M90 106L86 111V106Z" fill="#000" opacity=".35"/>' +
        '<path d="M30 93Q60 100.5 90 93V106Q60 113.5 30 106Z" fill="' + P.ribbon + '" stroke="' + P.rimLine + '" stroke-width="1.1" stroke-linejoin="round"/>' +
        '<path d="M33 96.5Q60 103.5 87 96.5" fill="none" stroke="' + (locked ? '#E4E1EC' : P.rim1) + '" stroke-width="1.6" opacity=".9"/>' +
        '<path d="M33 102.5Q60 109.5 87 102.5" fill="none" stroke="' + (locked ? '#E4E1EC' : P.rim1) + '" stroke-width="1.6" opacity=".9"/>' +
        (locked ? '' : '<circle cx="60" cy="103" r="3.2" fill="' + P.rim0 + '" stroke="' + P.rimLine + '" stroke-width=".8"/>');
      if (!locked) {
        gloss = '<path d="M31.5 51A28.5 28.5 0 0 1 88.5 51Q60 40 31.5 51Z" fill="' + url('g') + '"/>' +
          sparkle(13, 13, 7, '#F2D27E') + sparkle(107, 14, 5.5, '#F2D27E') + sparkle(101, 3.5, 3, '#E9C66B') +
          '<path d="M34 32A36 36 0 0 1 48 21" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".8"/>';
      } else {
        gloss = sparkle(13, 13, 7, '#C9C6D6') + sparkle(107, 14, 5.5, '#C9C6D6');
      }
    } else { // secret
      var sx = 60, sy = 58;
      var hexO = roundedPoly(regularPoly(sx, sy, 44, 6, -90), 9);
      var hexB = roundedPoly(regularPoly(sx, sy, 39, 6, -90), 7);
      var hexI = roundedPoly(regularPoly(sx, sy, 35.5, 6, -90), 6);
      body += '<path d="' + hexO + '" fill="' + url('r') + '" stroke="' + P.rimLine + '" stroke-width="1.2"/>' +
        '<path d="' + hexB + '" fill="' + (locked ? url('v') : '#D8B664') + '"/>' +
        '<path d="' + hexI + '" fill="' + url('d') + '"/>';
      body += iconLayer(icon, locked, P.accent, sx, sy, 0.42);
      if (!locked) {
        gloss = '<path d="' + roundedPoly([[sx - 30.7, sy - 17.7], [sx, sy - 35.5], [sx + 30.7, sy - 17.7], [sx + 30.7, sy - 6], [sx, sy - 12], [sx - 30.7, sy - 6]], 5) + '" fill="' + url('g') + '"/>' +
          sparkle(95, 22, 5, '#fff');
      }
    }

    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="100%" height="100%" aria-hidden="true" focusable="false">' +
      '<defs>' + defs + '</defs>' + body + gloss + '</svg>';
  }

  /* =====================================================================
     3. UI ICONS (24x24 line icons, currentColor)
     ===================================================================== */
  var UI = {
    quests: '<path d="M18 17V6a3 3 0 0 0-3-3H5a2 2 0 0 0-2 2v1.5a.5.5 0 0 0 .5.5H7"/><path d="M7 5v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2H11v2a2 2 0 0 1-2 2"/><path d="M11 8h3.5M11 12h3.5"/>',
    badges: '<path d="M7.5 10.7 4 3h5l3 6M16.5 10.7 20 3h-5l-1.4 2.8"/><circle cx="12" cy="15" r="6"/><path d="m12 12.6.8 1.6 1.7.2-1.2 1.2.3 1.7-1.6-.8-1.6.8.3-1.7-1.2-1.2 1.7-.2z"/>',
    map: '<path d="M3 6.5 9 4l6 2.5L21 4v13.5L15 20l-6-2.5L3 20z"/><path d="M9 4v13.5M15 6.5V20"/>',
    'sound-on': '<path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/>',
    'sound-off': '<path d="M11 5 6 9H3v6h3l5 4z"/><path d="m22 9-6 6M16 9l6 6"/>',
    help: '<circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
    close: '<path d="M18 6 6 18M6 6l12 12"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    external: '<path d="M15 3h6v6M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    pin: '<path d="M20 10c0 5-8 12-8 12s-8-7-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
    play: '<path d="M7 4.5v15a1 1 0 0 0 1.5.9l12-7.5a1 1 0 0 0 0-1.8l-12-7.5A1 1 0 0 0 7 4.5z"/>',
    star: '<path d="m12 2.5 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5-4.8-4.6 6.6-.9z"/>',
    users: '<circle cx="9" cy="7" r="4"/><path d="M2 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2"/><path d="M16 3.1a4 4 0 0 1 0 7.8M22 21v-2a4 4 0 0 0-3-3.9"/>',
    copy: '<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
    print: '<path d="M6 9V3h12v6"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="7" rx="1"/>',
    'arrow-left': '<path d="M19 12H5M12 19l-7-7 7-7"/>',
    'arrow-right': '<path d="M5 12h14M12 5l7 7-7 7"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
    lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    refresh: '<path d="M21 12a9 9 0 0 1-15.5 6.2L3 16"/><path d="M3 21v-5h5"/><path d="M3 12a9 9 0 0 1 15.5-6.2L21 8"/><path d="M21 3v5h-5"/>'
  };

  function icon(name) {
    var body = UI[name];
    if (!body) return '';
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + body + '</svg>';
  }

  window.PD.art = {
    leo: function (expr, opts) { return leo(expr === undefined ? 'happy' : expr, opts || {}); },
    badge: function (def, opts) { return badge(def, opts || {}); },
    icon: icon,
    expressions: Object.keys(EXPRS),
    badgeIcons: Object.keys(ICONS),
    uiIcons: Object.keys(UI)
  };
})();
