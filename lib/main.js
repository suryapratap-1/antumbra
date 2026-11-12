// Antumbra — the experience. One WebGL world behind real HTML; Lenis + GSAP on one ticker;
// a scroll rig that interpolates named shots (camera, car yaw, light, dissolve, explode) between DOM markers.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { Vector3 } from 'three';
import { createWorld } from './world.js';
import { createSound } from './sound.js';

gsap.registerPlugin(ScrollTrigger);
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const damp = (c, t, r, dt) => c + (t - c) * (1 - Math.exp(-r * dt));

const A = .55;                     // camera azimuth; car yaw = A + view angle (0 = right profile, −π/2 = nose, +π/2 = tail)
const TAU = Math.PI * 2;
const D = { az: A, el: .07, dist: 10, tx: 0, ty: .5, tz: 0, fov: 26, yaw: A, env: 1, rim: .6, dissolve: 0, explode: 0, canopy: 0, word: 0, px: 0, py: 0 };
const shot = (v, o = {}) => ({ ...D, yaw: A + v, ...o });
const SHOTS = {
  hero: shot(-.78, { el: .045, dist: 10.6, ty: .52, fov: 24, env: .7, rim: 1, word: 1, py: -.02 }),
  mani: shot(-.3, { el: .02, dist: 13.5, ty: .5, env: .45, rim: .8, py: -.24 }),
  ext1: shot(.02, { el: .06, dist: 10.4, env: 1.9, px: -.07 }),
  ext2: shot(2.25, { el: .16, dist: 8.6, env: 1.9, px: -.12 }),
  ext3: shot(2.8, { el: .03, dist: 3.9, fov: 28, tx: -1.38, ty: .4, tz: -.86, env: 1.9, px: -.14 }),
  ext4: shot(4.12, { el: .08, dist: 8.2, tx: .45, env: 1.9, px: -.12 }),
  int0: shot(5.3, { el: .85, dist: 9.5, env: 1.6, canopy: .5, px: .1 }),
  int1: shot(TAU - .1, { el: 1.18, dist: 12.5, ty: .5, env: 1.6, canopy: 1, px: .04 }),
  int2: shot(TAU + .15, { el: 1.24, dist: 11.2, ty: .5, env: 1.6, canopy: 1, px: .04 }),
  soul0: shot(TAU + .7, { el: .3, dist: 10.5, env: 1.4, rim: 1, py: -.06 }),
  soul1: shot(TAU + 1.05, { el: .32, dist: 10.5, env: 1.1, rim: 1, dissolve: 1, py: -.06 }),
  soul2: shot(TAU + 1.45, { el: .36, dist: 13, ty: 1.05, env: 1, rim: 1, dissolve: 1, explode: 1, py: -.08 }),
  soul3: shot(TAU + 2.0, { el: .24, dist: 12.6, ty: 1.05, env: 1, rim: 1, dissolve: 1, explode: 1, py: -.08 }),
  perf: shot(TAU + 2.25, { el: .02, dist: 8.8, ty: .45, fov: 26, env: 1.1, rim: 1.2, px: .2, py: -.04 }),
  res: shot(2 * TAU - .72, { el: .1, dist: 11.6, env: 1.8, rim: .8, px: -.17, py: .04 }),
};
const KEYS = Object.keys(D);

const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
const COARSE = matchMedia('(pointer: coarse)').matches;
const Q = new URLSearchParams(location.search);
const SHOT = Q.get('shot');
const CLEAN = Q.has('clean');

let world = null, lenis = null, vel = 0, introK = 0;
const fx = { shake: 0, streak: 0, spin: 0, fov: 0, flash: 0 };
const rig = { anchors: [], names: [], p: 0, smooth: 0, target: {} };

/* ================================================================ loader */
const PRE = { target: 0, shown: 0 };
function runCounter() {
  const pct = $('#ld-pct'), line = $('.ld-line'), ring = $('.ld-ring');
  const t0 = performance.now(); let prev = t0, last = -1;
  return new Promise(done => {
    const step = () => {
      const now = performance.now(), dt = clamp((now - prev) / 1000, 0, .05); prev = now;
      const paced = 100 * (1 - (1 - clamp((now - t0) / 2200, 0, 1)) ** 3);
      const real = PRE.target * 100;
      const goal = Math.min(paced, real >= 100 ? 100 : Math.max(real, Math.min(94, PRE.shown + dt * 6)));
      PRE.shown += (goal - PRE.shown) * (1 - Math.exp(-9 * dt));
      if (real >= 100 && paced >= 100 && PRE.shown > 99.6) PRE.shown = 100;
      const v = Math.round(PRE.shown);
      if (v !== last) { pct.textContent = String(v).padStart(3, '0'); last = v; }
      line.style.strokeDashoffset = 1 - clamp(PRE.shown / 35, 0, 1);
      line.style.opacity = 1 - sstep(40, 60, PRE.shown);
      ring.style.strokeDashoffset = 1 - clamp((PRE.shown - 35) / 65, 0, 1);
      PRE.shown >= 100 ? done() : requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}
const frame = () => new Promise(r => requestAnimationFrame(r));

/* ================================================================ rig */
function measure() {
  const marks = $$('[data-shot]');
  const sy = scrollY, H = innerHeight, max = Math.max(1, document.documentElement.scrollHeight - H);
  rig.names = []; rig.anchors = [];
  for (const m of marks) {
    const sec = m.closest('section'), r = sec.getBoundingClientRect();
    const top = r.top + sy, h = sec.offsetHeight, f = +m.dataset.f;
    rig.names.push(m.dataset.shot);
    rig.anchors.push(clamp(top + f * Math.max(0, h - H), 0, max));
  }
  for (let i = 1; i < rig.anchors.length; i++) rig.anchors[i] = Math.max(rig.anchors[i], rig.anchors[i - 1] + 1);
}
function progressFor(y) {
  const a = rig.anchors;
  if (y <= a[0]) return 0;
  for (let i = 0; i < a.length - 1; i++) if (y <= a[i + 1]) return i + (y - a[i]) / (a[i + 1] - a[i]);
  return a.length - 1;
}
function targetAt(p, out) {
  const n = rig.names.length, i = clamp(Math.floor(p), 0, n - 1), j = Math.min(i + 1, n - 1);
  let f = p - i; f = f * f * (3 - 2 * f);
  const a = SHOTS[rig.names[i]], b = SHOTS[rig.names[j]];
  for (const k of KEYS) out[k] = lerp(a[k], b[k], f);
  return out;
}

/* ================================================================ boot */
export async function boot() {
  const html = document.documentElement;
  if (FINE) html.classList.add('has-cursor');
  if (CLEAN) html.classList.add('clean');
  if (Q.has('film')) { const m = await import('./film.js'); return m.film(); }
  setupCountdown();

  const counter = SHOT ? Promise.resolve() : runCounter();
  try {
    await Promise.race([document.fonts.load('800 100px "Archivo Variable"'), new Promise(r => setTimeout(r, 2500))]);
    PRE.target = .2; await frame();
    world = createWorld($('#gl'), { coarse: COARSE });
    PRE.target = .5; await frame();
    world.buildWordmark();
    PRE.target = .65; await frame();
    rig.smooth = 0; measure(); targetAt(0, rig.target); Object.assign(world.st, rig.target);
    world.st.env = .02; world.st.word = 0; world.st.rim = 0;
    await world.compile();
    PRE.target = 1;
  } catch (e) {
    console.warn('[antumbra] WebGL unavailable, static fallback:', e);
    html.classList.add('no-webgl'); world = null; PRE.target = 1;
  }
  await counter;
  if (world) world.warm();
  window.__world = world;
  window.__jump = s => jumpTo(s);
  window.__scroll = y => { lenis ? lenis.scrollTo(y, { immediate: true, force: true }) : scrollTo(0, y); ScrollTrigger.update(); };

  setupScroll();
  setupCursor(); setupNav(); setupManifesto(); setupExterior(); setupInterior(); setupSoul(); setupPhilo();
  setupPerf(); setupFilm(); setupGallery(); setupReserve(); setupFooter(); setupSound();
  ScrollTrigger.refresh(); measure();

  const loader = $('.loader');
  if (SHOT) {
    loader.classList.add('done'); html.classList.remove('is-loading'); html.classList.add('intro-done');
    introK = 1; jumpTo(SHOT);
  } else {
    loader.classList.add('done');
    setTimeout(() => { html.classList.remove('is-loading'); html.classList.add('intro-done'); lenis?.start(); }, 700);
    if (REDUCE) introK = 1; else gsap.to({ k: 0 }, { k: 1, duration: 3.6, ease: 'power2.inOut', delay: .35, onUpdate() { introK = this.targets()[0].k; } });
  }
  gsap.ticker.add(tick);
  setTimeout(() => { window.__ready = true; }, SHOT ? 900 : 0);
}

function jumpTo(s) {
  const i = isNaN(+s) ? rig.names.indexOf(s) : +s;
  if (i < 0) return;
  const y = rig.anchors[i];
  lenis ? lenis.scrollTo(y, { immediate: true, force: true }) : scrollTo(0, y);
  ScrollTrigger.update();
  rig.p = rig.smooth = i; targetAt(i, rig.target); if (world) Object.assign(world.st, rig.target);
  $$('.ext-item, .mw').forEach(el => el.classList.add('seen'));
}

function setupScroll() {
  if (!REDUCE) {
    lenis = new Lenis({ lerp: .1, smoothWheel: true });
    if (!SHOT) lenis.stop();
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
  }
  gsap.ticker.lagSmoothing(0);
  ScrollTrigger.addEventListener('refresh', () => { lenis?.resize(); measure(); });
  addEventListener('resize', () => { world?.resize(); ScrollTrigger.refresh(); });
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href'); const el = id === '#top' ? document.body : $(id); if (!el) return;
    e.preventDefault();
    lenis ? lenis.scrollTo(el, { duration: 2.2, easing: t => 1 - Math.pow(1 - t, 4) }) : el.scrollIntoView();
  }));
}

/* ================================================================ frame loop */
let last = performance.now(), ft = [], govFrames = 0;
const covers = [];
function tick() {
  const now = performance.now(), real = (now - last) / 1000; last = now;
  const dt = clamp(real, 0, .05);
  const v = lenis ? lenis.velocity : 0;
  vel = damp(vel, v, 6, dt);
  rig.p = progressFor(scrollY);
  rig.smooth = REDUCE || SHOT && rig.p === Math.round(rig.p) && Math.abs(rig.smooth - rig.p) < 1e-3 ? rig.p : damp(rig.smooth, rig.p, 3.2, dt);
  for (const f of sectionTicks) f(dt);
  if (!world) return;
  targetAt(rig.smooth, rig.target);
  const st = world.st, T = rig.target;
  for (const k of KEYS) st[k] = REDUCE ? T[k] : damp(st[k], T[k], 5, dt);
  // intro: the eclipse passes
  const heroW = 1 - clamp(rig.smooth, 0, 1);
  st.env = lerp(st.env, Math.max(.015, T.env * introK), heroW);
  st.rim = lerp(st.rim, T.rim * sstep(0, .5, introK), heroW);
  st.word = T.word * sstep(.25, .9, introK);
  st.sweep = lerp(4, -3.6, introK) + rig.smooth * 0;
  st.envRot = (1 - introK) * -1.6 + rig.smooth * .35;
  st.shake = REDUCE ? 0 : fx.shake; st.streak = fx.streak; st.spin = fx.spin; st.flash = fx.flash;
  st.fov += fx.fov;
  // covered by an opaque section?
  let cov = false; for (const c of covers) { const r = c.getBoundingClientRect(); if (r.top <= 0 && r.bottom >= innerHeight) { cov = true; break; } }
  world.setCovered(cov);
  world.tick(dt);
  st.fov -= fx.fov;
  world.car.group.updateMatrixWorld();
  for (const f of projTicks) f();
  // governor
  if (!cov) { ft.push(real * 1000); govFrames++; }
  if (ft.length >= 40) {
    const avg = ft.reduce((a, b) => a + b, 0) / ft.length; ft = [];
    const s = world.getScale();
    if (govFrames > 90 && avg > 18.5 && s > .55) world.setScale(s * (avg > 40 ? .7 : .88));
    else if (avg < 13 && s < 1) world.setScale(Math.min(1, s + .05));
  }
}
const sectionTicks = [], projTicks = [];
const secProg = el => { const r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); };

/* ================================================================ sections */
function setupCountdown() {
  const el = $('#countdown'); const d = Math.ceil((new Date('2027-03-21T00:00:00Z') - Date.now()) / 864e5);
  el.textContent = d > 0 ? `${d} days` : 'Unveiled';
}

function setupManifesto() {
  const sec = $('.manifesto'), words = $$('.mw'), seam = $('.mani-seam');
  sectionTicks.push(() => {
    const r = sec.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
    const p = secProg(sec);
    words.forEach((w, i) => w.classList.toggle('lit', REDUCE || p > .08 + i * .16 || w.classList.contains('seen')));
    seam.style.setProperty('--p', sstep(.05, .75, p).toFixed(3));
  });
}

function setupExterior() {
  const sec = $('.exterior'), items = $$('.ext-item'), line = $('.leader line'), dot = $('.leader circle'), deg = $('#ext-deg'), dial = $('.ext-dial i');
  const fs = $$('[data-shot^="ext"]').map(m => +m.dataset.f);
  const anchors = items.map(it => new Vector3(...it.dataset.anchor.split(',').map(Number)));
  let cur = -1, pt = { x: 0, y: 0, v: true };
  sectionTicks.push(() => {
    const p = secProg(sec); let best = 0;
    fs.forEach((f, i) => { if (Math.abs(p - f) < Math.abs(p - fs[best])) best = i; });
    if (best !== cur) { cur = best; items.forEach((it, i) => it.classList.toggle('on', i === best)); }
  });
  projTicks.push(() => {
    const r = sec.getBoundingClientRect(); const vis = r.top < innerHeight && r.bottom > 0;
    if (!vis) { line.parentNode.style.opacity = 0; return; }
    const p = secProg(sec), near = 1 - sstep(.05, .12, Math.abs(p - fs[cur]));
    world.project(anchors[cur], pt);
    const it = items[cur].getBoundingClientRect();
    const x0 = it.left - 18, y0 = it.top + 7;
    line.setAttribute('x1', x0); line.setAttribute('y1', y0); line.setAttribute('x2', pt.x); line.setAttribute('y2', pt.y);
    dot.setAttribute('cx', pt.x); dot.setAttribute('cy', pt.y);
    line.parentNode.style.opacity = (near * (innerWidth > 760 ? 1 : 0)).toFixed(3);
    const d = (((world.st.yaw - A) * 180 / Math.PI) % 360 + 360) % 360;
    deg.textContent = String(Math.round(d)).padStart(3, '0') + '°'; dial.style.setProperty('--deg', d.toFixed(1) + 'deg');
  });
}

function projectTags(sec, list, gate) {
  const tags = $$('li', list).map(li => ({ li, a: new Vector3(...li.dataset.anchor.split(',').map(Number)), pt: { x: 0, y: 0 } }));
  projTicks.push(() => {
    const r = sec.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
    const on = gate(secProg(sec));
    list.classList.toggle('on', on);
    if (!on) return;
    for (const t of tags) {
      // car-local anchor follows the exploded parts
      const a = t.a.clone(); const e = world.st.explode; const ee = e * e * (3 - 2 * e);
      const id = t.li.dataset.part;
      if (id === 'canopy') a.y += ee * 1.9; else if (id === 'shell') a.y += ee * 1.15; else if (id === 'battery') a.y -= ee * .55;
      else if (id === 'motor') a.z += Math.sign(a.z) * ee * .35; else if (id === 'wheel') a.z += Math.sign(a.z) * ee * .75; else if (id === 'tub') a.y -= ee * .1;
      world.project(a, t.pt);
      t.li.style.transform = `translate3d(${t.pt.x.toFixed(1)}px,${(t.pt.y - 9).toFixed(1)}px,0)`;
    }
  });
}

function setupInterior() {
  const sec = $('.interior'), plates = $('.plates');
  projectTags(sec, $('.int-tags'), p => p > .3);
  sectionTicks.push(() => {
    const r = sec.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
    const p = secProg(sec);
    if (!REDUCE) plates.style.transform = `translate3d(0,${(-p * (plates.scrollHeight - innerHeight * .2)).toFixed(1)}px,0)`;
  });
}

function setupSoul() {
  const sec = $('.soul'), h = $('.soul-h'), pct = $('#soul-pct'), list = $('.soul-tags');
  $$('li', list).forEach((li, i) => { li.dataset.part = ['canopy', 'shell', 'tub', 'battery', 'motor', 'wheel'][i]; });
  projectTags(sec, list, p => p > .5);
  let lastV = -1;
  sectionTicks.push(() => {
    const r = sec.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
    const d = world ? world.st.dissolve : secProg(sec);
    h.style.setProperty('--sp', d.toFixed(3));
    const v = Math.round(d * 100); if (v !== lastV) { pct.textContent = String(v).padStart(3, '0'); lastV = v; }
  });
}

function setupPhilo() {
  const sec = $('.philo');
  covers.push(sec, $('.film'), $('.gallery'), $('.foot'));
  if (REDUCE) return;
  sectionTicks.push(() => {
    const r = sec.getBoundingClientRect();
    if (r.top > innerHeight || r.bottom < 0) return;
    const p = clamp(1 - r.top / innerHeight, 0, 1);              // wipe up from the bottom as it enters
    sec.style.setProperty('--ci', (100 * (1 - sstep(0, 1, p)) * 0).toFixed(2) + '%');
    sec.style.clipPath = `inset(${(100 - 100 * sstep(.0, .85, p)) * .0}% 0 0 0 round ${(1 - sstep(.3, .9, p)) * 40}vw ${(1 - sstep(.3, .9, p)) * 40}vw 0 0)`;
  });
}

function setupPerf() {
  const btn = $('#launch'), big = $('#perf-n'), kmh = $('#launch-kmh'), tt = $('#launch-t'), hint = $('#launch-hint'), seam = $('.speed-seam'), sec = $('.perf');
  const idleHint = hint.innerHTML;
  const L = { holding: false, t: 0, done: false, x: 0 };
  const start = e => { if (e) e.preventDefault(); if (L.holding) return; L.holding = true; L.t = 0; L.done = false; btn.classList.add('held'); sound?.launch(true); hint.textContent = 'Hold…'; };
  const stop = () => {
    if (!L.holding) return; L.holding = false; btn.classList.remove('held'); sound?.launch(false);
    if (!L.done) hint.innerHTML = `Lifted at ${Math.round(speed(L.t))} km/h. <em class="serif">Hold your nerve.</em>`;
  };
  const speed = t => 100 * (1 - Math.pow(1 - clamp(t / 1.9, 0, 1), 1.55));
  btn.addEventListener('pointerdown', start); addEventListener('pointerup', stop); btn.addEventListener('pointerleave', stop); addEventListener('blur', stop);
  btn.addEventListener('keydown', e => { if (e.key === 'Enter') start(e); });
  btn.addEventListener('keyup', e => { if (e.key === 'Enter') stop(); });
  btn.addEventListener('contextmenu', e => e.preventDefault());
  addEventListener('keydown', e => {
    if (e.code !== 'Space' || e.repeat) return;
    const r = sec.getBoundingClientRect(); if (r.top > innerHeight * .6 || r.bottom < innerHeight * .4) return;
    start(e);
  });
  addEventListener('keyup', e => { if (e.code === 'Space') stop(); });
  sectionTicks.push(dt => {
    if (L.holding && !L.done) {
      L.t += dt;
      if (L.t >= 1.9) {
        L.t = 1.9; L.done = true; fx.flash = .35;
        hint.innerHTML = `100 km/h in 1.90 s. <em class="serif">Your neck noticed.</em>`;
      }
    }
    const goal = L.holding && !L.done ? 1 : 0;
    L.x = damp(L.x, goal, L.holding ? 4 : 2.2, dt);
    const s = L.holding || L.done ? speed(L.t) : 0;
    btn.style.setProperty('--lp', (L.holding || L.done ? L.t / 1.9 : 0).toFixed(3));
    if (L.holding || L.x > .01) {
      big.textContent = L.t.toFixed(2); kmh.textContent = String(Math.round(s)).padStart(3, '0'); tt.textContent = L.t.toFixed(2);
    } else if (big.textContent !== '1.9' && !L.done) big.textContent = '1.9';
    fx.shake = L.x; fx.streak = L.x; fx.spin = L.x * 60 + (L.done ? 0 : 0); fx.fov = L.x * 7;
    fx.flash = damp(fx.flash, 0, 4, dt);
    seam.style.opacity = L.x.toFixed(3); seam.style.transform = `scaleX(${clamp(L.t / 1.9, 0, 1).toFixed(3)})`;
    if (!L.holding && L.done && L.x < .02) { L.done = false; setTimeout(() => { if (!L.holding) { hint.innerHTML = idleHint; big.textContent = '1.9'; } }, 2400); }
    const w = 125 - Math.min(45, Math.abs(vel) * 1.6) - L.x * 50;
    sec.style.setProperty('--wdth', w.toFixed(1));
    sound?.speed(s / 100);
  });
}

function setupFilm() {
  const sec = $('.film'), frame = $('.film-frame'), vid = $('.film-v'), dlg = $('#player'), pv = $('#player video');
  let playing = false;
  sectionTicks.push(() => {
    const r = sec.getBoundingClientRect(); const vis = r.top < innerHeight && r.bottom > 0;
    if (!vis) { if (playing) { vid.pause(); playing = false; } return; }
    const p = secProg(sec);
    const s = REDUCE ? 1 : lerp(.38, 1, sstep(0, .55, p));
    frame.style.setProperty('--fs', s.toFixed(4)); frame.style.setProperty('--fo', sstep(.45, .62, p).toFixed(3));
    if (!playing && p > .05) { vid.preload = 'auto'; vid.play().catch(() => {}); playing = true; }
  });
  const open = () => { dlg.showModal(); pv.currentTime = 0; pv.muted = false; pv.play().catch(() => {}); lenis?.stop(); };
  frame.addEventListener('click', open);
  $('.player-x').addEventListener('click', () => dlg.close());
  dlg.addEventListener('close', () => { pv.pause(); lenis?.start(); });
}

function setupGallery() {
  const sec = $('.gallery'), track = $('.gal-track'), cards = $$('.gal-card'), idx = $('#gal-i'), figs = cards.map(c => $('figure', c)), imgs = cards.map(c => $('img', c));
  const size = () => { if (REDUCE) { sec.style.height = 'auto'; return; } sec.style.height = (track.scrollWidth - innerWidth + innerHeight * 1.3) + 'px'; };
  size(); addEventListener('resize', size);
  if (REDUCE) { track.style.flexWrap = 'wrap'; return; }
  let lastI = -1;
  sectionTicks.push(() => {
    const r = sec.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
    const p = secProg(sec), dist = track.scrollWidth - innerWidth;
    track.style.transform = `translate3d(${(-p * dist).toFixed(1)}px,0,0)`;
    const sk = clamp(vel * -.12, -6, 6);
    let bi = 0, bd = 1e9;
    figs.forEach((f, i) => {
      f.style.setProperty('--sk', sk.toFixed(2) + 'deg');
      const cr = cards[i].getBoundingClientRect(), c = (cr.left + cr.width / 2 - innerWidth / 2) / innerWidth;
      imgs[i].style.setProperty('--px', (-8 + c * -8).toFixed(2) + '%');
      if (Math.abs(c) < bd) { bd = Math.abs(c); bi = i; }
    });
    if (bi !== lastI) { lastI = bi; idx.textContent = String(bi + 1).padStart(2, '0'); }
  });
}

function setupReserve() {
  const name = $('#paint-name');
  $$('.paints input').forEach(inp => inp.addEventListener('change', () => {
    world?.car.setPaint(inp.value); name.textContent = inp.value[0].toUpperCase() + inp.value.slice(1);
    fx.flash = .08;
  }));
  const form = $('#res-form'), msg = $('.res-msg');
  form.addEventListener('submit', e => {
    e.preventDefault();
    let ok = true;
    $$('.f', form).forEach(f => {
      const i = $('input', f); f.removeAttribute('data-err');
      if (i.required && !i.value.trim()) { f.dataset.err = 'Required'; ok = false; }
      else if (i.type === 'email' && i.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(i.value)) { f.dataset.err = 'Check the address'; ok = false; }
    });
    if (!ok) { msg.textContent = ''; return; }
    const slot = 63 - Math.floor(Math.random() * 3);
    msg.innerHTML = `Allocation request held for chassis <b>0${slot}</b>. We&rsquo;ll write within 48 hours. (Demo: nothing was sent.)`;
    $('#slots').textContent = '36'; $('.res-seam b').style.transform = 'scaleX(.364)';
  });
}

function setupFooter() {
  const f = $('.foot'), seam = $('.foot-seam'), word = $('.foot-word');
  const fit = () => { word.style.fontSize = '100px'; word.style.setProperty('--wdth', 125); const w = word.scrollWidth; word.style.fontSize = (100 * innerWidth * .97 / w).toFixed(2) + 'px'; word.style.removeProperty('--wdth'); };
  fit(); addEventListener('resize', fit); document.fonts.ready.then(fit); let sx = .5, tx = .5, w = .2, tw = .2;
  f.addEventListener('pointermove', e => { tx = e.clientX / innerWidth; tw = .35; });
  f.addEventListener('pointerleave', () => { tw = .2; });
  sectionTicks.push(dt => {
    const r = f.getBoundingClientRect(); if (r.top > innerHeight) return;
    sx = damp(sx, tx, 4, dt); w = damp(w, tw + Math.min(.6, Math.abs(vel) * .02), 3, dt);
    seam.style.setProperty('--sx', (sx * 100).toFixed(2) + '%'); seam.style.setProperty('--sw', w.toFixed(3));
    seam.style.left = '0';
    f.style.setProperty('--wdth', (125 - Math.min(40, Math.abs(vel) * 1.4)).toFixed(1));
  });
}

function setupNav() {
  const links = $$('.nav-links a'), bar = $('.nav-progress i');
  const map = links.map(a => [a, $(a.getAttribute('href'))]);
  sectionTicks.push(() => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${(scrollY / Math.max(1, max)).toFixed(4)})`;
    let on = null;
    for (const [a, s] of map) { const r = s.getBoundingClientRect(); if (r.top < innerHeight * .5 && r.bottom > innerHeight * .5) on = a; }
    links.forEach(a => a.classList.toggle('on', a === on));
  });
}

function setupCursor() {
  if (!FINE) return;
  const c = $('.cursor'), label = $('.cursor-label');
  const xTo = gsap.quickTo(c, 'x', { duration: .45, ease: 'power3' }), yTo = gsap.quickTo(c, 'y', { duration: .45, ease: 'power3' });
  addEventListener('pointermove', e => { xTo(e.clientX); yTo(e.clientY); }, { passive: true });
  document.addEventListener('pointerover', e => {
    const t = e.target.closest('[data-cursor], #launch, a, button, label, input');
    c.classList.remove('is-link', 'is-label');
    if (!t) return;
    const l = t.dataset?.cursor || null;
    if (l) { label.textContent = l; c.classList.add('is-label'); } else c.classList.add('is-link');
  });
}

let sound = null;
function setupSound() {
  const btn = $('#sound'), t = $('.sound-t');
  btn.addEventListener('click', () => {
    const on = btn.getAttribute('aria-pressed') !== 'true';
    if (!sound) sound = createSound();
    sound.enable(on); btn.setAttribute('aria-pressed', on); t.textContent = on ? 'Sound on' : 'Sound off';
    try { localStorage.setItem('antumbra-sound', on ? '1' : '0'); } catch (e) { /* storage blocked */ }
  });
}
