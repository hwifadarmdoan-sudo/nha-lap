// 10 học sinh ảo: đi lại, thả cảm xúc, làm thí nghiệm, kêu cứu, nhảy ăn mừng.
window.NL = window.NL || {};
NL.bots = (function () {
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const pick = a => a[Math.floor(rnd() * a.length)];
  const NAMES = ['Minh', 'Lan', 'Huy', 'Mai', 'Tú', 'Ngọc', 'Khoa', 'Vy', 'Phúc', 'An'];
  const HOME = ['lobby', 'outside', 'f2', 'f2', 'lobby', 'f2', 'lab-2A', 'lab-2B', 'f2', 'lobby'];
  const HELP = {
    'lab-2A': ['Kẹt ở bước 6: bọt nổi nhanh quá, đếm không kịp', 'Chưa biết chỉnh khoảng cách đèn'],
    'lab-2B': ['Kẹt ở bước 5: không biết nhỏ lọ nào trước', 'Chưa hiểu vì sao tế bào co lại'],
    other: ['Bị lạc, không tìm thấy phòng B', 'Không biết thang máy ở đâu']
  };
  const EMOS = ['wave', 'heart', 'haha', 'five', 'wave', 'heart'];
  const EMO_ICON = { wave: '👋', heart: '❤️', haha: '😂', five: '✋', poke: '👉' };
  let list = [], enabled = true;

  function make() {
    list = NAMES.map((name, k) => {
      const scene = HOME[k], s = NL.scenes[scene];
      const p = s.lab ? { x: 4 + rnd() * 2, y: 4.8 } : NL.randomSpot(s, rnd);
      return {
        id: 'bot' + k, bot: true, name, scene, x: p.x, y: p.y, facing: 1,
        look: { hair: k % 4, hairColor: NL.HAIR_COLORS[(k * 2) % 6], coat: NL.COAT_COLORS[(k * 5) % 6] },
        path: null, anim: 'idle', emote: null, emoteT: 0, help: false, helpReason: '', status: '',
        mode: s.lab ? 'lab' : 'idle', timer: 1 + rnd() * 4, step: 1 + Math.floor(rnd() * 3), lastMove: Date.now(), animT: 0
      };
    });
  }

  function walkTo(b, x, y) { b.path = NL.findPath(NL.scenes[b.scene], b.x, b.y, x, y); }

  function update(dt, now) {
    if (!enabled) return;
    list.forEach(b => {
      b.animT += dt;
      if (b.emote) { b.emoteT += dt; if (b.emoteT > 2.2) b.emote = null; }
      const s = NL.scenes[b.scene];
      if (b.path && b.path.length) {
        const tgt = b.path[0], dx = tgt.x - b.x, dy = tgt.y - b.y, dist = Math.hypot(dx, dy), sp = 2.1 * dt;
        if (dist <= sp) { b.x = tgt.x; b.y = tgt.y; b.path.shift(); } else { b.x += dx / dist * sp; b.y += dy / dist * sp; }
        const sx = dx - dy; if (Math.abs(sx) > 0.01) b.facing = sx > 0 ? 1 : -1;
        b.anim = 'walk'; b.lastMove = now;
        return;
      }
      if (b.help) { b.anim = 'jump'; b.timer -= dt; if (b.timer < 0) { b.help = false; b.timer = 3; } return; }
      if (b.mode === 'dance') { b.anim = 'dance'; b.timer -= dt; if (b.timer < 0) { b.mode = 'idle'; b.timer = 2; } return; }
      b.anim = 'idle';
      b.timer -= dt;
      if (b.timer > 0) return;
      if (b.mode === 'lab') {
        const total = 7;
        b.step++; b.status = `TN ${s.lab} · bước ${Math.min(b.step, total)}/${total}`;
        b.timer = 5 + rnd() * 5;
        if (rnd() < 0.12) { b.help = true; b.helpReason = pick(HELP[b.scene] || HELP.other); b.timer = 30; return; }
        if (b.step > total) { b.mode = 'dance'; b.timer = 5; b.status = `Xong TN ${s.lab} 🎉`; b.step = 1; b.after = 'leave'; }
        return;
      }
      if (b.after === 'leave') { b.after = null; b.mode = 'idle'; }
      const r = rnd();
      if (r < 0.45) { const p = NL.randomSpot(s, rnd); walkTo(b, p.x, p.y); b.status = ''; }
      else if (r < 0.7) {
        b.emote = pick(EMOS); b.emoteT = 0;
        const mate = list.find(o => o !== b && o.scene === b.scene && Math.hypot(o.x - b.x, o.y - b.y) < 2.5);
        if (mate && b.emote === 'five') { mate.emote = 'five'; mate.emoteT = 0; }
      }
      else if (r < 0.78) { b.mode = 'dance'; b.timer = 3; }
      else if (r < 0.84 && !s.lab) { b.help = true; b.helpReason = pick(HELP.other); b.timer = 25; }
      else if (r < 0.92) { // đổi tầng
        const to = pick(['outside', 'lobby', 'f2', 'f2', 'lab-2A', 'lab-2B']);
        b.scene = to; const ns = NL.scenes[to];
        if (ns.lab) { b.x = 5; b.y = 6.6; walkTo(b, 3.8 + rnd() * 2.4, 4.8); b.mode = 'lab'; b.step = 1; b.status = `TN ${ns.lab} · bước 1/7`; }
        else { const sp = ns.spawns.fromElev || ns.spawns.default; b.x = sp.x; b.y = sp.y; b.status = ''; }
      }
      b.timer = 2 + rnd() * 4;
    });
  }

  function asState(b) {
    return {
      id: b.id, bot: true, name: b.name, look: b.look, scene: b.scene, x: b.x, y: b.y, facing: b.facing,
      anim: b.anim, emote: b.emote, emoteT: b.emoteT, help: b.help, helpReason: b.helpReason, status: b.status, lastMove: b.lastMove,
      bubble: b.emote ? EMO_ICON[b.emote] : null
    };
  }

  function resolveHelp(id) {
    const b = list.find(o => o.id === id); if (!b || !b.help) return;
    b.help = false; b.emote = 'heart'; b.emoteT = 0; b.timer = 2;
  }

  function react(id, emo) {
    const b = list.find(o => o.id === id); if (!b) return;
    setTimeout(() => { b.emote = emo; b.emoteT = 0; }, 300);
  }

  make();
  return {
    update, resolveHelp, react,
    get list() { return enabled ? list.map(asState) : []; },
    get enabled() { return enabled; },
    set enabled(v) { enabled = v; }
  };
})();
