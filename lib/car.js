// Antumbra Totality — a procedural electric hypercar, built entirely in code.
// Body = parametric loft of superellipse sections (fenders, arches, tumblehome), plus canopy, wheels,
// light bars ("the Seam"), and an engineering skeleton (tub, battery, motors, arms) for the exploded view.
// x = length (front +), y = up, z = width.
import {
  BufferGeometry, Float32BufferAttribute, Mesh, Group, MeshPhysicalMaterial, MeshStandardMaterial, MeshBasicMaterial,
  LineSegments, LineBasicMaterial, WireframeGeometry, SphereGeometry, CylinderGeometry, BoxGeometry, LatheGeometry, TorusGeometry,
  InstancedMesh, Object3D, Vector2, Vector3, Color, DoubleSide, PlaneGeometry, CanvasTexture, SRGBColorSpace, AdditiveBlending
} from 'three';

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;
// piecewise smooth curve through [s, v] keys
const curve = keys => s => {
  if (s <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [s0, v0] = keys[i], [s1, v1] = keys[i + 1];
    if (s <= s1) { const t = (s - s0) / (s1 - s0); return lerp(v0, v1, t * t * (3 - 2 * t)); }
  }
  return keys[keys.length - 1][1];
};

export const DIM = { L: 4.7, FX: 2.35, wheelR: .37, wheelW: .32, front: 1.52, rear: -1.38, track: .86 };
const X = s => DIM.FX - s * DIM.L;               // s 0 (nose) → 1 (tail)

// plan + elevation of the body
const HW = curve([[0, .62], [.04, .86], [.12, 1.0], [.19, 1.07], [.29, 1.0], [.42, .9], [.55, .93], [.68, 1.04], [.78, 1.1], [.9, 1.02], [1, .93]]);
const TOPC = curve([[0, .34], [.05, .43], [.18, .55], [.3, .64], [.36, .7], [.66, .81], [.8, .82], [.93, .8], [1, .76]]);   // centreline
const FEND = curve([[0, .02], [.1, .17], [.2, .26], [.3, .14], [.45, .06], [.62, .1], [.76, .16], [.88, .08], [1, .03]]);   // fender rise
const BOTC = curve([[0, .2], [.08, .13], [.84, .13], [.93, .22], [1, .3]]);   // nose and diffuser kick-ups
const SH = curve([[0, .27], [.08, .38], [.4, .44], [.8, .5], [1, .5]]);           // shoulder / beltline
function archAt(x) {         // wheel-well ceiling (0 = no arch here)
  let b = 0;
  for (const wx of [DIM.front, DIM.rear]) {
    const R = DIM.wheelR + .07, dx = x - wx;
    if (Math.abs(dx) < R) b = Math.max(b, DIM.wheelR + Math.sqrt(R * R - dx * dx) * .98);
  }
  return b;
}
function endRound(s) {       // nose rounds in plan, tail is a cut-off Kamm face
  const f = s < .06 ? Math.sqrt(Math.max(0, 1 - ((.06 - s) / .06) ** 2)) : 1;
  const r = s > .984 ? Math.sqrt(Math.max(0, 1 - ((s - .984) / .016) ** 2)) : 1;
  return Math.max(.015, f * r);
}

function sectionPoint(s, t, out) {          // t ∈ [0, 2π): 0 = right side (+z), π/2 = top
  const x = X(s), er = endRound(s);
  const hw = HW(s) * er, top = TOPC(s), sh = SH(s), bot = BOTC(s), ab = archAt(x);
  const c = Math.cos(t), sn = Math.sin(t), n = 2.7;
  let z = hw * Math.sign(c) * Math.abs(c) ** (2 / n), y;
  const u = Math.abs(z) / Math.max(hw, 1e-3);
  if (sn >= 0) {
    y = sh + (top - sh) * sn ** (2 / n);
    z *= 1 - .14 * sn * sn;                                         // tumblehome
    y += FEND(s) * Math.exp(-(((u - .8) / .2) ** 2)) * sn;           // sculpted fenders
  } else {
    y = sh - (sh - bot) * Math.abs(sn) ** (2 / n);
    z *= 1 - .06 * sn * sn;                                         // undercut
  }
  if (ab > 0) {                                                       // wheel arch cut into the outer body only
    const k = sstep(.5, .64, u);
    y = sn >= 0 ? Math.max(y, lerp(y, ab + .07, k)) : Math.max(y, lerp(y, ab, k));
  }
  if (s > .984) y = sh + (y - sh) * Math.max(er, .35);              // Kamm face closes towards the beltline
  out.set(x, y, z);
  return out;
}

function loftGeometry(NS = 220, NT = 72) {
  const pos = [], uv = [], idx = [], p = new Vector3();
  for (let i = 0; i <= NS; i++) {
    const s = i / NS;
    for (let j = 0; j <= NT; j++) {
      sectionPoint(s, (j / NT) * Math.PI * 2, p);
      pos.push(p.x, p.y, p.z); uv.push(s, j / NT);
    }
  }
  const row = NT + 1;
  for (let i = 0; i < NS; i++) for (let j = 0; j < NT; j++) {
    const a = i * row + j, b = a + row;
    idx.push(a, a + 1, b, b, a + 1, b + 1);
  }
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals();
  return g;
}

// CAD-style wireframe: every k-th section loop + longitudinal lines
function draftLines(NSL = 26, NL = 18) {
  const pts = [], a = new Vector3(), b = new Vector3();
  for (let i = 1; i < NSL; i++) {
    const s = i / NSL;
    for (let j = 0; j < 96; j++) {
      sectionPoint(s, j / 96 * Math.PI * 2, a); sectionPoint(s, (j + 1) / 96 * Math.PI * 2, b);
      pts.push(a.x, a.y, a.z, b.x, b.y, b.z);
    }
  }
  for (let j = 0; j < NL; j++) {
    const t = j / NL * Math.PI * 2;
    for (let i = 0; i < 160; i++) {
      sectionPoint(i / 160, t, a); sectionPoint((i + 1) / 160, t, b);
      pts.push(a.x, a.y, a.z, b.x, b.y, b.z);
    }
  }
  const g = new BufferGeometry(); g.setAttribute('position', new Float32BufferAttribute(pts, 3));
  return g;
}

function canopyGeometry(ws = 72, hs = 40) {
  const g = new SphereGeometry(1, ws, hs);
  const p = g.attributes.position, v = new Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    let x = v.x, y = v.y, z = v.z;
    x *= x < 0 ? 1.32 : .95;                                   // teardrop: long tail
    const yy = y * (.36 - .1 * Math.max(0, -x) / 1.32);        // falls towards the tail
    p.setXYZ(i, x + .02, .7 + yy, z * (.6 - .1 * Math.max(0, -v.x)));
  }
  g.computeVertexNormals();
  return g;
}

function wheel(mats) {
  const g = new Group();
  // tyre: lathe a rounded section around the axle (y axis), then lay it on its side
  const R = DIM.wheelR, W = DIM.wheelW, prof = [];
  for (let i = 0; i <= 16; i++) { const a = -Math.PI / 2 + i / 16 * Math.PI; prof.push(new Vector2(R - .055 + Math.cos(a) * .055, Math.sin(a) * W / 2)); }
  prof.unshift(new Vector2(R - .12, -W / 2)); prof.push(new Vector2(R - .12, W / 2));
  const tyre = new Mesh(new LatheGeometry(prof, 64), mats.tyre);
  tyre.rotation.x = Math.PI / 2; g.add(tyre);
  // rim: dish + 7 twisted blades + lip
  const dish = new Mesh(new CylinderGeometry(R - .11, R - .11, .02, 48), mats.rim);
  dish.rotation.x = Math.PI / 2; dish.position.z = W / 2 - .05; g.add(dish);
  const lip = new Mesh(new TorusGeometry(R - .115, .012, 8, 64), mats.rimBright);
  lip.position.z = W / 2 - .03; g.add(lip);
  for (let i = 0; i < 7; i++) {
    const blade = new Mesh(new BoxGeometry(.04, R - .14, .035), mats.rimBright);
    const a = i / 7 * Math.PI * 2;
    blade.position.set(Math.cos(a) * (R - .14) / 2, Math.sin(a) * (R - .14) / 2, W / 2 - .025);
    blade.rotation.z = a - Math.PI / 2 + .35; g.add(blade);
  }
  const hub = new Mesh(new CylinderGeometry(.045, .045, .05, 24), mats.rimBright);
  hub.rotation.x = Math.PI / 2; hub.position.z = W / 2 - .01; g.add(hub);
  // brake disc + caliper
  const disc = new Mesh(new CylinderGeometry(R - .14, R - .14, .03, 48), mats.disc);
  disc.rotation.x = Math.PI / 2; disc.position.z = W / 2 - .12; g.add(disc);
  const cal = new Mesh(new BoxGeometry(.14, .08, .06), mats.caliper);
  cal.position.set(.12, .14, W / 2 - .1); cal.rotation.z = -.7;
  const spin = new Group(); while (g.children.length) spin.add(g.children[0]);
  const root = new Group(); root.add(spin); root.add(cal);
  root.userData.spin = spin;
  return root;
}

function contactShadow() {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const x = c.getContext('2d'), gr = x.createRadialGradient(128, 128, 10, 128, 128, 128);
  gr.addColorStop(0, 'rgba(0,0,0,.95)'); gr.addColorStop(.5, 'rgba(0,0,0,.55)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = gr; x.fillRect(0, 0, 256, 256);
  const m = new Mesh(new PlaneGeometry(6.4, 3.0), new MeshBasicMaterial({ map: new CanvasTexture(c), transparent: true, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; m.position.y = .004;
  return m;
}

// dissolve: noise threshold discards paint, a hot Seam-coloured rim burns at the edge
const NOISE = `
float hash3(vec3 p){ p = fract(p*.3183099+.1); p*=17.; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
float vnoise(vec3 x){ vec3 i=floor(x), f=fract(x); f=f*f*(3.-2.*f);
  return mix(mix(mix(hash3(i),hash3(i+vec3(1,0,0)),f.x),mix(hash3(i+vec3(0,1,0)),hash3(i+vec3(1,1,0)),f.x),f.y),
             mix(mix(hash3(i+vec3(0,0,1)),hash3(i+vec3(1,0,1)),f.x),mix(hash3(i+vec3(0,1,1)),hash3(i+vec3(1,1,1)),f.x),f.y),f.z); }
float fbm(vec3 p){ return .55*vnoise(p)+.3*vnoise(p*2.1)+.15*vnoise(p*4.3); }`;
export function addDissolve(mat, U) {
  mat.onBeforeCompile = sh => {
    sh.uniforms.uDissolve = U.uDissolve; sh.uniforms.uSeam = U.uSeam; sh.uniforms.uSweep = U.uSweep;
    sh.vertexShader = 'varying vec3 vObj;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvObj = position;');
    sh.fragmentShader = 'uniform float uDissolve, uSweep; uniform vec3 uSeam; varying vec3 vObj;\n' + NOISE + '\n' + sh.fragmentShader
      .replace('#include <clipping_planes_fragment>', `#include <clipping_planes_fragment>
        float dn = fbm(vObj * 2.6) * .55 + (1. - (vObj.x + 2.4) / 4.8) * .45;   // burns nose → tail
        float th = uDissolve * 1.12 - .06;
        if (dn < th) discard;
        vec2 ck = vec2((vObj.x + .12) / 1.02, vObj.z / .5);
        if (vObj.y > .6 && dot(ck, ck) < 1.) discard;                         // cockpit opening (hidden by the canopy)`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        float edge = 1. - smoothstep(0., .045, dn - th);
        totalEmissiveRadiance += uSeam * edge * step(.001, uDissolve) * 6.;
        float sw = exp(-pow((vObj.x - uSweep) * 6., 2.)) * step(.5, vObj.y);   // the sweeping light seam
        totalEmissiveRadiance += vec3(1., .93, .88) * sw * .06;`);
  };
  mat.customProgramCacheKey = () => 'dissolve';
  return mat;
}

export const PAINTS = {
  umbra: { name: 'Umbra', color: '#0b0c0f', metal: .55, rough: .3 },
  corona: { name: 'Corona', color: '#d8d4cb', metal: .2, rough: .28 },
  prominence: { name: 'Prominence', color: '#7d1410', metal: .6, rough: .26 },
  penumbra: { name: 'Penumbra', color: '#28303b', metal: .7, rough: .3 },
};

export function createCar({ seam = '#ff3b2f' } = {}) {
  const U = { uDissolve: { value: 0 }, uSeam: { value: new Color(1, .006, .004) }, uSweep: { value: 9 } };
  const mats = {
    paint: addDissolve(new MeshPhysicalMaterial({ color: PAINTS.umbra.color, metalness: .55, roughness: .3, clearcoat: 1, clearcoatRoughness: .04, envMapIntensity: 1 }), U),
    glass: new MeshPhysicalMaterial({ color: '#050608', metalness: .2, roughness: .06, clearcoat: 1, clearcoatRoughness: .05, transparent: true, opacity: .94, envMapIntensity: .8 }),
    carbon: new MeshPhysicalMaterial({ color: '#111214', metalness: .3, roughness: .45, clearcoat: .6, clearcoatRoughness: .2 }),
    tubMat: new MeshStandardMaterial({ color: '#16181c', metalness: .2, roughness: .75 }),
    tyre: new MeshStandardMaterial({ color: '#0d0d0e', roughness: .85, metalness: 0 }),
    rim: new MeshStandardMaterial({ color: '#141518', metalness: .9, roughness: .35 }),
    rimBright: new MeshStandardMaterial({ color: '#4b4e55', metalness: 1, roughness: .22 }),
    disc: new MeshStandardMaterial({ color: '#3a3b3f', metalness: .9, roughness: .5 }),
    caliper: new MeshStandardMaterial({ color: seam, metalness: .3, roughness: .4, emissive: seam, emissiveIntensity: .25 }),
    seamRed: new MeshBasicMaterial({ color: new Color(4.5, .03, .02), toneMapped: false }),
    seamWhite: new MeshBasicMaterial({ color: new Color('#fff4ea').multiplyScalar(2.2), toneMapped: false }),
    wire: new LineBasicMaterial({ color: '#8b8e94', transparent: true, opacity: 0, depthWrite: false }),
    cell: new MeshStandardMaterial({ color: '#1b1d22', metalness: .6, roughness: .4, emissive: seam, emissiveIntensity: 0 }),
    copper: new MeshStandardMaterial({ color: '#b0643a', metalness: 1, roughness: .3 }),
    steel: new MeshStandardMaterial({ color: '#5a5d63', metalness: 1, roughness: .35 }),
    seat: new MeshStandardMaterial({ color: '#1a1714', roughness: .7 }),
  };

  const car = new Group();          // world placement (yaw, offset)
  const parts = {};

  // --- shell
  const shell = new Group(); car.add(shell); parts.shell = shell;
  const body = new Mesh(loftGeometry(), mats.paint); body.castShadow = false; shell.add(body);
  const wire = new LineSegments(draftLines(), mats.wire); shell.add(wire); parts.wire = wire;

  // splitter, side blades, diffuser — carbon
  
  for (const sz of [-1, 1]) {
    const blade = new Mesh(new BoxGeometry(2.0, .05, .05), mats.carbon); blade.position.set(.08, .2, sz * .9); shell.add(blade);
    // side intake slash (dark) ahead of the rear wheel
    const intake = new Mesh(new BoxGeometry(.55, .17, .04), new MeshStandardMaterial({ color: '#020203', roughness: .9 }));
    intake.position.set(-.55, .42, sz * .885); intake.rotation.y = sz * .12; intake.rotation.z = .25; shell.add(intake);
  }
  for (let i = 0; i < 7; i++) {
    const fin = new Mesh(new BoxGeometry(.4, .09, .012), mats.carbon); fin.position.set(-2.12, .25, -.6 + i * .2); shell.add(fin);
  }
  // the Seam: full-width light bars front (white) and rear (red)
  const front = new Mesh(new BoxGeometry(.02, .014, 1.62), mats.seamWhite); front.position.set(2.27, .42, 0); front.rotation.z = -.5; shell.add(front);
  const rear = new Mesh(new BoxGeometry(.02, .02, 1.8), mats.seamRed); rear.position.set(-2.355, .74, 0); shell.add(rear);
  parts.front = front; parts.rear = rear;
  // ducktail lip
  const lip = new Mesh(new BoxGeometry(.28, .025, 1.82), mats.carbon); lip.position.set(-2.24, .875, 0); lip.rotation.z = -.12; shell.add(lip);

  // --- canopy (moves independently in the exploded view)
  const canopy = new Mesh(canopyGeometry(), mats.glass); car.add(canopy); parts.canopy = canopy;
  const canopyWire = new LineSegments(new WireframeGeometry(canopyGeometry(18, 10)), mats.wire); canopy.add(canopyWire);

  // --- interior (seen through the clear canopy, top-down)
  const cabin = new Group(); car.add(cabin); parts.cabin = cabin;
  for (const sz of [-1, 1]) {
    const seat = new Mesh(new BoxGeometry(.62, .1, .44), mats.seat); seat.position.set(-.15, .5, sz * .3); cabin.add(seat);
    const back = new Mesh(new BoxGeometry(.1, .5, .42), mats.seat); back.position.set(-.48, .72, sz * .3); back.rotation.z = .35; cabin.add(back);
    const stitch = new Mesh(new BoxGeometry(.6, .004, .01), mats.seamRed); stitch.position.set(-.15, .556, sz * .3); cabin.add(stitch);
  }
  const yoke = new Mesh(new TorusGeometry(.15, .018, 8, 32, Math.PI), mats.carbon); yoke.position.set(.32, .78, .3); yoke.rotation.set(0, Math.PI / 2, Math.PI); yoke.rotation.order = 'YXZ'; cabin.add(yoke);
  const spine = new Mesh(new BoxGeometry(1.3, .12, .12), mats.carbon); spine.position.set(-.05, .48, 0); cabin.add(spine);
  const spineSeam = new Mesh(new BoxGeometry(1.25, .006, .012), mats.seamRed); spineSeam.position.set(-.05, .545, 0); cabin.add(spineSeam);
  const dash = new Mesh(new BoxGeometry(.12, .05, 1.3), mats.carbon); dash.position.set(.55, .72, 0); cabin.add(dash);
  const dashSeam = new Mesh(new BoxGeometry(.01, .006, 1.25), mats.seamWhite); dashSeam.position.set(.5, .75, 0); cabin.add(dashSeam);

  // --- skeleton: tub, battery, motors, arms
  const skel = new Group(); car.add(skel); parts.skel = skel;
  const tub = new Mesh(new BoxGeometry(2.4, .2, 1.3), mats.tubMat); tub.position.set(-.05, .3, 0); skel.add(tub); parts.tub = tub;
  const NX = 14, NZ = 7, cellG = new BoxGeometry(.13, .07, .13);
  const cells = new InstancedMesh(cellG, mats.cell, NX * NZ); const o = new Object3D(); let k = 0;
  for (let i = 0; i < NX; i++) for (let j = 0; j < NZ; j++) { o.position.set(-.98 + i * .145, 0, -.45 + j * .15); o.updateMatrix(); cells.setMatrixAt(k++, o.matrix); }
  const battery = new Group(); battery.add(cells); battery.position.y = .21; skel.add(battery); parts.battery = battery;
  parts.motors = [];
  const motorG = new CylinderGeometry(.13, .13, .26, 32), coilG = new TorusGeometry(.135, .018, 8, 32);
  for (const [mx, mz] of [[DIM.front, 1], [DIM.front, -1], [DIM.rear, 1], [DIM.rear, -1]]) {
    const m = new Group(); const can = new Mesh(motorG, mats.steel); can.rotation.x = Math.PI / 2; m.add(can);
    for (const dz of [-.08, 0, .08]) { const c = new Mesh(coilG, mats.copper); c.position.z = dz; m.add(c); }
    m.position.set(mx, DIM.wheelR, mz * .5); m.userData.base = m.position.clone(); m.userData.dir = mz; skel.add(m); parts.motors.push(m);
    const arm = new Mesh(new CylinderGeometry(.018, .018, .5, 8), mats.steel); arm.rotation.x = Math.PI / 2; arm.position.set(mx, DIM.wheelR + .12, mz * .62); skel.add(arm);
  }

  // --- wheels
  parts.wheels = [];
  for (const [wx, wz] of [[DIM.front, 1], [DIM.front, -1], [DIM.rear, 1], [DIM.rear, -1]]) {
    const w = wheel(mats); w.position.set(wx, DIM.wheelR, wz * DIM.track);
    if (wz < 0) w.rotation.y = Math.PI;
    w.userData.base = w.position.clone(); w.userData.dir = wz;
    car.add(w); parts.wheels.push(w);
  }
  const shadow = contactShadow(); car.add(shadow); parts.shadow = shadow;

  let spinA = 0;
  const api = {
    group: car, parts, mats, U,
    setPaint(key) {
      const p = PAINTS[key]; if (!p) return;
      mats.paint.color.set(p.color); mats.paint.metalness = p.metal; mats.paint.roughness = p.rough;
    },
    // state: { dissolve 0..1, explode 0..1, canopy 0..1 (1 = clear), env, spin (rad/s) }
    apply(st, dt) {
      const d = st.dissolve, e = st.explode;
      U.uDissolve.value = d;
      body.visible = d < .999;
      body.material.side = 2;
      mats.wire.opacity = sstep(.05, .5, d) * .55;
      const ee = e * e * (3 - 2 * e);
      shell.position.y = ee * 1.15;
      canopy.position.y = ee * 1.9;
      const cc = Math.max(st.canopy, sstep(.2, .9, d));
      canopy.material.opacity = lerp(.92, .1, cc); canopy.material.envMapIntensity = lerp(.8, .05, cc); canopy.visible = cc < .97 || d > .05; canopy.material.visible = d < .5;
      mats.paint.envMapIntensity = lerp(1, .35, st.canopy);
      cabin.position.y = ee * .55;
      battery.position.y = .21 - ee * .55;
      mats.cell.emissiveIntensity = sstep(.4, 1, d) * (1.2 + .4 * Math.sin(performance.now() * .004));
      tub.position.y = .3 - ee * .1;
      for (const w of parts.wheels) { w.position.z = w.userData.base.z + w.userData.dir * ee * .75; w.position.y = w.userData.base.y; }
      for (const m of parts.motors) m.position.z = m.userData.base.z + m.userData.dir * ee * .35;
      skel.visible = d > .02 || st.canopy > .02;
      shadow.material.opacity = 1 - ee * .6;
      spinA += (st.spin || 0) * dt;
      for (const w of parts.wheels) w.userData.spin.rotation.z = -spinA * w.userData.dir;
    },
  };
  return api;
}
