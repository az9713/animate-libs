// =====================================================================
//  SCENES — kinetic-type demo. World coordinates 1080x1920, motion on 1s (TT = every frame). Every word is a spring
//  per letter; everything that matters sits in x 60-940, y 250-1500.
// =====================================================================
const ktSpr = (t, k = 320, d = 28) => springEase(TT - t, k, d);   // 0 -> 1 from time t, overshoots a hair

function sceneWords() {
  const cu = TIMELINE.cues, K = KTC;
  fillAll(K.yellow);
  ktBack(K.ink, 'WORDS ', 'WORDS ARE PICTURES + ');
  const [a, b, c] = ktStack([{ s: 'WORDS', w: 880 }, { s: 'ARE', w: 760 }, { s: 'PICTURES', w: 880 }], 336, 64);
  // WORDS: solid, each letter slides in from the left, one after another
  // (the last letter goes first, so a later letter never has to pass through an earlier one)
  ktLetters(a.s, 60, a.base, a.size, { fill: K.ink }, (i, n) => ({ dx: -(1 - ktSpr(cu.words + (n - 1 - i) * 0.05, 320, 36)) * 1300 }));
  // ARE: outline only; the letters spread out from below, turning, and settle
  ktLetters(b.s, 60, b.base, b.size, { line: K.ink, lw: 8 }, (i, n) => {
    const t0 = cu.are + i * 0.1, k = 1 - ktSpr(t0, 300, 20), s = 1 + k * 0.4;
    return { dy: k * 400, dx: (i - 1) * 260 * k, rot: (i - 1) * 1.2 * k, sx: s, al: TT >= t0 ? 1 : 0 };
  });
  const dp = ktSpr(cu.cap, 260, 14), ds = b.size * 0.17;   // the full stop after ARE: a red square that pops
  ctx.save(); ctx.fillStyle = K.red; ctx.translate(60 + b.w + b.size * 0.09 + ds / 2, b.base - ds / 2); ctx.scale(dp, dp); ctx.fillRect(-ds / 2, -ds / 2, ds, ds); ctx.restore();
  // PICTURES: solid, the letters rise out from behind the baseline, then ripple on the beat
  ktLetters(c.s, 60, c.base, c.size, { fill: K.ink, clip: [0, 0, W, c.base + 4] }, (i) => {
    const t0 = cu.pics + i * 0.04, rise = (1 - ktSpr(t0)) * c.cap * 1.3, w = TT >= cu.wave ? -c.cap * 0.09 * Math.exp(-mod(TT - cu.wave - i * 0.06, BEAT) * 9) : 0;
    return { dy: rise + w, al: TT >= t0 ? 1 : 0 };
  });
  ktRule(60, 940, c.base + 34, 14, K.red, EZ.o3(ev(cu.rule, 0.35)));
  ktBars(HX + HR + 56, HY + HR, 6, 24, 12, HR * 1.5, K.ink, cu.rule);
  ktBars(HX - HR - 56 - 204, HY + HR, 6, 24, 12, HR * 1.5, K.ink, cu.rule, 1);
  // the hero: an asterisk on an ink block, pops on a playful spring, spins, pulses on every beat
  const hp = ktSpr(cu.hero, 260, 14), pulse = 1 + 0.05 * Math.exp(-mod(TT - cu.hero, BEAT) * 9);
  ktHero(HX, HY, HR, { glyph: '*', bg: K.ink, fg: K.red, sc: hp * pulse, rot: -(1 - hp) * 2.5 + (TT - cu.hero) * 0.9 });
  ktCaption('LETTER BY LETTER', K.ink, cu.cap, 3.2);
}

function sceneIf() {
  const cu = TIMELINE.cues, K = KTC;
  fillAll(K.blue);
  ktBack(K.white, 'WHAT IF ', 'WHAT IF + WHAT IF + ');
  const [a, b] = ktStack([{ s: 'WHAT', w: 880 }, { s: 'IF', w: 560 }], 336, 64);
  // WHAT: solid, the letters rise out from behind the baseline, then ripple on the beat
  ktLetters(a.s, 60, a.base, a.size, { fill: K.white, clip: [0, 0, W, a.base + 4] }, (i) => {
    const t0 = cu.what + i * 0.05, rise = (1 - ktSpr(t0)) * a.cap * 1.3, w = TT >= cu.wave2 ? -a.cap * 0.09 * Math.exp(-mod(TT - cu.wave2 - i * 0.06, BEAT) * 9) : 0;
    return { dy: rise + w, al: TT >= t0 ? 1 : 0 };
  });
  // IF: outline; both letters slide in from the left, F first (so I never has to pass through it), turning; then the outline fills solid
  const fa = ev(cu.fill, 0.12);
  ktLetters(b.s, 60, b.base, b.size, { line: K.white, lw: 10, fill: K.white, fa }, (i, n) => {
    const t0 = cu.if + (n - 1 - i) * 0.12, k = 1 - ktSpr(t0, 300, 24);
    return { dx: -1300 * Math.max(k, 0), rot: -1.4 * k, al: TT >= t0 ? 1 : 0 };
  });
  ktRule(60, 940, b.base + 36, 14, K.red, EZ.o3(ev(cu.fill, 0.35)), EZ.i3(ev(cu.wave2 + 0.25, 0.3)));
  ktBars(HX + HR + 56, HY + HR, 6, 24, 12, HR * 1.5, K.white, cu.if);
  ktBars(HX - HR - 56 - 204, HY + HR, 6, 24, 12, HR * 1.5, K.white, cu.if, 1);
  // the hero: a red circle with a '?' that wobbles, pulses on the beat, and at `flip` turns through its edge into a '!'
  const fp = ev(cu.flip, 0.3), pulse = 1 + 0.05 * Math.exp(-mod(TT - E0, BEAT) * 9);
  ktHero(HX, HY, HR, { glyph: fp < 0.5 ? '?' : '!', shape: 'circle', bg: K.red, fg: K.white, sc: pulse, rot: 0.1 * Math.sin(TT * TAU * 0.5), gx: Math.max(0.02, Math.abs(Math.cos(Math.PI * fp))) });
  ktCaption('ALL OF IT IS TYPE', K.white, cu.cap2);
}
