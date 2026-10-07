// =====================================================================
//  ERAS, BRIDGES — flat-vector demo (read by kit/morph.js). No camera moves.
// =====================================================================
const ERA_BG = [FV.ground, FV.ground];
const SH = [CX, 1000], SH_R = 190;   // the shape's centre and radius: a circle in era 1, a rounded square in era 2
const BRIDGES = [
  { tc: 4.0, A: () => ({ P: fvCirc(SH[0], SH[1], SH_R), c: FV.coral }), B: () => ({ P: fvRR(SH[0] - SH_R, SH[1] - SH_R, SH_R * 2, SH_R * 2, 64), c: FV.lilac }) },   // the idea's circle -> the product's card
];
