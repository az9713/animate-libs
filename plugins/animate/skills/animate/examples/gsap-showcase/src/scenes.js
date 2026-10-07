// =====================================================================
//  SCENES — GSAP showcase. One paused gsap.timeline (MASTER) holds every tween. Each frame it is seeked with MASTER.time(TT),
//  and the scene only reads the numbers the tweens wrote: p (enter 0..1 on the row's ease), x (exit 0..1), y (wave), k, a.
//  Words are set with the kinetic-type kit (ktLetters); rows are placed by hand so the bar and the labels keep their own space.
// =====================================================================
const MASTER = gsap.timeline({ paused: true });
const LANES = [[], [], [], [], [], []];   // lane 0-4: the five words; lane 5: title, letter band
const T_BAR = 8;                           // the bar spans the whole piece
const mkL = (n) => Array.from({ length: n }, () => ({ p: 0, x: 0, y: 0 }));

// add a fromTo tween to MASTER at `at` and remember its block (start, end) for the bar
function gAdd(lane, targets, from, to, at) {
  const tw = gsap.fromTo(targets, from, { immediateRender: false, ...to });
  MASTER.add(tw, at);
  LANES[lane].push([tw.startTime(), tw.startTime() + tw.totalDuration()]);
  return tw;
}

const ROWS = [
  { w: 'POWER',   ease: 'power4.out',          line: false, maxW: 820, from: 'end' },
  { w: 'ELASTIC', ease: 'elastic.out(1, 0.3)', line: true,  maxW: 820, from: 'start' },
  { w: 'BACK',    ease: 'back.out(2)',         line: false, maxW: 760, from: 'end' },
  { w: 'BOUNCE',  ease: 'bounce.out',          line: true,  maxW: 820, from: 'start' },
  { w: 'EXPO',    ease: 'expo.inOut',          line: false, maxW: 760, from: 'end' },
];
const R_TOP = 272, R_PITCH = 205, R_CAP = 130;   // cap top of row 0, row pitch, cap height of a full-size word
const TITLE = { L: mkL(4), S: mkL('ONE TIMELINE, ANY EASE'.length), per: { k: 0 } };
const BAND = { s: 'stagger: { each: 0.05 }', L: mkL('stagger: { each: 0.05 }'.length) };

(function buildMaster() {
  const cu = TIMELINE.cues, ENTER = 0.9, EACH = 0.04;
  // title: letters grow from the baseline on power4.out, the line types in, a red full stop pops on elastic.out, then all of it flattens away
  gAdd(5, TITLE.L, { p: 0 }, { p: 1, duration: 0.5, ease: 'power4.out', stagger: { each: 0.07 } }, cu.title);
  gAdd(5, TITLE.S, { p: 0 }, { p: 1, duration: 0.25, ease: 'power2.out', stagger: { each: 0.01 } }, cu.title + 0.5);
  gAdd(5, TITLE.per, { k: 0 }, { k: 1, duration: 0.45, ease: 'elastic.out(1, 0.3)' }, cu.period);
  gAdd(5, TITLE.L, { x: 0 }, { x: 1, duration: 0.35, ease: 'power3.in', stagger: { each: 0.04, from: 'end' } }, 1.0);
  gAdd(5, TITLE.S, { x: 0 }, { x: 1, duration: 0.3, ease: 'power3.in', stagger: { each: 0.012, from: 'end' } }, 1.0);
  gAdd(5, TITLE.per, { k: 1 }, { k: 0, duration: 0.25, ease: 'power3.in' }, 1.0);
  // the letter band: a stagger of 0.05 s per letter, then waves
  gAdd(5, BAND.L, { p: 0 }, { p: 1, duration: 0.4, ease: 'power2.out', stagger: { each: 0.05 } }, cu.r0);
  [cu.wave, cu.hit].forEach((t) => gAdd(5, BAND.L, { y: 0 }, { y: -26, duration: 0.3, ease: 'sine.inOut', yoyo: true, repeat: 1, stagger: { each: 0.03 } }, t));
  ROWS.forEach((r, i) => {
    r.L = mkL(r.w.length); r.L2 = mkL(r.w.length); r.lab = { a: 0 };
    const t0 = cu['r' + i];
    gAdd(i, r.L, { p: 0 }, { p: 1, duration: ENTER, ease: r.ease, stagger: { each: EACH, from: r.from } }, t0);
    gAdd(i, r.lab, { a: 0 }, { a: 1, duration: 0.2, ease: 'power2.out' }, t0);
    gAdd(i, r.L, { y: 0 }, { y: -16, duration: 0.25, ease: 'sine.inOut', yoyo: true, repeat: 1, stagger: { each: 0.05 } }, cu.wave + i * 0.15);
    gAdd(i, r.L, { x: 0 }, { x: 1, duration: 0.4, ease: 'power3.in', stagger: { each: 0.03, from: 'end' } }, cu.exit + i * 0.1);
    gAdd(i, r.L2, { p: 0 }, { p: 1, duration: ENTER, ease: r.ease, stagger: { each: EACH, from: r.from } }, cu.hit);
  });
  MASTER.set({}, {}, T_BAR);   // the master timeline lasts exactly the piece
})();

const gsVis = (L) => (L.p > 0.001 && L.x < 0.999 ? 1 : 0);

function gsRow(r, i) {
  const K = KTC, top = R_TOP + i * R_PITCH, base = top + R_CAP;
  const size = r.size || (r.size = Math.min(ktFit(r.w, r.maxW), Math.floor(R_CAP / 0.716)));
  const clip = [0, 0, W, base + 4];
  const o = r.line ? { line: K.ink, lw: 6, clip } : { fill: K.ink, clip };
  ktLetters(r.w, 60, base, size, o, (j) => {
    const L = (MASTER.time() >= 6.0 ? r.L2 : r.L)[j], al = gsVis(L), fl = Math.max(1 - L.x, 0.001), dy = L.y;   // exit: flatten onto the baseline
    switch (i) {
      case 0: return { al, dx: -(1 - L.p) * 700, sy: fl, py: base, dy };                         // power4.out: crosses fast, stops dead
      case 1: { const s = 0.55 + 0.45 * L.p; return { al, sx: s, sy: s * fl, py: base - 65, rot: -(1 - L.p) * 0.8, dy }; }   // elastic.out: pops and wobbles
      case 2: return { al, dx: -(1 - L.p) * 300, sy: fl, py: base, dy };                         // back.out(2): pulls past its place, comes back
      case 3: return { al, sx: 1, sy: Math.max(L.p, 0.001) * fl, py: base, dy };                 // bounce.out: height bounces on the baseline
      default: return { al, sx: Math.max(L.p, 0.001), sy: fl, py: base, dy };                    // expo.inOut: waits, then snaps open
    }
  });
  // the ease name, small, under the word
  ktType(r.ease, 60, base + 42, 34, { fill: K.ink, al: 0.8 * r.lab.a });
}

function sceneEases() {
  const K = KTC;
  MASTER.time(TT);
  const now = MASTER.time();
  fillAll(K.yellow);
  ktGhost('GSAP ', 330, 330, 1, 70, K.ink, 0.16);
  ktGhost('GSAP ', 330, 790, -1, 95, K.ink, 0.16);
  ktGhost('GSAP ', 330, 1250, 1, 55, K.ink, 0.16);

  // title (0-1.4 s)
  const tsz = ktFit('GSAP', 760), tcap = ktCap(tsz), tb = 790, tclip = [0, 0, W, tb + 4];
  const tw = ktLetters('GSAP', 60, tb, tsz, { fill: K.ink, clip: tclip }, (j) => { const L = TITLE.L[j]; return { al: gsVis(L), sx: 1, sy: Math.max(L.p * (1 - L.x), 0.001), py: tb }; });
  const ds = tsz * 0.17, pk = TITLE.per.k;
  if (pk > 0.01) { ctx.save(); ctx.fillStyle = K.red; ctx.translate(60 + tw + tsz * 0.06 + ds / 2, tb - ds / 2); ctx.scale(pk, pk); ctx.fillRect(-ds / 2, -ds / 2, ds, ds); ctx.restore(); }
  const ssz = Math.min(ktFit('ONE TIMELINE, ANY EASE', 880), 60), sb = tb + 36 + ktCap(ssz);
  ktLetters('ONE TIMELINE, ANY EASE', 60, sb, ssz, { fill: K.ink, clip: [0, 0, W, sb + 4] }, (j) => { const L = TITLE.S[j]; return { al: gsVis(L), sx: 1, sy: Math.max(L.p * (1 - L.x), 0.001), py: sb }; });

  // the five words
  ROWS.forEach(gsRow);

  // the letter band: gsap stagger, a wave runs through it
  const bsz = Math.min(ktFit(BAND.s, 860), 46), bb = 1340;
  ktLetters(BAND.s, 60, bb, bsz, { fill: K.ink, clip: [0, 0, W, bb + 4] }, (j) => { const L = BAND.L[j]; return { al: gsVis(L), sx: 1, sy: Math.max(L.p, 0.001), py: bb, dy: L.y }; });

  // the master timeline bar: the tween blocks, the ticks, the playhead = MASTER.time()
  const bx = 60, bw = 880, X = (t) => bx + bw * t / T_BAR, y0 = 1406;
  ktType('MASTER TIMELINE, PAUSED', 60, 1394, 28, { fill: K.ink, al: 0.8 });
  ktType('tl.time(' + now.toFixed(2) + ')', 940, 1394, 28, { fill: K.ink, align: 'right' });
  ctx.save();
  ctx.fillStyle = K.ink; ctx.globalAlpha = 0.1; ctx.fillRect(bx, y0, bw, 84);
  ctx.globalAlpha = 0.3; for (let s = 1; s < T_BAR; s++) ctx.fillRect(X(s) - 1, y0, 2, 84);
  LANES.forEach((lane, k) => lane.forEach(([a, b]) => {
    ctx.globalAlpha = now >= b ? 0.5 : now >= a ? 1 : 0.22;
    ctx.fillRect(X(a), y0 + 8 + k * 12, Math.max(X(b) - X(a), 3), 9);
  }));
  ctx.globalAlpha = 1; ctx.fillStyle = K.red; ctx.fillRect(X(now) - 3, y0 - 6, 6, 96);
  ctx.restore();
}
