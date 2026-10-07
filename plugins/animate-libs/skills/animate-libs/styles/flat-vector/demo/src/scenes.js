// =====================================================================
//  SCENES — flat-vector demo. World coordinates 1080x1920; time TT on 1s (STYLE.ones); fvPop(t) = a spring from time t.
//  The bridge shapes (the coral circle, the lilac card) are drawn at full size with no spring-in where the window shows them.
// =====================================================================
const HERO_AT = [826, 1328], HERO_S = 0.92;

// three satellites that orbit the shape; popT = the time the first one pops in (null = already there)
function sceneSats(rx, ry, popT) {
  const defs = [
    { c: FV.lilac, P: fvCirc(0, 0, 36) },
    { c: FV.teal, P: fvRR(-30, -30, 60, 60, 20) },
    { c: FV.navy, P: [[0, -36], [32, 22], [-32, 22]] },
  ];
  defs.forEach((d, i) => {
    const a = TT * 0.9 + i * TAU / 3, p = popT == null ? 1 : fvPop(popT + i * 0.15), x = SH[0] + Math.cos(a) * rx, y = SH[1] + Math.sin(a) * ry;
    fvShape(xform(d.P, x, y, TT * 0.7 + i), d.c, { s: p, drop: 10 });
  });
}
function sceneHero(mood, hop, look) {
  fvShape(fvRR(HERO_AT[0] - 125, HERO_AT[1], 250, 34, 17), FV.lilac, { long: 24 });
  fvHero(HERO_AT[0], HERO_AT[1], HERO_S, { key: 'hero', look, mood, hop });
}

function sceneIdea() {
  const cu = TIMELINE.cues;
  fvGround(1);
  fvHead(['Start with', 'an idea'], cu.head, 470, 100);
  // the idea: a coral circle (the bridge shape) that pops in and pulses
  const p = fvPop(cu.shape), ph = mod(TT - cu.shape - 0.8, 1.6) / 1.6;
  if (TT > cu.shape + 0.8) fvShape(fvCirc(SH[0], SH[1], SH_R), FV.coral, { s: 1 + 0.3 * ph, a: 0.22 * (1 - ph) });
  fvShape(fvCirc(SH[0], SH[1], SH_R), FV.coral, { s: p, long: 46 });
  // a light bulb: ground-coloured glass, a lilac base, rays that shimmer
  const bp = fvPop(cu.bulb), bx = SH[0], by = SH[1] - 24;
  fvShape(fvCirc(bx, by, 66), FV.ground, { s: bp, at: [bx, by] });
  fvShape(fvRR(bx - 28, by + 50, 56, 34, 14), FV.lilac, { s: bp, at: [bx, by] });
  fvShape(fvRR(bx - 18, by + 80, 36, 16, 8), FV.navy, { s: bp, at: [bx, by] });
  fvShape(fvCirc(bx, by - 4, 16), FV.coral, { s: bp, at: [bx, by] });
  for (let i = 0; i < 7; i++) {
    const a = Math.PI + i * Math.PI / 6, rp = fvPop(cu.bulb + 0.25 + i * 0.05, SPRING.snappy), r0 = 96, r1 = r0 + (30 + 8 * Math.sin(TT * TAU * 0.9 + i)) * rp;
    if (rp > 0.01) fvPill(bx + Math.cos(a) * r0, by + Math.sin(a) * r0, bx + Math.cos(a) * r1, by + Math.sin(a) * r1, 14, FV.ground);
  }
  sceneSats(250, 270, cu.sat);
  sceneHero(TT >= cu.wave ? 'wave' : 'calm', 0, SH);
  fvTag('1  IDEA', FV.coral);
  fvCaption('ideas start small', FV.coral);
}

function sceneProduct() {
  const cu = TIMELINE.cues;
  fvGround(2);
  fvHead(['Ship it as', 'a product'], cu.head2, 470, 100);
  // the product: a lilac card (the bridge shape) with a growing bar chart
  sceneSats(270, 290, null);
  fvShape(fvRR(SH[0] - SH_R, SH[1] - SH_R, SH_R * 2, SH_R * 2, 64), FV.lilac, { long: 46 });
  const base = SH[1] + 120, cols = [FV.ground, FV.teal, FV.coral], hs = [110, 170, 230];
  fvPill(SH[0] - 150, base + 18, SH[0] + 150, base + 18, 10, FV.ground, { a: 0.55 });
  cols.forEach((c, i) => {
    const bp = fvPop(cu.bars + i * 0.14, SPRING.smooth), h = hs[i] * bp * (1 + (TT > cu.bars + 1.4 ? 0.05 * Math.sin(TT * TAU * 0.5 + i * 1.3) : 0)), x = SH[0] + (i - 1) * 100;
    if (h > 1) fvShape(fvRR(x - 27, base - h, 54, h, 27), c, { drop: 8 });
  });
  // a badge with a check mark pops on the card's corner
  const bp = fvPop(cu.badge), bx = SH[0] + SH_R - 20, by = SH[1] - SH_R + 20;
  fvShape(fvCirc(bx, by, 58), FV.coral, { s: bp, drop: 8 });
  if (bp > 0.05) { ctx.save(); ctx.translate(bx, by); ctx.scale(bp, bp); ctx.strokeStyle = FV.ground; ctx.lineWidth = 14; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(-22, 2); ctx.lineTo(-6, 18); ctx.lineTo(24, -16); ctx.stroke(); ctx.restore(); }
  sceneHero(TT >= cu.hop ? 'happy' : 'calm', TT >= cu.hop ? (TT - cu.hop) / 0.6 : 0, SH);
  fvTag('2  PRODUCT', FV.teal);
  fvCaption('ideas become products', FV.teal);
}
