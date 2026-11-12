# ANTUMBRA — direction

**Brand:** Antumbra (fictional). An electric hypercar maker. In an eclipse, the antumbra is the region of shadow where the sun shows only as a ring of light.
**Vehicle:** Antumbra **Totality**, concept, chassis 001 of 099. Unveiling: 21.03.2027.

**Concept:** *A car you first see by the light around it.* The site is an eclipse. The car starts as a black void defined only by its rim of light. As you scroll, the eclipse passes, light floods in, and the car is revealed, then opened, then handed to you.

**Family:** clean and editorial, with one heavy 3D hero (object continuity: the car never leaves; it rotates, re-materialises and comes apart from section to section).
**Feeling after 10 s:** *hushed.* **What people remember afterwards:** "the car that dissolved into its own skeleton" and "I held the button and it launched."

## Concept device: the Seam
One hairline of light in the prominence red. It is the car's full-width light bar, the edge of the dissolve, and the eclipse's diamond-ring flash. It appears in:
1. **Loader:** the Seam draws across the black, then bends into a ring (the corona).
2. **Hero:** the Seam sweeps over the car, lighting it with a rim. It is also the car's light bar.
3. **Skeleton:** the glowing dissolve edge that eats the paint.
4. **Launch:** the speed trace races across the screen while you hold.
5. **Film:** a letterbox hairline and a scrub bar.
6. **Reserve:** the slot counter rule and the CTA underline.
7. **Footer:** it runs under the giant wordmark and follows the cursor.

## Art direction
- **Palette:** Umbra `#07080A` (base), Graphite `#15171B`, Ash `#8B8E94`, Bone `#ECE7DD` (one inverted section).
  - **Rule-breaker:** Prominence `#FF3B2F` (the red of the solar prominences seen during totality). It is used only for the Seam, the CTA and the cursor, on less than 3% of pixels.
- **Type:** **Archivo Variable** carries about 95% of the text: display set expanded (`wdth` 125, `wght` 800) and huge, body at `wdth` 100. The `wdth` axis is animated with scroll velocity, so the type stretches with speed. **Newsreader italic** is the accent voice for a few words per section. There is no mono; numbers use Archivo `tabular-nums`.
  - Scale: 12 / 14 / 16 / 20 / 28 / 44 / 72 / 7vw / 11vw / 27vw (the wordmark).
- **Material:** black lacquer, smoked glass, forged carbon, film grain. Photography is graded cold and neutral, with a red light leak only where the Seam is.
- **Motion personality:** *slow, weighted, inevitable.* Out-quart `cubic-bezier(.165,.84,.44,1)` for reveals (0.9–1.4 s), strong in-out `cubic-bezier(.76,0,.24,1)` for wipes, and linear only for scrubs.
- **Sound:** opt-in. A low electric hum whose pitch follows the launch. WebAudio, so there is nothing to download.

## Three signature moments
1. **Totality (3D + light).** *Trigger:* the loader completes. *Action:* the Seam ring (the corona) shrinks into the car's light bar. The car sits in total darkness, rim-lit only. As you scroll, a light sweeps across the body, the studio "eclipse" passes and the car turns 3/4 towards you, while the 27vw wordmark ANTUMBRA sits **behind** the car (type and subject interlock). *Meaning:* the brand's name is literally a shadow with a ring of light.
2. **Shell to Soul (3D, material).** *Trigger:* a pinned chapter. *Action:* the paint dissolves through a noise field with a glowing Seam edge, leaving a wireframe body. Then the parts separate (canopy up, battery pack down, four motors and wheels out), and hanging captions track each part in 3D. Scrolling back reassembles it. *Meaning:* "nothing hidden": the engineering is the beauty.
3. **Hold to launch (interactive + typographic).** *Trigger:* press and hold the button (or Space). *Action:* the 0→100 counter runs in exactly 1.9 s, the type stretches to `wdth` 125, the Seam speed trace races across the screen, the camera shakes, the hum climbs (if sound is on), and the car's wheels spin. Let go early and it says "Lifted at 63 km/h. Hold your nerve." *Meaning:* the spec is felt, not read.

## Section map
| # | Section | Layout (vocab #) | Motion idea | Asset |
|---|---|---|---|---|
| 0 | Loader | understated corona ring | the Seam draws, bends into a ring, shrinks into the light bar | code |
| 1 | Totality (hero) | full-screen WebGL + 27vw wordmark behind the car (#13 + #1) | rim-light sweep, eclipse passes, car turns | 3D procedural |
| 2 | Manifesto | quote as typographic sculpture (#19) | words light up as the Seam passes (scrubbed) | type |
| 3 | Exterior | single object centre stage, copy orbiting (#9) | pinned 360° turn, 4 stops, captions orbit and leader lines track 3D points | 3D |
| 4 | Interior | top-down plan view, hanging captions (#2) | canopy fades to glass, camera descends into the cabin, material plates slide past | 3D + AI macros |
| 5 | Shell to Soul | pinned stage + scrubbed sequence (#4) | dissolve, then explode, then labels | 3D |
| 6 | Philosophy | inverted Bone, asymmetric editorial, grid that breaks (#16) | a wipe from black to bone (clip inset); photo bleeds across the boundary | AI stills |
| 7 | Performance | full-bleed type poster + launch (#1) | hold to launch | type + 3D |
| 8 | Launch film | full-screen video, minimal overlay (#13) | zoom-through from a small frame to full bleed; PLAY cursor | MP4 rendered from the 3D scene |
| 9 | Gallery | horizontal track by vertical scroll (#5) | velocity skew + inner parallax | AI stills + rendered stills |
| 10 | Reserve | split (configurator + form) (#3 variant) | paint swatches re-materialise the live car; slot counter | 3D |
| 11 | Footer | destination (#20) | giant wordmark with the Seam that follows the cursor | type |

**Banned:** eyebrow, then a centred H2, then three cards; icons in squares; gradient blobs; "revolutionary", "seamless", "unleash".

## Voice (quiet, certain, a little dry)
- "Darkness first. Then everything."
- "Four motors. One opinion."
- "0–100 in 1.9 s. Hold the button. We'll wait."
- "99 cars. No second edition. No exceptions, including us."

## Asset plan
| Asset | Type | Source | Cost |
|---|---|---|---|
| Totality car (body loft, canopy, wheels, light bars, diffuser) | 3D procedural | three.js parametric loft | 0 |
| Skeleton: battery cells, 4 motors, tub, arms | 3D procedural | instanced primitives | 0 |
| Eclipse, salt flat, tunnel, wind tunnel, mountain, atelier | AI still | Pollinations free + process-gen | 0 |
| Leather, carbon, titanium macros | AI still | Pollinations free | 0 |
| Launch film (≈20 s, 1280×544) | rendered video | the site's own 3D scene captured headless, then ffmpeg H.264 + WebM | 0 |
| Hum / launch sound | code | WebAudio oscillators | 0 |
| Fonts | type | @fontsource-variable archivo + newsreader | 0 |

Placeholder content: the brand, vehicle, specs, dates, prices and the reservation endpoint are all fictional, and the form does not submit anywhere.
