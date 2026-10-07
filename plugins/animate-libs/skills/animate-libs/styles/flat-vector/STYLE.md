# Flat vector

![sample](sample.png)

A flat-vector explainer, the corporate-explainer / motion-graphics look. Clean geometric shapes with rounded corners, filled with solid colour. No outlines, no texture, no grain. A limited bold palette sits on an off-white ground. Depth comes only from a flat 45-degree long shadow on big shapes and one soft drop shadow on small ones. Characters are circles and pills. Type is bold sans-serif. Everything arrives on springs: it scales or slides in, overshoots a little, and settles, one item after another.

Use it for product explainers, "how it works" pieces, and any idea that is a sequence of clean objects. It promises "this is tidy and friendly", so keep shapes simple and let motion carry the energy.

**Made without reference media.** The numbers below are the values chosen in `kit.js`, not measurements of a reference. The look has not had the `new-style.md` thumbs-up check-in yet.

## Palette (`FV.*`)

| key | value | use |
|---|---|---|
| `ground` | `#f6f3ee` | the off-white ground (and `STYLE.paper`); also the "white" of bars, glass and text on colour |
| `navy` | `#1f2a5a` | all type, the hero's body, small marks |
| `coral` | `#ff6b5e` | main accent: the idea circle, tags, badges |
| `sunny` | `#ffc83d` | **the hero only** (head and hands; `heroColor`). Never spend it on decoration |
| `teal` | `#2ec4b6` | second accent: bars, satellites, tags |
| `lilac` | `#b9a6ff` | third accent: cards, platforms, soft background discs |
| `shade` | `#e6e0dc` | the flat long shadow on the ground (opaque, so overlapping steps do not add up) |

Soft background discs use lilac at 32% and teal at 20% alpha; the dot grid is navy at 16%.

Pick the two bridge colours so their blend is not grey. Coral to teal (complements) blends to a muddy olive-grey at the midpoint. Coral to lilac blends to pink-mauve and is used in the demo.

## Line and texture

- No strokes on shapes. Lines exist only as round-capped pills (`fvPill`, 8-28px at 1080 wide): limbs, rays, the check mark, the chart baseline.
- Corners are rounded: radius is 30-50% of the short side (`fvRR`; cards 64px on 380px, pills half their height).
- Long shadow: the outline copied along 45 degrees, up to `long` px (44-46 for big shapes, 24 for the platform), filled with `shade`. A single soft drop shadow (`drop`, navy at 16%, offset straight down 6-10px) is used on small and on-colour shapes.
- Fills are solid. No gradients, no `shadowBlur`, no wobble, no boil.

## Type

`FVF`: `"Segoe UI", "Helvetica Neue", Helvetica, Arial, sans-serif`, weight 800. Headline 100px navy, centred at `CX`, first baseline y 470. Tag: a coloured pill at x 70, y 290-358, 44px ground-coloured text. Caption: 56px navy at `CX`, baseline y 1440, with a rounded accent bar below it (y 1462).

## Motion habits

- **On 1s (`ones: true`).** Smooth motion is part of the look: a spring settles over about 0.5 s and a 2s step would show as stutter. The cost is none that matters here: nothing in the kit uses `B` (the 2-frame boil index), so there is no mix of rates.
- Entrances use `springEase` through `fvPop(t, preset)`: `SPRING.playful` for shapes and characters (visible overshoot), `snappy` for tags and rays, `smooth` for bars and captions, and a stiffer custom spring for headline words. Stagger items by 0.05-0.15 s.
- Headlines enter word by word, sliding up 80px and fading in.
- Idle life is continuous: the hero bobs, blinks (keyed on `F`) and wiggles its antenna; confetti drifts and turns; the background discs float; satellites orbit; light rays shimmer; bars breathe by 5%.
- The camera holds still. The morph is a flat circle blending into a flat rounded square.
- The bridge shape in each era (the circle, the card) is drawn at full size with no spring-in, because the window shows it from the first frame. Spring in everything else.

## Frame checklist (on top of the skill's grammar/FRAME.md)

1. **No outlines, no texture** anywhere: check a full-size crop for hairlines around shapes.
2. **Flat colour only.** Every fill is one of the six colours (plus alpha). `sunny` appears only on the hero.
3. Every big shape on the ground has a long shadow; every small shape on a colour has a drop shadow or none.
4. Corners are rounded on every rectangle.
5. Type is bold navy sans; text on a colour is `ground`.
6. The hero has a simple face (eyes with highlights, cheeks, a mouth), its feet on a platform, and its bottom at or above y 1330.
7. Headline, tag, caption, hero and the main shape do not overlap; the hero's raised hands may cross a satellite, which draws behind it.
8. Background life (discs, dot grid, confetti) is pale or small and never competes with the main shape.
9. Nothing sits still in a held frame: something drifts, bobs or orbits.

## Kit API (`kit.js`, on top of `kit/core.js`)

- `FV` palette, `FVF` font stack.
- Geometry: `fvCirc(x, y, r)`, `fvRR(x, y, w, h, r)`, `fvMid(P)`, `fvAbout(P, k, c)`.
- `fvPop(t0, preset)`: spring 0 to 1 from time t0 (default `SPRING.playful`).
- `fvShape(P, c, { long, drop, s, at, a, shade })`: a flat shape, scaled by `s` about `at` (default its centre). `fvPill(x0, y0, x1, y1, w, c, { drop, a })`.
- `fvText(str, x, y, size, c, { align, weight, a })` returns the width. `fvHead(lines, t0, y0, size, c, { gap })`: a word-by-word headline.
- `fvGround(seed, avoid)`: ground, background discs, dot grid and 8 confetti pieces (RNG-keyed, `avoid = [x, y, r]` keeps them off the main shape).
- `fvHero(x, y, s, { look, mood, hop, key, al })`: (x, y) = ground under the feet; s = 1 is about 380px tall. Moods: `calm`, `wave`, `wow`, `happy`. `hop` 0..1 is a jump with squash and stretch. It sets `SPARK_AT`.
- `fvTag(str, c)`, `fvCaption(str, c)`: through `DEFER`; they fade out before a bridge shrinks and fade in after its window opens (`fvFade`, reads `BRIDGES`).
- `STYLE`: `paper`, `ones: true`, `backdrop` (fill), `window` (long shadow, a 16px ring in the bridge colour, then the clipped era), `blob` (flat shape with long shadow), `hero`, `heroColor`, `heroPts`, `post` (none).

## Do / don't

- **Do** stagger entrances and let them overshoot.
- **Do** keep one colour per idea and the hero's colour for the hero.
- **Do** keep shapes simple: circles, pills, rounded squares, a rounded triangle.
- **Don't** add outlines, gradients, grain, or `shadowBlur`.
- **Don't** use `wobble` or key anything visible on `B`.
- **Don't** morph between complementary colours (grey midpoint).
- **Don't** redeclare a core or morph name (see `styles/README.md`); kit names start with `fv` or `FV`.

## Not matched (deliberate or open)

- No reference was measured. Palette, radii, shadow length and spring presets are chosen by eye from the brief.
- The long shadow is stepped copies of the outline (3px per step), not an exact swept hull; a very thin shape could show faint steps at close crop.
- Shadows are not cast over other shapes, only onto the ground.
- Icons beyond circle, pill, rounded square and rounded triangle are not in the kit.

## Proven on

`demo/` (8s, 9:16, 120 BPM, 24fps, 192 frames): a coral circle with a light bulb and three satellites (era 1, "Start with an idea") morphs at 4.0s into a lilac card with a growing bar chart and a check badge (era 2, "Ship it as a product"). The hero waves, then jumps. Checked 2026-10-07: `tile.mjs` prints `deterministic: true`. A full export (`export.mjs --workers 2`) exits 0: h264 1080x1920, 24 fps, 192 frames, 8.000 s, plus AAC audio. `review.mjs`: cuts on grid PASS, morph on grid PASS, flat frames none, story arc PASS (2/2), text PASS (0 cut-off or overlap, 0 in the safe zone), dead beats PASS (0 stretches over 3s), loudness -14.7 LUFS, true peak -1.0 dBFS.
