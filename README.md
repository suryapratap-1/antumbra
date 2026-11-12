# Antumbra Totality

A launch website for **Antumbra Totality**, a fictional electric hypercar.
In an eclipse, the *antumbra* is the shadow where the sun shows only as a ring of light. The site works the same way: you first see the car by the light around it. Then the eclipse passes, and the car is revealed, opened up and offered for reservation.

> Antumbra is a fictional brand. All specifications, prices, dates and allocation numbers are concept placeholders, and the reservation form does not send data anywhere.

![Next.js](https://img.shields.io/badge/Next.js-16-black) ![three.js](https://img.shields.io/badge/three.js-0.170-black) ![GSAP](https://img.shields.io/badge/GSAP-3-black) ![Lenis](https://img.shields.io/badge/Lenis-smooth%20scroll-black)

## Highlights

- **Procedural 3D hypercar.** The car is built entirely in code from a parametric loft of superellipse sections, with fenders, wheel arches, a canopy, forged wheels, red brake calipers, and light bars front and rear. It uses no external models.
- **One continuous scroll film.** A single WebGL scene sits behind real HTML. Scrolling moves between named "shots" that set the camera, the car's rotation, lighting, dissolve and explode.
- **The Seam.** One hairline of red light recurs throughout. It is the loader, the car's light bars, the dissolve edge, the speed trace, the film letterbox and the footer line.
- **Three signature moments:**
  1. **Totality.** The loader ring shrinks into the car's light bar. The car is rim-lit in darkness, with the wordmark set *behind* it.
  2. **Shell to soul.** The paint burns away along a glowing edge into a CAD wireframe. Then the battery, motors, tub and wheels separate, with labels that track each part.
  3. **Hold to launch.** Press and hold to run 0–100 km/h in exactly 1.9 s. The camera shakes, speed streaks appear, the wheels spin and the type stretches. There is an optional WebAudio hum.
- **Launch film rendered from the site itself.** The 24 s film is captured frame by frame from the live scene, then encoded with ffmpeg.
- **Craft details:** a custom cursor with states, text-roll navigation, a velocity-reactive variable font (Archivo `wdth`), a horizontal gallery with velocity skew, a paint configurator that recolours the live car, and a footer wordmark fitted to the viewport.

## Sections

| # | Section | What happens |
|---|---|---|
| 1 | Totality (hero) | Eclipse intro; the car turns in front of the wordmark |
| 2 | Manifesto | Words light up as the Seam draws beneath them |
| 3 | Exterior | Pinned 360° turn with four stops; leader lines track points on the car |
| 4 | Interior | The canopy clears and the camera looks into the cabin; material plates |
| 5 | Shell to soul | Dissolve to wireframe, then an exploded engineering view |
| 6 | Philosophy | Inverted bone section, three design rules |
| 7 | Performance | Hold to launch plus the spec sheet |
| 8 | Launch film | Zoom-through from a small frame to full bleed; player dialog |
| 9 | Gallery | Horizontal track driven by vertical scroll |
| 10 | Reserve | Paint swatches recolour the car; allocation form |
| 11 | Footer | Fitted wordmark with a cursor-following Seam |

## Tech stack

- **Next.js 16** (App Router, static export) and **React 19**
- **three.js** for the renderer, the procedural car, a strip-light PMREM environment, and post-processing (bloom plus a custom grain, vignette and chromatic-aberration grade pass)
- **GSAP** and **ScrollTrigger**, with **Lenis** smooth scroll on one shared ticker
- **Archivo Variable** (`wdth` and `wght` axes) and **Newsreader** italic via Fontsource

The page markup is server-rendered by Next.js, so it stays real, accessible and indexable. A small client component then boots the imperative WebGL and scroll layer.

## Getting started

Requires Node.js 20 or newer.

```bash
npm install
npm run dev        # http://localhost:3210
```

### Production build

```bash
npm run build      # static export → ./out
npm start          # serves ./out on http://localhost:3211
```

`out/` is a plain static site and can be deployed to Vercel, Netlify, Cloudflare Pages or any static host. When hosting under a sub-path (for example GitHub Pages at `/antumbra/`), set `basePath` in `next.config.mjs` and prefix the `/img` and `/film` asset paths to match.

## Review and debug URLs

| Query | Effect |
|---|---|
| `?shot=hero` | Skip the intro and jump to a shot: `hero`, `mani`, `ext1`–`ext4`, `int0`–`int2`, `soul0`–`soul3`, `perf`, `res` |
| `?clean` | Hide all HTML so only the 3D render shows |
| `?film` | Film-render mode: `window.__film(t)` poses a frame at time `t`, and `window.__pose('r-low')` renders gallery stills |

`window.__jump(name)` and `window.__scroll(y)` are exposed for scripted screenshots.

## Project structure

```
app/
  layout.tsx        metadata, fonts, base colours
  page.tsx          all section markup (server-rendered)
  globals.css       design tokens, type scale, layouts, responsive and reduced-motion rules
components/
  Boot.tsx          client entry that loads lib/main.js once
lib/
  car.js            procedural hypercar, materials, dissolve shader, exploded-view rig
  world.js          renderer, environment, floor, wordmark, post-processing, camera
  main.js           loader, scroll rig and shots, section behaviour, cursor, governor
  film.js           deterministic launch-film and still renderer
  sound.js          opt-in WebAudio hum
public/
  img/              AI photographs and 3D renders used on the page
  film/             totality.mp4, teaser.mp4, poster.jpg
assets-src/         image generation and processing scripts
DIRECTION.md        concept, art direction, signature moments, section map
CRITIQUE.md         scored critique passes, taste audit, performance results
```

## Performance and accessibility

- One WebGL context and one render loop. Rendering is skipped while an opaque section covers the canvas.
- An adaptive resolution governor, DPR capped at 2 (1.5 on touch devices), and bloom computed at reduced resolution.
- Measured on an integrated Intel UHD 620: **58.5 fps average, p95 frame time 16.8 ms** across a full scroll.
- Video is lazy-loaded (`preload="none"`), and images below the fold use `loading="lazy"`.
- `prefers-reduced-motion`: native scroll, no camera damping or shake, all content revealed.
- No WebGL: static photographic fallback with all content intact.
- Semantic landmarks, a visible focus style, keyboard-operable launch (Space or Enter), and labelled form fields with inline validation.

## Credits and licences

- Atmosphere and material photographs were generated with the free [Pollinations](https://pollinations.ai) image model. Their commercial-use terms are unverified, so replace them before any commercial use.
- The car, the gallery renders and the launch film are generated from this project's own code.
- Fonts: Archivo and Newsreader (SIL Open Font License) via Fontsource.
