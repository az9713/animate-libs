// =====================================================================
//  SCENES — chalkboard demo. World coordinates 1080x1920; time TT on 2s; ev / popS for events.
//  Equations are MathJax images made once here; chImg() draws them as chalk.
// =====================================================================
MJ.make('e1', String.raw`\mathbf{E}=-\nabla\varphi-\frac{\partial\mathbf{A}}{\partial t}`, { size: 104, color: '#f2efe4' });
MJ.make('e2', String.raw`\mathbf{B}=\nabla\times\mathbf{A}`, { size: 104, color: '#f2efe4' });

function sceneCharge() {
  const cu = TIMELINE.cues;
  chBoard(); chTray();
  chImg(MJ.img.e1, CX, 520, { key: 'e1', frac: ev(cu.eq, 1.3) });
  chStroke([[CX - 330, 690], [CX + 330, 696]], { c: CB.yellow, w: 5, frac: ev(cu.eq + 1.3, 0.5), key: 'ul1' });
  // the charge: a circle with a plus, field lines leaving it
  chFill(ellipsePts(SH[0], SH[1], SH_R, SH_R, 0, 64), CB.yellow, { a: 0.22 * ev(cu.shape, 0.8), key: 'chg', gap: 14 });
  chStroke(ellipsePts(SH[0], SH[1], SH_R, SH_R, 0, 64), { closed: true, c: CB.yellow, w: 7, frac: ev(cu.shape, 0.8), key: 'ring' });
  chStroke([[SH[0] - 70, SH[1]], [SH[0] + 70, SH[1]]], { c: CB.white, w: 12, frac: ev(cu.label, 0.3), key: 'plus1' });
  chStroke([[SH[0], SH[1] - 70], [SH[0], SH[1] + 70]], { c: CB.white, w: 12, frac: ev(cu.label + 0.15, 0.3), key: 'plus2' });
  for (let i = 0; i < 12; i++) {
    const a = i / 12 * TAU, r0 = SH_R + 30, r1 = SH_R + 110 + 14 * Math.sin(B * 0.5 + i);
    chStroke([[SH[0] + Math.cos(a) * r0, SH[1] + Math.sin(a) * r0], [SH[0] + Math.cos(a) * r1, SH[1] + Math.sin(a) * r1]], { c: CB.blue, w: 5, frac: ev(cu.lines + i * 0.05, 0.3), key: 'fl' + i, amt: 0.8 });
  }
  chText('ρ', SH[0] + SH_R + 90, SH[1] - SH_R - 20, 90, CB.pink, { frac: ev(cu.label, 0.4), key: 'rho' });
  // background life: chalk stars, fixed
  for (let i = 0; i < 5; i++) { const R = RNG('star', i), x = R.r(120, 940), y = R.r(760, 1180), s = R.r(10, 18); if (Math.hypot(x - SH[0], y - SH[1]) < SH_R + 130) continue; chStroke([[x - s, y], [x + s, y]], { c: CB.grey, w: 3, key: 'sa' + i, alpha: 0.6 }); chStroke([[x, y - s], [x, y + s]], { c: CB.grey, w: 3, key: 'sb' + i, alpha: 0.6 }); }
  chHero(880, 1320, 1.0, { key: 'stick', look: TT < 1.5 ? [CX, 520] : SH, mood: TT >= cu.label ? 'wow' : 'calm', hop: (TT - cu.label) / 0.5 });
  chTag('potentials');
  chCaption('a charge makes the potential φ');
}

function sceneCurrent() {
  const cu = TIMELINE.cues;
  chBoard(); chTray();
  chImg(MJ.img.e2, CX, 520, { key: 'e2', frac: ev(cu.eq2, 1.0) });
  chStroke([[CX - 250, 630], [CX + 250, 636]], { c: CB.blue, w: 5, frac: ev(cu.eq2 + 0.9, 0.5), key: 'ul2' });
  // the current: a block with flow arrows going through it
  const blk = rrectPts(SH[0] - SH_R, SH[1] - SH_R, SH_R * 2, SH_R * 2, 40, 12);
  chFill(blk, CB.blue, { a: 0.22, key: 'cur', gap: 14, angle: 0.7 });
  chStroke(blk, { closed: true, c: CB.blue, w: 7, key: 'box' });
  for (let k = 0; k < 3; k++) {
    const y = SH[1] - 90 + k * 90, f = ev(cu.flow + k * 0.15, 0.5), dx = 20 * Math.sin(B * 0.5 + k);
    chStroke([[SH[0] - 110, y], [SH[0] + 90 + dx, y]], { c: CB.white, w: 7, frac: f, key: 'ar' + k, amt: 1.0 });
    if (f >= 1) chStroke([[SH[0] + 60 + dx, y - 26], [SH[0] + 100 + dx, y], [SH[0] + 60 + dx, y + 26]], { c: CB.white, w: 7, key: 'ah' + k });
  }
  chText('J', SH[0] + SH_R + 90, SH[1] - SH_R - 20, 90, CB.pink, { frac: ev(cu.label2, 0.4), key: 'jj' });
  // curling field lines around the block
  for (let i = 0; i < 3; i++) chStroke(ellipsePts(SH[0], SH[1], SH_R + 55 + i * 45, SH_R + 55 + i * 45, 0, 64, 0.4, TAU - 0.4), { c: CB.green, w: 4, frac: ev(cu.flow + 0.5 + i * 0.2, 0.7), key: 'cl' + i, alpha: 0.8 });
  chHero(880, 1320, 1.0, { key: 'stick', look: TT < 3.8 ? [CX, 520] : SH, mood: TT >= cu.wow ? 'happy' : 'calm', hop: (TT - cu.wow) / 0.5 });
  chTag('potentials');
  chCaption('a current makes the potential A', CB.blue);
}
