// =====================================================================
//  SCENES — one era. TT is seconds. See SPEC.md for the timeline and the sources of every equation.
// =====================================================================
const MJO = (c) => ({ size: 88, color: '#f2efe4', ...c });
MJ.make('divB', String.raw`\nabla\cdot\mathbf{B}=0`, MJO());
MJ.make('B', String.raw`\mathbf{B}=\nabla\times\mathbf{A}`, MJO());
MJ.make('E', String.raw`\mathbf{E}=-\nabla\varphi-\frac{\partial\mathbf{A}}{\partial t}`, MJO());
MJ.make('gauss', String.raw`\nabla\cdot\mathbf{E}=\frac{\rho}{\varepsilon_0}`, MJO({ size: 58 }));
MJ.make('gaussP', String.raw`\nabla\cdot\left(-\nabla\varphi-\frac{\partial\mathbf{A}}{\partial t}\right)=\frac{\rho}{\varepsilon_0}`, MJO({ size: 58 }));
MJ.make('amp', String.raw`\nabla\times\mathbf{B}=\mu_0\left(\mathbf{J}+\varepsilon_0\frac{\partial\mathbf{E}}{\partial t}\right)`, MJO({ size: 50 }));
MJ.make('ampB', String.raw`\nabla\times\left(\nabla\times\mathbf{A}\right)=\mu_0\left(\mathbf{J}+\varepsilon_0\frac{\partial\mathbf{E}}{\partial t}\right)`, MJO({ size: 50 }));
MJ.make('gauge', String.raw`\nabla\cdot\mathbf{A}+\frac{1}{c^{2}}\frac{\partial\varphi}{\partial t}=0`, MJO({ size: 66 }));
MJ.make('wphi', String.raw`\Box\varphi=\frac{\rho}{\varepsilon_0}`, MJO({ size: 58 }));
MJ.make('wA', String.raw`\Box\mathbf{A}=\mu_0\mathbf{J}`, MJO({ size: 50 }));
MJ.make('box', String.raw`\Box=\frac{1}{c^{2}}\frac{\partial^{2}}{\partial t^{2}}-\nabla^{2}`, MJO({ size: 56 }));

// captions: [t0, t1, text, colour]; the one whose window holds TT is written on
const CAPS = [
  [0.4, 1.8, 'no magnetic charges'], [2.0, 3.3, 'so B is a curl of A', CB.blue], [3.5, 5.7, "Faraday's law gives E"],
  [6.3, 7.4, "Gauss's law"], [7.6, 8.9, 'swap E for its potentials', CB.blue], [9.1, 10.3, 'Ampère–Maxwell law'], [10.5, 12.2, 'swap B for its potential', CB.blue],
  [12.4, 15.9, 'choose the Lorenz gauge', CB.yellow], [16.2, 20.1, 'the wave equations', CB.green],
];

function sceneDerivation() {
  const cu = TIMELINE.cues;
  chBoard(); chTray();
  // stage 1: divB -> B at y 520, E at y 860, erased at 5.6
  const a1 = 1 - ev(cu.erase, 0.4);
  if (TT < cu.erase + 0.5) {
    ctx.save(); ctx.globalAlpha = a1;
    eqDraw('divB', 'B', (TT - cu.toB) / 0.8, CX, 520, { frac: ev(cu.divB, 1.0), key: 'e1' });
    eqDraw('E', null, 0, CX, 860, { frac: ev(cu.E, 1.4), key: 'e2' });
    ctx.restore();
    chStroke([[CX - 330, 930], [CX + 330, 936]], { c: CB.yellow, w: 5, frac: ev(cu.E + 1.4, 0.5), key: 'ul1', alpha: a1 });
  }
  // stage 2 and 3: gauss -> gaussP -> wphi at y 760; amp -> ampB -> wA at y 1050
  if (TT >= cu.gauss) {
    if (TT < cu.waves) eqDraw('gauss', 'gaussP', (TT - cu.toGaussP) / 0.9, CX, 760, { frac: ev(cu.gauss, 1.0), key: 'e3' });
    else eqDraw('gaussP', 'wphi', (TT - cu.waves) / 1.0, CX, 760, { key: 'e3b' });
  }
  if (TT >= cu.amp) {
    if (TT < cu.waves) eqDraw('amp', 'ampB', (TT - cu.toAmpB) / 0.9, CX, 1050, { frac: ev(cu.amp, 1.0), key: 'e4' });
    else eqDraw('ampB', 'wA', (TT - cu.waves) / 1.0, CX, 1050, { key: 'e4b' });
  }
  // the gauge, top of the board, underlined
  if (TT >= cu.gauge) {
    eqDraw('gauge', null, 0, CX, 430, { frac: ev(cu.gauge, 1.0), key: 'e5' });
    chStroke([[CX - 400, 505], [CX + 400, 511]], { c: CB.yellow, w: 5, frac: ev(cu.gauge + 1.0, 0.5), key: 'ul2' });
  }
  if (TT >= cu.box) eqDraw('box', null, 0, CX, 1300, { frac: ev(cu.box, 1.0), key: 'e6', c: CB.grey });
  for (const [t0, t1, s, c] of CAPS) if (TT >= t0 && TT < t1) chText(s, CX, 1440, 56, c ?? CB.white, { align: 'center', frac: ev(t0, 0.8), key: 'cap' + s });
  chTag('potentials');
  chHero(900, 1330, 0.9, { key: 'stick', look: [CX, 760], mood: TT >= cu.wow ? 'wow' : TT >= cu.waves ? 'happy' : 'calm', hop: (TT - cu.wow) / 0.5 });
}
