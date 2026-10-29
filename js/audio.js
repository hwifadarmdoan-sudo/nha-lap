// Âm thanh tự tổng hợp bằng WebAudio, không cần file nhạc.
window.NL = window.NL || {};
NL.audio = (function () {
  let ctx = null, master = null, musicGain = null, muted = false;
  let musicTimer = null, musicMode = null, step = 0;

  function init() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain(); master.gain.value = muted ? 0 : 0.8; master.connect(ctx.destination);
      musicGain = ctx.createGain(); musicGain.gain.value = 0.18; musicGain.connect(master);
    } catch (e) { ctx = null; }
  }

  function tone(freq, dur, type, vol, when, dest) {
    if (!ctx) return;
    const t = ctx.currentTime + (when || 0);
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol || 0.3, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    o.connect(g); g.connect(dest || master);
    o.start(t); o.stop(t + dur + 0.05);
  }

  const sfx = {
    click() { tone(660, 0.08, 'triangle', 0.18); },
    pop() { tone(880, 0.06, 'sine', 0.25); tone(1320, 0.05, 'sine', 0.12, 0.03); },
    ting() { tone(1568, 0.9, 'sine', 0.25); tone(1175, 1.1, 'sine', 0.2, 0.18); },
    step() { tone(140 + Math.random() * 40, 0.05, 'triangle', 0.05); },
    bubble() { tone(500 + Math.random() * 500, 0.09, 'sine', 0.2); },
    drop() { tone(1200, 0.12, 'sine', 0.2); tone(700, 0.15, 'sine', 0.12, 0.05); },
    help() { tone(988, 0.15, 'square', 0.08); tone(1318, 0.2, 'square', 0.08, 0.15); },
    unlock() { [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.25, 'triangle', 0.18, i * 0.08)); },
    success() { [523, 659, 784, 1046, 784, 1046].forEach((f, i) => tone(f, 0.3, 'triangle', 0.22, i * 0.11)); },
    door() { tone(220, 0.5, 'sine', 0.08); },
    hum() { tone(180, 1.6, 'sawtooth', 0.025); }
  };

  // Nhạc nền: hợp âm rải ngũ cung nhẹ; nhạc nhảy: nhanh, có trống.
  const calm = [523, 587, 659, 784, 880, 784, 659, 587];
  const bass = [131, 131, 147, 165, 131, 196, 175, 147];
  const dance = [659, 784, 880, 784, 659, 523, 587, 659];
  function tick() {
    if (!ctx || muted) return;
    if (musicMode === 'calm') {
      tone(calm[step % 8], 0.9, 'sine', 0.35, 0, musicGain);
      if (step % 4 === 0) tone(bass[(step / 4) % 8 | 0], 1.6, 'triangle', 0.3, 0, musicGain);
    } else if (musicMode === 'dance') {
      tone(dance[step % 8], 0.18, 'square', 0.18, 0, musicGain);
      if (step % 2 === 0) tone(90, 0.12, 'sine', 0.9, 0, musicGain);
      else tone(4000, 0.03, 'triangle', 0.15, 0, musicGain);
    }
    step++;
  }
  function music(mode) {
    if (musicMode === mode) return;
    musicMode = mode; clearInterval(musicTimer); step = 0;
    if (!mode) return;
    musicTimer = setInterval(tick, mode === 'dance' ? 170 : 520);
  }
  function setMuted(m) {
    muted = m;
    if (master) master.gain.value = m ? 0 : 0.8;
  }
  function play(name) { if (!muted && sfx[name]) { init(); sfx[name](); } }
  // tiếng tự chọn tần số cho mô hình 3D: tone(Hz, giây, dạng sóng, âm lượng, trễ)
  function beep(f, d, type, vol, when) { if (muted) return; init(); tone(f, d, type, vol, when); }
  // tiếng xì (ho, gió, khò khè)
  function noise(d, vol, freq) {
    if (muted) return; init(); if (!ctx) return;
    const n = Math.floor(ctx.sampleRate * d), b = ctx.createBuffer(1, n, ctx.sampleRate), a = b.getChannelData(0);
    for (let k = 0; k < n; k++) a[k] = (Math.random() * 2 - 1) * (1 - k / n);
    const src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = b; f.type = 'bandpass'; f.frequency.value = freq || 900; g.gain.value = vol || 0.2;
    src.connect(f); f.connect(g); g.connect(master); src.start();
  }
  return { init, play, music, setMuted, beep, noise, get muted() { return muted; } };
})();
