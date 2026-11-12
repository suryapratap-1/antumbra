// "Totality" — the launch film, rendered deterministically from the live scene (?film).
// window.__film(t) poses the world for time t (seconds) and renders one frame; window.__pose(name) renders gallery stills.
import { createWorld } from './world.js';

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = t => t * t * (3 - 2 * t);
const A = .55, TAU = Math.PI * 2;
const BASE = { az: A, el: .05, dist: 9, tx: 0, ty: .5, tz: 0, fov: 26, yaw: A, env: 1.4, rim: 1, dissolve: 0, explode: 0, canopy: 0, word: 0, px: 0, py: 0, sweep: 9, envRot: 0, spin: 0, shake: 0, streak: 0, flash: 0, fade: 0 };

// each shot: [start, end, (k 0..1, t) => partial state]
const SHOTS = [
  [0, 4.2, k => ({ yaw: A - Math.PI / 2 + .25, el: .015, dist: lerp(6.2, 5.2, k), ty: .42, fov: 30, env: lerp(.0, .5, ease(clamp((k - .35) / .65, 0, 1))), envRot: lerp(-2, -1, k), sweep: lerp(3, -1, k) })],
  [4.2, 8.6, k => ({ yaw: A, el: .03, dist: 7.2, tx: lerp(1.6, -1.4, ease(k)), fov: 30, env: 1.6, envRot: lerp(-1.4, 1.6, k) })],
  [8.6, 12, k => ({ yaw: A + 2.8, el: .02, dist: 2.9, tx: -1.38, ty: .38, tz: -.86, fov: 32, env: 1.5, spin: 34, streak: .8, envRot: k * 2, shake: .15 })],
  [12, 16, k => ({ yaw: A + 2.1, el: .03, dist: lerp(7.5, 6.4, k), ty: .45, fov: 30, env: 1.1, streak: 1, spin: 40, shake: .35, envRot: k * 6 })],
  [16, 19.6, k => ({ yaw: A + TAU - .1 + k * .6, el: 1.42, dist: 9.5, fov: 28, env: 1.2, dissolve: ease(clamp(Math.sin(k * Math.PI) * 1.6, 0, 1)), envRot: k })],
  [19.6, 24, k => ({ yaw: A - .78, el: .045, dist: lerp(11.5, 10.4, k), ty: .52, fov: 24, env: lerp(.3, .8, k), word: ease(clamp((k - .15) / .5, 0, 1)), envRot: lerp(-1.2, -.2, k), sweep: lerp(4, -3.6, k) })],
];
export const FILM_LEN = 24;

function poseAt(t) {
  const st = { ...BASE };
  for (const [a, b, f] of SHOTS) {
    if (t >= a && t < b) {
      const k = (t - a) / (b - a);
      Object.assign(st, f(k, t));
      const dip = Math.min(t - a, b - t);                       // dip to black at every cut
      st.fade = a === 0 ? 1 - clamp(t / 1.2, 0, 1) * 1 : 1 - clamp(dip / .35, 0, 1);
      if (b === FILM_LEN) st.fade = Math.max(st.fade * (t - a < 1 ? 1 : 0), clamp((t - 23) / 1, 0, 1));
      break;
    }
  }
  return st;
}

const STILLS = {
  'r-low': { yaw: A - .55, el: .0, dist: 6.6, ty: .45, fov: 30, env: 1.7, envRot: .3 },
  'r-top': { yaw: A + TAU - .02, el: 1.47, dist: 10.5, fov: 26, env: 1.6, envRot: .8 },
  'r-rear': { yaw: A + Math.PI / 2 + .12, el: .07, dist: 7.6, ty: .5, fov: 26, env: 1.2, envRot: -.6 },
  'r-wheel': { yaw: A + .15, el: .03, dist: 2.6, tx: 1.52, ty: .38, tz: .86, fov: 32, env: 1.8, envRot: 1.2 },
};

export async function film() {
  const html = document.documentElement;
  html.classList.add('film-mode'); html.classList.remove('is-loading');
  document.querySelector('.loader')?.remove();
  await document.fonts.load('800 100px "Archivo Variable"');
  const world = createWorld(document.querySelector('#gl'), {});
  world.buildWordmark();
  await world.compile();
  const title = document.createElement('div'); title.className = 'film-title';
  title.innerHTML = '<p class="ft-a">Antumbra</p><p class="ft-b">Totality</p><p class="ft-c">21.03.2027</p>';
  document.body.appendChild(title);
  const render = (st, dt = 1 / 30) => { Object.assign(world.st, st); world.tick(dt); };
  window.__film = t => {
    const st = poseAt(t); render(st);
    title.style.opacity = t > 20.8 ? clamp((t - 20.8) / .8, 0, 1) * (1 - clamp((t - 23) / .8, 0, 1)) : 0;
    title.style.setProperty('--ty', ((1 - clamp((t - 20.8) / 1.6, 0, 1)) * 12).toFixed(1) + 'px');
  };
  window.__pose = name => { for (let i = 0; i < 3; i++) render({ ...BASE, ...STILLS[name] }); title.style.opacity = 0; };
  window.__film(0);
  window.__ready = true;
}
