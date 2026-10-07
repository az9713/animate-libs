# Navier-Stokes (incompressible) — manim piece, 1080x1920, 24 fps, 20 s. Written 2026-10-07.

Second manim take of the bake-off (see `../maxwell-derivation/SPEC.md`). Route: `manim/scene.py` only; no canvas route for this topic.

## Equations on screen (TeX) and sources
| id | TeX | source |
|---|---|---|
| cont | `\nabla\cdot\mathbf{u}=0` | Wikipedia "Navier–Stokes equations"; "Navier–Stokes existence and smoothness" (`∇·v = 0`) |
| kinematic | `\frac{\partial\mathbf{u}}{\partial t}+\mathbf{u}\cdot\nabla\mathbf{u}=-\frac{1}{\rho}\nabla p+\nu\nabla^{2}\mathbf{u}+\mathbf{f}` | "Navier–Stokes existence and smoothness": `∂v/∂t + (v·∇)v = −(1/ρ)∇p + ν∆v + f(x,t)`, f = external specific force (per unit mass), ν > 0 kinematic viscosity |
| momentum (ρ form) | `\rho\bigl(\frac{\partial\mathbf{u}}{\partial t}+\mathbf{u}\cdot\nabla\mathbf{u}\bigr)=-\nabla p+\mu\nabla^{2}\mathbf{u}+\rho\mathbf{f}` | **derived**: the kinematic form multiplied by ρ, with μ = ρν. Not copied from a source. |
| nu | `\nu=\frac{\mu}{\rho}` | "Navier–Stokes equations" (ν = μ/ρ, kinematic viscosity) |
| Re | `\mathrm{Re}=\frac{UL}{\nu}` | Wikipedia "Reynolds number": Re = uL/ν; a ratio of inertial to viscous forces |

The example flow is `u = (−(y−y0), x−x0)`, a rigid rotation. Its divergence is `∂(−y)/∂x + ∂x/∂y = 0`, so it satisfies `∇·u = 0`. It is a velocity field only; the piece does not claim it solves the momentum equation.

## Timeline (s)
| t | what | caption |
|---|---|---|
| 0.2–1.2 | write cont | the fluid keeps its volume |
| 1.6–3.2 | write the ρ form on two lines | momentum balance |
| 3.6–8.1 | colour the four terms one by one (acceleration, pressure, viscous, body force) | acceleration of a parcel / pressure gradient / viscous diffusion / body force, e.g. gravity |
| 9.0–11.0 | term-matched morph ρ form -> kinematic form | divide by rho |
| 11.5–12.3 | write nu | nu is the kinematic viscosity |
| 13.0–14.0 | write Re | inertial / viscous forces |
| 14.5–20.0 | vector field of a rotation, a dot orbits | an example flow: rotation |

## Result (2026-10-07)
Render 30-31 s at 1080x1920, 24 fps; 479 frames (19.958 s: manim rounds each `play`); 1.16 MB H.264, no audio. Two renders gave identical frame hashes. Layout took four render cycles: a fraction (`∂u/∂t`, `1/ρ`, `μ/ρ`) is about 0.7 scene units tall, so rows need about 250 px of spacing. Not done: audio, `review.mjs` (it reads canvas pieces only), a canvas route.
