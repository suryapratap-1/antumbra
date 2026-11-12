// One WebGL world behind the page: the car on a black studio floor, a strip-light environment that
// sweeps across the paint, the wordmark set *behind* the car, bloom + grade. Driven by a state object
// that the scroll rig interpolates between named shots.
import {
  WebGLRenderer, Scene, PerspectiveCamera, Color, Vector3, Mesh, MeshBasicMaterial, MeshStandardMaterial, PlaneGeometry,
  BoxGeometry, PMREMGenerator, ACESFilmicToneMapping, SRGBColorSpace, CanvasTexture, DirectionalLight, Group, InstancedMesh,
  Object3D, AdditiveBlending, Vector2, HalfFloatType, Euler, HemisphereLight
} from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { createCar } from './car.js';

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const damp = (c, t, r, dt) => c + (t - c) * (1 - Math.exp(-r * dt));
export const BG = '#07080a';
export const SEAM = '#ff3b2f';

function stripEnvironment() {
  const s = new Scene(); s.background = new Color('#000000');
  const m = (c, k) => new MeshBasicMaterial({ color: new Color(c).multiplyScalar(k) });
  const add = (w, h, d, x, y, z, mat) => { const b = new Mesh(new BoxGeometry(w, h, d), mat); b.position.set(x, y, z); s.add(b); };
  add(60, .16, .16, 0, 6, -1.3, m('#ffffff', 2.2)); add(60, .16, .16, 0, 6, 1.3, m('#ffffff', 2.2));   // two long overhead strips
  add(60, .08, .08, 0, 5.6, 0, m('#ffd9c4', 1.2));
  add(60, .1, .1, 0, 1.4, -9, m('#ffffff', 1.4)); add(60, .1, .1, 0, .8, 9, m('#ffe2d2', 1));         // low side lines → the moving highlight
  add(30, .05, 30, 0, 9, 0, m('#8d96a8', .06));
  add(.2, 3, 60, -10, 2.5, 0, m('#dfe6ff', 1.6));                                                     // rim strip behind                                                         // faint ceiling for body tone
  return s;
}

function radialTex(inner, outer) {
  const c = document.createElement('canvas'); c.width = c.height = 512;
  const x = c.getContext('2d'), g = x.createRadialGradient(256, 256, 0, 256, 256, 256);
  g.addColorStop(0, inner); g.addColorStop(.55, outer); g.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = g; x.fillRect(0, 0, 512, 512);
  return new CanvasTexture(c);
}

function wordmarkTexture(text) {
  const c = document.createElement('canvas'); c.width = 4096; c.height = 720;
  const x = c.getContext('2d');
  x.clearRect(0, 0, c.width, c.height);
  try { x.fontStretch = 'expanded'; } catch (e) { /* older browsers */ }
  let size = 600;
  x.font = `800 ${size}px "Archivo Variable", Archivo, sans-serif`;
  const w = x.measureText(text).width; size *= 3980 / w; x.font = `800 ${size}px "Archivo Variable", Archivo, sans-serif`;
  x.letterSpacing = '-0.01em';
  const g = x.createLinearGradient(0, 0, 0, c.height);
  g.addColorStop(0, '#62666e'); g.addColorStop(.6, '#2a2c32'); g.addColorStop(1, '#101114');
  x.fillStyle = g; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillText(text, c.width / 2, c.height / 2 + size * .04);
  const t = new CanvasTexture(c); t.colorSpace = SRGBColorSpace; t.anisotropy = 8;
  return { tex: t, aspect: c.width / c.height };
}

const GradeShader = {
  uniforms: { tDiffuse: { value: null }, uTime: { value: 0 }, uVig: { value: .9 }, uCA: { value: .0015 }, uFlash: { value: 0 }, uFade: { value: 0 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
  fragmentShader: `uniform sampler2D tDiffuse; uniform float uTime, uVig, uCA, uFlash, uFade; varying vec2 vUv;
    float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
    void main(){
      vec2 d = vUv - .5; float r = length(d);
      vec3 col; col.r = texture2D(tDiffuse, vUv + d * uCA * r * 4.).r; col.g = texture2D(tDiffuse, vUv).g; col.b = texture2D(tDiffuse, vUv - d * uCA * r * 4.).b;
      col *= mix(1., smoothstep(.95, .25, r), uVig);
      col += (h(vUv * 900. + uTime) - .5) * .035;
      col = mix(col, vec3(1.), uFlash);
      col *= 1. - uFade;
      gl_FragColor = vec4(col, 1.);
    }`
};

export function createWorld(canvas, { coarse = false } = {}) {
  const renderer = new WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance', stencil: false });
  if (!renderer.getContext()) throw new Error('no webgl');
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  const maxDpr = coarse ? 1.5 : 2;
  let scale = 1;

  const scene = new Scene(); scene.background = new Color(BG);
  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(stripEnvironment(), .02).texture;
  scene.environmentIntensity = .05;
  scene.environmentRotation = new Euler(0, 0, 0);

  const camera = new PerspectiveCamera(30, innerWidth / innerHeight, .1, 80);
  scene.add(camera);

  const rim = new DirectionalLight('#dfe6ff', 0); rim.position.set(-4, 3, -5); scene.add(rim);
  const key = new DirectionalLight('#fff3ea', 0); key.position.set(3, 6, 4); scene.add(key);
  const hemi = new HemisphereLight('#dfe4ee', '#08090b', 0); scene.add(hemi);

  // floor: dark, slightly glossy, fading into the void
  const floor = new Mesh(new PlaneGeometry(40, 40), new MeshStandardMaterial({ color: '#0b0c0e', roughness: .8, metalness: .0, envMapIntensity: .06, transparent: true, alphaMap: radialTex('#fff', '#555') }));
  floor.rotation.x = -Math.PI / 2; scene.add(floor);
  const pool = new Mesh(new PlaneGeometry(12, 12), new MeshBasicMaterial({ map: radialTex('rgba(150,155,165,.16)', 'rgba(60,62,70,.04)'), transparent: true, depthWrite: false, blending: AdditiveBlending }));
  pool.rotation.x = -Math.PI / 2; pool.position.y = .002; scene.add(pool);

  // speed streaks for the launch
  const NST = coarse ? 40 : 90;
  const streaks = new InstancedMesh(new BoxGeometry(1, .004, .012), new MeshBasicMaterial({ color: new Color('#cfd3dc').multiplyScalar(1.4), transparent: true, opacity: 0, depthWrite: false, toneMapped: false }), NST);
  const stData = []; const o = new Object3D();
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < NST; i++) stData.push({ x: (rnd() - .5) * 30, z: (rnd() < .5 ? -1 : 1) * (1.3 + rnd() * 5), len: 1 + rnd() * 3, sp: .7 + rnd() * .6 });
  scene.add(streaks);

  const car = createCar({ seam: SEAM });
  scene.add(car.group);

  // wordmark behind the car, locked to the camera
  let word = null;
  function buildWordmark() {
    const { tex, aspect } = wordmarkTexture('ANTUMBRA');
    const m = new Mesh(new PlaneGeometry(aspect, 1), new MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, opacity: 0, fog: false }));
    m.renderOrder = -1; camera.add(m); word = m; layoutWord();
  }
  function layoutWord() {
    if (!word) return;
    const D = 16, h = 2 * D * Math.tan(camera.fov * Math.PI / 360), w = h * camera.aspect;
    const s = (w * .96) / word.geometry.parameters.width;
    word.scale.setScalar(s); word.position.set(0, h * .06, -D);
  }

  // post
  const composer = new EffectComposer(renderer);
  composer.renderTarget1.texture.type = HalfFloatType; composer.renderTarget2.texture.type = HalfFloatType;
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new Vector2(innerWidth / 2, innerHeight / 2), .42, .5, .97);
  composer.addPass(bloom);
  const grade = new ShaderPass(GradeShader); composer.addPass(grade);
  composer.addPass(new OutputPass());

  function resize() {
    const dpr = Math.min(devicePixelRatio, maxDpr) * scale;
    renderer.setPixelRatio(dpr); renderer.setSize(innerWidth, innerHeight, false);
    composer.setPixelRatio(dpr); composer.setSize(innerWidth, innerHeight);
    bloom.resolution.set(innerWidth / 4, innerHeight / 4); bloom.setSize(innerWidth * dpr / 3, innerHeight * dpr / 3);
    camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); layoutWord();
  }
  resize();

  // ---- state & camera
  const st = { px: 0, py: 0, az: .9, el: .08, dist: 11, tx: 0, ty: .55, tz: 0, fov: 28, yaw: 0, env: .05, rim: 0, dissolve: 0, explode: 0, canopy: 0, word: 0, sweep: 9, envRot: 0, spin: 0, shake: 0, streak: 0, flash: 0, lift: 0 };
  const ptr = { x: 0, y: 0, sx: 0, sy: 0 };
  addEventListener('pointermove', e => { ptr.x = e.clientX / innerWidth * 2 - 1; ptr.y = e.clientY / innerHeight * 2 - 1; }, { passive: true });
  const tmp = new Vector3(), tgt = new Vector3();
  let time = 0, paused = false, covered = false;

  function placeCamera(dt) {
    ptr.sx = damp(ptr.sx, ptr.x, 2.5, dt); ptr.sy = damp(ptr.sy, ptr.y, 2.5, dt);
    const aspect = innerWidth / innerHeight, k = clamp((1.5 - aspect) / 1.0, 0, 1);
    const dist = st.dist * (1 + k * .55);
    const az = st.az + ptr.sx * .06, el = st.el + ptr.sy * .03;
    const c = Math.cos(st.yaw), s = Math.sin(st.yaw);
    tgt.set(st.tx * c + st.tz * s, st.ty, -st.tx * s + st.tz * c);
    camera.position.set(tgt.x + dist * Math.cos(el) * Math.sin(az), tgt.y + dist * Math.sin(el), tgt.z + dist * Math.cos(el) * Math.cos(az));
    if (st.shake > 0) {
      const a = st.shake * .03;
      camera.position.x += (Math.sin(time * 71) + Math.sin(time * 43)) * a; camera.position.y += Math.sin(time * 57) * a;
    }
    const W = innerWidth, H = innerHeight, px = st.px * (1 - k), py = st.py + k * .14;
    camera.setViewOffset(W, H, -px * W, py * H, W, H);
    camera.lookAt(tgt);
    const fov = st.fov * (1 + k * .18);
    if (Math.abs(camera.fov - fov) > .01) { camera.fov = fov; layoutWord(); }
    camera.updateProjectionMatrix();
  }

  function tick(dt) {
    time += dt;
    placeCamera(dt);
    car.group.rotation.y = st.yaw;
    scene.environmentIntensity = st.env;
    scene.environmentRotation.y = st.envRot;
    rim.intensity = 0; key.intensity = 0; hemi.intensity = st.env * .9;
    car.U.uSweep.value = st.sweep;
    car.apply(st, dt);
    if (word) { word.material.opacity = st.word; word.visible = st.word > .01; }
    pool.material.opacity = clamp(st.env * .55, 0, 1);
    // streaks
    streaks.material.opacity = st.streak * .8; streaks.visible = st.streak > .01;
    if (streaks.visible) {
      for (let i = 0; i < NST; i++) {
        const d = stData[i]; d.x -= dt * 60 * d.sp * st.streak; if (d.x < -15) d.x += 30;
        o.position.set(d.x, .01, d.z); o.scale.set(d.len * (1 + st.streak * 3), 1, 1); o.updateMatrix(); streaks.setMatrixAt(i, o.matrix);
      }
      streaks.instanceMatrix.needsUpdate = true;
    }
    grade.uniforms.uTime.value = time; grade.uniforms.uFlash.value = st.flash; grade.uniforms.uFade.value = st.fade || 0;
    grade.uniforms.uCA.value = .0012 + st.streak * .006;
    if (!paused && !covered) composer.render();
  }

  // project a car-local point to screen px
  function project(local, out = { x: 0, y: 0, v: true }) {
    tmp.copy(local).applyMatrix4(car.group.matrixWorld).project(camera);
    out.x = (tmp.x * .5 + .5) * innerWidth; out.y = (-tmp.y * .5 + .5) * innerHeight; out.v = tmp.z < 1;
    return out;
  }

  return {
    renderer, scene, camera, car, st, tick, resize, project, buildWordmark,
    compile: () => renderer.compileAsync(scene, camera),
    warm: () => composer.render(),
    setScale(s) { scale = s; resize(); }, getScale: () => scale,
    setPaused(v) { paused = v; }, setCovered(v) { covered = v; },
  };
}
