# Antumbra — critique log

## Pass 1 — 2026-11-13 (1440×900 + 390×844, SwiftShader screenshots)
| Section | Concept | Comp | Type | Motion | Craft | Memo | Notes / move |
|---|---|---|---|---|---|---|---|
| Loader | 8 | 8 | 7 | 8 | 8 | 7 | Seam draws, bends into the corona ring, shrinks into the light bar |
| Totality (hero) | 9 | 8 | 9 | 8 | 6 | 8 | bloom haze and specular blobs on the body → environment rebuilt from long strips, directional lights removed |
| Manifesto | 8 | 8 | 9 | 8 | 8 | 7 | words light up as the Seam draws under them |
| Exterior | 8 | 7 | 8 | 9 | 7 | 8 | profile was cropped by the offset; tyres poked through the fenders → widened fenders, arches decoupled from the upper surface |
| Interior | 7 | 6 | 8 | 8 | 6 | 7 | lumpy top-down body, car under the plates, tag clutter on mobile → camera to a 3/4 overhead, pulled back, mobile tags trimmed |
| Shell to soul | 9 | 8 | 9 | 9 | 7 | 9 | glowing white tub → matte; canopy re-drawn as a CAD wireframe |
| Philosophy (bone) | 8 | 8 | 9 | 7 | 7 | 7 | the wind-tunnel still contained a stock car → regenerated with no vehicle |
| Performance | 9 | 8 | 9 | 9 | 7 | 9 | readout dropped to 0.00 after a full launch; the HOLD cursor badge hid the label → fixed |
| Film | 8 | 8 | 8 | 8 | 8 | 8 | zoom-through from a framed window to full bleed; the film is rendered from the site's own scene |
| Gallery | 7 | 8 | 7 | 8 | 8 | 7 | live renders interleaved with location stills; velocity skew |
| Reserve | 8 | 7 | 8 | 7 | 8 | 8 | the car slid under the form → camera offset increased |
| Footer | 8 | 7 | 8 | 8 | 6 | 8 | wordmark overflowed ("ANTUMBR") → JS fit to the viewport width |
Signature moments: Totality 8 · Shell to soul 9 · Hold to launch 9
Taste audit: distinctSizes 15 ❌ (everything else on target).

## Pass 2 — 2026-11-13
| Section | Concept | Comp | Type | Motion | Craft | Memo |
|---|---|---|---|---|---|---|
| Loader | 8 | 8 | 8 | 9 | 8 | 8 |
| Totality | 9 | 9 | 9 | 9 | 8 | 9 |
| Manifesto | 8 | 8 | 9 | 8 | 8 | 8 |
| Exterior | 9 | 8 | 8 | 9 | 8 | 8 |
| Interior | 8 | 8 | 8 | 8 | 8 | 8 |
| Shell to soul | 9 | 9 | 9 | 9 | 8 | 9 |
| Philosophy | 8 | 8 | 9 | 8 | 8 | 8 |
| Performance | 9 | 8 | 9 | 9 | 8 | 9 |
| Film | 8 | 8 | 8 | 8 | 8 | 8 |
| Gallery | 8 | 8 | 8 | 8 | 8 | 8 |
| Reserve | 8 | 8 | 8 | 8 | 8 | 8 |
| Footer | 8 | 8 | 9 | 8 | 8 | 8 |
Signature moments: Totality 9 · Shell to soul 9 · Hold to launch 9
Taste audit: off-target none (Archivo 96 %, mono 0 %, 10 sizes, tracking −0.014em, body lh 1.35, measure 40ch, UI 0.53 s, scroll t90 439 ms).
Real-GPU FPS (Intel UHD 620): pass 1 52.9 avg / p95 33.3 ms → bloom at 1/3 res + earlier governor → **58.5 avg / p95 16.8 ms, PASS**.

Calibration: device = the Seam (loader, light bars, dissolve edge, manifesto rule, speed trace, film letterbox, slot meter, footer) · 27vw moment = 1.9 s numerals · real imagery = 9 AI stills + 4 renders + film · type/subject interlock = wordmark behind the car in the hero · footer = fitted wordmark with a cursor-following Seam.

Known limits: the car is procedural (it reads as a concept, not a production model); AI stills come from the free Pollinations model, whose commercial terms are unverified.
