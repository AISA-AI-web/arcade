/* =====================================================================
   pD-Day 2026 · WORLD
   Builds the school map from PD.quests and draws tiles and furniture.
   All drawing is done in "world pixels" where one tile = 32px; the game
   scales that up to the screen.
   ===================================================================== */
(function () {
  'use strict';
  var PD = window.PD;
  var T = 32;
  var TILE = { OUT: 0, WALL: 1, FACE: 2, FLOOR: 3, DOOR: 4 };
  var FONT = "'DM Sans','Cairo',system-ui,sans-serif";

  /* ---------------- colour helpers ---------------- */
  function hexToRgb(h) {
    h = h.replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(function (v) { v = Math.max(0, Math.min(255, Math.round(v))); return (v < 16 ? '0' : '') + v.toString(16); }).join('');
  }
  function mix(a, b, t) {
    var A = hexToRgb(a), B = hexToRgb(b);
    return rgbToHex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t);
  }
  function shade(c, amt) { return amt >= 0 ? mix(c, '#ffffff', amt) : mix(c, '#000000', -amt); }
  function rgba(c, a) { var A = hexToRgb(c); return 'rgba(' + A[0] + ',' + A[1] + ',' + A[2] + ',' + a + ')'; }
  function hash(x, y, s) {
    var h = (x * 374761393 + y * 668265263 + (s || 0) * 2147483647) | 0;
    h = (h ^ (h >>> 13)) * 1274126177 | 0;
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }

  /* ---------------- drawing helpers ---------------- */
  function rr(c, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
  }
  function fillRR(c, x, y, w, h, r, fill) { rr(c, x, y, w, h, r); c.fillStyle = fill; c.fill(); }
  function shadow(c, cx, cy, rx, ry, a) {
    c.save();
    c.fillStyle = 'rgba(30,16,60,' + (a == null ? 0.18 : a) + ')';
    c.beginPath(); c.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); c.fill();
    c.restore();
  }
  function circle(c, x, y, r, fill) { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fillStyle = fill; c.fill(); }
  function text(c, s, x, y, size, color, weight, align, maxW) {
    c.save();
    c.font = (weight || 700) + ' ' + size + 'px ' + FONT;
    c.fillStyle = color;
    c.textAlign = align || 'center';
    c.textBaseline = 'middle';
    if (PD.lang === 'ar') c.direction = 'rtl';
    if (maxW) {
      var m = c.measureText(s).width;
      if (m > maxW) { c.font = (weight || 700) + ' ' + Math.max(4.5, size * maxW / m) + 'px ' + FONT; }
    }
    c.fillText(s, x, y);
    c.restore();
  }
  function tr(o) { return PD.t ? PD.t(o) : (o && (o.en || o)) || ''; }

  /* =================================================================
     MAP BUILDER
     ================================================================= */
  function build(quests) {
    var N = quests.length;
    var cols = Math.max(1, Math.ceil(N / 2));
    var OUT = 5, LW = 12, RW = 12, LGW = 11, RH = 10, CH = 6;
    var x0 = OUT, y0 = OUT;
    var lobbyX = x0 + 1;
    function roomX(c) { return x0 + LW + 2 + c * (RW + 1); }
    var loungeX = roomX(cols - 1) + RW + 1;
    var W = loungeX + LGW + 1 + OUT;
    var yTop = y0 + 1, yw1 = y0 + RH + 1, yCor = yw1 + 1, yw2 = yCor + CH, yBot = yw2 + 1, yb = yBot + RH;
    var H = yb + 1 + OUT;

    var tiles = new Uint8Array(W * H);
    var zoneOf = new Array(W * H);
    var zones = {};
    function idx(x, y) { return y * W + x; }
    function set(x, y, t, z) { if (x < 0 || y < 0 || x >= W || y >= H) return; tiles[idx(x, y)] = t; if (z !== undefined) zoneOf[idx(x, y)] = z; }
    function get(x, y) { if (x < 0 || y < 0 || x >= W || y >= H) return TILE.OUT; return tiles[idx(x, y)]; }
    function carve(x, y, w, h, z) { for (var j = y; j < y + h; j++) for (var i = x; i < x + w; i++) set(i, j, TILE.FLOOR, z); }

    // building shell
    for (var j = y0; j <= yb; j++) for (var i = x0; i <= loungeX + LGW; i++) set(i, j, TILE.WALL);

    zones.lobby = { id: 'lobby', type: 'lobby', x: lobbyX, y: yTop, w: LW, h: yb - yTop };
    zones.lounge = { id: 'lounge', type: 'lounge', x: loungeX, y: yTop, w: LGW, h: yb - yTop };
    zones.corridor = { id: 'corridor', type: 'corridor', x: lobbyX + LW, y: yCor, w: loungeX - (lobbyX + LW), h: CH };
    carve(lobbyX, yTop, LW, yb - yTop, 'lobby');
    carve(loungeX, yTop, LGW, yb - yTop, 'lounge');
    carve(lobbyX + LW, yCor, loungeX - (lobbyX + LW), CH, 'corridor');

    var rooms = [];
    quests.forEach(function (q, i) {
      var row = i < cols ? 0 : 1, c = row ? i - cols : i;
      var rx = roomX(c), ry = row ? yBot : yTop;
      var id = 'room' + i;
      var doorTop = row === 1;
      var door = doorTop ? { x: rx + 1, y: yw2 } : { x: rx + 5, y: yw1 };
      var z = { id: id, type: 'room', x: rx, y: ry, w: RW, h: RH, quest: q, index: i, doorTop: doorTop, door: door };
      zones[id] = z; rooms.push(z);
      carve(rx, ry, RW, RH, id);
      set(door.x, door.y, TILE.DOOR, id); set(door.x + 1, door.y, TILE.DOOR, id);
    });
    // faces: floor tiles directly under a wall
    for (j = 0; j < H; j++) for (i = 0; i < W; i++) {
      if (get(i, j) === TILE.FLOOR && get(i, j - 1) === TILE.WALL) set(i, j, TILE.FACE);
    }

    var world = {
      W: W, H: H, T: T, tiles: tiles, zoneOf: zoneOf, zones: zones, rooms: rooms, props: [],
      get: get, idx: idx,
      L: { x0: x0, y0: y0, lobbyX: lobbyX, loungeX: loungeX, yTop: yTop, yw1: yw1, yCor: yCor, yw2: yw2, yBot: yBot, yb: yb, LW: LW, LGW: LGW, RW: RW, RH: RH, CH: CH, OUT: OUT }
    };
    world.zoneAt = function (x, y) { x = Math.floor(x); y = Math.floor(y); if (x < 0 || y < 0 || x >= W || y >= H) return null; return zoneOf[idx(x, y)] || null; };

    var pid = 0;
    function prop(kind, x, y, w, h, o) {
      var p = { id: pid++, kind: kind, x: x, y: y, w: w || 1, h: h || 1, top: 0, layer: 'stand', solid: true };
      if (o) for (var k in o) p[k] = o[k];
      world.props.push(p);
      return p;
    }
    world.prop = prop;

    buildLobby(world, prop);
    buildLounge(world, prop);
    buildCorridor(world, prop);
    rooms.forEach(function (z) { buildRoom(world, prop, z); });
    buildOutside(world, prop);

    // solidity grid
    world.solid = new Uint8Array(W * H);
    for (j = 0; j < H; j++) for (i = 0; i < W; i++) {
      var t = get(i, j);
      world.solid[idx(i, j)] = (t === TILE.FLOOR || t === TILE.DOOR) ? 0 : 1;
    }
    world.props.forEach(function (p) {
      if (!p.solid || p.layer !== 'stand') return;
      var f = p.foot || { x: p.x, y: p.y, w: p.w, h: p.h };
      for (var jj = Math.floor(f.y); jj < Math.ceil(f.y + f.h); jj++)
        for (var ii = Math.floor(f.x); ii < Math.ceil(f.x + f.w); ii++)
          if (ii >= 0 && jj >= 0 && ii < W && jj < H) world.solid[idx(ii, jj)] = 1;
    });
    world.isSolid = function (x, y) { x = Math.floor(x); y = Math.floor(y); if (x < 0 || y < 0 || x >= W || y >= H) return true; return world.solid[idx(x, y)] === 1; };

    world.spawn = { x: lobbyX + LW / 2, y: yb - 1.5 };
    world.leoSpawn = { x: lobbyX + LW / 2 + 1.5, y: yb - 3 };
    world.interactables = world.props.filter(function (p) { return p.interact; });
    return world;
  }

  /* ---------------- LOBBY ---------------- */
  function buildLobby(w, prop) {
    var L = w.L, x = L.lobbyX, y = L.yTop, cx = x + L.LW / 2;
    // wall décor
    prop('window', x, y, 2, 1, { layer: 'flat', solid: false });
    prop('banner', x + 3, y, 6, 1, { layer: 'flat', solid: false });
    prop('window', x + 10, y, 2, 1, { layer: 'flat', solid: false });
    prop('sunpatch', x, y + 1, 2, 2, { layer: 'flat', solid: false });
    prop('sunpatch', x + 10, y + 1, 2, 2, { layer: 'flat', solid: false });
    // quest board and trophy case
    prop('questboard', x + 1, y + 2, 3, 1, { top: 1.1, interact: { type: 'board' } });
    prop('trophycase', x + 8, y + 2, 3, 1, { top: 1.2, anim: true, interact: { type: 'trophy' } });
    prop('plant', x, y + 1, 1, 1, { top: 0.9, variant: 0, interact: { type: 'object', obj: 'plant' } });
    prop('plant', x + 11, y + 1, 1, 1, { top: 0.9, variant: 1 });
    // reception
    prop('rug', x + 2, y + 5, 8, 4, { layer: 'flat', solid: false, color: '#21076C' });
    prop('reception', x + 3, y + 6, 6, 1, { top: 0.6 });
    prop('chair', x + 5, y + 5, 1, 1, { solid: false, color: '#21076C' });
    // seating
    prop('bench', x, y + 12, 1, 3, { color: '#5B45A8' });
    prop('plant', x, y + 10, 1, 1, { top: 0.9, variant: 2 });
    prop('plant', x, y + 16, 1, 1, { top: 0.9, variant: 0 });
    prop('floorlogo', cx - 3, L.yCor + 0.5, 6, 5, { layer: 'flat', solid: false });
    prop('clock', x + 6, y, 1, 1, { layer: 'over', solid: false });
    // Leo's bed
    prop('leobed', cx + 1, L.yb - 4, 2, 1.4, { layer: 'flat', solid: false });
    prop('sofa', x + 8, y + 19, 3, 1, { color: '#6A55B8' });
    prop('coffeetable', x + 8.5, y + 20.4, 2, 0.8, {});
    prop('sofa', x + 1, y + 19, 3, 1, { color: '#6A55B8' });
    prop('bell', x + 11, L.yb - 5, 1, 1, { top: 0.6, interact: { type: 'object', obj: 'bell' } });
    prop('lostfound', x, L.yb - 3, 1, 1, { top: 0.2, interact: { type: 'object', obj: 'lostfound' } });
    prop('plant', x + 11, L.yb - 1, 1, 1, { top: 0.9, variant: 1 });
    prop('plant', x, L.yb - 1, 1, 1, { top: 0.9, variant: 2 });
    prop('doormat', cx - 1.5, L.yb - 1, 3, 1, { layer: 'flat', solid: false });
    prop('frontdoor', cx - 1, L.yb, 2, 1, { layer: 'flat', solid: false, interact: { type: 'object', obj: 'exit' } });
  }

  /* ---------------- STAFF LOUNGE ---------------- */
  function buildLounge(w, prop) {
    var L = w.L, x = L.loungeX, y = L.yTop;
    prop('window', x + 1, y, 2, 1, { layer: 'flat', solid: false });
    prop('noticeboard', x + 4, y, 3, 1, { layer: 'flat', solid: false });
    prop('window', x + 8, y, 2, 1, { layer: 'flat', solid: false });
    prop('sunpatch', x + 1, y + 1, 2, 2, { layer: 'flat', solid: false });
    prop('sunpatch', x + 8, y + 1, 2, 2, { layer: 'flat', solid: false });
    prop('counter', x, y + 1, 4, 1, { top: 0.3 });
    prop('coffee', x + 1, y + 1, 1, 1, { top: 0.8, solid: true, interact: { type: 'object', obj: 'coffee' } });
    prop('fridge', x + 5, y + 1, 2, 1, { top: 1.5, interact: { type: 'object', obj: 'fridge' } });
    prop('cooler', x + 8, y + 1, 1, 1, { top: 1.1, interact: { type: 'object', obj: 'cooler' } });
    prop('plant', x + 10, y + 1, 1, 1, { top: 0.9, variant: 0 });
    prop('rug', x + 1, y + 5, 9, 5, { layer: 'flat', solid: false, color: '#D8B664' });
    prop('table', x + 2, y + 6, 2, 2, { top: 0.2, items: 'cups', color: '#FFFFFF' });
    prop('table', x + 7, y + 6, 2, 2, { top: 0.2, items: 'papers', color: '#FFFFFF' });
    prop('chair', x + 1, y + 6.5, 1, 1, { solid: false, color: '#E5733A' });
    prop('chair', x + 4, y + 6.5, 1, 1, { solid: false, color: '#2E9E6B' });
    prop('chair', x + 6, y + 6.5, 1, 1, { solid: false, color: '#2F6FD6' });
    prop('chair', x + 9, y + 6.5, 1, 1, { solid: false, color: '#D1477A' });
    prop('sofa', x + 7, y + 17, 3, 1, { color: '#2E9E6B' });
    prop('coffeetable', x + 7.5, y + 18.4, 2, 0.8, {});
    prop('copier', x, y + 22, 2, 1, { top: 0.7, interact: { type: 'object', obj: 'copier' } });
    prop('vending', x + 9, y + 21, 2, 1, { top: 1.6, interact: { type: 'object', obj: 'vending' } });
    prop('plant', x + 10, L.yb - 1, 1, 1, { top: 0.9, variant: 1 });
    prop('plant', x, L.yb - 1, 1, 1, { top: 0.9, variant: 2 });
    prop('trash', x + 4, L.yb - 1, 1, 1, { top: 0.1 });
  }

  /* ---------------- CORRIDOR ---------------- */
  function buildCorridor(w, prop) {
    var L = w.L;
    var cz = w.zones.corridor;
    // wall clock on a stretch of corridor wall away from doors and signs
    var mid = cz.x + Math.floor(cz.w / 2), clockX = mid;
    for (var off = 0; off < cz.w / 2; off++) {
      var ok = [mid + off, mid - off].filter(function (cx) {
        return w.get(cx - 1, L.yCor) === TILE.FACE && w.get(cx, L.yCor) === TILE.FACE && w.get(cx + 1, L.yCor) === TILE.FACE &&
          w.rooms.every(function (r) { return r.doorTop || cx < r.door.x - 4 || cx > r.door.x + 2; });
      });
      if (ok.length) { clockX = ok[0]; break; }
    }
    w.clockX = clockX;
    prop('clock', clockX, L.yCor, 1, 1, { layer: 'over', solid: false });
    w.rooms.forEach(function (z) {
      var q = z.quest, d = z.door;
      if (!z.doorTop) {
        // sign on the corridor face next to the door, and a mat in front
        prop('doorsign', d.x - 3.1, L.yCor, 3, 1, { layer: 'flat', solid: false, quest: q });
        prop('doorframe', d.x, L.yCor, 2, 1, { layer: 'flat', solid: false, color: q.color });
        prop('doormat', d.x, L.yCor + 1, 2, 1, { layer: 'flat', solid: false, color: q.color, station: q.station });
      } else {
        prop('doormat', d.x, L.yw2 - 1, 2, 1, { layer: 'flat', solid: false, color: q.color, station: q.station });
        prop('roomsign', d.x + 2.2, L.yw2 - 1, 3, 1, { top: 0.9, quest: q, foot: { x: d.x + 3.2, y: L.yw2 - 0.6, w: 1, h: 0.6 } });
      }
    });
    // benches and plants along the bottom wall, away from doors
    var bottomY = L.yw2 - 1;
    for (var i = cz.x + 1; i < cz.x + cz.w - 2; i += 1) {
      var free = w.rooms.every(function (z) { return !z.doorTop || i < z.door.x - 1 || i > z.door.x + 5; });
      if (!free) continue;
      var r = hash(i, bottomY, 7);
      if (r < 0.18) { prop('plant', i, bottomY, 1, 1, { top: 0.9, variant: Math.floor(r * 15) % 3 }); i += 1; }
      else if (r < 0.32 && i < cz.x + cz.w - 4) { prop('bench', i, bottomY, 2, 1, { color: '#5B45A8', horizontal: true }); i += 2; }
    }
  }

  /* ---------------- ROOMS ---------------- */
  function buildRoom(w, prop, z) {
    var q = z.quest, x = z.x, y = z.y, th = q.theme;
    var col = q.color;
    // the station kiosk, always in the middle
    z.kiosk = prop('kiosk', x + 5, y + 4, 2, 1, { top: 1.4, anim: true, quest: q, interact: { type: 'quest', quest: q } });
    prop('glowring', x + 4, y + 3.3, 4, 2.6, { layer: 'flat', solid: false, color: col });

    // face décor: windows either side of a feature that suits the theme
    if (th !== 'library') {
      if (!z.doorTop) prop('window', x + 1, y, 2, 1, { layer: 'flat', solid: false });
      prop('window', x + 10, y, 2, 1, { layer: 'flat', solid: false });
    }
    if (z.doorTop) prop('doorframe', z.door.x, y, 2, 1, { layer: 'flat', solid: false, color: col, inside: true });
    var feature = { library: 'whiteboard', studio: 'screen', arena: 'hooksign', cinema: 'cinemascreen', lab: 'codewall', vault: 'vaultdoor' }[th] || 'whiteboard';
    prop(feature, x + 3.5, y, 5, 1, { layer: 'flat', solid: false, quest: q, color: col, interact: feature === 'whiteboard' ? { type: 'object', obj: 'whiteboard' } : null });
    var first = w.props.length;

    var themes = {
      library: function () {
        prop('rug', x + 1, y + 6, 10, 3, { layer: 'flat', solid: false, color: col });
        prop('bookshelf', x + 10, y + 1, 2, 1, { top: 1.4, variant: 2, interact: { type: 'object', obj: 'books' } });
        prop('bookshelf', x + 8, y + 1, 2, 1, { top: 1.4, variant: 3 });
        if (!z.doorTop) { prop('bookshelf', x, y + 1, 2, 1, { top: 1.4, variant: 0 }); prop('bookshelf', x + 2, y + 1, 2, 1, { top: 1.4, variant: 1 }); }
        prop('table', x + 1, y + 6, 3, 2, { top: 0.2, items: 'books', color: '#C98E58' });
        prop('table', x + 8, y + 6, 3, 2, { top: 0.2, items: 'books', color: '#C98E58' });
        prop('chair', x + 2, y + 8, 1, 1, { solid: false, color: col, back: true });
        prop('chair', x + 9, y + 8, 1, 1, { solid: false, color: col, back: true });
        prop('armchair', x, y + 4, 1, 1, { top: 0.3, color: col });
        prop('globe', x + 11, y + 4, 1, 1, { top: 0.7 });
        prop('plant', x + 11, y + 9, 1, 1, { top: 0.9, variant: 0 });
        prop('plant', x, y + 9, 1, 1, { top: 0.9, variant: 1 });
      },
      studio: function () {
        prop('easel', x + (z.doorTop ? 0 : 1), y + (z.doorTop ? 4 : 2), 1, 1, { top: 1.2, color: '#2F6FD6' });
        prop('easel', x + 3, y + (z.doorTop ? 9 : 2), 1, 1, { top: 1.2, color: '#D1477A' });
        prop('easel', x + 8, y + 2, 1, 1, { top: 1.2, color: '#2E9E6B' });
        prop('easel', x + 10, y + 2, 1, 1, { top: 1.2, color: '#D8B664' });
        prop('desk', x + 1, y + 6, 3, 1, { top: 0.6, items: 'laptops', color: '#F3F1F7' });
        prop('desk', x + 8, y + 6, 3, 1, { top: 0.6, items: 'laptops', color: '#F3F1F7' });
        prop('chair', x + 2, y + 7, 1, 1, { solid: false, color: col, back: true });
        prop('chair', x + 9, y + 7, 1, 1, { solid: false, color: col, back: true });
        prop('beanbag', x, y + 9, 1, 1, { color: '#D1477A' });
        prop('beanbag', x + 11, y + 9, 1, 1, { color: '#2F6FD6' });
        prop('plant', x + 11, y + 5, 1, 1, { top: 0.9, variant: 2 });
      },
      arena: function () {
        prop('court', x + 1, y + 1, 10, 9, { layer: 'flat', solid: false, color: col });
        prop('mats', x, y + 6, 4, 3, { layer: 'flat', solid: false });
        prop('bleachers', x, y + 1, 4, 1, { top: 0.5, color: col });
        prop('bleachers', x + 8, y + 1, 4, 1, { top: 0.5, color: col });
        prop('stage', x + 8, y + 6, 4, 3, { layer: 'flat', solid: false, color: col });
        prop('mic', x + 9.5, y + 7, 1, 1, { top: 0.9, solid: true });
        prop('cone', x + 4, y + 8, 1, 1, { top: 0.2 });
        prop('cone', x + 7, y + 8, 1, 1, { top: 0.2 });
      },
      cinema: function () {
        prop('carpetrunner', x + 4, y + 1, 4, 9, { layer: 'flat', solid: false, color: col });
        prop('seats', x, y + 6, 4, 1, { top: 0.4 });
        prop('seats', x + 8, y + 6, 4, 1, { top: 0.4 });
        prop('seats', x, y + 8, 4, 1, { top: 0.4 });
        prop('seats', x + 8, y + 8, 4, 1, { top: 0.4 });
        prop('popcorn', x + 11, y + 3, 1, 1, { top: 1.0, interact: { type: 'object', obj: 'popcorn' } });
        prop('filmreel', x, y + 3, 1, 1, { top: 0.6 });
      },
      lab: function () {
        if (!z.doorTop) { prop('desk', x, y + 2, 3, 1, { items: 'monitors', color: '#E8ECF4' }); prop('chair', x + 1, y + 3, 1, 1, { solid: false, color: col, back: true }); }
        prop('desk', x + 9, y + 2, 3, 1, { items: 'monitors', color: '#E8ECF4' });
        prop('chair', x + 10, y + 3, 1, 1, { solid: false, color: col, back: true });
        prop('desk', x + 1, y + 6, 3, 1, { items: 'monitors', color: '#E8ECF4' });
        prop('desk', x + 8, y + 6, 3, 1, { items: 'monitors', color: '#E8ECF4' });
        prop('chair', x + 2, y + 7, 1, 1, { solid: false, color: col, back: true });
        prop('chair', x + 9, y + 7, 1, 1, { solid: false, color: col, back: true });
        prop('arcade', x, y + 9, 1, 1, { top: 1.3, interact: { type: 'object', obj: 'arcade' } });
        prop('server', x + 11, y + 9, 1, 1, { top: 1.4, anim: true });
      },
      vault: function () {
        prop('safeboxes', x + (z.doorTop ? 8 : 0), y + 1, 2, 1, { top: 1.4 });
        prop('safeboxes', x + 10, y + 1, 2, 1, { top: 1.4 });
        prop('stanchion', x + 3, y + 7, 1, 1, { top: 0.6, rope: 'right' });
        prop('stanchion', x + 8, y + 7, 1, 1, { top: 0.6, rope: 'left' });
        prop('desk', x, y + 6, 2, 1, { top: 0.6, items: 'lock', color: '#C9D2E0' });
        prop('desk', x + 10, y + 6, 2, 1, { top: 0.6, items: 'files', color: '#C9D2E0' });
        prop('plant', x + 11, y + 9, 1, 1, { top: 0.9, variant: 2 });
        prop('plant', x, y + 9, 1, 1, { top: 0.9, variant: 0 });
      }
    };
    (themes[th] || themes.library)();
    // safety net for new themes: nothing standing on the route from the door to the station
    var clear = z.doorTop ? { x: x + 1, y: y + 1, w: 6, h: 3 } : { x: x + 5, y: y + 5, w: 2, h: 5 };
    for (var k = w.props.length - 1; k >= first; k--) {
      var p = w.props[k];
      if (p.layer !== 'stand') continue;
      if (p.x < clear.x + clear.w && p.x + p.w > clear.x && p.y < clear.y + clear.h && p.y + p.h > clear.y) w.props.splice(k, 1);
    }
  }

  /* ---------------- OUTSIDE ---------------- */
  function buildOutside(w, prop) {
    var L = w.L, cx = L.lobbyX + L.LW / 2;
    var spots = [];
    for (var i = 1; i < w.W - 2; i += 3) { spots.push([i + hash(i, 1) * 1.5, 1.5 + hash(i, 2)]); spots.push([i + hash(i, 3) * 1.5, w.H - 2.5 + hash(i, 4)]); }
    for (var j = 4; j < w.H - 4; j += 3) { spots.push([1 + hash(j, 5), j + hash(j, 6)]); spots.push([w.W - 3 + hash(j, 7), j + hash(j, 8)]); }
    spots.forEach(function (s, k) {
      if (Math.abs(s[0] - cx) < 3 && s[1] > L.yb) return;
      var r = hash(k, 9);
      if (r < 0.55) prop('palm', s[0], s[1], 1, 1, { top: 3.4, solid: false, variant: k % 3 });
      else prop('bush', s[0], s[1], 1, 1, { top: 0.3, solid: false, variant: k % 3 });
    });
    prop('flag', cx + 4.2, L.yb + 3.6, 1, 1, { top: 2.6, solid: false, anim: true });
  }

  /* =================================================================
     TILE RENDERING
     ================================================================= */
  var FLOOR_BASE = {
    lobby: '#F2EEFA', corridor: '#EEE9F6', lounge: '#D7A66B',
    library: '#C68D57', studio: '#D9DCE3', arena: '#E3B275', cinema: '#3A2B5C', lab: '#D7E2EF', vault: '#9EA9BA'
  };
  function zoneStyle(world, z) {
    if (!z) return 'out';
    var zone = world.zones[z];
    if (!zone) return 'lobby';
    return zone.type === 'room' ? zone.quest.theme : zone.type;
  }
  function wallPaint(world, z) {
    var zone = world.zones[z];
    if (!zone) return '#EDE8F6';
    if (zone.type === 'room') {
      var th = zone.quest.theme;
      if (th === 'cinema') return '#2A1F46';
      if (th === 'vault') return '#5D6B83';
      return mix(zone.quest.color, '#FFFFFF', 0.78);
    }
    if (zone.type === 'lounge') return '#FBEFD9';
    if (zone.type === 'corridor') return '#F1ECF8';
    return '#EAE3F7';
  }

  function drawFloor(c, world, x, y, style) {
    var px = x * T, py = y * T, r = hash(x, y);
    var base = FLOOR_BASE[style] || '#EEE';
    c.fillStyle = base; c.fillRect(px, py, T, T);
    switch (style) {
      case 'lobby':
        // large stone slabs, 2x2 tiles
        c.fillStyle = shade(base, (hash(x >> 1, y >> 1) - 0.5) * 0.06); c.fillRect(px, py, T, T);
        c.fillStyle = 'rgba(120,100,170,0.16)';
        if (x % 2 === 0) c.fillRect(px, py, 1, T);
        if (y % 2 === 0) c.fillRect(px, py, T, 1);
        c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(px + 2, py + 2, 6, 1);
        break;
      case 'corridor':
        c.fillStyle = (x + y) % 2 ? '#E6DFF2' : '#F3EFF9'; c.fillRect(px, py, T, T);
        c.fillStyle = 'rgba(255,255,255,0.4)'; c.fillRect(px + 3, py + 3, 8, 2);
        break;
      case 'lounge':
      case 'arena': {
        var pl = style === 'arena' ? 4 : 8, n = T / pl;
        for (var k = 0; k < n; k++) {
          var off = Math.floor(hash(x, y * n + k) * T);
          if (style === 'arena') {
            c.fillStyle = shade(base, (hash(x * n + k, y) - 0.5) * 0.08); c.fillRect(px + k * pl, py, pl, T);
            c.fillStyle = 'rgba(120,70,20,0.18)'; c.fillRect(px + k * pl, py, 1, T);
            if (hash(x * 7 + k, y) < 0.25) c.fillRect(px + k * pl, py + off, pl, 1);
          } else {
            c.fillStyle = shade(base, (hash(x, y * n + k, 3) - 0.5) * 0.1); c.fillRect(px, py + k * pl, T, pl);
            c.fillStyle = 'rgba(110,60,20,0.22)'; c.fillRect(px, py + k * pl, T, 1);
            if (hash(x, y * n + k, 5) < 0.4) c.fillRect(px + off, py + k * pl, 1, pl);
          }
        }
        break;
      }
      case 'library': {
        // parquet: alternating 16px blocks
        for (var by = 0; by < 2; by++) for (var bx = 0; bx < 2; bx++) {
          var vert = ((x * 2 + bx) + (y * 2 + by)) % 2 === 0;
          var X = px + bx * 16, Y = py + by * 16;
          for (var s = 0; s < 4; s++) {
            c.fillStyle = shade(base, (hash(x * 4 + bx * 2 + s, y * 4 + by) - 0.5) * 0.12);
            if (vert) c.fillRect(X + s * 4, Y, 4, 16); else c.fillRect(X, Y + s * 4, 16, 4);
          }
          c.fillStyle = 'rgba(90,50,20,0.2)'; c.fillRect(X, Y, 16, 1); c.fillRect(X, Y, 1, 16);
        }
        break;
      }
      case 'studio':
        for (var d = 0; d < 6; d++) { c.fillStyle = hash(x, y, d) < 0.5 ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.35)'; c.fillRect(px + hash(x, y, d + 10) * T, py + hash(x, y, d + 20) * T, 2, 2); }
        c.fillStyle = 'rgba(0,0,0,0.05)'; if (x % 4 === 0) c.fillRect(px, py, 1, T); if (y % 4 === 0) c.fillRect(px, py, T, 1);
        break;
      case 'cinema':
        c.fillStyle = 'rgba(216,182,100,0.16)';
        for (var a = 0; a < 2; a++) for (var b = 0; b < 2; b++) { c.beginPath(); c.arc(px + 8 + a * 16, py + 8 + b * 16, 2.2, 0, 7); c.fill(); }
        c.fillStyle = 'rgba(255,255,255,0.03)'; c.fillRect(px, py, T, T / 2);
        break;
      case 'lab':
        c.fillStyle = 'rgba(80,110,160,0.18)'; c.fillRect(px, py, T, 1); c.fillRect(px, py, 1, T);
        c.fillStyle = 'rgba(255,255,255,0.5)'; c.fillRect(px + 2, py + 2, T - 6, 1);
        if (r < 0.08) { c.fillStyle = 'rgba(123,79,214,0.25)'; c.fillRect(px + 10, py + 14, 12, 2); }
        break;
      case 'vault':
        c.fillStyle = 'rgba(40,50,70,0.35)'; c.fillRect(px, py, T, 1); c.fillRect(px, py, 1, T);
        c.fillStyle = 'rgba(255,255,255,0.25)'; c.fillRect(px + 1, py + 1, T - 2, 1);
        c.fillStyle = 'rgba(40,50,70,0.4)';
        [[4, 4], [T - 5, 4], [4, T - 5], [T - 5, T - 5]].forEach(function (p) { c.beginPath(); c.arc(px + p[0], py + p[1], 1.4, 0, 7); c.fill(); });
        c.strokeStyle = 'rgba(255,255,255,0.12)'; c.lineWidth = 1;
        for (var dd = 6; dd < T; dd += 6) { c.beginPath(); c.moveTo(px + dd, py + 3); c.lineTo(px + dd - 3, py + T - 3); c.stroke(); }
        break;
    }
  }

  function drawOutside(c, world, x, y) {
    var px = x * T, py = y * T, L = world.L, cx = L.lobbyX + L.LW / 2;
    var onPath = y > L.yb && Math.abs(x + 0.5 - cx) <= 1.6;
    if (onPath) {
      c.fillStyle = '#E9DFC9'; c.fillRect(px, py, T, T);
      c.fillStyle = 'rgba(120,100,70,0.18)';
      c.fillRect(px, py + ((x + y) % 2 ? 0 : 16), T, 1); c.fillRect(px + ((y % 2) ? 16 : 0), py, 1, T);
      return;
    }
    var g = hash(x, y);
    c.fillStyle = g < 0.5 ? '#8DC56C' : '#86BF66'; c.fillRect(px, py, T, T);
    for (var k = 0; k < 5; k++) {
      c.fillStyle = hash(x, y, k) < 0.5 ? 'rgba(60,120,50,0.35)' : 'rgba(200,240,160,0.35)';
      c.fillRect(px + hash(x, y, k + 3) * 30, py + hash(x, y, k + 9) * 30, 2, 3);
    }
    if (g > 0.93) { var fc = ['#FFFFFF', '#F5D04B', '#F08CA8'][Math.floor(hash(x, y, 4) * 3)]; circle(c, px + 10 + hash(x, y, 5) * 12, py + 10 + hash(x, y, 6) * 12, 2.2, fc); }
  }

  function drawWall(c, world, x, y) {
    var px = x * T, py = y * T, get = world.get;
    c.fillStyle = '#3F3170'; c.fillRect(px, py, T, T);
    c.fillStyle = '#4B3C83'; c.fillRect(px + 2, py + 2, T - 4, T - 4);
    c.fillStyle = 'rgba(255,255,255,0.08)'; c.fillRect(px + 2, py + 2, T - 4, 3);
    // edges facing open space get a highlight
    c.fillStyle = '#6A59A6';
    if (get(x, y - 1) !== TILE.WALL) c.fillRect(px, py, T, 2);
    if (get(x - 1, y) !== TILE.WALL) c.fillRect(px, py, 2, T);
    if (get(x + 1, y) !== TILE.WALL) c.fillRect(px + T - 2, py, 2, T);
    if (get(x, y + 1) !== TILE.WALL && get(x, y + 1) !== TILE.FACE) { c.fillStyle = '#2B2052'; c.fillRect(px, py + T - 3, T, 3); }
  }

  function drawFace(c, world, x, y) {
    var px = x * T, py = y * T;
    var z = world.zoneOf[world.idx(x, y)];
    var zone = world.zones[z];
    var paint = wallPaint(world, z);
    c.fillStyle = paint; c.fillRect(px, py, T, T);
    // subtle vertical paint texture
    c.fillStyle = 'rgba(0,0,0,0.025)'; if (x % 2) c.fillRect(px, py, T, T);
    // crown shadow and baseboard
    var g = c.createLinearGradient(0, py, 0, py + 8); g.addColorStop(0, 'rgba(30,16,60,0.35)'); g.addColorStop(1, 'rgba(30,16,60,0)');
    c.fillStyle = g; c.fillRect(px, py, T, 8);
    var dark = zone && zone.type === 'room' && (zone.quest.theme === 'cinema' || zone.quest.theme === 'vault');
    c.fillStyle = dark ? 'rgba(0,0,0,0.35)' : shade(paint, -0.25); c.fillRect(px, py + T - 5, T, 5);
    c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(px, py + T - 5, T, 1);
    // corridor lockers
    if (zone && zone.type === 'corridor') {
      var isDoorNear = false;
      for (var dx = -1; dx <= 1; dx++) { var t = world.get(x + dx, y); if (t !== TILE.FACE) isDoorNear = true; }
      var nearSign = world.rooms.some(function (r) { return !r.doorTop && (x >= r.door.x - 4 && x <= r.door.x + 2); });
      if (!isDoorNear && !nearSign && x !== world.clockX) {
        var lc = x % 3 === 0 ? '#5B45A8' : (x % 3 === 1 ? '#6A55B8' : '#4E3B96');
        fillRR(c, px + 1, py + 4, T - 2, T - 9, 2, lc);
        c.fillStyle = 'rgba(255,255,255,0.18)'; for (var v = 0; v < 3; v++) c.fillRect(px + 8, py + 8 + v * 3, 16, 1.2);
        c.fillStyle = '#D8B664'; c.fillRect(px + T - 7, py + 16, 2, 5);
        c.fillStyle = 'rgba(0,0,0,0.2)'; c.fillRect(px + T - 2, py + 4, 1, T - 9);
      }
    }
  }

  function drawDoor(c, world, x, y) {
    var px = x * T, py = y * T;
    var z = world.zoneOf[world.idx(x, y)];
    var zone = world.zones[z];
    var col = zone && zone.quest ? zone.quest.color : '#21076C';
    // threshold between two floors
    c.fillStyle = '#CFC6E2'; c.fillRect(px, py, T, T);
    c.fillStyle = 'rgba(0,0,0,0.07)'; for (var k = 0; k < T; k += 4) c.fillRect(px, py + k, T, 1);
    c.fillStyle = col; c.fillRect(px, py + T / 2 - 2, T, 4);
    // posts
    var left = world.get(x - 1, y) === TILE.WALL, right = world.get(x + 1, y) === TILE.WALL;
    c.fillStyle = shade(col, -0.25);
    if (left) c.fillRect(px, py, 4, T);
    if (right) c.fillRect(px + T - 4, py, 4, T);
  }

  function drawTile(c, world, x, y) {
    var t = world.get(x, y);
    if (t === TILE.OUT) {
      drawOutside(c, world, x, y);
      if (world.get(x, y - 1) === TILE.WALL) drawFacade(c, world, x, y);
    } else if (t === TILE.WALL) drawWall(c, world, x, y);
    else if (t === TILE.FACE) drawFace(c, world, x, y);
    else if (t === TILE.DOOR) drawDoor(c, world, x, y);
    else {
      drawFloor(c, world, x, y, zoneStyle(world, world.zoneOf[world.idx(x, y)]));
      // soft shadow under walls/faces to the north and west
      var n = world.get(x, y - 1), wv = world.get(x - 1, y);
      if (n === TILE.FACE || n === TILE.WALL) { var g = c.createLinearGradient(0, y * T, 0, y * T + 10); g.addColorStop(0, 'rgba(30,16,60,0.22)'); g.addColorStop(1, 'rgba(30,16,60,0)'); c.fillStyle = g; c.fillRect(x * T, y * T, T, 10); }
      if (wv === TILE.WALL || wv === TILE.FACE) { var g2 = c.createLinearGradient(x * T, 0, x * T + 6, 0); g2.addColorStop(0, 'rgba(30,16,60,0.14)'); g2.addColorStop(1, 'rgba(30,16,60,0)'); c.fillStyle = g2; c.fillRect(x * T, y * T, 6, T); }
    }
  }

  function drawFacade(c, world, x, y) {
    var px = x * T, py = y * T;
    c.fillStyle = '#E4DEF0'; c.fillRect(px, py, T, T * 0.75);
    c.fillStyle = 'rgba(33,7,108,0.08)'; c.fillRect(px, py + T * 0.36, T, 1);
    c.fillStyle = '#C9C0DD'; c.fillRect(px, py + T * 0.68, T, 3);
    var g = c.createLinearGradient(0, py + T * 0.75, 0, py + T); g.addColorStop(0, 'rgba(30,16,60,0.25)'); g.addColorStop(1, 'rgba(30,16,60,0)');
    c.fillStyle = g; c.fillRect(px, py + T * 0.75, T, T * 0.25);
    if (x % 3 === 1) {
      fillRR(c, px + 5, py + 4, T - 10, 14, 2, '#FFFFFF');
      var gg = c.createLinearGradient(px, py + 5, px + T, py + 18); gg.addColorStop(0, '#9FC8EE'); gg.addColorStop(1, '#6E9FD6');
      fillRR(c, px + 7, py + 6, T - 14, 10, 1, gg);
      c.fillStyle = 'rgba(255,255,255,0.6)'; c.beginPath(); c.moveTo(px + 9, py + 15); c.lineTo(px + 14, py + 6); c.lineTo(px + 16, py + 6); c.lineTo(px + 11, py + 15); c.fill();
    }
  }

  /* =================================================================
     PROP RENDERING
     Each painter draws with (0,0) at the footprint's top-left.
     ================================================================= */
  var P = {};

  P.window = function (c, p) {
    var w = p.w * T;
    fillRR(c, 3, 2, w - 6, 24, 3, '#FFFFFF');
    var g = c.createLinearGradient(0, 4, w, 26); g.addColorStop(0, '#B9DBF7'); g.addColorStop(1, '#7FB1E3');
    fillRR(c, 6, 5, w - 12, 18, 2, g);
    c.fillStyle = '#FFFFFF'; c.fillRect(w / 2 - 1, 5, 2, 18); c.fillRect(6, 13, w - 12, 2);
    c.fillStyle = 'rgba(255,255,255,0.55)'; c.beginPath(); c.moveTo(10, 22); c.lineTo(18, 6); c.lineTo(22, 6); c.lineTo(14, 22); c.fill();
    c.fillStyle = 'rgba(30,16,60,0.15)'; c.fillRect(3, 26, w - 6, 2);
  };
  P.sunpatch = function (c, p) {
    var w = p.w * T, h = p.h * T;
    var g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(255,240,190,0.35)'); g.addColorStop(1, 'rgba(255,240,190,0)');
    c.fillStyle = g; c.beginPath(); c.moveTo(6, 0); c.lineTo(w - 6, 0); c.lineTo(w + 10, h); c.lineTo(14, h); c.closePath(); c.fill();
  };
  P.banner = function (c, p) {
    var w = p.w * T;
    fillRR(c, 4, 1, w - 8, 25, 4, '#21076C');
    c.fillStyle = '#D8B664'; c.fillRect(4, 22, w - 8, 3);
    c.beginPath(); c.moveTo(4, 26); c.lineTo(12, 26); c.lineTo(8, 30); c.fill();
    c.beginPath(); c.moveTo(w - 4, 26); c.lineTo(w - 12, 26); c.lineTo(w - 8, 30); c.fill();
    c.save(); c.font = '800 13px ' + FONT; c.textAlign = 'center'; c.textBaseline = 'middle';
    var title = (PD.config && PD.config.title) || 'pD-Day 2026';
    var parts = title.split(' ');
    var a = parts[0] + ' ', b = parts.slice(1).join(' ');
    var wa = c.measureText(a).width, wb = c.measureText(b).width, sx = w / 2 - (wa + wb) / 2;
    c.textAlign = 'left'; c.fillStyle = '#FFFFFF'; c.fillText(a, sx, 12); c.fillStyle = '#D8B664'; c.fillText(b, sx + wa, 12);
    c.restore();
  };
  P.rug = function (c, p) {
    var w = p.w * T, h = p.h * T, col = p.color || '#21076C';
    fillRR(c, 2, 2, w - 4, h - 4, 8, rgba(col, 0.85));
    rr(c, 8, 8, w - 16, h - 16, 5); c.strokeStyle = 'rgba(216,182,100,0.85)'; c.lineWidth = 2; c.stroke();
    rr(c, 13, 13, w - 26, h - 26, 3); c.strokeStyle = 'rgba(255,255,255,0.25)'; c.lineWidth = 1; c.stroke();
    c.fillStyle = 'rgba(255,255,255,0.08)';
    for (var i = 20; i < w - 20; i += 16) for (var j = 20; j < h - 20; j += 16) { c.beginPath(); c.moveTo(i, j - 4); c.lineTo(i + 4, j); c.lineTo(i, j + 4); c.lineTo(i - 4, j); c.fill(); }
  };
  P.floorlogo = function (c, p) {
    var w = p.w * T, h = p.h * T, cx = w / 2, cy = h / 2, r = Math.min(w, h) / 2 - 4;
    c.save();
    c.beginPath(); c.ellipse(cx, cy, r * 1.15, r, 0, 0, 7); c.fillStyle = 'rgba(33,7,108,0.10)'; c.fill();
    c.lineWidth = 4; c.strokeStyle = 'rgba(216,182,100,0.85)'; c.stroke();
    c.beginPath(); c.ellipse(cx, cy, r * 1.15 - 9, r - 9, 0, 0, 7); c.lineWidth = 1.5; c.strokeStyle = 'rgba(33,7,108,0.35)'; c.stroke();
    // paw print
    c.fillStyle = 'rgba(33,7,108,0.55)';
    c.beginPath(); c.ellipse(cx, cy + 10, 15, 12, 0, 0, 7); c.fill();
    [[-17, -6], [-6, -16], [6, -16], [17, -6]].forEach(function (o) { c.beginPath(); c.ellipse(cx + o[0], cy + o[1], 6, 7.5, 0, 0, 7); c.fill(); });
    c.font = '800 15px ' + FONT; c.textAlign = 'center'; c.fillStyle = 'rgba(216,182,100,0.95)';
    c.fillText('AISA', cx, cy + r - 16);
    c.restore();
  };
  P.leobed = function (c, p) {
    var w = p.w * T, h = p.h * T;
    shadow(c, w / 2, h / 2 + 4, w / 2 - 2, h / 2 - 2, 0.15);
    c.beginPath(); c.ellipse(w / 2, h / 2, w / 2 - 3, h / 2 - 3, 0, 0, 7); c.fillStyle = '#21076C'; c.fill();
    c.beginPath(); c.ellipse(w / 2, h / 2 + 1, w / 2 - 9, h / 2 - 8, 0, 0, 7); c.fillStyle = '#D8B664'; c.fill();
    c.fillStyle = 'rgba(33,7,108,0.55)'; c.font = '800 9px ' + FONT; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('LEO', w / 2, h / 2 + 2);
  };
  P.doormat = function (c, p) {
    var w = p.w * T, h = p.h * T, col = p.color || '#21076C';
    fillRR(c, 3, 5, w - 6, h - 10, 3, rgba(col, 0.9));
    rr(c, 6, 8, w - 12, h - 16, 2); c.strokeStyle = 'rgba(255,255,255,0.4)'; c.lineWidth = 1; c.stroke();
    if (p.station) text(c, String(p.station), w / 2, h / 2 + 0.5, 12, '#FFFFFF', 800);
    else text(c, PD.lang === 'ar' ? 'أهلاً وسهلاً' : 'WELCOME', w / 2, h / 2 + 0.5, 8, 'rgba(255,255,255,0.85)', 800);
  };
  P.frontdoor = function (c, p) {
    var w = p.w * T;
    c.fillStyle = '#2B2052'; c.fillRect(0, 0, w, T);
    var g = c.createLinearGradient(0, 0, 0, T); g.addColorStop(0, '#BFE0F7'); g.addColorStop(1, '#8DBCE6');
    fillRR(c, 4, 3, w / 2 - 5, T - 6, 2, g); fillRR(c, w / 2 + 1, 3, w / 2 - 5, T - 6, 2, g);
    c.fillStyle = '#D8B664'; c.fillRect(w / 2 - 4, 12, 2, 8); c.fillRect(w / 2 + 2, 12, 2, 8);
    c.fillStyle = 'rgba(255,255,255,0.6)'; c.fillRect(8, 6, 2, T - 12); c.fillRect(w / 2 + 6, 6, 2, T - 12);
  };
  P.clock = function (c, p, now) {
    var cx = T / 2, cy = 13;
    circle(c, cx, cy + 1, 10, 'rgba(30,16,60,0.2)');
    circle(c, cx, cy, 10, '#21076C'); circle(c, cx, cy, 8, '#FFFFFF');
    var d = new Date();
    var hA = ((d.getHours() % 12) + d.getMinutes() / 60) / 12 * Math.PI * 2, mA = d.getMinutes() / 60 * Math.PI * 2;
    c.strokeStyle = '#1A1A1A'; c.lineCap = 'round';
    c.lineWidth = 1.8; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.sin(hA) * 4.5, cy - Math.cos(hA) * 4.5); c.stroke();
    c.lineWidth = 1.2; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.sin(mA) * 6.5, cy - Math.cos(mA) * 6.5); c.stroke();
    circle(c, cx, cy, 1.3, '#D8B664');
  };
  P.noticeboard = function (c, p) {
    var w = p.w * T;
    fillRR(c, 4, 2, w - 8, 24, 2, '#B07A45'); fillRR(c, 6, 4, w - 12, 20, 1, '#D9A86A');
    var notes = [['#FFF7B0', 10, 6], ['#FFFFFF', 28, 8], ['#C8F0D8', 48, 5], ['#F9C8D8', 66, 7]];
    notes.forEach(function (n, i) { c.save(); c.translate(n[1] + 6, n[2] + 6); c.rotate((i % 2 ? 1 : -1) * 0.08); c.fillStyle = n[0]; c.fillRect(-6, -6, 13, 12); c.fillStyle = 'rgba(0,0,0,0.25)'; for (var k = 0; k < 3; k++) c.fillRect(-4, -3 + k * 3, 9, 0.8); c.restore(); circle(c, n[1] + 6, n[2], 1.5, '#E5533A'); });
  };
  P.whiteboard = function (c, p) {
    var w = p.w * T, q = p.quest;
    fillRR(c, 2, 1, w - 4, 26, 3, '#B9B4C8'); fillRR(c, 4, 3, w - 8, 21, 2, '#FFFFFF');
    c.fillStyle = '#9C97AE'; c.fillRect(8, 24, w - 16, 3);
    c.fillStyle = '#E5533A'; c.fillRect(14, 23, 8, 2); c.fillStyle = '#2F6FD6'; c.fillRect(26, 23, 8, 2);
    if (q) text(c, tr({ en: 'Station ', ar: 'المحطة ' }) + q.station, w / 2, 9, 9, q.color, 800);
    c.strokeStyle = 'rgba(33,7,108,0.55)'; c.lineWidth = 1.3; c.lineCap = 'round';
    c.beginPath(); c.moveTo(14, 17); c.lineTo(30, 17); c.moveTo(14, 20); c.lineTo(24, 20); c.stroke();
    c.beginPath(); c.moveTo(w - 40, 20); c.lineTo(w - 32, 13); c.lineTo(w - 24, 18); c.lineTo(w - 14, 10); c.stroke();
  };
  P.screen = function (c, p) {
    var w = p.w * T, col = p.color;
    c.fillStyle = '#3B3550'; c.fillRect(6, 0, w - 12, 3);
    fillRR(c, 4, 2, w - 8, 25, 2, '#FFFFFF');
    var g = c.createLinearGradient(0, 4, 0, 24); g.addColorStop(0, shade(col, 0.15)); g.addColorStop(1, shade(col, -0.1));
    fillRR(c, 7, 5, w - 14, 19, 1, g);
    c.fillStyle = 'rgba(255,255,255,0.9)'; c.fillRect(12, 8, w * 0.35, 3);
    c.fillStyle = 'rgba(255,255,255,0.6)'; c.fillRect(12, 13, w * 0.25, 2); c.fillRect(12, 17, w * 0.3, 2);
    c.fillStyle = '#D8B664'; c.fillRect(w - 46, 14, 7, 8); c.fillStyle = '#FFFFFF'; c.fillRect(w - 37, 10, 7, 12); c.fillStyle = 'rgba(255,255,255,0.7)'; c.fillRect(w - 28, 16, 7, 6);
  };
  P.hooksign = function (c, p) {
    var w = p.w * T, col = p.color;
    fillRR(c, 4, 1, w - 8, 26, 6, '#21076C');
    rr(c, 6, 3, w - 12, 22, 5); c.strokeStyle = col; c.lineWidth = 2; c.stroke();
    // fishing hook
    c.save(); c.translate(24, 14); c.strokeStyle = '#D8B664'; c.lineWidth = 2.6; c.lineCap = 'round';
    c.beginPath(); c.moveTo(0, -9); c.lineTo(0, 3); c.arc(-4, 3, 4, 0, Math.PI, false); c.lineTo(-8, -1); c.stroke();
    c.beginPath(); c.arc(0, -10.5, 1.8, 0, 7); c.stroke(); c.restore();
    var label = PD.lang === 'ar' ? 'ساحة التشويق' : 'HOOK ARENA';
    text(c, label, w / 2 + 10, 14, 11, '#FFFFFF', 800, 'center', w - 50);
  };
  P.cinemascreen = function (c, p) {
    var w = p.w * T;
    c.fillStyle = '#8E1F2F'; c.fillRect(0, 0, 8, T); c.fillRect(w - 8, 0, 8, T);
    c.fillStyle = 'rgba(0,0,0,0.25)'; for (var i = 2; i < 8; i += 3) { c.fillRect(i, 0, 1, T); c.fillRect(w - 8 + i, 0, 1, T); }
    var g = c.createLinearGradient(0, 2, 0, 28); g.addColorStop(0, '#FFFFFF'); g.addColorStop(1, '#DCE6FF');
    fillRR(c, 10, 2, w - 20, 25, 2, g);
    c.fillStyle = 'rgba(47,111,214,0.25)'; fillRR(c, 14, 5, w - 28, 19, 1, 'rgba(47,111,214,0.18)');
    c.fillStyle = '#2F6FD6'; c.beginPath(); c.moveTo(w / 2 - 5, 9); c.lineTo(w / 2 + 7, 14.5); c.lineTo(w / 2 - 5, 20); c.closePath(); c.fill();
    c.fillStyle = '#D8B664'; c.fillRect(10, 26, w - 20, 2);
  };
  P.codewall = function (c, p) {
    var w = p.w * T;
    fillRR(c, 3, 1, w - 6, 26, 3, '#1C1440');
    var cols = ['#D8B664', '#7FD1AE', '#9DB7FF', '#F59FC0', '#FFFFFF'];
    for (var r = 0; r < 5; r++) {
      var x = 9 + (r % 3) * 6;
      for (var k = 0; k < 4; k++) {
        var len = 6 + hash(r, k, 3) * 16; c.fillStyle = cols[(r + k) % cols.length]; c.globalAlpha = 0.85;
        c.fillRect(x, 5 + r * 4, len, 2); x += len + 4; if (x > w - 50) break;
      }
    }
    c.globalAlpha = 1;
    text(c, '</>', w - 30, 14, 14, '#D8B664', 800);
  };
  P.vaultdoor = function (c, p) {
    var w = p.w * T, cx = w / 2, cy = 13;
    fillRR(c, 6, 1, w - 12, 27, 3, '#4A566C');
    c.fillStyle = 'rgba(255,255,255,0.12)'; c.fillRect(6, 1, w - 12, 2);
    circle(c, cx, cy, 13, '#2E3647');
    var g = c.createRadialGradient(cx - 4, cy - 4, 2, cx, cy, 12); g.addColorStop(0, '#E3E8F0'); g.addColorStop(1, '#8D98AB');
    circle(c, cx, cy, 11.5, g);
    circle(c, cx, cy, 7, '#B8C2D2');
    c.strokeStyle = '#D8B664'; c.lineWidth = 2; c.lineCap = 'round';
    for (var i = 0; i < 6; i++) { var a = i / 6 * Math.PI * 2; c.beginPath(); c.moveTo(cx + Math.cos(a) * 3, cy + Math.sin(a) * 3); c.lineTo(cx + Math.cos(a) * 9.5, cy + Math.sin(a) * 9.5); c.stroke(); }
    circle(c, cx, cy, 3, '#D8B664');
    for (var b = 0; b < 8; b++) { var a2 = b / 8 * Math.PI * 2 + 0.2; circle(c, cx + Math.cos(a2) * 12.5, cy + Math.sin(a2) * 12.5, 1, '#D8B664'); }
    // hinges and labels
    c.fillStyle = '#2E3647'; c.fillRect(cx - 22, cy - 6, 5, 4); c.fillRect(cx - 22, cy + 3, 5, 4);
    text(c, 'STU-004', 34, 9, 7, '#D8B664', 800);
    text(c, '🔒', w - 32, 14, 10, '#FFFFFF', 400);
  };
  P.doorsign = function (c, p) {
    var w = p.w * T, q = p.quest;
    c.fillStyle = 'rgba(30,16,60,0.25)'; c.fillRect(w / 2 - 1, 0, 2, 4);
    fillRR(c, 4, 4, w - 8, 21, 4, q.color);
    fillRR(c, 6, 6, 15, 17, 3, '#FFFFFF');
    text(c, String(q.station), 13.5, 15, 12, q.color, 800);
    text(c, tr(q.room).replace(/^The /, ''), 23 + (w - 27) / 2, 15, 8, '#FFFFFF', 800, 'center', w - 32);
  };
  P.doorframe = function (c, p) {
    var w = p.w * T, col = p.color;
    c.fillStyle = shade(col, -0.15);
    c.fillRect(-4, 0, 4, T - 3); c.fillRect(w, 0, 4, T - 3);
    c.fillStyle = col; c.fillRect(-4, 0, w + 8, 4);
    c.fillStyle = 'rgba(255,255,255,0.3)'; c.fillRect(-4, 0, w + 8, 1);
  };
  P.glowring = function (c, p) {
    var w = p.w * T, h = p.h * T, col = p.color;
    var g = c.createRadialGradient(w / 2, h / 2, 4, w / 2, h / 2, Math.max(w, h) / 2);
    g.addColorStop(0, rgba(col, 0.35)); g.addColorStop(0.6, rgba(col, 0.12)); g.addColorStop(1, rgba(col, 0));
    c.fillStyle = g; c.beginPath(); c.ellipse(w / 2, h / 2, w / 2, h / 2, 0, 0, 7); c.fill();
    c.beginPath(); c.ellipse(w / 2, h / 2, w / 2 - 14, h / 2 - 12, 0, 0, 7); c.strokeStyle = rgba(col, 0.45); c.lineWidth = 1.5; c.setLineDash([4, 4]); c.stroke(); c.setLineDash([]);
  };
  P.court = function (c, p) {
    var w = p.w * T, h = p.h * T;
    c.strokeStyle = 'rgba(255,255,255,0.85)'; c.lineWidth = 2;
    c.strokeRect(2, 2, w - 4, h - 4);
    c.beginPath(); c.arc(w / 2, h / 2 - 8, 40, 0, 7); c.stroke();
    c.strokeStyle = rgba(p.color, 0.6); c.lineWidth = 3; c.beginPath(); c.arc(w / 2, h / 2 - 8, 48, 0, 7); c.stroke();
  };
  P.mats = function (c, p) {
    var cols = ['#E5533A', '#2F6FD6', '#2E9E6B', '#D8B664', '#7B4FD6', '#D1477A'];
    for (var i = 0; i < 6; i++) {
      var mx = (i % 3) * 40 + 6, my = Math.floor(i / 3) * 40 + 8;
      fillRR(c, mx + 2, my + 3, 34, 34, 5, 'rgba(30,16,60,0.15)');
      fillRR(c, mx, my, 34, 34, 5, cols[i]);
      c.fillStyle = 'rgba(255,255,255,0.25)'; c.fillRect(mx + 3, my + 3, 28, 4);
      text(c, String(i + 1), mx + 17, my + 19, 13, '#FFFFFF', 800);
    }
  };
  P.stage = function (c, p) {
    var w = p.w * T, h = p.h * T;
    fillRR(c, 0, 6, w, h - 6, 6, shade(p.color, -0.35));
    fillRR(c, 0, 0, w, h - 8, 6, '#2B2052');
    c.fillStyle = 'rgba(255,255,255,0.08)'; for (var i = 8; i < w; i += 12) c.fillRect(i, 2, 1, h - 12);
    c.fillStyle = '#D8B664'; c.fillRect(0, h - 10, w, 2);
    var g = c.createRadialGradient(w / 2, h / 2 - 6, 2, w / 2, h / 2 - 6, 40); g.addColorStop(0, 'rgba(255,240,180,0.45)'); g.addColorStop(1, 'rgba(255,240,180,0)');
    c.fillStyle = g; c.beginPath(); c.ellipse(w / 2, h / 2 - 6, 44, 28, 0, 0, 7); c.fill();
  };
  P.carpetrunner = function (c, p) {
    var w = p.w * T, h = p.h * T;
    c.fillStyle = 'rgba(142,31,47,0.55)'; c.fillRect(8, 0, w - 16, h);
    c.fillStyle = 'rgba(216,182,100,0.6)'; c.fillRect(8, 0, 2, h); c.fillRect(w - 10, 0, 2, h);
    for (var y = 12; y < h; y += 24) { c.fillStyle = 'rgba(255,230,150,0.45)'; circle(c, 4, y, 1.6, 'rgba(255,230,150,0.6)'); circle(c, w - 4, y, 1.6, 'rgba(255,230,150,0.6)'); }
  };

  /* ---- standing props ---- */
  P.kiosk = function (c, p, now, state) {
    var w = p.w * T, q = p.quest, col = q.color, t = now / 1000;
    var done = state && state.done;
    shadow(c, w / 2, T - 3, w / 2 - 4, 6, 0.22);
    // base
    fillRR(c, 6, 8, w - 12, T - 10, 5, shade(col, -0.3));
    fillRR(c, 6, 6, w - 12, T - 14, 5, col);
    c.fillStyle = 'rgba(255,255,255,0.25)'; c.fillRect(10, 8, w - 20, 2);
    // screen post
    c.fillStyle = '#2B2052'; c.fillRect(w / 2 - 3, -14, 6, 22);
    // screen
    fillRR(c, 8, -40, w - 16, 30, 5, '#2B2052');
    var g = c.createLinearGradient(0, -38, 0, -12); g.addColorStop(0, shade(col, 0.25)); g.addColorStop(1, shade(col, -0.1));
    fillRR(c, 11, -37, w - 22, 24, 3, g);
    c.fillStyle = 'rgba(255,255,255,0.18)'; c.beginPath(); c.moveTo(11, -20); c.lineTo(28, -37); c.lineTo(36, -37); c.lineTo(19, -20); c.fill();
    text(c, tr({ en: 'STATION', ar: 'المحطة' }), w / 2, -31, 6.5, 'rgba(255,255,255,0.9)', 800);
    text(c, String(q.station), w / 2, -21, 13, '#FFFFFF', 800);
    // pulse
    var pulse = (Math.sin(t * 3) + 1) / 2;
    c.strokeStyle = done ? 'rgba(216,182,100,' + (0.4 + pulse * 0.4) + ')' : rgba(col, 0.25 + pulse * 0.5);
    c.lineWidth = 2; rr(c, 8, -40, w - 16, 30, 5); c.stroke();
    // floating badge
    var img = state && state.badgeImg;
    if (img && img.complete && img.naturalWidth) {
      var bob = Math.sin(t * 2.2) * 3, s = 32;
      c.save(); c.globalAlpha = done ? 1 : 0.95;
      c.drawImage(img, w / 2 - s / 2, -80 + bob, s, s);
      c.restore();
    }
  };
  P.bookshelf = function (c, p) {
    var w = p.w * T, H = (p.top + p.h) * T, y0 = -p.top * T;
    shadow(c, w / 2, T - 4, w / 2 - 2, 4, 0.2);
    fillRR(c, 1, y0, w - 2, H - 4, 3, '#7A4A28');
    c.fillStyle = '#5E361C'; c.fillRect(4, y0 + 4, w - 8, H - 12);
    var shelves = 3, sh = (H - 12) / shelves;
    var bookCols = ['#E5533A', '#2F6FD6', '#2E9E6B', '#D8B664', '#7B4FD6', '#D1477A', '#F3EFE6', '#21076C'];
    for (var s = 0; s < shelves; s++) {
      var sy = y0 + 4 + s * sh, x = 6;
      while (x < w - 8) {
        var bw = 3 + Math.floor(hash(x, s, p.variant + p.id) * 4), bh = sh - 4 - Math.floor(hash(x, s + 9, p.id) * 5);
        if (x + bw > w - 6) break;
        c.fillStyle = bookCols[Math.floor(hash(x, s, p.id + 3) * bookCols.length)];
        if (hash(x, s, p.id + 7) < 0.12) { c.save(); c.translate(x, sy + sh - 2); c.rotate(-0.25); c.fillRect(0, -bh, bw, bh); c.restore(); x += bw + 3; continue; }
        c.fillRect(x, sy + sh - 2 - bh, bw, bh);
        c.fillStyle = 'rgba(255,255,255,0.3)'; c.fillRect(x, sy + sh - bh + 1, bw, 1);
        x += bw + 0.6;
      }
      c.fillStyle = '#8A5632'; c.fillRect(4, sy + sh - 2, w - 8, 3);
    }
    c.fillStyle = 'rgba(255,255,255,0.15)'; c.fillRect(1, y0, w - 2, 2);
  };
  P.table = function (c, p) {
    var w = p.w * T, h = p.h * T, col = p.color || '#C98E58';
    shadow(c, w / 2, h - 2, w / 2 - 2, 5, 0.18);
    c.fillStyle = shade(col, -0.35); c.fillRect(4, 8, 3, h - 10); c.fillRect(w - 7, 8, 3, h - 10);
    fillRR(c, 1, -6, w - 2, h - 2, 4, shade(col, -0.2));
    fillRR(c, 1, -8, w - 2, h - 6, 4, col);
    c.fillStyle = 'rgba(255,255,255,0.25)'; c.fillRect(5, -6, w - 10, 1.5);
    var items = p.items;
    if (items === 'books') {
      [['#2F6FD6', 10, 0], ['#E5533A', 14, 2], ['#D8B664', w - 26, 4]].forEach(function (b) { c.fillStyle = b[0]; c.fillRect(b[1], b[2], 14, 9); c.fillStyle = '#FFFFFF'; c.fillRect(b[1] + 1, b[2] + 1, 12, 1); });
      c.fillStyle = '#FFFFFF'; c.fillRect(w / 2 - 8, 6, 16, 11); c.fillStyle = 'rgba(0,0,0,0.15)'; c.fillRect(w / 2, 6, 1, 11);
    } else if (items === 'cups') {
      [[10, 2], [w - 18, 10], [w / 2, 4]].forEach(function (k) { circle(c, k[0] + 4, k[1] + 4, 4, '#FFFFFF'); circle(c, k[0] + 4, k[1] + 4, 2.6, '#7A4A28'); });
    } else if (items === 'papers') {
      c.fillStyle = '#FFFFFF'; c.fillRect(8, 0, 14, 18); c.fillRect(w - 24, 6, 14, 18);
      c.fillStyle = 'rgba(33,7,108,0.3)'; for (var k = 0; k < 4; k++) { c.fillRect(10, 3 + k * 4, 10, 1); c.fillRect(w - 22, 9 + k * 4, 10, 1); }
    }
  };
  P.desk = function (c, p) {
    var w = p.w * T, col = p.color || '#EEE';
    shadow(c, w / 2, T - 3, w / 2 - 2, 4, 0.18);
    c.fillStyle = '#8D86A3'; c.fillRect(3, 6, 3, T - 8); c.fillRect(w - 6, 6, 3, T - 8);
    fillRR(c, 0, -4, w, 16, 3, shade(col, -0.15)); fillRR(c, 0, -6, w, 14, 3, col);
    var items = p.items, n = Math.max(1, Math.round(p.w));
    for (var i = 0; i < n; i++) {
      var cx = (i + 0.5) * T;
      if (items === 'laptops') {
        fillRR(c, cx - 10, -18, 20, 13, 2, '#3B3550'); fillRR(c, cx - 8, -16, 16, 9, 1, i % 2 ? '#9DB7FF' : '#F7C9A3');
        c.fillStyle = '#C8C3D6'; c.fillRect(cx - 12, -5, 24, 3);
      } else if (items === 'monitors') {
        c.fillStyle = '#3B3550'; c.fillRect(cx - 2, -8, 4, 6);
        fillRR(c, cx - 12, -26, 24, 18, 2, '#1C1440');
        var colors = ['#7FD1AE', '#9DB7FF', '#D8B664', '#F59FC0'];
        for (var k = 0; k < 4; k++) { c.fillStyle = colors[(k + i) % 4]; c.fillRect(cx - 9 + (k % 2) * 2, -23 + k * 3.5, 6 + hash(i, k, p.id) * 9, 1.6); }
        c.fillStyle = '#C8C3D6'; c.fillRect(cx - 8, -1, 16, 3);
      } else if (items === 'lock') {
        if (i === 0) { fillRR(c, cx - 7, -14, 14, 11, 2, '#D8B664'); c.strokeStyle = '#8D98AB'; c.lineWidth = 2.5; c.beginPath(); c.arc(cx, -14, 4.5, Math.PI, 0); c.stroke(); circle(c, cx, -9, 1.6, '#5A4520'); }
        else { c.fillStyle = '#FFFFFF'; c.fillRect(cx - 9, -6, 18, 10); c.fillStyle = '#21076C'; c.fillRect(cx - 7, -4, 9, 1.2); c.fillRect(cx - 7, -1, 12, 1.2); }
      } else if (items === 'files') {
        ['#E5533A', '#D8B664', '#2F6FD6'].forEach(function (fc, k) { c.fillStyle = fc; c.fillRect(cx - 10 + k * 2, -8 - k * 3, 18, 4); });
        if (i === 1) text(c, 'TOP SECRET', cx, 4, 5, '#E5533A', 800);
      }
    }
  };
  P.chair = function (c, p) {
    var col = p.color || '#5B45A8';
    shadow(c, 16, 28, 9, 3, 0.15);
    c.fillStyle = '#5A5470'; c.fillRect(9, 18, 2, 10); c.fillRect(21, 18, 2, 10);
    fillRR(c, 7, 12, 18, 10, 3, shade(col, -0.1));
    if (p.back) fillRR(c, 7, 18, 18, 9, 3, col); else fillRR(c, 7, 2, 18, 12, 3, col);
    c.fillStyle = 'rgba(255,255,255,0.25)'; c.fillRect(9, p.back ? 19 : 3, 14, 1.5);
  };
  P.armchair = function (c, p) {
    var col = p.color;
    shadow(c, 16, 29, 14, 4, 0.18);
    fillRR(c, 2, -6, 28, 20, 7, shade(col, -0.2));
    fillRR(c, 1, 6, 30, 22, 6, shade(col, -0.1));
    fillRR(c, 6, 4, 20, 16, 5, col);
    fillRR(c, 0, 4, 7, 22, 4, shade(col, -0.25)); fillRR(c, 25, 4, 7, 22, 4, shade(col, -0.25));
  };
  P.globe = function (c, p) {
    shadow(c, 16, 29, 8, 3, 0.18);
    c.fillStyle = '#7A4A28'; c.fillRect(14, 10, 4, 18); fillRR(c, 8, 25, 16, 4, 2, '#5E361C');
    circle(c, 16, 0, 11, '#3E8FD8');
    c.fillStyle = '#5DBB63'; c.beginPath(); c.ellipse(12, -3, 5, 4, 0.4, 0, 7); c.fill(); c.beginPath(); c.ellipse(20, 4, 4, 5, -0.3, 0, 7); c.fill();
    c.strokeStyle = '#D8B664'; c.lineWidth = 1.6; c.beginPath(); c.arc(16, 0, 13, -1.9, 1.3); c.stroke();
    c.fillStyle = 'rgba(255,255,255,0.35)'; c.beginPath(); c.arc(12, -5, 3, 0, 7); c.fill();
  };
  P.plant = function (c, p) {
    var v = p.variant || 0;
    shadow(c, 16, 29, 9, 3, 0.2);
    fillRR(c, 8, 14, 16, 15, 4, ['#E5733A', '#FFFFFF', '#21076C'][v]);
    c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(8, 24, 16, 5);
    c.fillStyle = 'rgba(255,255,255,0.25)'; c.fillRect(10, 16, 12, 2);
    c.fillStyle = '#5A3A20'; c.fillRect(10, 13, 12, 3);
    var leaf = ['#3E9A4E', '#4FB062', '#2E7F3E'];
    if (v === 2) { // cactus
      fillRR(c, 12, -10, 8, 26, 4, '#4FA060'); fillRR(c, 4, -2, 6, 10, 3, '#4FA060'); fillRR(c, 22, -6, 6, 10, 3, '#4FA060');
      c.fillStyle = 'rgba(255,255,255,0.4)'; c.fillRect(15, -8, 1, 20);
      circle(c, 16, -11, 2.4, '#F08CA8');
      return;
    }
    for (var i = 0; i < 7; i++) {
      var a = -Math.PI / 2 + (i - 3) * 0.42;
      c.save(); c.translate(16, 12); c.rotate(a + Math.PI / 2);
      c.fillStyle = leaf[i % 3]; c.beginPath(); c.ellipse(0, -12 - (i % 2) * 3, 4.5, 11, 0, 0, 7); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.18)'; c.fillRect(-0.5, -22, 1, 16);
      c.restore();
    }
  };
  P.easel = function (c, p) {
    shadow(c, 16, 29, 10, 3, 0.18);
    c.strokeStyle = '#8A5632'; c.lineWidth = 2.5; c.lineCap = 'round';
    c.beginPath(); c.moveTo(16, -32); c.lineTo(6, 28); c.moveTo(16, -32); c.lineTo(26, 28); c.moveTo(16, -24); c.lineTo(16, 26); c.stroke();
    fillRR(c, 2, -30, 28, 22, 2, '#FFFFFF');
    c.fillStyle = p.color; c.fillRect(4, -28, 24, 6);
    c.fillStyle = 'rgba(33,7,108,0.4)'; c.fillRect(5, -19, 12, 2); c.fillRect(5, -15, 9, 2);
    c.fillStyle = p.color; c.globalAlpha = 0.7; c.fillRect(19, -18, 3, 8); c.fillRect(23, -15, 3, 5); c.globalAlpha = 1;
    c.fillStyle = '#8A5632'; c.fillRect(1, -8, 30, 3);
  };
  P.beanbag = function (c, p) {
    shadow(c, 16, 27, 13, 4, 0.18);
    c.fillStyle = shade(p.color, -0.15); c.beginPath(); c.ellipse(16, 18, 14, 10, 0, 0, 7); c.fill();
    c.fillStyle = p.color; c.beginPath(); c.ellipse(16, 14, 12, 9, 0, 0, 7); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.25)'; c.beginPath(); c.ellipse(12, 10, 5, 2.5, -0.4, 0, 7); c.fill();
  };
  P.bleachers = function (c, p) {
    var w = p.w * T;
    shadow(c, w / 2, T - 3, w / 2, 4, 0.18);
    for (var i = 0; i < 3; i++) {
      fillRR(c, 0, -12 + i * 12, w, 10, 2, shade(p.color, -0.1 - i * 0.08));
      c.fillStyle = 'rgba(255,255,255,0.3)'; c.fillRect(2, -12 + i * 12, w - 4, 1.5);
    }
    c.fillStyle = '#8D86A3'; c.fillRect(2, 22, 3, 8); c.fillRect(w - 5, 22, 3, 8);
  };
  P.mic = function (c, p) {
    shadow(c, 16, 28, 6, 2, 0.2);
    c.strokeStyle = '#3B3550'; c.lineWidth = 2; c.beginPath(); c.moveTo(16, 27); c.lineTo(16, -6); c.lineTo(22, -12); c.stroke();
    c.beginPath(); c.moveTo(10, 28); c.lineTo(22, 28); c.stroke();
    fillRR(c, 20, -18, 7, 9, 3, '#3B3550'); c.fillStyle = 'rgba(255,255,255,0.3)'; c.fillRect(21, -17, 2, 6);
  };
  P.cone = function (c, p) {
    shadow(c, 16, 27, 9, 3, 0.2);
    fillRR(c, 6, 22, 20, 5, 1, '#E5733A');
    c.fillStyle = '#F08A3E'; c.beginPath(); c.moveTo(16, 0); c.lineTo(24, 23); c.lineTo(8, 23); c.closePath(); c.fill();
    c.fillStyle = '#FFFFFF'; c.beginPath(); c.moveTo(12.3, 11); c.lineTo(19.7, 11); c.lineTo(21, 15); c.lineTo(11, 15); c.closePath(); c.fill();
  };
  P.seats = function (c, p) {
    var w = p.w * T;
    shadow(c, w / 2, T - 2, w / 2, 4, 0.25);
    for (var i = 0; i < p.w * 2; i++) {
      var x = i * 16 + 1;
      fillRR(c, x, -6, 14, 12, 3, '#8E1F2F');
      fillRR(c, x, 4, 14, 14, 3, '#B42C3F');
      c.fillStyle = 'rgba(255,255,255,0.18)'; c.fillRect(x + 2, -4, 10, 1.5);
      c.fillStyle = '#5E1520'; c.fillRect(x - 1, 2, 2, 18);
    }
    c.fillStyle = '#5E1520'; c.fillRect(w - 2, 2, 2, 18);
  };
  P.popcorn = function (c, p) {
    shadow(c, 16, 29, 11, 3, 0.2);
    fillRR(c, 4, 12, 24, 17, 2, '#B42C3F'); c.fillStyle = '#D8B664'; c.fillRect(4, 12, 24, 3);
    fillRR(c, 3, -20, 26, 33, 3, '#B42C3F');
    fillRR(c, 6, -16, 20, 22, 2, 'rgba(220,240,255,0.85)');
    for (var i = 0; i < 18; i++) circle(c, 8 + hash(i, 1) * 16, -2 + hash(i, 2) * 7, 2.2, i % 4 ? '#FFF6D8' : '#F5D04B');
    c.fillStyle = '#D8B664'; fillRR(c, 6, -26, 20, 7, 3, '#D8B664');
    text(c, 'POP', 16, -22.5, 5.5, '#B42C3F', 800);
  };
  P.filmreel = function (c, p) {
    shadow(c, 16, 28, 10, 3, 0.2);
    c.fillStyle = '#3B3550'; c.fillRect(14, 8, 4, 20); fillRR(c, 8, 25, 16, 4, 2, '#3B3550');
    circle(c, 16, 0, 12, '#2B2052'); circle(c, 16, 0, 3, '#D8B664');
    for (var i = 0; i < 6; i++) { var a = i / 6 * Math.PI * 2; circle(c, 16 + Math.cos(a) * 7, Math.sin(a) * 7, 2.6, '#8D86A3'); }
  };
  P.arcade = function (c, p) {
    var H = (p.top + 1) * T, y0 = -p.top * T;
    shadow(c, 16, 29, 13, 4, 0.25);
    fillRR(c, 2, y0, 28, H - 2, 3, '#7B4FD6');
    c.fillStyle = '#5A35AA'; c.fillRect(2, y0 + 12, 28, 3);
    fillRR(c, 4, y0 + 2, 24, 9, 2, '#D8B664'); text(c, 'LEO', 16, y0 + 6.8, 6, '#21076C', 800);
    fillRR(c, 5, y0 + 16, 22, 17, 2, '#140E30');
    c.fillStyle = '#7FD1AE'; c.fillRect(8, y0 + 26, 4, 4); c.fillStyle = '#F59FC0'; c.fillRect(18, y0 + 20, 4, 4); c.fillStyle = '#D8B664'; c.fillRect(13, y0 + 22, 2, 2);
    fillRR(c, 3, y0 + 35, 26, 8, 2, '#3B2A7A');
    circle(c, 10, y0 + 39, 2.4, '#E5533A'); circle(c, 20, y0 + 39, 2, '#2F6FD6'); circle(c, 25, y0 + 39, 2, '#2E9E6B');
  };
  P.server = function (c, p, now) {
    var H = (p.top + 1) * T, y0 = -p.top * T;
    shadow(c, 16, 29, 12, 4, 0.25);
    fillRR(c, 4, y0, 24, H - 2, 2, '#2B2052');
    for (var i = 0; i < 6; i++) {
      c.fillStyle = '#3B3170'; c.fillRect(6, y0 + 4 + i * 9, 20, 7);
      var on = Math.sin((now || 0) / 180 + i * 1.7) > 0;
      circle(c, 9, y0 + 7.5 + i * 9, 1.3, on ? '#7FD1AE' : '#2E5A4A');
      circle(c, 13, y0 + 7.5 + i * 9, 1.3, Math.sin((now || 0) / 260 + i) > 0.3 ? '#D8B664' : '#5A4A20');
    }
  };
  P.safeboxes = function (c, p) {
    var w = p.w * T, H = (p.top + 1) * T, y0 = -p.top * T;
    shadow(c, w / 2, T - 3, w / 2 - 2, 4, 0.25);
    fillRR(c, 1, y0, w - 2, H - 3, 3, '#5D6B83');
    for (var r = 0; r < 4; r++) for (var k = 0; k < 4; k++) {
      var bx = 4 + k * ((w - 8) / 4), by = y0 + 4 + r * ((H - 12) / 4);
      fillRR(c, bx, by, (w - 8) / 4 - 2, (H - 12) / 4 - 2, 1.5, hash(r, k, p.id) < 0.15 ? '#D8B664' : '#AEB8C8');
      circle(c, bx + (w - 8) / 8 - 1, by + (H - 12) / 8 - 1, 1.2, '#4A566C');
    }
  };
  P.stanchion = function (c, p) {
    shadow(c, 16, 28, 6, 2, 0.2);
    c.fillStyle = '#C9A24E'; c.fillRect(14, 2, 4, 25); fillRR(c, 10, 25, 12, 4, 2, '#B28A3A');
    circle(c, 16, 2, 3.5, '#E8C877');
    c.strokeStyle = '#8E1F2F'; c.lineWidth = 3; c.lineCap = 'round';
    var dir = p.rope === 'right' ? 1 : -1;
    c.beginPath(); c.moveTo(16, 5); c.quadraticCurveTo(16 + dir * 30, 16, 16 + dir * 52, 5); c.stroke();
  };
  P.reception = function (c, p) {
    var w = p.w * T;
    shadow(c, w / 2, T - 2, w / 2, 5, 0.22);
    fillRR(c, 0, -14, w, 44, 6, '#2B2052');
    fillRR(c, 0, -16, w, 14, 6, '#4E3B96');
    c.fillStyle = '#D8B664'; c.fillRect(0, 0, w, 3);
    c.fillStyle = 'rgba(255,255,255,0.08)'; for (var i = 10; i < w; i += 18) c.fillRect(i, 6, 8, 20);
    fillRR(c, w / 2 - 40, 8, 80, 14, 3, '#21076C');
    text(c, PD.lang === 'ar' ? 'الاستقبال' : 'WELCOME', w / 2, 15.5, 8, '#D8B664', 800);
    fillRR(c, 18, -30, 22, 16, 2, '#1C1440'); fillRR(c, 20, -28, 18, 11, 1, '#9DB7FF'); c.fillStyle = '#1C1440'; c.fillRect(27, -14, 4, 4);
    circle(c, w - 30, -12, 4, '#D8B664'); c.fillStyle = '#8D6A20'; c.fillRect(w - 34, -9, 8, 2);
  };
  P.trophycase = function (c, p, now, state) {
    var w = p.w * T, H = (p.top + 1) * T, y0 = -p.top * T;
    shadow(c, w / 2, T - 3, w / 2 - 2, 4, 0.22);
    fillRR(c, 0, y0, w, H - 2, 4, '#5E361C');
    var g = c.createLinearGradient(0, y0, 0, y0 + H); g.addColorStop(0, 'rgba(210,235,255,0.9)'); g.addColorStop(1, 'rgba(170,200,235,0.9)');
    fillRR(c, 4, y0 + 4, w - 8, H - 14, 2, g);
    c.fillStyle = '#7A4A28'; c.fillRect(4, y0 + (H - 14) / 2 + 3, w - 8, 2);
    var imgs = (state && state.badgeImgs) || [];
    var per = Math.ceil(imgs.length / 2) || 3, s = Math.min(18, (w - 12) / per - 2);
    imgs.forEach(function (it, i) {
      var row = i < per ? 0 : 1, k = row ? i - per : i;
      var bx = 6 + k * ((w - 12) / per) + ((w - 12) / per - s) / 2, by = y0 + 6 + row * ((H - 14) / 2);
      if (it.img && it.img.complete && it.img.naturalWidth) {
        c.save(); c.globalAlpha = it.earned ? 1 : 0.35; c.drawImage(it.img, bx, by, s, s); c.restore();
      }
    });
    c.fillStyle = 'rgba(255,255,255,0.45)'; c.beginPath(); c.moveTo(8, y0 + H - 14); c.lineTo(20, y0 + 6); c.lineTo(26, y0 + 6); c.lineTo(14, y0 + H - 14); c.fill();
    fillRR(c, w / 2 - 22, y0 + H - 10, 44, 7, 2, '#D8B664');
    text(c, PD.lang === 'ar' ? 'الأوسمة' : 'BADGES', w / 2, y0 + H - 6.3, 5.5, '#21076C', 800);
  };
  P.questboard = function (c, p, now, state) {
    var w = p.w * T, y0 = -p.top * T;
    shadow(c, w / 2, T - 3, w / 2 - 4, 4, 0.2);
    c.fillStyle = '#7A4A28'; c.fillRect(8, 10, 3, T - 12); c.fillRect(w - 11, 10, 3, T - 12);
    fillRR(c, 0, y0, w, 48, 4, '#7A4A28');
    fillRR(c, 3, y0 + 3, w - 6, 42, 2, '#D9A86A');
    c.fillStyle = 'rgba(122,74,40,0.25)'; for (var k = 0; k < 20; k++) c.fillRect(4 + hash(k, 1) * (w - 10), y0 + 4 + hash(k, 2) * 38, 1.5, 1.5);
    fillRR(c, w / 2 - 26, y0 + 4, 52, 9, 2, '#21076C');
    text(c, PD.lang === 'ar' ? 'المهمات' : 'QUESTS', w / 2, y0 + 8.7, 6, '#D8B664', 800);
    var qs = PD.quests, per = Math.ceil(qs.length / 2), nw = 14, gap = (w - 12 - per * nw) / Math.max(1, per - 1);
    qs.forEach(function (q, i) {
      var row = i < per ? 0 : 1, k = row ? i - per : i;
      var nx = 6 + k * (nw + gap), ny = y0 + 16 + row * 15;
      c.save(); c.translate(nx + nw / 2, ny + 6); c.rotate(((i * 37) % 7 - 3) * 0.03);
      c.fillStyle = 'rgba(0,0,0,0.15)'; c.fillRect(-nw / 2 + 1, -5, nw, 12);
      c.fillStyle = q.color; c.fillRect(-nw / 2, -6, nw, 12);
      var done = state && state.done && state.done[q.id];
      if (done) { c.strokeStyle = '#FFFFFF'; c.lineWidth = 2; c.lineCap = 'round'; c.beginPath(); c.moveTo(-3.5, 0); c.lineTo(-1, 2.5); c.lineTo(4, -3); c.stroke(); }
      else text(c, String(q.station), 0, 0.5, 7, '#FFFFFF', 800);
      c.restore();
      circle(c, nx + nw / 2, ny, 1.4, '#E5533A');
    });
  };
  P.bench = function (c, p) {
    var w = p.w * T, h = p.h * T, col = p.color || '#5B45A8';
    shadow(c, w / 2, h - 3, w / 2 - 2, 4, 0.18);
    if (p.horizontal) {
      fillRR(c, 1, 6, w - 2, 12, 3, col); c.fillStyle = 'rgba(255,255,255,0.25)'; c.fillRect(4, 8, w - 8, 1.5);
      c.fillStyle = '#3B3550'; c.fillRect(4, 18, 3, 9); c.fillRect(w - 7, 18, 3, 9);
    } else {
      fillRR(c, 6, 2, 20, h - 6, 3, col); c.fillStyle = 'rgba(255,255,255,0.25)'; c.fillRect(8, 4, 1.5, h - 10);
      c.fillStyle = shade(col, -0.25); for (var i = 1; i < p.h; i++) c.fillRect(6, i * T - 1, 20, 2);
    }
  };
  P.sofa = function (c, p) {
    var w = p.w * T, col = p.color;
    shadow(c, w / 2, T - 2, w / 2, 5, 0.2);
    fillRR(c, 0, -10, w, 18, 7, shade(col, -0.2));
    fillRR(c, 2, 2, w - 4, 26, 6, shade(col, -0.08));
    for (var i = 0; i < p.w; i++) { fillRR(c, 6 + i * ((w - 12) / p.w), 2, (w - 12) / p.w - 2, 18, 4, col); c.fillStyle = 'rgba(255,255,255,0.2)'; c.fillRect(9 + i * ((w - 12) / p.w), 4, (w - 12) / p.w - 8, 1.5); }
    fillRR(c, -2, -2, 9, 28, 4, shade(col, -0.25)); fillRR(c, w - 7, -2, 9, 28, 4, shade(col, -0.25));
  };
  P.coffeetable = function (c, p) {
    var w = p.w * T, h = p.h * T;
    shadow(c, w / 2, h, w / 2 - 2, 3, 0.18);
    fillRR(c, 2, 0, w - 4, h - 2, 4, '#7A4A28'); fillRR(c, 2, -2, w - 4, h - 4, 4, '#A06A3E');
    c.fillStyle = '#FFFFFF'; c.fillRect(10, 2, 12, 9); c.fillStyle = '#D8B664'; c.fillRect(12, 4, 8, 1.5);
    circle(c, w - 14, 7, 3.5, '#FFFFFF'); circle(c, w - 14, 7, 2.2, '#7A4A28');
  };
  P.bell = function (c, p) {
    shadow(c, 16, 28, 8, 3, 0.2);
    c.fillStyle = '#5E361C'; c.fillRect(14, 2, 4, 26); fillRR(c, 8, 25, 16, 4, 2, '#5E361C');
    c.fillStyle = '#5E361C'; c.fillRect(6, -6, 20, 3);
    c.fillStyle = '#E8C04A'; c.beginPath(); c.moveTo(10, 12); c.quadraticCurveTo(10, -3, 16, -3); c.quadraticCurveTo(22, -3, 22, 12); c.closePath(); c.fill();
    fillRR(c, 8, 10, 16, 3, 1.5, '#C9A030'); circle(c, 16, 14.5, 2, '#8D6A20');
    c.fillStyle = 'rgba(255,255,255,0.5)'; c.fillRect(12.5, 0, 1.5, 9);
  };
  P.lostfound = function (c, p) {
    shadow(c, 16, 29, 13, 3, 0.2);
    fillRR(c, 2, 6, 28, 22, 2, '#C98E58'); c.fillStyle = '#A9743F'; c.fillRect(2, 6, 28, 4);
    c.fillStyle = '#2F6FD6'; c.fillRect(6, 0, 5, 9); circle(c, 8.5, 0, 2.6, '#2F6FD6');
    c.fillStyle = '#E5533A'; fillRR(c, 13, 1, 9, 7, 2, '#E5533A');
    c.fillStyle = '#2E9E6B'; c.fillRect(23, -2, 4, 10);
    fillRR(c, 6, 14, 20, 8, 1, '#FFFFFF'); text(c, PD.lang === 'ar' ? 'مفقودات' : 'LOST', 16, 18.3, 5.5, '#21076C', 800);
  };
  P.counter = function (c, p) {
    var w = p.w * T;
    shadow(c, w / 2, T - 2, w / 2, 4, 0.2);
    fillRR(c, 0, -8, w, 38, 3, '#F3EFF9');
    c.fillStyle = '#DAD3E8'; for (var i = 1; i < p.w; i++) c.fillRect(i * T, 6, 1, 22);
    c.fillStyle = '#B8AFCB'; for (i = 0; i < p.w; i++) c.fillRect(i * T + T / 2 - 4, 14, 8, 2);
    fillRR(c, -1, -10, w + 2, 14, 3, '#8D86A3'); c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(1, -9, w - 2, 1.5);
    // kettle and mugs
    fillRR(c, w - 26, -20, 12, 12, 4, '#E5533A'); c.fillStyle = '#3B3550'; c.fillRect(w - 23, -22, 6, 2);
    circle(c, w - 6, -7, 3, '#FFFFFF'); circle(c, 76, -7, 3, '#D8B664');
  };
  P.coffee = function (c, p, now) {
    shadow(c, 16, 22, 10, 3, 0.15);
    fillRR(c, 5, -22, 22, 34, 3, '#2B2052');
    fillRR(c, 7, -20, 18, 8, 2, '#4E3B96'); c.fillStyle = '#7FD1AE'; c.fillRect(9, -18, 8, 3);
    circle(c, 21, -16, 1.5, '#D8B664');
    c.fillStyle = '#1C1440'; c.fillRect(9, -10, 14, 16);
    fillRR(c, 12, -1, 8, 7, 1.5, '#FFFFFF');
    var t = (now || 0) / 600;
    c.strokeStyle = 'rgba(255,255,255,0.55)'; c.lineWidth = 1.2;
    for (var i = 0; i < 2; i++) { c.beginPath(); var sx = 14 + i * 4; c.moveTo(sx, -2); c.quadraticCurveTo(sx + Math.sin(t + i) * 2, -6, sx, -9); c.stroke(); }
  };
  P.fridge = function (c, p) {
    var w = p.w * T, H = (p.top + 1) * T, y0 = -p.top * T;
    shadow(c, w / 2, T - 2, w / 2 - 2, 4, 0.22);
    fillRR(c, 4, y0, w - 8, H - 2, 5, '#E6EBF2');
    c.fillStyle = '#C9D2E0'; c.fillRect(4, y0 + H * 0.38, w - 8, 2);
    c.fillStyle = '#9AA6B8'; c.fillRect(w - 14, y0 + 6, 3, 14); c.fillRect(w - 14, y0 + H * 0.38 + 6, 3, 20);
    c.fillStyle = 'rgba(255,255,255,0.7)'; c.fillRect(7, y0 + 3, 2, H - 10);
    // magnets and the sign
    fillRR(c, 12, y0 + H * 0.38 + 10, 26, 18, 1, '#FFF7B0');
    c.fillStyle = '#E5533A'; c.fillRect(14, y0 + H * 0.38 + 13, 22, 1.4); c.fillStyle = 'rgba(0,0,0,0.3)'; c.fillRect(14, y0 + H * 0.38 + 17, 18, 1); c.fillRect(14, y0 + H * 0.38 + 20, 20, 1); c.fillRect(14, y0 + H * 0.38 + 23, 14, 1);
    circle(c, 25, y0 + H * 0.38 + 10, 2, '#2F6FD6');
    circle(c, 18, y0 + 12, 3, '#D8B664'); circle(c, 30, y0 + 16, 3, '#2E9E6B');
  };
  P.cooler = function (c, p) {
    var H = (p.top + 1) * T, y0 = -p.top * T;
    shadow(c, 16, 29, 9, 3, 0.2);
    fillRR(c, 7, y0 + 18, 18, H - 20, 3, '#E6EBF2');
    c.fillStyle = '#E5533A'; c.fillRect(11, y0 + 26, 3, 3); c.fillStyle = '#2F6FD6'; c.fillRect(18, y0 + 26, 3, 3);
    var g = c.createLinearGradient(0, y0, 0, y0 + 20); g.addColorStop(0, 'rgba(150,200,245,0.95)'); g.addColorStop(1, 'rgba(100,160,230,0.95)');
    fillRR(c, 8, y0, 16, 20, 6, g);
    c.fillStyle = 'rgba(255,255,255,0.6)'; c.fillRect(11, y0 + 3, 2, 13);
  };
  P.copier = function (c, p) {
    var w = p.w * T;
    shadow(c, w / 2, T - 2, w / 2 - 2, 4, 0.22);
    fillRR(c, 2, -16, w - 4, 46, 4, '#D6D9E0');
    fillRR(c, 2, -22, w - 4, 10, 3, '#B9BDC9');
    fillRR(c, 6, -14, 22, 10, 2, '#2B2052'); c.fillStyle = '#E5533A'; c.fillRect(8, -12, 8, 3); circle(c, 24, -9, 1.6, '#E5533A');
    c.fillStyle = '#FFFFFF'; c.fillRect(w - 26, -6, 18, 6);
    c.save(); c.translate(w - 18, 2); c.rotate(0.3); c.fillStyle = '#FFFFFF'; c.fillRect(-5, -4, 12, 8); c.restore();
    c.fillStyle = '#B9BDC9'; c.fillRect(6, 8, w - 12, 2); c.fillRect(6, 18, w - 12, 2);
    text(c, 'Tray 2?', w / 2, 14, 5.5, '#6E6A80', 700);
  };
  P.vending = function (c, p) {
    var w = p.w * T, H = (p.top + 1) * T, y0 = -p.top * T;
    shadow(c, w / 2, T - 2, w / 2 - 2, 4, 0.25);
    fillRR(c, 3, y0, w - 6, H - 2, 4, '#D1477A');
    fillRR(c, 7, y0 + 5, w - 26, H - 26, 2, 'rgba(220,240,255,0.9)');
    for (var r = 0; r < 4; r++) {
      c.fillStyle = 'rgba(0,0,0,0.15)'; c.fillRect(7, y0 + 5 + (r + 1) * ((H - 26) / 4) - 1, w - 26, 1.5);
      for (var k = 0; k < 3; k++) {
        var x = 10 + k * ((w - 32) / 3), y = y0 + 8 + r * ((H - 26) / 4);
        fillRR(c, x, y, 8, 7, 1.5, r === 3 && k === 1 ? '#7A4A28' : (r === 3 ? '#7A4A28' : 'rgba(0,0,0,0.08)'));
      }
    }
    fillRR(c, w - 17, y0 + 8, 10, 18, 2, '#2B2052'); c.fillStyle = '#7FD1AE'; c.fillRect(w - 15, y0 + 10, 6, 3);
    fillRR(c, 9, y0 + H - 18, w - 30, 8, 2, '#2B2052');
    c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(6, y0 + 3, 2, H - 10);
  };
  P.trash = function (c, p) {
    shadow(c, 16, 28, 7, 2.5, 0.2);
    fillRR(c, 9, 10, 14, 18, 2, '#8D86A3'); fillRR(c, 8, 8, 16, 4, 2, '#6E6A80');
    c.fillStyle = 'rgba(255,255,255,0.25)'; c.fillRect(11, 13, 1.5, 12);
    c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(16, 7, 3, 0, 7); c.fill();
  };
  P.roomsign = function (c, p) {
    var w = p.w * T, q = p.quest;
    shadow(c, w / 2, T - 3, w / 2 - 6, 3, 0.2);
    c.fillStyle = '#3B3550'; c.fillRect(w / 2 - 1.5, -6, 3, T - 2); fillRR(c, w / 2 - 9, T - 6, 18, 4, 2, '#3B3550');
    fillRR(c, 1, -26, w - 2, 24, 4, q.color);
    fillRR(c, 3, -24, 16, 20, 3, '#FFFFFF');
    text(c, String(q.station), 11, -14, 12, q.color, 800);
    text(c, tr(q.room).replace(/^The /, ''), 21 + (w - 24) / 2, -14, 8, '#FFFFFF', 800, 'center', w - 28);
  };
  P.palm = function (c, p) {
    var v = p.variant || 0, H = p.top * T;
    shadow(c, 16, 28, 16, 5, 0.18);
    c.strokeStyle = '#9A6B3E'; c.lineWidth = 6; c.lineCap = 'round';
    c.beginPath(); c.moveTo(16, 27); c.quadraticCurveTo(16 + (v - 1) * 8, -H / 2, 16 + (v - 1) * 5, -H + 10); c.stroke();
    c.strokeStyle = 'rgba(90,55,25,0.45)'; c.lineWidth = 6; c.setLineDash([2, 4]);
    c.beginPath(); c.moveTo(16, 27); c.quadraticCurveTo(16 + (v - 1) * 8, -H / 2, 16 + (v - 1) * 5, -H + 10); c.stroke(); c.setLineDash([]);
    var tx = 16 + (v - 1) * 5, ty = -H + 10;
    var fr = ['#3E9A4E', '#4FB062', '#2E7F3E'];
    for (var i = 0; i < 8; i++) {
      var a = i / 8 * Math.PI * 2 + v;
      c.save(); c.translate(tx, ty); c.rotate(a);
      c.fillStyle = fr[i % 3]; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(12, -7, 26, 3); c.quadraticCurveTo(12, 2, 0, 0); c.fill();
      c.restore();
    }
    circle(c, tx - 3, ty + 3, 2.5, '#7A4A28'); circle(c, tx + 2, ty + 4, 2.5, '#7A4A28');
  };
  P.bush = function (c, p) {
    shadow(c, 16, 26, 13, 4, 0.15);
    var cols = ['#4FA060', '#5DB06E', '#3F8F50'];
    [[10, 16, 9], [22, 16, 9], [16, 9, 10]].forEach(function (b, i) { circle(c, b[0], b[1], b[2], cols[(i + p.variant) % 3]); });
    if (p.variant === 1) { circle(c, 12, 10, 2, '#F08CA8'); circle(c, 21, 13, 2, '#F08CA8'); circle(c, 16, 6, 2, '#FFFFFF'); }
  };
  P.flag = function (c, p, now) {
    var H = p.top * T, t = (now || 0) / 400;
    shadow(c, 16, 28, 6, 2, 0.2);
    c.fillStyle = '#C8C3D6'; c.fillRect(15, -H, 2.5, H + 28); circle(c, 16.2, -H, 2.2, '#D8B664');
    var fw = 30, fh = 18, x0 = 17.5, y0 = -H + 2;
    for (var i = 0; i < fw; i++) {
      var wave = Math.sin(t + i / 6) * 1.8 * (i / fw);
      var y = y0 + wave;
      if (i < 8) { c.fillStyle = '#C8102E'; c.fillRect(x0 + i, y, 1.2, fh); }
      else {
        c.fillStyle = '#00843D'; c.fillRect(x0 + i, y, 1.2, fh / 3);
        c.fillStyle = '#FFFFFF'; c.fillRect(x0 + i, y + fh / 3, 1.2, fh / 3);
        c.fillStyle = '#1A1A1A'; c.fillRect(x0 + i, y + fh * 2 / 3, 1.2, fh / 3);
      }
    }
  };

  /* Which props need redrawing every frame */
  var DYNAMIC = { kiosk: 1, trophycase: 1, questboard: 1, server: 1, coffee: 1, flag: 1, clock: 1 };
  /* Minimum art height above the footprint (tiles) and side padding for cached sprites */
  var KIND_TOP = { sofa: 0.4, table: 0.3, desk: 0.9, reception: 1.1, coffeetable: 0.1, lostfound: 0.1, counter: 0.75, bell: 0.3, palm: 3.4, bush: 0.1, roomsign: 0.9, plant: 0.5, globe: 0.5, chair: 0, armchair: 0.25, easel: 1.1, popcorn: 0.85, filmreel: 0.45, mic: 0.6, bleachers: 0.4, seats: 0.2, cooler: 1.1, copier: 0.75 };
  var KIND_PAD = { palm: 1.1, stanchion: 1.8, sofa: 0.3 };

  PD.world = {
    T: T, TILE: TILE, FONT: FONT, build: build, drawTile: drawTile, painters: P, DYNAMIC: DYNAMIC, KIND_TOP: KIND_TOP, KIND_PAD: KIND_PAD,
    helpers: { rr: rr, fillRR: fillRR, shadow: shadow, circle: circle, text: text, shade: shade, mix: mix, rgba: rgba, hash: hash }
  };
})();
