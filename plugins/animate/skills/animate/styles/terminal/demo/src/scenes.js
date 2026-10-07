// =====================================================================
//  SCENES — terminal demo. World coordinates 1080x1920; motion on 1s (TT = F / FPS); ev / seg for events.
//  Layout: status line y 268, tag y 330, log lines from y 440 (40px, 56px apart), the pane at SH, caption y 1440.
// =====================================================================
function sceneScan() {
  const cu = TIMELINE.cues, bx = SH[0] - PANE_A.w / 2, by = SH[1] - PANE_A.h / 2;
  tmBoard();
  tmLog([
    { t: cu.cmd, s: '$ ./run --scan sky' },
    { t: cu.load, s: '> loading catalog...', c: TM.dim },
    { t: cu.bar, fn: () => tmBarStr(seg(TT, cu.bar, 3.0), 22) },
    { t: cu.found, s: '> 1 object found', c: TM.dim },
  ], 70, 440, 56, 40);
  tmBox(bx, by, PANE_A.w, PANE_A.h, 'viewport', { frac: ev(cu.box, 0.5), rows: 40 });
  const n = 4 * EZ.o2(seg(TT, cu.star, 3.8));
  tmHero(SH[0], SH[1], n);
  if (TT >= cu.star) tmText(`radius: ${String(Math.floor(n)).padStart(2, '0')}`, bx, by + PANE_A.h + 70, TM.amber, { size: 36 });
  tmTag('SCAN');
  tmCaption('one spark in the dark');
}

function sceneGrow() {
  const cu = TIMELINE.cues, bx = SH[0] - PANE_B.w / 2, by = SH[1] - PANE_B.h / 2;
  tmBoard();
  tmLog([
    { t: cu.cmd2, s: '$ ./run --grow' },
    { t: cu.cmd2 + 0.7, s: '> histogram', c: TM.dim },
    { t: cu.done, s: '> done. radius 5 cells', c: TM.dim, y: 440 + 56 * 3 + 40 },
    { t: cu.prompt, s: '$ ', y: by + PANE_B.h + 100 },
  ], 70, 440, 56, 40);
  // the block-character histogram: 20 columns, each a shade character that changes every 4 frames
  const hp = ev(cu.hist, 0.8);
  if (hp > 0) {
    const s = Array.from({ length: 20 }, (_, i) => TM_SHADES[Math.floor(clamp(RNG('hist', i, Math.floor(TT * 6)).r(0.15, 1) * hp) * 7.99)]).join('');
    tmText(s, 70, 590, TM.green, { size: 56, glow: 3 });
  }
  tmBox(bx, by, PANE_B.w, PANE_B.h, 'viewport', { rows: 40 });
  const n = 4 + 1 * EZ.o2(seg(TT, cu.star2, 6.6));
  tmHero(SH[0], SH[1], n);
  tmText(`radius: ${String(Math.floor(n)).padStart(2, '0')}`, bx, by + PANE_B.h + 50, TM.amber, { size: 36 });
  tmTag('GROW');
  tmCaption('the star keeps growing');
}
