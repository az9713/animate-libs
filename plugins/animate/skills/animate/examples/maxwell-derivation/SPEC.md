# Maxwell derivation (bake-off) — shared spec for Route A (canvas + MathJax) and Route B (manim)

Both routes render this same storyboard: 1080x1920, 24 fps, 20.0 s (480 frames). Written 2026-10-07.
This is an abridged derivation. The algebra between lines is NOT on screen; every caption states only what the line shows.

## Convention (fixed; do not mix)
`□ = (1/c²) ∂²/∂t² − ∇²`, so `□φ = ρ/ε₀` and `□A = μ₀J` (SI). Source: Wikipedia, "Lorenz gauge condition".

## Equations on screen (TeX) and sources
| id | TeX | source |
|---|---|---|
| divB | `\nabla\cdot\mathbf{B}=0` | Wikipedia "Maxwell's equations" (Gauss's law for magnetism) |
| B | `\mathbf{B}=\nabla\times\mathbf{A}` | Wikipedia "Lorenz gauge condition"; Cambridge IB EM notes 5.3 |
| E | `\mathbf{E}=-\nabla\varphi-\frac{\partial\mathbf{A}}{\partial t}` | same two sources |
| gauss | `\nabla\cdot\mathbf{E}=\frac{\rho}{\varepsilon_0}` | Wikipedia "Maxwell's equations" |
| gaussP | gauss with `E` replaced by the E line (in parentheses) | substitution of the E line into gauss |
| amp | `\nabla\times\mathbf{B}=\mu_0\left(\mathbf{J}+\varepsilon_0\frac{\partial\mathbf{E}}{\partial t}\right)` | Wikipedia "Maxwell's equations" |
| ampB | amp with `B` replaced by `\nabla\times\mathbf{A}` (in parentheses) | substitution of the B line into amp |
| gauge | `\nabla\cdot\mathbf{A}+\frac{1}{c^2}\frac{\partial\varphi}{\partial t}=0` | Wikipedia "Lorenz gauge condition" |
| wphi | `\Box\varphi=\frac{\rho}{\varepsilon_0}` | same |
| wA | `\Box\mathbf{A}=\mu_0\mathbf{J}` | same |
| box | `\Box=\frac{1}{c^2}\frac{\partial^2}{\partial t^2}-\nabla^2` | same |
Also used (not on screen): `∇×(∇×A) = ∇(∇·A) − ∇²A` (Wikipedia "Vector calculus identities"), `c = (ε₀μ₀)^(−1/2)`.

## Timeline (s) — each row is one beat; "morph" = term-matched transform (unchanged terms slide, changed terms fade)
| t | what | caption |
|---|---|---|
| 0.2–1.2 | write divB at y=520 | no magnetic charges |
| 1.8–2.6 | morph divB -> B | so B is a curl of A |
| 3.4–4.8 | write E at y=860 | Faraday's law gives E |
| 5.6–6.0 | erase both | |
| 6.2–7.2 | write gauss at y=760 | Gauss's law |
| 7.4–8.3 | morph gauss -> gaussP | swap E for its potentials |
| 9.0–10.0 | write amp at y=1050 | Ampère–Maxwell law |
| 10.3–11.2 | morph amp -> ampB | swap B for its potential |
| 12.3–13.3 | write gauge at y=430, underline | choose the Lorenz gauge |
| 13.5–15.9 | near silence, picture holds | |
| 16.0–17.0 | morph gaussP -> wphi, ampB -> wA | the wave equations |
| 17.3–18.3 | write box at y=1300 | |
| 18.5–20.0 | hero reacts, hold | |

Not claimed: the loop closes; the algebra from gaussP/ampB to wphi/wA is shown.

## Results (2026-10-07, this Windows machine, RTX 3050; both routes ran the same storyboard)
| | Route A: canvas + MathJax 3.2.2 (`src/`) | Route B: manim 0.21 (`manim/scene.py`) |
|---|---|---|
| Code written | `glyphs.js` 60 lines (parse MathJax SVG, longest-common-subsequence match of glyph outlines, slide/fade) + `scenes.js` | one `scene.py`, 24 animations; every equation hand-grouped with `{{ }}` so terms can match |
| Term matching | automatic, by identical glyph outline; repeated glyphs match in order | only groups with identical TeX strings match; grouping is manual per pair |
| Wall time, full run | 37 s export (16.5 s frames) | 34-35 s render |
| Frames / duration | 480 / 20.000 s | 476 / 19.833 s (rounding per `play`) |
| Output | 3.16 MB H.264 + AAC (score with silence and chimes) | 1.1 MB H.264, no audio |
| Pipeline checks | `tile.mjs` deterministic: true; `review.mjs` all PASS | none (no review, no tile, no audio); determinism not measured |
| Look | chalk on slate (eroded glyphs, hero, tray) | clean LaTeX serif; no style; captions overlap while cross-fading |
| Needs | Chromium + MathJax inlined (2.1 MB) | Python venv with manim, MiKTeX (a LaTeX compile for each MathTex) |
| Gotchas | none hit after the score cue fix | frame width for portrait (`config.frame_width = 4.5`); underline and caption positions need units, not pixels |

Finding: on this storyboard both routes give term-matched morphs in about the same render time. Route A costs 60 lines once and adds nothing to maintain per equation; Route B costs a hand-made grouping per equation and adds a second toolchain (Python, MiKTeX) with no audio or review path. Not shown by this test: morphs that need a non-rigid motion of glyphs (manim has path interpolation for arbitrary shapes), 3D, or long programs where manim's caching helps.
