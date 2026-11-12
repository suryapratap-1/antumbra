import Boot from '../components/Boot';

const ext = [
  { k: 'ext1', n: '01', t: 'Profile', h: <>One line, <em className="serif">nose to tail.</em></>, p: 'The roof never peaks above 1,120 mm. Air leaves the body where it arrived: unbroken.', a: [-0.2, 0.86, 0.6], d: ['Cd 0.26', 'Height 1,120 mm'] },
  { k: 'ext2', n: '02', t: 'Rear', h: <>A tail that <em className="serif">ends on purpose.</em></>, p: 'Cut-off ducktail, seven-fin diffuser and the red Seam, 1.8 m wide, 20 mm tall.', a: [-2.36, 0.74, 0.5], d: ['Downforce 1,180 kg', 'at 300 km/h'] },
  { k: 'ext3', n: '03', t: 'Wheels', h: <>Forged titanium, <em className="serif">quietly red</em> inside.</>, p: '21-inch blades, carbon-ceramic discs. The calipers are the only colour we allowed on the outside.', a: [1.52, 0.37, 0.98], d: ['Ø 21 in', 'Discs 410 mm'] },
  { k: 'ext4', n: '04', t: 'Front', h: <>It looks at you <em className="serif">with one line.</em></>, p: 'No headlamps, no grille: one blade of light, 1.62 m long and 4 mm thick.', a: [2.27, 0.42, 0.4], d: ['Light blade 1,620 mm', 'Thickness 4 mm'] },
];

const soul = [
  { id: 'canopy', a: [0, 1.06, 0], t: 'Canopy', d: 'Single-piece smoked glass, 9.2 kg' },
  { id: 'shell', a: [-1.4, 0.9, -0.7], t: 'Shell', d: 'Carbon skin, 61 panels, one surface' },
  { id: 'tub', a: [0.9, 0.3, -0.55], t: 'Monocoque', d: 'Pre-preg carbon tub, 78 kg' },
  { id: 'battery', a: [-0.4, 0.21, 0.5], t: 'Battery', d: '120 kWh, structural, 98 modules' },
  { id: 'motor', a: [-1.38, 0.37, 0.5], t: 'Motors ×4', d: '1,470 kW total, one per wheel' },
  { id: 'wheel', a: [1.52, 0.37, 0.86], t: 'Corners', d: 'Torque vectored, 1,000 times a second' },
];

const gallery = [
  { src: '/img/r-low.jpg', c: 'Studio 4, Lund', y: '2026', w: 'w' },
  { src: '/img/saltflat.jpg', c: 'Test plate, Uyuni', y: '2026', w: 'n' },
  { src: '/img/r-top.jpg', c: 'Plan view, chassis 001', y: '2026', w: 's' },
  { src: '/img/tunnel.jpg', c: 'Night run, Gotthard', y: '2026', w: 'w' },
  { src: '/img/r-rear.jpg', c: 'The red Seam', y: '2026', w: 'n' },
  { src: '/img/mountain.jpg', c: 'Stelvio, 03:40', y: '2026', w: 'w' },
  { src: '/img/r-wheel.jpg', c: 'Corner, forged Ti', y: '2026', w: 's' },
];

const specs = [
  ['Power', '1,470', 'kW'], ['Torque', '2,300', 'Nm'], ['Top speed', '412', 'km/h'],
  ['Battery', '120', 'kWh'], ['Range', '640', 'km'], ['Weight', '1,690', 'kg'],
];

export default function Page() {
  return (
    <>
      <canvas id="gl" aria-hidden="true" />
      <div className="fx-vignette" aria-hidden="true" />
      <div className="fx-grain" aria-hidden="true" />
      <div className="cursor" aria-hidden="true"><span className="cursor-dot" /><span className="cursor-label" /></div>

      <div className="loader" role="status" aria-live="polite">
        <svg className="ld-svg" viewBox="0 0 400 400" aria-hidden="true">
          <line className="ld-line" x1="40" y1="200" x2="360" y2="200" pathLength={1} />
          <circle className="ld-ring" cx="200" cy="200" r="88" pathLength={1} />
        </svg>
        <p className="ld-cap">Totality approaching</p>
        <p className="ld-num"><span id="ld-pct">000</span></p>
      </div>

      <header className="nav">
        <a href="#top" className="nav-logo" aria-label="Antumbra, back to top">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8" /></svg>
          <span>Antumbra</span>
        </a>
        <nav aria-label="Chapters">
          <ul className="nav-links">
            <li><a href="#exterior" data-roll="Exterior">Exterior</a></li>
            <li><a href="#interior" data-roll="Interior">Interior</a></li>
            <li><a href="#soul" data-roll="Engineering">Engineering</a></li>
            <li><a href="#performance" data-roll="Performance">Performance</a></li>
            <li><a href="#film" data-roll="Film">Film</a></li>
            <li><a href="#gallery" data-roll="Gallery">Gallery</a></li>
          </ul>
        </nav>
        <div className="nav-r">
          <button className="sound" type="button" aria-pressed="false" id="sound"><span className="sound-bars" aria-hidden="true"><i /><i /><i /><i /></span><span className="sound-t">Sound off</span></button>
          <a href="#reserve" className="nav-cta"><span data-roll="Reserve">Reserve</span></a>
        </div>
        <div className="nav-progress" aria-hidden="true"><i /></div>
      </header>

      <main id="top">
        {/* 1 — Totality */}
        <section className="hero" data-sec="hero" data-cam>
          <i data-shot="hero" data-f="0" />
          <h1 className="sr">Antumbra Totality, an electric hypercar. Unveiling 21 March 2027.</h1>
          <div className="hero-word-fallback" aria-hidden="true">ANTUMBRA</div>
          <div className="hero-meta">
            <p className="hm-l"><span className="hm-k">Totality</span><span className="hm-v">Concept, chassis 001 of 099</span></p>
            <p className="hm-c" aria-hidden="true"><span className="scroll-cue"><i /></span></p>
            <p className="hm-r"><span className="hm-k">Unveiling</span><span className="hm-v"><b id="countdown">—</b> · 21.03.2027</span></p>
          </div>
        </section>

        {/* 2 — Manifesto */}
        <section className="manifesto" data-sec="mani" aria-label="Manifesto">
          <i data-shot="mani" data-f="0.5" />
          <div className="mani-stick">
            <p className="mani-q" aria-label="Darkness first. Then everything.">
              <span className="mw">Darkness</span> <span className="mw">first.</span><br />
              <span className="mw">Then</span> <span className="mw serif">everything.</span>
            </p>
            <i className="mani-seam" aria-hidden="true" />
            <p className="mani-p">For eleven seconds during a total eclipse you can see the sun&rsquo;s corona. We built a car for that feeling: you notice the light around it first, and then you notice everything else.</p>
            <p className="mani-cap"><span>Fig. 00</span> Path of totality, 21.03.2027</p>
          </div>
        </section>

        {/* 3 — Exterior */}
        <section className="exterior" id="exterior" data-sec="ext" aria-label="Exterior">
          <i data-shot="ext1" data-f="0.08" /><i data-shot="ext2" data-f="0.36" /><i data-shot="ext3" data-f="0.64" /><i data-shot="ext4" data-f="0.94" />
          <div className="stage">
            <h2 className="ext-title"><span>Exterior</span></h2>
            <ol className="ext-list">
              {ext.map(e => (
                <li key={e.k} className="ext-item" data-anchor={e.a.join(',')}>
                  <p className="ext-n"><span>{e.n}</span> / 04 · {e.t}</p>
                  <h3 className="ext-h">{e.h}</h3>
                  <p className="ext-p">{e.p}</p>
                  <p className="ext-d">{e.d.map(x => <span key={x}>{x}</span>)}</p>
                </li>
              ))}
            </ol>
            <svg className="leader" aria-hidden="true"><line /><circle r="4" /></svg>
            <div className="ext-dial" aria-hidden="true"><i /><span id="ext-deg">000°</span></div>
          </div>
        </section>

        {/* 4 — Interior */}
        <section className="interior" id="interior" data-sec="int" aria-label="Interior">
          <i data-shot="int0" data-f="0" /><i data-shot="int1" data-f="0.45" /><i data-shot="int2" data-f="1" />
          <div className="stage">
            <div className="int-head">
              <p className="lbl">Interior · plan view</p>
              <h2 className="int-h">Two seats. <em className="serif">No noise.</em></h2>
              <p className="int-p">From above, the cabin is a single spine of carbon with a red stitch running down it. Everything else is there because you need it.</p>
            </div>
            <ul className="int-tags">
              <li data-anchor="0.32,0.8,0.3"><b>Yoke</b> Machined from one billet</li>
              <li data-anchor="-0.15,0.56,-0.3"><b>Seats</b> Moulded to the tub, 11 kg each</li>
              <li data-anchor="-0.05,0.55,0"><b>Spine</b> Every switch in the car lives here</li>
              <li data-anchor="0.5,0.76,-0.45"><b>Dash</b> One white line; no screen</li>
            </ul>
            <div className="plates" aria-label="Materials">
              <figure className="plate"><img src="/img/leather.jpg" alt="Macro of black perforated leather with red stitching" loading="lazy" /><figcaption><span>M-01</span> Aniline leather, red thread</figcaption></figure>
              <figure className="plate"><img src="/img/carbon.jpg" alt="Macro of forged carbon fibre" loading="lazy" /><figcaption><span>M-02</span> Forged carbon</figcaption></figure>
              <figure className="plate"><img src="/img/titanium.jpg" alt="Macro of machined titanium grooves" loading="lazy" /><figcaption><span>M-03</span> Machined titanium</figcaption></figure>
            </div>
          </div>
        </section>

        {/* 5 — Shell to Soul */}
        <section className="soul" id="soul" data-sec="soul" aria-label="Engineering: shell to soul">
          <i data-shot="soul0" data-f="0" /><i data-shot="soul1" data-f="0.32" /><i data-shot="soul2" data-f="0.66" /><i data-shot="soul3" data-f="1" />
          <div className="stage">
            <h2 className="soul-h"><span className="soul-a">Shell</span> <em className="serif soul-to">to</em> <span className="soul-b">soul</span></h2>
            <p className="soul-p">Scroll and the paint burns away. What&rsquo;s left is what we actually spent four years on.</p>
            <ul className="soul-tags">
              {soul.map(s => (
                <li key={s.id} data-anchor={s.a.join(',')}><i /><b>{s.t}</b><span>{s.d}</span></li>
              ))}
            </ul>
            <p className="soul-meter" aria-hidden="true"><span id="soul-pct">000</span> % exposed</p>
          </div>
        </section>

        {/* 6 — Philosophy (inverted) */}
        <section className="philo" id="philosophy" data-sec="philo" data-cover aria-label="Engineering and design philosophy">
          <div className="philo-in">
            <p className="lbl philo-lbl">Philosophy · three rules</p>
            <h2 className="philo-h">Four motors.<br /><em className="serif">One opinion.</em></h2>
            <figure className="philo-fig philo-fig-a"><img src="/img/atelier.jpg" alt="An empty concrete studio lit by overhead strip lights" loading="lazy" /><figcaption>Atelier, Lund. One strip light, no windows, fourteen months.</figcaption></figure>
            <ol className="rules">
              <li><span className="r-n">I</span><h3>Subtract until it hurts.</h3><p>Every part had to argue for its weight. The ones that lost became software.</p></li>
              <li><span className="r-n">II</span><h3>Light defines form.</h3><p>We sculpted under one strip light, never daylight. If a surface didn&rsquo;t hold a clean reflection, we cut it again.</p></li>
              <li><span className="r-n">III</span><h3>Engineering is the ornament.</h3><p>There is no trim on the car. What looks like decoration is cooling, downforce or structure.</p></li>
            </ol>
            <figure className="philo-fig philo-fig-b"><img src="/img/windtunnel.jpg" alt="Smoke streamlines in a dark wind tunnel" loading="lazy" /><figcaption>Wind tunnel, run 412. Cd 0.26.</figcaption></figure>
          </div>
        </section>

        {/* 7 — Performance */}
        <section className="perf" id="performance" data-sec="perf" aria-label="Performance">
          <i data-shot="perf" data-f="0.2" />
          <div className="perf-in">
            <p className="lbl">Performance · 0–100 km/h</p>
            <p className="perf-big" aria-live="off"><span id="perf-n">1.9</span><span className="perf-u">s</span></p>
            <div className="launch">
              <button type="button" className="launch-btn" id="launch" aria-describedby="launch-hint">
                <span className="lb-fill" aria-hidden="true" /><span className="lb-t">Hold to launch</span>
              </button>
              <p className="launch-hint" id="launch-hint">Press and hold, or hold Space. <em className="serif">We&rsquo;ll wait.</em></p>
              <p className="launch-read" aria-live="polite"><span id="launch-kmh">000</span> km/h · <span id="launch-t">0.00</span> s</p>
            </div>
            <i className="speed-seam" aria-hidden="true" />
            <dl className="specs">
              {specs.map(([k, v, u]) => (<div key={k}><dt>{k}</dt><dd><b>{v}</b> {u}</dd></div>))}
            </dl>
          </div>
        </section>

        {/* 8 — Film */}
        <section className="film" id="film" data-sec="film" data-cover aria-label="Launch film">
          <div className="film-stick">
            <div className="film-frame" data-cursor="Play">
              <video className="film-v" src="/film/teaser.mp4" poster="/film/poster.jpg" muted playsInline loop preload="none" aria-label="Launch film teaser" />
              <button className="film-play" type="button" aria-label="Play the launch film with controls"><span>Play film</span><span className="film-len">0:24</span></button>
            </div>
            <p className="film-cap"><span>Film 01</span> &ldquo;Totality&rdquo;, rendered in real time from the car you just scrolled through.</p>
            <h2 className="film-h"><span>Launch</span> <em className="serif">film</em></h2>
          </div>
        </section>
        <dialog className="player" id="player" aria-label="Launch film">
          <video controls playsInline preload="none" src="/film/totality.mp4" poster="/film/poster.jpg" />
          <button className="player-x" type="button" aria-label="Close film">Close</button>
        </dialog>

        {/* 9 — Gallery */}
        <section className="gallery" id="gallery" data-sec="gal" data-cover aria-label="Gallery">
          <div className="gal-stick">
            <h2 className="gal-h">Gallery <span className="gal-count"><span id="gal-i">01</span> / {String(gallery.length).padStart(2, '0')}</span></h2>
            <ul className="gal-track">
              {gallery.map((g, i) => (
                <li key={g.src} className={`gal-card gal-${g.w}`}>
                  <figure>
                    <div className="gal-img"><img src={g.src} alt={g.c} loading="lazy" /></div>
                    <figcaption><span>{String(i + 1).padStart(2, '0')}</span>{g.c}<em>{g.y}</em></figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 10 — Reserve */}
        <section className="reserve" id="reserve" data-sec="res" aria-label="Reserve your Totality">
          <i data-shot="res" data-f="0.5" />
          <div className="res-in">
            <div className="res-l">
              <p className="lbl">Reserve · allocation</p>
              <h2 className="res-h">99 cars.<br /><em className="serif">No second edition.</em></h2>
              <p className="res-slots"><span id="slots">37</span> of 99 chassis remain <i className="res-seam" aria-hidden="true"><b /></i></p>
              <fieldset className="paints">
                <legend>Paint <span id="paint-name">Umbra</span></legend>
                <label><input type="radio" name="paint" value="umbra" defaultChecked /><i style={{ background: '#0b0c0f' }} /><span className="sr">Umbra</span></label>
                <label><input type="radio" name="paint" value="corona" /><i style={{ background: '#d8d4cb' }} /><span className="sr">Corona</span></label>
                <label><input type="radio" name="paint" value="prominence" /><i style={{ background: '#7d1410' }} /><span className="sr">Prominence</span></label>
                <label><input type="radio" name="paint" value="penumbra" /><i style={{ background: '#28303b' }} /><span className="sr">Penumbra</span></label>
              </fieldset>
            </div>
            <form className="res-form" id="res-form" noValidate>
              <label className="f"><span>Name</span><input name="name" autoComplete="name" required /></label>
              <label className="f"><span>Email</span><input name="email" type="email" autoComplete="email" required /></label>
              <label className="f"><span>Country</span><input name="country" autoComplete="country-name" /></label>
              <p className="res-dep">Refundable deposit <b>€250,000</b>. Delivery from Q4 2028.</p>
              <button className="res-cta" type="submit"><span>Request allocation</span><i aria-hidden="true" /></button>
              <p className="res-msg" role="status" aria-live="polite" />
            </form>
          </div>
        </section>
      </main>

      <footer className="foot" data-sec="foot" data-cover>
        <div className="foot-top">
          <p className="foot-l">Antumbra Automobili<br />Lund · Modena</p>
          <ul className="foot-links"><li><a href="#top">Back to darkness ↑</a></li><li><a href="#reserve">Reserve</a></li><li><a href="#film">Film</a></li></ul>
          <p className="foot-r">Antumbra is a fictional brand. All specifications are concept targets.</p>
        </div>
        <p className="foot-word" aria-hidden="true">ANTUMBRA</p>
        <i className="foot-seam" aria-hidden="true" />
      </footer>
      <Boot />
    </>
  );
}
