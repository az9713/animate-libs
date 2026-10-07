// =====================================================================
//  SCENES — waapi showcase (terminal style). World coordinates 1080x1920; motion on 1s (TT = F / FPS).
//  One animation, defined once below (WA_KF, WA_OPT). Three things come from that same definition:
//    1. the source text typed on the left (waSrc builds it from WA_KF and WA_OPT),
//    2. the real Element.animate call on a hidden <div> (libs/waapi.js seeks it with seekCSS(TT)),
//    3. every number on the right, read back with getComputedStyle and getComputedTiming (waRead).
//  The easing curve is sampled from the browser too: a hidden probe animation with the same easing is
//  set to 41 times and its computed margin-top is read.
//  Layout: status line y 268, tag y 330, boxes from y 400 to 1400, caption y 1440. Content stays in x 70-890.
// =====================================================================
const WA_KF = [
  { height: '0px', backgroundColor: '#14612b', opacity: 0.2 },
  { height: '240px', backgroundColor: '#ffb000', opacity: 1 },
];
const WA_OPT = { delay: 2600, duration: 1400, iterations: 3, direction: 'alternate', easing: 'cubic-bezier(.3,1.6,.5,1)', fill: 'both' };
const WA_TARGET = parseFloat(WA_KF[1].height);

const WA_EL = document.createElement('div');
WA_EL.style.cssText = 'position:absolute;left:0;top:0;visibility:hidden;width:0;height:0';
document.body.appendChild(WA_EL);
const WA_ANIM = WA_EL.animate(WA_KF, WA_OPT);

// the easing curve as the browser computes it: a probe animation, same easing, margin-top 0..1000px over 1000ms
const WA_CURVE = (() => {
  const p = document.createElement('div');
  p.style.cssText = 'position:absolute;left:0;top:0;visibility:hidden;width:0;height:0';
  document.body.appendChild(p);
  const a = p.animate([{ marginTop: '0px' }, { marginTop: '1000px' }], { duration: 1000, easing: WA_OPT.easing, fill: 'both' });
  a.pause();
  const pts = [];
  for (let i = 0; i <= 40; i++) { a.currentTime = i * 25; pts.push([i / 40, parseFloat(getComputedStyle(p).marginTop) / 1000]); }
  a.cancel(); p.remove();
  return pts;
})();

// ---- the source text, built from the same objects that were passed to el.animate
function waSrc() {
  const o = WA_OPT, e = o.easing.split('(');
  const L = [{ s: 'el.animate([', k: -1 }];
  WA_KF.forEach((k, i) => L.push(
    { s: ` {height:'${k.height}',`, k: i },
    { s: '  backgroundColor:', k: i },
    { s: `   '${k.backgroundColor}',`, k: i },
    { s: `  opacity:${k.opacity}${i === WA_KF.length - 1 ? '}' : '},'}`, k: i }));
  L.push({ s: '],{', k: -1 },
    { s: ` delay:${o.delay},`, k: -1 }, { s: ` duration:${o.duration},`, k: -1 },
    { s: ` iterations:${o.iterations},`, k: -1 }, { s: ` direction:'${o.direction}',`, k: -1 },
    { s: ` easing:'${e[0]}(`, k: -1 }, { s: `  ${e[1]}',`, k: -1 }, { s: ` fill:'${o.fill}'});`, k: -1 });
  return L;
}
const WA_SRC = waSrc();

// ---- everything read from the browser for this frame
function waRead() {
  seekCSS(TT);
  const cs = getComputedStyle(WA_EL), tm = WA_ANIM.effect.getComputedTiming(), ct = WA_ANIM.currentTime;
  const o = WA_OPT, n = (ct - o.delay) / o.duration;
  // x on the curve = the directed progress inside the current iteration (odd iterations run backwards)
  let x = 0;
  if (n >= o.iterations) x = o.iterations % 2 ? 1 : 0;
  else if (n > 0) { const it = Math.floor(n), f = n - it; x = it % 2 ? 1 - f : f; }
  const rgb = (cs.backgroundColor.match(/[\d.]+/g) || [0, 0, 0]).slice(0, 3).map((v) => Math.round(+v));
  return {
    h: parseFloat(cs.height), op: +cs.opacity, rgb, hex: '#' + rgb.map((v) => clamp(v, 0, 255).toString(16).padStart(2, '0')).join(''),
    p: tm.progress ?? 0, x, ct, iter: Math.min(o.iterations, (tm.currentIteration ?? 0) + 1), phase: n < 0 ? 'before' : n >= o.iterations ? 'after' : 'active',
  };
}

// ---- the element: a stack of full-block characters, cut to the computed height
function waBar(cx, base, h, color, alpha) {
  if (h < 0.5) return;
  const size = 56, cols = 5, cw = tmCW(size), w = cols * cw;
  ctx.save(); ctx.font = `${size}px ${TMF}`; ctx.textBaseline = 'alphabetic';
  const m = ctx.measureText('█'), asc = m.actualBoundingBoxAscent, row = asc + m.actualBoundingBoxDescent;
  ctx.beginPath(); ctx.rect(cx - w / 2 - 6, base - h, w + 12, h); ctx.clip();
  ctx.fillStyle = color; ctx.globalAlpha = clamp(alpha); ctx.shadowColor = color; ctx.shadowBlur = 12;
  for (let r = 0; r * row < h; r++) ctx.fillText('█'.repeat(cols), cx - w / 2, base - r * row - m.actualBoundingBoxDescent);
  ctx.restore();
}

function waCaption(str, t, cps, c = TM.green) {
  const s = '> ' + str, cw = tmCW(40), x0 = CX - s.length * cw / 2;
  tmType(s, x0, 1440, c, { t, size: 40, cps });
}

// ---- era 0: the title card
function sceneTitle() {
  tmBoard();
  const n1 = tmType('CSS / WAAPI', CX, 870, TM.green, { t: 0, cps: 30, size: 110, weight: 700, glow: 14, align: 'center' });
  const s2 = 'no library: the browser animates', cw = tmCW(34), x2 = CX - s2.length * cw / 2;
  const n2 = tmType(s2, x2, 960, TM.green, { t: 0.4, cps: 64, size: 34 });
  tmType('libs/waapi.js  0.4 KB', CX, 1040, TM.dim, { t: 0.75, cps: 60, size: 30, align: 'center' });
  if (n2 > 0) tmCursor(x2 + n2 * cw, 960, 34, TM.green, n2 < s2.length);
}

// ---- era 1: source on the left, the element, its computed style and its easing on the right
function sceneRun() {
  const cu = TIMELINE.cues, R = waRead();
  tmBoard();
  const lx = 70, lw = 420, rx = 510, rw = 380, last = WA_KF.length - 1, hot = R.p < 0.5 ? 0 : last;

  // left: the source, typed line by line (a line is bright while its keyframe is the nearer one)
  tmBox(lx, 400, lw, 1000, 'Element.animate', { frac: ev(1.0, 0.5), rows: 40 });
  tmLog(WA_SRC.map((l, i) => ({ t: cu.type + i * 0.08, s: l.s, c: l.k < 0 || l.k === hot ? TM.green : TM.dim, cps: 90 })), lx + 28, 480, 42, 28);
  if (TT >= 2.7) {
    tmText('// animation state', lx + 28, 1215, TM.faint, { size: 26, glow: 0 });
    tmText('t        ' + String(Math.round(R.ct)).padStart(4, ' ') + 'ms', lx + 28, 1262, TM.green, { size: 28 });
    tmText('iter     ' + R.iter + ' / ' + WA_OPT.iterations, lx + 28, 1304, TM.green, { size: 28 });
    tmText('phase    ' + R.phase, lx + 28, 1346, TM.green, { size: 28 });
  }

  // right 1: the element
  const done = TT >= TIMELINE.cues.hit;
  tmBox(rx, 400, rw, 400, 'element', { frac: ev(1.1, 0.5), c: done ? TM.amber : TM.green, rows: 40 });
  if (TT >= 1.6) {
    const base = 770;
    tmText('╌╌╌╌╌╌', rx + 22, base - WA_TARGET, TM.faint, { size: 24, glow: 0 });
    tmText(WA_KF[1].height, rx + rw - 22, base - WA_TARGET, TM.faint, { size: 24, glow: 0, align: 'right' });
    tmText('════════════════════', rx + 22, base + 14, TM.faint, { size: 24, glow: 0 });
    waBar(rx + rw / 2, base, R.h, `rgb(${R.rgb.join(',')})`, R.op);
  }

  // right 2: getComputedStyle
  tmBox(rx, 830, rw, 220, 'getComputedStyle', { frac: ev(1.2, 0.4), rows: 40 });
  if (TT >= 1.6) {
    const x = rx + 26, rows = [
      ['height   ', R.h.toFixed(1) + 'px'], ['bg-color ', R.hex], ['opacity  ', R.op.toFixed(2)], ['progress ', R.p.toFixed(3)]];
    rows.forEach(([a, b], i) => {
      tmText(a, x, 898 + i * 42, TM.dim, { size: 28, glow: 4 });
      tmText(b, x + a.length * tmCW(28), 898 + i * 42, TM.amber, { size: 28 });
    });
    tmText('██', x + 17 * tmCW(28), 898 + 42, `rgb(${R.rgb.join(',')})`, { size: 28, al: clamp(R.op) });
  }

  // right 3: the easing curve, with the dot at (x, progress)
  tmBox(rx, 1080, rw, 320, 'easing', { frac: ev(1.3, 0.5), rows: 40 });
  if (TT >= 1.7) {
    const ox = rx + 50, oy = 1345, sx = 270, sy = 170;
    const X = (u) => ox + u * sx, Y = (v) => oy - v * sy;
    tmText(WA_OPT.easing.slice(WA_OPT.easing.indexOf('(')), rx + 26, 1136, TM.dim, { size: 24, glow: 0 });
    ctx.save(); ctx.strokeStyle = TM.faint; ctx.lineWidth = 2; ctx.setLineDash([4, 6]);
    ctx.beginPath(); ctx.moveTo(ox, Y(0)); ctx.lineTo(ox + sx, Y(0)); ctx.moveTo(ox, Y(1)); ctx.lineTo(ox + sx, Y(1)); ctx.moveTo(ox, Y(0)); ctx.lineTo(ox, Y(1.15)); ctx.stroke();
    // guides from the dot to the axes
    ctx.strokeStyle = TM.dim; ctx.beginPath(); ctx.moveTo(X(R.x), Y(0)); ctx.lineTo(X(R.x), Y(R.p)); ctx.moveTo(ox, Y(R.p)); ctx.lineTo(X(R.x), Y(R.p)); ctx.stroke();
    ctx.restore();
    tmText('0', ox - 22, Y(0) + 8, TM.faint, { size: 22, glow: 0 }); tmText('1', ox - 22, Y(1) + 8, TM.faint, { size: 22, glow: 0 });
    for (const [u, v] of WA_CURVE) tmText('•', X(u), Y(v) + 8, TM.green, { size: 24, glow: 4, align: 'center' });
    ctx.save(); ctx.fillStyle = TM.amber; ctx.shadowColor = TM.amber; ctx.shadowBlur = 14; ctx.beginPath(); ctx.arc(X(R.x), Y(R.p), 9, 0, TAU); ctx.fill(); ctx.restore();
  }

  // the status line of the whole shot
  tmTag('CSS / WAAPI  0.4 KB');
  if (!done) waCaption('no library: the browser animates', 1.3, 60);
  else waCaption('0.4 KB helper. nothing else.', TIMELINE.cues.hit, 72);
}
