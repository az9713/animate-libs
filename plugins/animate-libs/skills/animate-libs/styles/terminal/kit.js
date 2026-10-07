// =====================================================================
//  styles/terminal/kit.js — a command-line terminal on a CRT phosphor screen: near-black ground, phosphor-green
//  monospace text typed on character by character, one amber accent for the hero, double-line frames, block-character
//  progress bars and charts, faint scanlines, a glow and a vignette in post(). Motion is on 1s (STYLE.ones = true):
//  typing steps one character per frame, so the clock is TT (= F / FPS) and nothing is random per frame.
//  Built on kit/core.js (RNG, hash, clamp, lerp, ev, toScreen, fillAll, screen, trace, bbox, rrectPts, DEFER, SPARK_AT).
//  Needs from the piece head: W, H, CX (caption centre x). It sets its own font stack (TMF), so it needs no HAND.
// =====================================================================
const TM = {
  ground: '#0a0f0a', panel: '#0f3a1c', panel2: '#145c2a', green: '#33ff66', dim: '#1f9d44', faint: '#14612b', amber: '#ffb000',
};
const TMF = 'Consolas, "Cascadia Mono", "Courier New", monospace';   // local system fonts only: Windows, then a fallback
const TM_SHADES = '▁▂▃▄▅▆▇█';
const TM_CW = {};

// width of one character cell at a font size (monospace); measured once per size
function tmCW(size) {
  if (!TM_CW[size]) { ctx.save(); ctx.font = `${size}px ${TMF}`; TM_CW[size] = ctx.measureText('M').width; ctx.restore(); }
  return TM_CW[size];
}

// plain text with a phosphor glow. o: size, align, weight, glow (shadowBlur px, 0 = none), al (alpha)
function tmText(str, x, y, color, o = {}) {
  const size = o.size ?? 40;
  ctx.save(); ctx.font = `${o.weight ?? 400} ${size}px ${TMF}`; ctx.textBaseline = 'alphabetic'; ctx.textAlign = o.align ?? 'left';
  ctx.fillStyle = color; ctx.globalAlpha = o.al ?? 1;
  if ((o.glow ?? 8) > 0) { ctx.shadowColor = color; ctx.shadowBlur = o.glow ?? 8; }
  ctx.fillText(str, x, y); ctx.restore();
}

// text typed on: o.t = the start time, o.cps = characters per second (default 24 = one per frame), the rest as tmText.
// Returns the number of characters shown, so the caller can place a cursor after them.
function tmType(str, x, y, color, o = {}) {
  const n = Math.min(str.length, Math.floor(Math.max(0, TT - (o.t ?? 0)) * (o.cps ?? 24) + 1e-6));
  if (n > 0) tmText(str.slice(0, n), x, y, color, o);
  return n;
}

// a block cursor whose top-left sits at char column `col` of a line at baseline y. solid = no blink (while typing)
function tmCursor(x, y, size, color, solid) {
  if (!solid && Math.floor(TT * 2) % 2 === 1) return;
  const cw = tmCW(size);
  ctx.save(); ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 10;
  ctx.fillRect(x, y - size * 0.8, cw * 0.92, size * 0.98); ctx.restore();
}

// a prompt log: lines = [{ t, s, c?, cps?, fn? }]; a line starts typing at t. fn() gives a string that shows at once
// (bars). The cursor sits after the newest started line: solid while it types, blinking after.
function tmLog(lines, x, y0, dy, size, o = {}) {
  const cw = tmCW(size); let last = -1, lastN = 0, lastLen = 0, lastY = 0;
  lines.forEach((ln, i) => {
    if (TT < ln.t - 1e-6) return;
    const y = ln.y ?? y0 + i * dy, s = ln.fn ? ln.fn() : ln.s, n = ln.fn ? s.length : tmType(s, x, y, ln.c ?? TM.green, { t: ln.t, cps: ln.cps, size });
    if (ln.fn) tmText(s, x, y, ln.c ?? TM.green, { size });
    last = i; lastN = n; lastLen = s.length; lastY = y;
  });
  if (last >= 0 && o.cursor !== false) tmCursor(x + lastN * cw, lastY, size, TM.green, lastN < lastLen);
}

// a block-character progress bar string: [██████░░░░] 42%
function tmBarStr(p, cols) {
  const n = Math.round(clamp(p) * cols);
  return '[' + '█'.repeat(n) + '░'.repeat(cols - n) + '] ' + String(Math.round(clamp(p) * 100)).padStart(3, ' ') + '%';
}

// a double-line frame with a title cut into the top edge; it wipes in downward, one text row at a time.
// o: frac (0..1), c (colour), rows (row height of the wipe), key
function tmBox(x, y, w, h, title, o = {}) {
  const frac = clamp(o.frac ?? 1); if (frac <= 0) return;
  const c = o.c ?? TM.green, z = ctx.getTransform().a, lh = o.rows ?? 40, vis = Math.ceil(h * frac / lh) * lh;
  ctx.save(); ctx.beginPath(); ctx.rect(x - 20, y - 30, w + 40, Math.min(h + 40, vis + 30)); ctx.clip();
  ctx.strokeStyle = c; ctx.shadowColor = c; ctx.shadowBlur = 9; ctx.lineJoin = 'miter';
  ctx.lineWidth = 3 / z; ctx.strokeRect(x, y, w, h);
  ctx.lineWidth = 2 / z; ctx.strokeRect(x + 9, y + 9, w - 18, h - 18);
  ctx.restore();
  if (title) {   // the title sits on a ground-coloured patch that breaks the double line
    const tw = (title.length + 2) * tmCW(34);
    ctx.save(); ctx.fillStyle = TM.ground; ctx.fillRect(x + 30, y - 8, tw, 26); ctx.restore();
    tmText(' ' + title + ' ', x + 30, y + 12, c, { size: 34, glow: 6 });
  }
}

// ---- the hero: an ASCII star of '*' (diagonals) and '+' (axes) in amber, grown to n cells from the centre.
// The ring cells between the arms are '.', the core blinks between '@' and '*'. (x, y) = the centre. cs = cell size.
function tmHero(x, y, n, o = {}) {
  n = Math.max(0, n); const cs = o.cs ?? 40, size = o.size ?? 52, al = o.al ?? 1;
  if (n <= 0 || al <= 0) return;
  const cells = [[0, 0, Math.floor(TT * 2) % 2 ? '*' : '@', 0]], m = Math.ceil(n);
  for (let d = 1; d <= m; d++) {
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) cells.push([dx * d, dy * d, '+', d]);
    for (const [dx, dy] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) cells.push([dx * d, dy * d, '*', d * 1.3]);
    if (d >= 2) for (const [dx, dy] of [[1, d], [-1, d], [1, -d], [-1, -d], [d, 1], [d, -1], [-d, 1], [-d, -1]]) cells.push([dx, dy, '.', d * 1.1]);   // flanks of the arms
  }
  ctx.save(); ctx.font = `700 ${size}px ${TMF}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = TM.amber;
  ctx.shadowColor = TM.amber; ctx.shadowBlur = 14;
  for (const [dx, dy, ch, d] of cells) {
    const a = clamp(n - d + 1) * (1 - 0.45 * (d / Math.max(n, 1)));      // the newest cell fades in, the tips are dimmer
    if (a <= 0.02) continue;
    ctx.globalAlpha = a * al; ctx.fillText(ch, x + dx * cs, y + dy * cs * 1.0);
  }
  ctx.restore();
  SPARK_AT = toScreen(x, y);
}

// ---- background life: the ground, a status line, hex rain down the left edge and at x 900 (rows end at y 1470, above the phone UI), a system line beside the status line.
// Everything is a function of TT (steps on 1s) and fixed RNG keys.
function tmBoard(o = {}) {
  fillAll(TM.ground);
  ctx.save(); screen();
  const sec = Math.floor(TT), up = '00:0' + Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0');
  tmText(`tty1  80x24  utf-8  up ${up}`, 70, 268, TM.faint, { size: 26, glow: 0 });
  for (const [cx, sp, k] of [[8, 7, 'a'], [34, 11, 'b'], [900, 9, 'c']]) {   // hex rain: dim glyphs falling
    const shift = Math.floor(TT * sp);
    for (let r = 0; r < 48; r++) {
      const g = RNG('rain', k, r - shift).i(0, 15).toString(16).toUpperCase();
      tmText(g, cx, 30 + r * 30, TM.faint, { size: 24, glow: 0, al: 0.45 + 0.4 * RNG('rainal', k, r - shift).f() });
    }
  }
  const cpu = Array.from({ length: 8 }, (_, i) => TM_SHADES[Math.floor(RNG('cpu', i, Math.floor(TT * 4)).r(0, 7.99))]).join('');
  tmText(`cpu ${cpu}`, 545, 268, TM.faint, { size: 26, glow: 0 });
  if (Math.floor(TT * 1.5) % 2 === 0) tmText("● rec", 770, 268, TM.dim, { size: 26, glow: 6 });
  ctx.restore();
}

// ---- captions and tags: drawn after the camera, at screen size (DEFER). A tag is a bracketed label; a caption is typed.
const tmTag = (str) => { const f = () => tmType('[ ' + str + ' ]', 70, 330, TM.dim, { t: E0 + 0.1, size: 36, glow: 6 }); if (DEFER) DEFER.push(f); else f(); };
const tmCaption = (str, c = TM.green) => {
  const f = () => {   // centred by the full text's width, so the line types out to the right and does not shift
    const s = '> ' + str, cw = tmCW(46), x0 = CX - s.length * cw / 2;
    const n = tmType(s, x0, 1440, c, { t: E0 + 0.5, size: 46, cps: 24 });
    if (n > 0) tmCursor(x0 + n * cw, 1440, 46, c, n < s.length);
  };
  if (DEFER) DEFER.push(f); else f();
};

// =====================================================================
//  STYLE — the renderer's hooks (styles/README.md)
//    window: the old / new world seen through the bridge outline, rimmed in a glowing green line
//    blob:   the morphing terminal pane: a green-tinted fill with a grid of random characters that dissolve in and out
//    post:   scanlines, a soft bloom, a rolling band, a vignette
// =====================================================================
const STYLE = {
  name: 'terminal',
  paper: TM.ground,
  ones: true,                                   // typing steps one character per frame, so motion must not sit on 2s
  backdrop(c) { fillAll(c); },
  window(P, key, src, o) {
    ctx.save(); trace(P, true); ctx.clip(); ctx.drawImage(src, 0, 0); ctx.restore();
    ctx.save(); trace(P, true); ctx.lineWidth = 4; ctx.strokeStyle = TM.green; ctx.shadowColor = TM.green; ctx.shadowBlur = 12; ctx.lineJoin = 'miter'; ctx.stroke(); ctx.restore();
  },
  blob(P, c, key, u) {
    ctx.save(); trace(P, true); ctx.fillStyle = c; ctx.fill(); ctx.clip();
    const bb = bbox(P, 0), size = 34, cw = tmCW(size), rh = 40, step = Math.floor(TT * 12), on = Math.sin(Math.PI * clamp(u)) * 0.9 + 0.1;
    ctx.font = `${size}px ${TMF}`; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = TM.green;
    for (let r = 0; bb.y0 + r * rh < bb.y1 + rh; r++) for (let q = 0; bb.x0 + q * cw < bb.x1 + cw; q++) {
      const R = RNG('cell', key, r, q, step);
      if (R.f() > on) continue;
      ctx.globalAlpha = R.r(0.25, 0.9); ctx.fillText('01#%*+=:/\\<>[]{}'[R.i(0, 15)], bb.x0 + q * cw, bb.y0 + r * rh + size);
    }
    ctx.restore();
    ctx.save(); trace(P, true); ctx.lineWidth = 4; ctx.strokeStyle = TM.green; ctx.shadowColor = TM.green; ctx.shadowBlur = 12; ctx.lineJoin = 'miter'; ctx.stroke(); ctx.restore();
  },
  hero(x, y, r, o = {}) { tmHero(x, y, Math.max(1, r / 40), { al: o.al }); },
  heroColor: TM.amber,
  heroPts: (x, y, r, n) => rrectPts(x - r * 0.9, y - r * 0.9, r * 1.8, r * 1.8, r * 0.1, 8),
  post() {
    ctx.save(); screen();
    // bloom: a blurred copy of the frame added back at low strength (the phosphor glow beyond the glyphs)
    ctx.filter = 'blur(6px)'; ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.3; ctx.drawImage(ctx.canvas, 0, 0);
    ctx.filter = 'none'; ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    // a faint band that rolls down the screen once every 5 s
    const by = ((TT / 5) % 1) * (H + 400) - 200, g = ctx.createLinearGradient(0, by - 160, 0, by + 160);
    g.addColorStop(0, 'rgba(51,255,102,0)'); g.addColorStop(0.5, 'rgba(51,255,102,0.045)'); g.addColorStop(1, 'rgba(51,255,102,0)');
    ctx.fillStyle = g; ctx.fillRect(0, by - 160, W, 320);
    // scanlines: a dark line on every 4th pixel row
    ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.beginPath();
    for (let y = 0; y < H; y += 4) ctx.rect(0, y + 2, W, 2);
    ctx.fill();
    // vignette
    const v = ctx.createRadialGradient(W / 2, H * 0.5, H * 0.3, W / 2, H * 0.5, H * 0.72);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.55)'); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
    ctx.restore();
  },
};
