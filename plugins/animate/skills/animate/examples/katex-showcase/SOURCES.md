# Sources: equations in the KaTeX showcase

Each equation was compared with a standard source (Wikipedia page, wikitext fetched 2026-10-07) and checked numerically in Node.

| On screen | LaTeX typed in the piece | Source line | Numeric check |
|---|---|---|---|
| Euler's identity | `e^{i\pi}+1=0` | https://en.wikipedia.org/wiki/Euler%27s_identity: `e^{i \pi} + 1 = 0` | cos(pi) + 1 = 0 and sin(pi) = 1.2e-16 (floating-point zero) |
| Gaussian integral | `\int_{-\infty}^{\infty} e^{-x^2}\,dx=\sqrt{\pi}` | https://en.wikipedia.org/wiki/Gaussian_integral: `\int_{-\infty}^\infty e^{-x^2}\,dx = \sqrt{\pi}` | trapezoid rule on [-10, 10], step 1e-4: 1.772453850905577 against sqrt(pi) = 1.7724538509055159 (difference 6e-14) |
| Quadratic formula | `x=\frac{-b\pm\sqrt{b^2-4ac}}{2a}` | https://en.wikipedia.org/wiki/Quadratic_formula: `x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}` | both roots put back into ax^2 + bx + c for 8 coefficient sets: worst residual 4.4e-16 |

The formula is the solution of ax^2 + bx + c = 0 for a not equal to 0. The Gaussian integral is over the whole real line.

The colour code in the piece (e teal, i pink, pi orange, x blue, a red, b green, c yellow) only changes colour. It does not change any symbol. The coloured LaTeX in `src/scenes.js` (`EQ_COL`) has the same symbols as the typed source (`EQ_SRC`).

The numeric check script was `check-math.mjs` (scratch file, not kept in the piece).
