// =====================================================================
//  SCENES — d3 showcase (riso). One scene for the whole 8 s.
//  The dataset DV is the constant. d3 turns it into four sets of 8 cell outlines (bars, line ribbon, donut
//  slices, radial wedges), each outline with the same number of points, so d3.interpolate can morph any
//  shape into the next. Generators draw into a small recorder (no DOM, no canvas), the points are printed
//  through the riso plates. Every colour is plate tones; d3.interpolateRgb feeds tonesOf().
// =====================================================================
const DV = [5, 9, 7, 13, 10, 19, 12, 16];
const NV = DV.length, KP = 20;   // 8 values; KP points on the top edge and on the bottom edge of every cell outline
const CH = { x0: 90, x1: 910, base: 1300, h: 600, cx: 500, cy: 1000, rin: 50, rout: 290, rpie: 150, th: 26 };
const MX = 500;                  // centre of the safe width (x 60 to 940)
const SW_T = [0.25, 1.25, 2.75, 4.25, 5.75, 7.0];   // when the header item 0..5 appears (tag + big word)
const SW_TAG = ['one dataset, 8 numbers', 'd3.scaleBand + scaleLinear', 'd3.line + curveMonotoneX', 'd3.pie + d3.arc', 'd3.areaRadial', 'data in, any shape out'];
const SW_WORD = ['', 'BARS', 'LINE', 'DONUT', 'RADIAL', 'SHAPES'];
const READ = [[0, 19, 0, 600], [0, 7, 90, 910], [0, 91, 0, 360], [0, 19, 50, 290]];   // domain -> range of the scale each shape uses
const BGT = [{ teal: 0, pink: 0, yellow: 0.14 }, { teal: 0.12, pink: 0, yellow: 0 }, { teal: 0, pink: 0.12, yellow: 0.08 }, { teal: 0.1, pink: 0, yellow: 0.12 }];
const RAMP = [   // per shape: the ink mix of the lowest and of the highest value
  [{ teal: 0.75 }, { teal: 1, pink: 0.85 }],
  [{ pink: 0.9, yellow: 0.9 }, { pink: 1 }],
  [{ yellow: 1 }, { pink: 0.9, yellow: 0.55 }],
  [{ teal: 0.9, yellow: 0.9 }, { teal: 0.9, pink: 0.7 }],
];
const PINGS = [1.25, 2.5, 4.0, 5.5, 7.0];

// ---- a recorder that stands in for the canvas path: d3 generators draw into it and we keep the points
function d3Rec() {
  const subs = [], arcs = []; let cur = null;
  return {
    subs, arcs,
    moveTo(x, y) { cur = [[x, y]]; subs.push(cur); },
    lineTo(x, y) { cur.push([x, y]); },
    bezierCurveTo(x1, y1, x2, y2, x, y) {
      const [px, py] = cur[cur.length - 1];
      for (let k = 1; k <= 10; k++) {
        const t = k / 10, u = 1 - t;
        cur.push([u * u * u * px + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x, u * u * u * py + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y]);
      }
    },
    arc(x, y, r, a0, a1) { const P = []; for (let k = 0; k <= 24; k++) { const a = a0 + (a1 - a0) * k / 24; P.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); } arcs.push(P); },
    closePath() {},
  };
}
function d3Resample(P, n) {   // n points evenly along the polyline P, ends included
  const cum = [0];
  for (let i = 1; i < P.length; i++) cum.push(cum[i - 1] + dist(P[i - 1], P[i]));
  const L = cum[cum.length - 1] || 1, out = []; let j = 1;
  for (let k = 0; k < n; k++) {
    const s = (L * k) / (n - 1);
    while (j < P.length - 1 && cum[j] < s) j++;
    const a = P[j - 1], b = P[j], t = (s - cum[j - 1]) / ((cum[j] - cum[j - 1]) || 1);
    out.push([lerp(a[0], b[0], t), lerp(a[1], b[1], t)]);
  }
  return out;
}
function d3Fn(P) {   // y of x on a polyline sorted by x: linear between samples, flat outside
  return (v) => {
    if (v <= P[0][0]) return P[0][1];
    if (v >= P[P.length - 1][0]) return P[P.length - 1][1];
    let lo = 0, hi = P.length - 1;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (P[m][0] <= v) lo = m; else hi = m; }
    return lerp(P[lo][1], P[hi][1], (v - P[lo][0]) / ((P[hi][0] - P[lo][0]) || 1));
  };
}
const full3 = (t) => ({ teal: t.teal || 0, pink: t.pink || 0, yellow: t.yellow || 0 });
const rimOf = (t) => ({ teal: Math.min(1, t.teal * 1.5), pink: Math.min(1, t.pink + 0.4), yellow: Math.min(1, t.yellow + 0.3) });

// ---- the geometry, built once: S[shape][cell] = outline points; T = tones; N = outward label direction
let D3G = null;
function d3Geometry() {
  if (D3G) return D3G;
  const vmax = d3.max(DV);
  const yS = d3.scaleLinear().domain([0, vmax]).range([0, CH.h]);
  const xS = d3.scaleBand().domain(d3.range(NV)).range([CH.x0, CH.x1]).paddingInner(0.2).paddingOuter(0.1);
  const bw = xS.bandwidth(), step = xS.step(), topY = (i) => CH.base - yS(DV[i]);
  const S = [[], [], [], []], N = [[], [], [], []], T = [[], [], [], []], grow = [];
  const outline = (top, bot) => [...top, ...bot.slice().reverse()];
  // 0 bars (scaleBand + scaleLinear); grow = the same bar with no height, for the rise
  for (let i = 0; i < NV; i++) {
    const x = xS(i), up = d3.range(KP).map((k) => [x + (bw * k) / (KP - 1), topY(i)]), dn = d3.range(KP).map((k) => [x + (bw * k) / (KP - 1), CH.base]);
    S[0].push(outline(up, dn)); grow.push(outline(dn, dn)); N[0].push([0, -1]);
  }
  // 1 line: d3.line + curveMonotoneX through the 8 knots, sampled; every cell is a slice of the curve with thickness
  const knots = DV.map((v, i) => [xS(i) + bw / 2, topY(i)]), lr = d3Rec();
  d3.line().curve(d3.curveMonotoneX).context(lr)(knots);
  const Y = d3Fn(lr.subs[0]);
  for (let i = 0; i < NV; i++) {
    const xc = knots[i][0], xs = d3.range(KP).map((k) => xc - step / 2 + (step * k) / (KP - 1));
    S[1].push(outline(xs.map((x) => [x, Y(x) - CH.th / 2]), xs.map((x) => [x, Y(x) + CH.th / 2]))); N[1].push([0, -1]);
  }
  // 2 donut: d3.pie gives the angles, d3.arc the outline of each slice
  const arcGen = d3.arc().innerRadius(CH.rpie).outerRadius(CH.rout).padAngle(0.035);
  d3.pie().sort(null).value((d) => d)(DV).forEach((s) => {
    const r = d3Rec(); arcGen.context(r)(s);
    const o = d3Resample(r.arcs[0], KP), n = d3Resample(r.arcs[1], KP), mv = (p) => [p[0] + CH.cx, p[1] + CH.cy];
    S[2].push([...o.map(mv), ...n.map(mv)]);   // the inner arc already runs back, like the bottom edge of a bar
    const am = (s.startAngle + s.endAngle) / 2; N[2].push([Math.sin(am), -Math.cos(am)]);
  });
  // 3 radial area: d3.areaRadial, closed Catmull-Rom through (angle, radius = scaleLinear(value)); cut into 8 wedges
  const rS = d3.scaleLinear().domain([0, vmax]).range([CH.rin, CH.rout]);
  const kn = DV.map((v, i) => [((i + 0.5) / NV) * TAU, rS(v)]), rr = d3Rec();
  d3.areaRadial().angle((d) => d[0]).innerRadius(CH.rin).outerRadius((d) => d[1]).curve(d3.curveCardinalClosed.tension(0.85)).context(rr)(kn);
  const ring = rr.subs[0].map(([x, y]) => [(Math.atan2(x, -y) + TAU) % TAU, Math.hypot(x, y)]).sort((a, b) => a[0] - b[0]);
  const R = d3Fn([[ring[ring.length - 1][0] - TAU, ring[ring.length - 1][1]], ...ring, [ring[0][0] + TAU, ring[0][1]]]);
  const polar = (a, r) => [CH.cx + Math.sin(a) * r, CH.cy - Math.cos(a) * r];
  for (let i = 0; i < NV; i++) {
    const a0 = (i / NV) * TAU + 0.012, a1 = ((i + 1) / NV) * TAU - 0.012, as = d3.range(KP).map((k) => a0 + ((a1 - a0) * k) / (KP - 1));
    S[3].push(outline(as.map((a) => polar(a, R(a))), as.map((a) => polar(a, CH.rin))));
    const am = ((i + 0.5) / NV) * TAU; N[3].push([Math.sin(am), -Math.cos(am)]);
  }
  // colours: a ramp by value for each shape (d3.interpolateRgb of the printed inks), snapped to plate tones
  for (let s = 0; s < 4; s++) {
    const ramp = d3.interpolateRgb(rgbHex(inkRGB(RAMP[s][0])), rgbHex(inkRGB(RAMP[s][1])));
    for (let i = 0; i < NV; i++) T[s].push(full3(tonesOf(ramp(DV[i] / vmax))));
  }
  return (D3G = { S, N, T, grow, knots, Y, vmax });
}

// ---- where the morph is at TT: progress p of the three morphs, stage weights w
function d3State() {
  const cu = TIMELINE.cues, ms = [cu.m1, cu.m2, cu.m3];
  const p = ms.map((m) => EZ.io(seg(TT, m, m + 0.5)));
  const st = p[2] > 0 ? 2 : p[1] > 0 ? 1 : 0, u = p[st];
  const w = [1 - p[0], p[0] * (1 - p[1]), p[1] * (1 - p[2]), p[2]];
  return { p, st, u, w, bg: d3.interpolate(BGT[st], BGT[st + 1])(u) };
}
function d3Cells() {
  const G = d3Geometry(), cu = TIMELINE.cues, ms = [cu.m1, cu.m2, cu.m3], out = [];
  // before the hit the radial breathes in; on the hit it springs out
  const kk = TT < cu.hit ? 1 - 0.12 * EZ.io(seg(TT, cu.hit - 0.75, cu.hit)) : lerp(0.88, 1.04, EZ.back(seg(TT, cu.hit, cu.hit + 0.45)));
  for (let i = 0; i < NV; i++) {
    const us = ms.map((m) => EZ.io(seg(TT, m + i * 0.03, m + 0.26 + i * 0.03)));
    const st = us[2] > 0 ? 2 : us[1] > 0 ? 1 : 0, u = us[st], gi = EZ.o3(ev(cu.grow + i * 0.1, 0.4));
    const A = st === 0 ? d3.interpolate(G.grow[i], G.S[0][i])(gi) : G.S[st][i];
    let pts = u > 0 ? d3.interpolate(A, G.S[st + 1][i])(u) : A;
    const tn = u > 0 ? d3.interpolate(G.T[st][i], G.T[st + 1][i])(u) : G.T[st][i];
    const nm = u > 0 ? d3.interpolate(G.N[st][i], G.N[st + 1][i])(u) : G.N[st][i];
    if (kk !== 1) pts = pts.map(([x, y]) => [CH.cx + (x - CH.cx) * kk, CH.cy + (y - CH.cy) * kk]);
    let area = 0; for (let j = 0; j < pts.length; j++) { const a = pts[j], b = pts[(j + 1) % pts.length]; area += a[0] * b[1] - b[0] * a[1]; }
    const cw = st === 0 ? u : st === 1 ? 1 - u : 0;   // how much of this cell is still the line
    out.push({ i, pts, tn, nm, gi, cw, area: Math.abs(area) / 2 });
  }
  return out;
}
const pingOf = (i) => PINGS.reduce((m, t) => Math.max(m, Math.sin(Math.PI * seg(TT, t + i * 0.03, t + i * 0.03 + 0.3))), 0);
const scaleAbout = (P, c, s) => P.map(([x, y]) => [c[0] + (x - c[0]) * s, c[1] + (y - c[1]) * s]);

// the header item (tag + big word) shown at TT, with the scale it has: it shrinks just before the next one pops in
function d3Item() {
  let idx = -1; SW_T.forEach((t, k) => { if (TT >= t - 1e-6) idx = k; });
  if (idx < 0) return null;
  const a = popS(SW_T[idx]), b = idx < SW_T.length - 1 ? 1 - EZ.i2(seg(TT, SW_T[idx + 1] - 0.1, SW_T[idx + 1])) : 1;
  return { idx, s: Math.min(a, b, 1.1) };
}
function d3Readout(S) {
  const a = READ[S.st], b = READ[S.st + 1], r = a.map((v, j) => d3.interpolateRound(v, b[j])(S.u));
  return `domain [${r[0]}, ${r[1]}] -> range [${r[2]}, ${r[3]}]`;
}

// ---- the pieces of the picture (all inside one world layer)
function d3Table(cells) {
  const cu = TIMELINE.cues;
  for (let i = 0; i < NV; i++) {
    const x = 60 + i * 110, y = 500, pop = popS(0.12 + i * 0.06), b = pingOf(i);
    if (pop < 0.03) continue;
    const c = [x + 52, y + 50], P = scaleAbout(boxPts(x, y, 104, 100), c, pop);
    fill(hand(P, 'td' + i, 1.1), i % 2 ? { yellow: 0.4 } : {});
    line(P, { teal: 1 }, { closed: true, w: 5, rough: 0.3, amt: 0.8, key: 'tdr' + i });
    type(String(DV[i]), c[0], y + 68, 54 * pop, b > 0.15 ? { pink: 1 } : MIX.blue, { align: 'center', key: 'tv' + i });
    if (TT >= cu.grow + i * 0.1 - 1e-6) fill(rrect(x + 12 - 8 * b, 608, 80 + 16 * b, 14 + 6 * b, 4), cells[i].tn);   // a colour chip: the same colour as that value's shape
  }
}
function d3Header(S) {
  // 0 to 0.75 s the big title; it shrinks away on its baseline (clear of the table strip) while the header D3 pops in at 0.875 s
  const bigK = TT < 0.75 ? Math.min(EZ.back(clamp((TT + 0.12) / 0.3)), 1.08) : 1 - EZ.i2(seg(TT, 0.75, 1.0)), hk = Math.min(popS(0.875), 1.1);
  const D3 = (size, x, y, off, key) => {
    type('D3', x + off, y + off, size, { teal: 1 }, { key: key + 'sh' });
    type('D3', x, y, size, { pink: 1 }, { key });
  };
  if (bigK * 420 > 12) { const sz = 420 * bigK; D3(sz, MX - typeW('D3', sz) / 2, 1000, 14 * bigK, 'd3big'); }
  if (hk > 0.03) D3(170 * hk, 70, 400, 6, 'd3');
  const it = d3Item();
  if (it && it.idx > 0 && it.s * 110 > 8) type(SW_WORD[it.idx], 655, 400, 110 * it.s, MIX.blue, { align: 'center', key: 'word' + it.idx });
}
function d3Panel() {
  const s = EZ.o3(ev(1.0, 0.35));
  if (s < 0.03) return;
  const P = scaleAbout(boxPts(60, 640, 880, 720), [MX, 1000], s);
  fill(hand(P, 'panel', 1.2), {});
  rimLine(P, 'panelr', { w: 7, amt: 1.4, rough: 0.4 });
}
function d3Guides(S) {
  const G = d3Geometry(), wg = S.w[0] + S.w[1], wr = S.w[3];
  if (TT < 1.2) return;   // the chart panel has not opened yet
  if (wg > 0.15) {
    for (const v of [5, 10, 15, 19]) {
      const y = CH.base - d3.scaleLinear().domain([0, G.vmax]).range([0, CH.h])(v);
      line([[70, y], [930, y]], { teal: 0.35 }, { w: 3.5 * wg, amt: 0.8, key: 'gr' + v });
    }
    line([[70, CH.base], [930, CH.base]], MIX.dark, { w: 7 * wg, amt: 0.6, key: 'base', knock: true });
  }
  if (wr > 0.15) for (const r of [CH.rin, 180, CH.rout]) line(ringPts(CH.cx, CH.cy, r), { teal: 0.35 }, { w: 3.5 * wr, amt: 0.8, key: 'ring' + r, closed: true });
}
function d3Cell(c) {
  if (c.area < 40) return;
  fill(hand(c.pts, 'cell' + c.i, 1.0, 6), c.tn);
  line(c.pts, rimOf(c.tn), { closed: true, w: 5, rough: 0.4, amt: 1.1, key: 'cr' + c.i });
}
function d3Marks(S, cells) {
  const G = d3Geometry(), cu = TIMELINE.cues;
  // the knots of the line, only while the line is the shape
  // (each dot sits on the middle of its own cell, so it travels with the ribbon while the line dissolves)
  for (const c of cells) {
    const r = 15 * c.cw;
    if (r < 3 || TT < cu.m1) continue;
    const a = c.pts[KP >> 1], b = c.pts[2 * KP - 1 - (KP >> 1)], x = (a[0] + b[0]) / 2, y = (a[1] + b[1]) / 2;
    fill(circ(x, y, r), {});
    rim(x, y, r, 'dot' + c.i, { w: 5, amt: 0.8, tones: MIX.dark, double: false });
  }
  // the donut hole shows what its angle scale adds up
  if (S.w[2] > 0.6) {
    type('sum', CH.cx, CH.cy - 34, 34 * S.w[2], MIX.dark, { align: 'center', key: 'sum' });
    type('91', CH.cx, CH.cy + 58, 96 * S.w[2], MIX.blue, { align: 'center', key: '91' });
  }
  // every value rides on its shape
  for (const c of cells) {
    if (TT < cu.grow + c.i * 0.1 + 0.35 || c.area < 200) continue;
    const m = c.pts[KP >> 1];
    type(String(DV[c.i]), m[0] + c.nm[0] * 30, m[1] + c.nm[1] * 30 + 12, 34, MIX.dark, { align: 'center', key: 'lb' + c.i });
  }
  // the hit: a printed burst round the radial area
  if (TT >= cu.hit && TT < cu.hit + 0.5) for (let j = 0; j < 8; j++) {
    const a = (j / 8) * TAU, k = 1 + 0.12 * ((B + j) % 2), r0 = 250 + 90 * EZ.o2(seg(TT, cu.hit, cu.hit + 0.2)), r1 = r0 + 34 * k;
    line([[CH.cx + Math.sin(a) * r0, CH.cy - Math.cos(a) * r0], [CH.cx + Math.sin(a) * r1, CH.cy - Math.cos(a) * r1]], MIX.coral, { w: 8, taper: 0.4, amt: 0.6, key: 'bu' + j, knock: true });
  }
}
// the payoff: the four shapes, side by side, from the same eight values
function d3Minis() {
  const cu = TIMELINE.cues;
  if (TT < cu.hit) return;
  const G = d3Geometry(), k = 0.19, cy = 1432;
  printed(PITCH.fine, { shapes: true, box: [60, 1365, 940, 1495] }, () => {
    for (let j = 0; j < 4; j++) {
      const s = popS(cu.hit + j * E16), mx = 165 + j * 220;
      if (s < 0.03) continue;
      for (let i = 0; i < NV; i++) {
        let P = G.S[j][i];
        // the line ribbon is 26 px thick at full size: fatten it so it still prints at this scale
        if (j === 1) P = P.map(([x, y], n) => { const q = n < KP ? n : 2 * KP - 1 - n, yc = (P[q][1] + P[2 * KP - 1 - q][1]) / 2; return [x, yc + (y - yc) * 4]; });
        fill(poly(P.map(([x, y]) => [mx + (x - CH.cx) * k * s, cy + (y - CH.cy) * k * s])), G.T[j][i]);
      }
    }
  });
}

function sceneD3() {
  const cu = TIMELINE.cues, S = d3State(), cells = d3Cells();
  beginSheet();
  printed(PITCH.field, { full: true }, () => fill(rect(-80, -80, W + 160, H + 160), S.bg));
  printed(PITCH.world, { shapes: true, box: [0, 230, W, 1380] }, () => {
    d3Table(cells);
    d3Panel();
    d3Guides(S);
    cells.forEach(d3Cell);
    d3Marks(S, cells);
    d3Header(S);
  });
  d3Minis();
  endSheet();
  const it = d3Item();
  if (it) defer(() => printTag(SW_TAG[it.idx], MX, 450, 36, { s: it.s }));
  // the title card, then the scale readout; the readout leaves before the hit, where the four shapes arrive
  defer(() => printCard('data in, any shape out', MX, 1180, 50, { s: TT < 0.75 ? popS(0.2) : 1 - EZ.i2(seg(TT, 0.75, 1.0)), frac: ev(0.3, 0.4) }));
  defer(() => {
    const s = Math.min(popS(1.5), 1 - EZ.i2(seg(TT, cu.hit - 0.4, cu.hit - 0.1)));
    if (s > 0.02) printCard(d3Readout(S), MX, 1425, 38, { s });
  });
}
