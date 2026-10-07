  // SCORE BODY — waapi showcase (inside buildScore(); see kit/score-head.js). A low drone under key clicks while the source
  // types, a rising blip as the element grows and a falling one as it runs back. The drone ends at 6.4s, nothing sounds
  // from 6.4s to 7.5s, then one low hit with a chord (the loudest sound), and the last line types on.
  const T = TIMELINE, cu = T.cues;
  to = 'm';
  pad(0.0, 6.4, ['A2', 'E3'], 0.03, { type: 'triangle', cut: 800, att: 0.3, rel: 0.3, send: 0 });
  pad(1.0, 6.4, ['Cs4'], 0.02, { type: 'triangle', cut: 900, att: 0.3, rel: 0.3, send: 0 });
  to = 's';
  const typed = (t0, len, cps) => { for (let i = 0; i < len; i += 3) blip(t0 + i / cps, 2600 + (i % 3) * 140, 1800, 0.012, 0.02, (i % 4) * 0.1 - 0.15); };
  typed(0.0, 11, 30); typed(0.4, 32, 64);                                // the title card
  for (let i = 0; i < 17; i++) typed(cu.type + i * 0.08, 14, 90);        // the source lines
  typed(1.3, 34, 60);                                                    // the caption
  blip(cu.run, 300, 1400, 0.3, 0.03); blip(cu.rev, 1400, 300, 0.3, 0.03); blip(cu.fwd, 300, 1400, 0.3, 0.03);   // one blip per run of the animation
  chime(cu.run + 0.05, [nz('E5')], 0.03);
  // the hit
  sub(cu.hit, 0.5);
  noiseHit(cu.hit, 0.25, 'bandpass', 2400, 1, 0.12);
  chime(cu.hit, [nz('A5'), nz('Cs6'), nz('E6')], 0.09);
  typed(cu.hit + 0.05, 30, 72);                                          // the last caption
