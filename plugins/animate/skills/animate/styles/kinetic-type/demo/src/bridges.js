// =====================================================================
//  ERAS, BRIDGES — kinetic-type demo (read by kit/morph.js). No camera moves: the type moves, the frame holds.
// =====================================================================
const ERA_BG = [KTC.yellow, KTC.blue];
const HX = CX, HY = 1240, HR = 150;   // the hero block: centre and half-size, the same in both eras
const BRIDGES = [
  { tc: 4.0, d: 0.5, m: 0.2,
    A: () => ({ P: rrectPts(HX - HR, HY - HR, HR * 2, HR * 2, HR * 0.36, 8), c: KTC.ink }),     // the ink block with the asterisk
    B: () => ({ P: ellipsePts(HX, HY, HR, HR, 0, 64), c: KTC.red }) },                          // the red circle with the '?'
];
