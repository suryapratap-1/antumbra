// Opt-in sound, generated in WebAudio (nothing to download): a low electric hum whose pitch follows the launch.
export function createSound() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 420; lp.Q.value = 6; lp.connect(master);
  const o1 = ctx.createOscillator(); o1.type = 'sawtooth'; o1.frequency.value = 55;
  const o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = 110.4;
  const g1 = ctx.createGain(); g1.gain.value = .25; const g2 = ctx.createGain(); g2.gain.value = .6;
  o1.connect(g1).connect(lp); o2.connect(g2).connect(lp); o1.start(); o2.start();
  let on = false, launching = false;
  return {
    enable(v) { on = v; ctx.resume(); master.gain.setTargetAtTime(v ? .05 : 0, ctx.currentTime, .4); },
    launch(v) { launching = v; if (on) master.gain.setTargetAtTime(v ? .12 : .05, ctx.currentTime, .15); },
    speed(x) {
      if (!on) return;
      const f = 55 * (1 + x * 3.2);
      o1.frequency.setTargetAtTime(f, ctx.currentTime, .05); o2.frequency.setTargetAtTime(f * 2.007, ctx.currentTime, .05);
      lp.frequency.setTargetAtTime(420 + x * 2400, ctx.currentTime, .08);
    },
  };
}
