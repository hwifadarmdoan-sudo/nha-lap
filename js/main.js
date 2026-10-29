// Vòng lặp game: màn mở đầu, đi lại, camera, thang máy, hành động, thí nghiệm, nhiều người chơi.
(function () {
  const $ = id => document.getElementById(id);
  const cv = $('world'), c = cv.getContext('2d');
  const isTouch = matchMedia('(pointer:coarse)').matches || 'ontouchstart' in window;
  const params = new URLSearchParams(location.search);
  const wantTeacher = params.has('dieuhanh') || location.hash === '#dieuhanh';

  // ---------- lưu trên máy ----------
  const store = {
    load() { try { return JSON.parse(localStorage.getItem('nhalap-v1')) || null; } catch (e) { return null; } },
    save(d) { try { localStorage.setItem('nhalap-v1', JSON.stringify(d)); } catch (e) { /* trình duyệt chặn lưu */ } }
  };
  const saved = store.load();

  const g = NL.game = {
    id: 'p' + Math.random().toString(36).slice(2, 9),
    name: saved ? saved.name : '', look: saved ? saved.look : { hair: 0, hairColor: NL.HAIR_COLORS[0], coat: NL.COAT_COLORS[0] },
    results: (saved && saved.results) || {}, order: (saved && saved.order) || [], unlocked: !!(saved && saved.unlocked), tutDone: !!(saved && saved.tutDone),
    scene: 'outside', x: 8, y: 11.5, facing: 1, anim: 'idle', path: null, emote: null, emoteT: 0, help: false, status: '',
    danceT: 0, danceKind: 'dance', lastMove: Date.now(), teacher: false, playing: false, tut: {}, followId: null,
    setStatus(s) { g.status = s; },
    toast, finishExperiment
  };
  function persist() { if (!g.teacher) store.save({ name: g.name, look: g.look, results: g.results, order: g.order, unlocked: g.unlocked, tutDone: g.tutDone }); }

  // ---------- canvas ----------
  let W = 0, H = 0, DPR = 1, zoom = 1, baseZoom = 1, cam = { x: 0, y: 0 };
  function resize() {
    DPR = Math.min(2, window.devicePixelRatio || 1);
    W = innerWidth; H = innerHeight;
    cv.width = W * DPR; cv.height = H * DPR;
    baseZoom = Math.max(0.55, Math.min(1.25, Math.min(W / 1150, H / 640) * 1.15));
    if (!g.teacher) zoom = baseZoom;
  }
  addEventListener('resize', resize); resize();

  const toWorld = (sx, sy) => {
    const ix = (sx - cam.x) / zoom, iy = (sy - cam.y) / zoom;
    return { x: (ix / (NL.TW / 2) + iy / (NL.TH / 2)) / 2, y: (iy / (NL.TH / 2) - ix / (NL.TW / 2)) / 2 };
  };

  // ---------- màn mở đầu ----------
  function showStep(id) { document.querySelectorAll('.intro-step').forEach(e => e.classList.toggle('show', e.id === id)); }
  function drawPreview(canvas, scale) {
    const pc = canvas.getContext('2d'); let t = 0;
    const loop = () => {
      if (!canvas.isConnected || $('intro').classList.contains('hidden')) return;
      t += 1 / 60; pc.clearRect(0, 0, canvas.width, canvas.height);
      NL.drawChar(pc, canvas.width / 2, canvas.height - 18, g.look, { t, scale, emote: 'wave' });
      requestAnimationFrame(loop);
    };
    loop();
  }
  function buildChips() {
    const mk = (box, items, isOn, set, render) => {
      box.innerHTML = '';
      items.forEach((it, k) => {
        const b = document.createElement('button'); b.className = 'chip-opt pop' + (isOn(it, k) ? ' on' : '');
        render(b, it, k);
        b.onclick = () => { set(it, k); NL.audio.play('pop'); buildChips(); };
        box.appendChild(b);
      });
    };
    mk($('optHair'), NL.HAIR_STYLES, (it, k) => g.look.hair === k, (it, k) => { g.look.hair = k; }, (b, it, k) => { b.textContent = k + 1; b.title = it; });
    mk($('optHairColor'), NL.HAIR_COLORS, it => g.look.hairColor === it, it => { g.look.hairColor = it; }, (b, it) => { b.style.background = it; });
    mk($('optCoat'), NL.COAT_COLORS, it => g.look.coat === it, it => { g.look.coat = it; }, (b, it) => { b.style.background = it; });
  }
  function intro() {
    showStep('introLogo');
    setTimeout(() => showStep('introTitle'), 1600);
    $('btnStart').onclick = () => {
      NL.audio.init(); NL.audio.play('pop'); NL.audio.music('calm');
      if (g.name) { $('backName').textContent = g.name; showStep('introBack'); drawPreview($('backPreview'), 1.6); }
      else { showStep('introName'); setTimeout(() => $('nameInput').focus(), 300); }
    };
    $('btnName').onclick = () => {
      const v = $('nameInput').value.trim().slice(0, 14);
      if (!v) { $('nameNote').textContent = 'Em nhập tên trước nha'; $('nameNote').classList.add('warn'); $('nameInput').focus(); return; }
      g.name = v; NL.audio.play('pop'); buildChips(); showStep('introLook'); drawPreview($('lookPreview'), 2.4);
    };
    $('nameInput').addEventListener('keydown', e => { if (e.key === 'Enter') $('btnName').click(); });
    $('btnLook').onclick = () => { NL.audio.play('pop'); persist(); enterGame(); };
    $('btnEnter').onclick = () => { NL.audio.play('pop'); enterGame(); };
    $('btnChange').onclick = () => { $('nameInput').value = g.name; showStep('introName'); };
  }

  // Lối tắt vào thẳng thí nghiệm: ?tn=2A, ?tn=2B… hoặc số phòng ?tn=1 … ?tn=10
  const TN = (() => {
    const q = (params.get('tn') || '').toLowerCase(); if (!q) return null;
    const alias = { bubbles: '2A', bot: '2A', plasmo: '2B', co: '2B' };
    const e = NL.EXPERIMENTS.find(x => x.ready && x.floor === 2 && (x.id.toLowerCase() === q || String(x.no) === q || alias[q] === x.id));
    return e ? e.id : null;
  })();
  function enterGame() {
    $('intro').classList.add('hidden'); $('hud').classList.remove('hidden');
    g.playing = true;
    NL.bots.avoidName(g.name);
    if (g.unlocked) $('emoSpecial').classList.remove('locked');
    if (isTouch) $('joy').classList.add('on');
    if (TN) { g.tut.elevator = 1; goScene('lab-' + TN, 'default'); $('btnLab').click(); return; }
    goScene('outside', 'default');
    if (!g.tutDone) {
      $('tutMove').textContent = isTouch ? 'Kéo cần tròn ở góc trái để đi, hoặc chạm xuống sàn' : 'Đi bằng phím mũi tên hoặc W A S D, hoặc bấm chuột xuống sàn';
      $('tutorial').classList.remove('hidden');
      $('tutOk').onclick = () => { NL.audio.play('pop'); $('tutorial').classList.add('hidden'); g.tutDone = true; persist(); };
    }
  }

  // ---------- chuyển cảnh ----------
  let fade = 0, fadeAt = 0, insideTrig = new Set();
  function goScene(id, spawn) {
    const s = NL.scenes[id];
    g.scene = id;
    const sp = (s.spawns[spawn] || s.spawns.default);
    g.x = sp.x; g.y = sp.y; g.path = null; fade = 1; fadeAt = performance.now();
    insideTrig = new Set(s.triggers.filter(tr => inRect(tr, g.x, g.y)).map(tr => tr));
    $('hudFloor').textContent = s.title;
    $('hudFloor').style.background = s.subject ? s.subject.color : '#fff';
    $('hudFloor').style.color = s.subject ? '#fff' : '';
    showGuide();
    benchPrompt(false);
    $('btnLab').classList.toggle('hidden', !s.lab || g.teacher);
    $('btnElev').classList.toggle('hidden', !s.triggers.some(tr => tr.type === 'elevator'));
  }
  const inRect = (r, x, y) => x >= r.x1 && x <= r.x2 && y >= r.y1 && y <= r.y2;

  let guideTimer = 0;
  function setGuide(text, ms) {
    const el = $('guide'); clearTimeout(guideTimer);
    if (!text) { el.classList.add('hidden'); return; }
    el.textContent = text; el.classList.remove('hidden');
    if (ms) guideTimer = setTimeout(() => el.classList.add('hidden'), ms);
  }
  // Việc tiếp theo của em ở cảnh này: chữ hướng dẫn + chỗ mũi tên vàng chỉ tới.
  function nextGuide() {
    const s = NL.scenes[g.scene], r = g.results;
    if (g.teacher) return null;
    const left = NL.EXPERIMENTS.filter(e => e.floor === 2 && e.ready && !r[e.id]);
    if (s.lab) return r[s.lab] ? null : s.guide;
    if (g.scene === 'outside') return left.length ? s.guide : null;
    if (g.scene === 'lobby') return left.length ? { x: 6, y: 0.9, text: 'Vào thang máy, lên tầng 2' } : null;
    if (g.scene === 'f2') {
      if (!left.length) return null;
      const e = left[0], d = s.doors[e.id];
      return { x: d.x, y: d.y, text: `Vào phòng ${e.no} · ${e.short}` };
    }
    if (s.floor > 2) return { x: 8, y: 0.7, text: 'Tầng này sắp có. Quay lại thang máy nhé' };
    return null;
  }
  function showGuide() {
    const gd = nextGuide();
    setGuide(gd ? gd.text : null, NL.scenes[g.scene].lab ? 0 : 6000);
  }

  // ---------- toast ----------
  let toastTimer = 0;
  function toast(msg, ms) {
    const el = $('toast'); el.textContent = msg; el.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), ms || 2600);
  }
  function bigMsg(emoji, text, cb, btn) {
    $('bigEmoji').textContent = emoji; $('bigText').textContent = text; $('bigOk').textContent = btn || 'OK';
    $('bigmsg').classList.remove('hidden');
    $('bigOk').onclick = () => { NL.audio.play('click'); $('bigmsg').classList.add('hidden'); cb && cb(); };
  }

  // ---------- điều khiển ----------
  const keys = {};
  addEventListener('keydown', e => {
    if (document.activeElement && document.activeElement.tagName === 'INPUT') return;
    keys[e.key.toLowerCase()] = true;
    if (e.key === 'Escape' && document.body.classList.contains('film')) NL.teacher.film(false);
  });
  addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });
  const joy = { on: false, dx: 0, dy: 0, id: null };
  (function setupJoy() {
    const el = $('joy'), knob = el.firstElementChild;
    const upd = e => {
      const r = el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      let dx = e.clientX - cx, dy = e.clientY - cy; const m = Math.hypot(dx, dy), R = r.width / 2 - 10;
      if (m > R) { dx = dx / m * R; dy = dy / m * R; }
      knob.style.transform = `translate(${dx}px,${dy}px)`;
      joy.dx = dx / R; joy.dy = dy / R;
    };
    el.addEventListener('pointerdown', e => { joy.on = true; joy.id = e.pointerId; el.setPointerCapture(e.pointerId); upd(e); g.path = null; NL.audio.init(); });
    el.addEventListener('pointermove', e => { if (joy.on && e.pointerId === joy.id) upd(e); });
    const end = () => { joy.on = false; joy.dx = joy.dy = 0; knob.style.transform = ''; };
    el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
  })();

  // chạm/bấm vào màn hình: đi tới chỗ đó, hoặc chạm vào bạn để xem (người điều hành)
  cv.addEventListener('pointerdown', e => {
    if (!g.playing) return;
    NL.audio.init();
    if (document.body.classList.contains('film')) { NL.teacher.film(false); return; }
    const w = toWorld(e.clientX, e.clientY);
    const s = NL.scenes[g.scene];
    // chạm vào bàn thí nghiệm (ưu tiên hơn bạn đứng gần bàn)
    const bench = s.objects.find(o => o.kind === 'bench' && w.x > o.x - 0.3 && w.x < o.x + o.w + 0.3 && w.y > o.y - 0.6 && w.y < o.y + o.d + 0.4);
    if (bench && !g.teacher) { g.pendingBench = bench.exp; g.path = NL.findPath(s, g.x, g.y, bench.x + bench.w / 2, bench.y + bench.d + 0.7); g.followId = null; return; }
    // chạm vào cửa thang máy
    const et = elevTrig(s);
    if (et && w.y < 1.1 && w.x > et.x1 - 0.3 && w.x < et.x2 + 0.3) { walkToElevator(); return; }
    // chạm vào nhân vật khác
    const hit = visibleOthers().find(o => {
      const p = NL.iso(o.rx, o.ry); const sx = p.x * zoom + cam.x, sy = p.y * zoom + cam.y;
      return Math.abs(e.clientX - sx) < 22 * zoom + 6 && e.clientY < sy + 8 && e.clientY > sy - 75 * zoom;
    });
    if (hit) { showInfo(hit); if (g.teacher) return; }
    g.pendingBench = null; g.pendingElev = false;
    g.path = NL.findPath(s, g.x, g.y, w.x, w.y);
    g.followId = null;
    if (g.path) clickMark = { x: w.x, y: w.y, t: 0 };
  });
  let clickMark = null;

  function showInfo(o) {
    if (g.teacher) {
      const st = o.help ? `🆘 ${o.helpReason || 'Cần giúp'}` : (o.status || (o.anim === 'dance' ? 'Đang nhảy ăn mừng 🎉' : 'Đang đi dạo'));
      toast(`${o.name}${o.bot ? ' (ảo)' : ''} · ${st}`, 3500);
    } else toast(`${o.name}${o.teacher ? ' 👩‍🏫' : ''}`, 1500);
  }

  // ---------- hành động ----------
  const EMO_ICON = { wave: '👋', poke: '👉', five: '✋', heart: '❤️', haha: '😂', dance: '💃', special: '🕺' };
  document.querySelectorAll('.emo').forEach(b => b.addEventListener('click', () => {
    const emo = b.dataset.emo;
    if (emo === 'special' && !g.unlocked) { toast('Làm xong một thí nghiệm để mở khóa điệu nhảy này 🔒'); return; }
    NL.audio.play('pop');
    if (emo === 'dance' || emo === 'special') { g.danceT = 3.5; g.danceKind = emo; g.emote = emo; g.emoteT = 0; NL.audio.music('dance'); return; }
    if (emo === 'poke' || emo === 'five') {
      const near = visibleOthers().filter(o => Math.hypot(o.rx - g.x, o.ry - g.y) < 1.8).sort((a, b) => Math.hypot(a.rx - g.x, a.ry - g.y) - Math.hypot(b.rx - g.x, b.ry - g.y))[0];
      if (!near) { toast('Đứng sát một bạn rồi bấm nhé'); return; }
      g.facing = (near.rx - near.ry) - (g.x - g.y) >= 0 ? 1 : -1;
      NL.net.sendEvent({ type: emo, target: near.id, name: g.name });
      if (near.bot) NL.bots.react(near.id, emo === 'five' ? 'five' : 'haha');
    }
    g.emote = emo; g.emoteT = 0;
  }));
  $('btnHelp').addEventListener('click', () => setHelp(!g.help));
  $('labHelp').addEventListener('click', () => setHelp(!g.help));
  function setHelp(on) {
    g.help = on;
    $('btnHelp').classList.toggle('on', on); $('labHelp').classList.toggle('on', on);
    $('btnHelp').textContent = on ? '🙋 Đang gọi cô…' : '🙋 Hỏi giáo viên';
    if (!on) return;
    NL.audio.play('help');
    const teacherOn = [...remote.values()].some(r => r.teacher && NL.net.peers.has(r.id));
    if (teacherOn) { toast('Đã báo cô. Cô sẽ tới chỗ em!'); return; }
    // không có cô online: tự hiện gợi ý của bước đang làm
    if (NL.lab.isOpen) NL.lab.showHint();
    const gd = nextGuide();
    toast('Cô chưa online. ' + (NL.lab.isOpen ? 'Xem gợi ý bên dưới nhé 💡' : gd ? '💡 ' + gd.text : 'Em thử đi tiếp nhé'), 4500);
    setTimeout(() => { if (g.help) setHelp(false); }, 6000);
  }
  $('btnSound').addEventListener('click', () => {
    NL.audio.setMuted(!NL.audio.muted); $('btnSound').textContent = NL.audio.muted ? '🔇' : '🔊';
    if (!NL.audio.muted) { NL.audio.init(); NL.audio.music('calm'); }
  });
  $('btnReport').addEventListener('click', () => { NL.audio.play('click'); NL.report.open(); });

  // ---------- thang máy ----------
  // Bước vào cửa thang (nhìn từ trên), nhân vật biến vào trong, rồi chuyển sang góc nhìn POV trong cabin.
  function floorOf(scene) { const s = NL.scenes[scene]; return s.floor || 0; }
  function elevTrig(s) { return s.triggers.find(tr => tr.type === 'elevator'); }
  function walkToElevator() {
    const s = NL.scenes[g.scene], tr = elevTrig(s);
    if (!tr || g.inElev || NL.lab.isOpen) return;
    const cx = (tr.x1 + tr.x2) / 2;
    if (inRect(tr, g.x, g.y)) { enterElevator(); return; }
    g.path = NL.findPath(s, g.x, g.y, cx, 0.6); g.pendingBench = null; g.pendingElev = true;
    if (!g.path) { g.pendingElev = false; enterElevator(); }
  }
  function enterElevator() {
    if (g.teacher && NL.teacher.filming) return;
    const s = NL.scenes[g.scene], tr = elevTrig(s); if (!tr) return;
    g.pendingElev = false; g.path = null; setGuide(null);
    g.x = (tr.x1 + tr.x2) / 2; g.y = 0.35; g.inElev = true; g.facing = 1;
    NL.audio.play('door');
    setTimeout(() => {
      NL.elevator.open({
        floor: floorOf(g.scene) || 1, allowAll: g.teacher,
        onArrive: to => { g.inElev = false; g.tut.elevator = 1; goScene(to === 1 ? 'lobby' : 'f' + to, 'fromElev'); },
        onExit: () => { g.inElev = false; const sc = NL.scenes[g.scene]; g.y = 0.6; g.path = NL.findPath(sc, g.x, g.y, g.x, 1.8); }
      });
    }, 450);
  }
  $('btnElev').addEventListener('click', () => { NL.audio.play('click'); if (!NL.lab.isOpen && !g.inElev) enterElevator(); });
  $('btnLab').addEventListener('click', () => { const s = NL.scenes[g.scene]; if (!s.lab) return; const b = s.objects.find(o => o.kind === 'bench'); g.x = b.x + b.w / 2; g.y = b.y + b.d + 0.6; openLab(s.lab); });

  // ---------- bàn thí nghiệm ----------
  function benchPrompt(on, exp) {
    const el = $('guide');
    if (on) { el.innerHTML = ''; const b = document.createElement('button'); b.className = 'btn pop'; b.textContent = '🔬 Làm thí nghiệm'; b.onclick = () => openLab(exp); el.appendChild(b); el.style.pointerEvents = 'auto'; el.classList.remove('hidden'); clearTimeout(guideTimer); }
    else { el.style.pointerEvents = 'none'; }
    $('btnLab').classList.toggle('hidden', !!on || !NL.scenes[g.scene].lab || g.teacher);
  }
  function openLab(exp) {
    if (g.teacher) return;
    NL.audio.play('pop'); setGuide(null); benchPrompt(false);
    g.path = null; g.facing = -1;
    NL.lab.open(exp);
  }
  $('labExit').addEventListener('click', () => { NL.audio.play('click'); NL.lab.close(); });

  function finishExperiment(id, result) {
    const first = !g.results[id];
    g.results[id] = result;
    g.order = g.order.filter(x => x !== id).concat(id);
    const wasLocked = !g.unlocked; g.unlocked = true; persist();
    NL.audio.play('success');
    confetti();
    bigMsg('🎉', `Thành công!\n${result.title}`, () => {
      NL.lab.close();
      g.danceT = 4.5; g.danceKind = 'dance'; g.emote = 'dance'; g.emoteT = 0; NL.audio.music('dance');
      g.status = `Xong TN ${id} 🎉`;
      if (wasLocked) setTimeout(() => { $('emoSpecial').classList.remove('locked'); NL.audio.play('unlock'); toast('Mở khóa điệu nhảy riêng 🕺'); }, 1200);
      setTimeout(() => toast('Mệt quá, ra ban công hóng gió nhé 🌿', 3500), wasLocked ? 4200 : 2500);
      setTimeout(() => { g.status = ''; }, 8000);
      void first;
    }, 'Nhảy ăn mừng 💃');
  }
  function confetti() {
    const box = document.createElement('div'); box.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:40;overflow:hidden';
    const cols = ['#5BB4EA', '#3FB37F', '#FFD54A', '#E86A92', '#9B6BD6'];
    for (let k = 0; k < 90; k++) {
      const p = document.createElement('i'); const s = 6 + Math.random() * 8;
      p.style.cssText = `position:absolute;left:${Math.random() * 100}%;top:-20px;width:${s}px;height:${s * 1.6}px;background:${cols[k % 5]};border-radius:2px;transform:rotate(${Math.random() * 360}deg);transition:transform 2.6s cubic-bezier(.2,.6,.4,1),top 2.6s cubic-bezier(.3,.1,.6,1)`;
      box.appendChild(p);
      requestAnimationFrame(() => requestAnimationFrame(() => { p.style.top = (80 + Math.random() * 30) + '%'; p.style.transform = `rotate(${Math.random() * 900}deg) translateX(${Math.random() * 120 - 60}px)`; }));
    }
    document.body.appendChild(box); setTimeout(() => box.remove(), 3000);
  }

  // ---------- nhiều người chơi ----------
  const remote = new Map(); // id -> trạng thái + vị trí vẽ
  NL.net.onState((id, st) => {
    const r = remote.get(id);
    if (r) { Object.assign(r, st); if (r.scene !== r._scene) { r.rx = st.x; r.ry = st.y; r._scene = st.scene; } }
    else remote.set(id, Object.assign({ id, rx: st.x, ry: st.y, _scene: st.scene }, st));
  });
  NL.net.onEvent(ev => {
    if (ev.type === 'recall' && !g.teacher) {
      NL.lab.close(); NL.elevator.close(); g.inElev = false; g.pendingElev = false;
      bigMsg('📣', 'Hết giờ rồi!\nVề sảnh tầng 1 thôi', () => { goScene('lobby', 'fromElev'); });
    } else if (ev.type === 'bots') { NL.bots.enabled = ev.on; if (g.teacher) NL.teacher.syncBots(); }
    else if (ev.type === 'resolve' && ev.target === g.id) {
      setHelp(false);
      if (NL.lab.isOpen) NL.lab.showHint(); else toast(`${ev.name} tới rồi! Hỏi cô nhé 💬`, 3500);
    } else if ((ev.type === 'poke' || ev.type === 'five') && ev.target === g.id) {
      g.emote = ev.type === 'five' ? 'five' : 'haha'; g.emoteT = 0;
      toast(ev.type === 'five' ? `${ev.name} đập tay với em ✋` : `${ev.name} chọc em 👉`);
    }
  });
  function myState() {
    return { name: g.name, look: g.look, scene: g.scene, x: +g.x.toFixed(2), y: +g.y.toFixed(2), facing: g.facing, anim: g.anim, emote: g.emote, emoteT: g.emoteT, help: g.help, status: g.status, lastMove: g.lastMove, teacher: g.teacher, hidden: (g.teacher && NL.teacher.filming) || !!g.inElev };
  }
  function visibleOthers() {
    const out = [];
    remote.forEach(r => { if (r.scene === g.scene && !r.hidden && NL.net.peers.has(r.id)) out.push(r); });
    botView.forEach(b => { if (b.scene === g.scene) out.push(b); });
    return out;
  }
  function allPeople() {
    const out = [{ scene: g.scene }];
    remote.forEach(r => { if (NL.net.peers.has(r.id) && !r.teacher) out.push(r); });
    NL.bots.list.forEach(b => out.push(b));
    return out;
  }
  let botView = [];
  const botPos = new Map();
  NL.helpers = { visibleOthers, allPeople, get remote() { return remote; }, get botView() { return botView; }, goScene, toast, setZoom: z => { zoom = z; }, get zoom() { return zoom; }, get baseZoom() { return baseZoom; } };

  // ---------- vòng lặp ----------
  let last = performance.now(), t = 0, sendAcc = 0, stepAcc = 0;
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now; t += dt;
    if (g.playing) update(dt, now);
    render(dt);
    requestAnimationFrame(frame);
  }

  function update(dt) {
    const s = NL.scenes[g.scene];
    const frozen = NL.lab.isOpen || NL.elevator.isOpen() || g.inElev || !$('tutorial').classList.contains('hidden') || !$('bigmsg').classList.contains('hidden') || (g.teacher && NL.teacher.filming);
    // hướng đi từ bàn phím / cần điều khiển
    let mx = 0, my = 0;
    if (!frozen) {
      let kx = 0, ky = 0;
      if (keys.arrowup || keys.w) ky -= 1; if (keys.arrowdown || keys.s) ky += 1;
      if (keys.arrowleft || keys.a) kx -= 1; if (keys.arrowright || keys.d) kx += 1;
      if (joy.on) { kx = joy.dx; ky = joy.dy; }
      if (kx || ky) { mx = kx + ky; my = ky - kx; const m = Math.hypot(mx, my); mx /= m; my /= m; const mag = joy.on ? Math.min(1, Math.hypot(joy.dx, joy.dy) * 1.3) : 1; mx *= mag; my *= mag; g.path = null; g.pendingBench = null; g.pendingElev = false; g.followId = null; }
    }
    const SPEED = 3.2;
    let moving = false;
    if (mx || my) {
      const nx = g.x + mx * SPEED * dt, ny = g.y + my * SPEED * dt;
      if (NL.walkable(s, nx, ny)) { g.x = nx; g.y = ny; moving = true; }
      else if (NL.walkable(s, nx, g.y)) { g.x = nx; moving = true; }
      else if (NL.walkable(s, g.x, ny)) { g.y = ny; moving = true; }
      if (Math.abs(mx - my) > 0.05) g.facing = (mx - my) > 0 ? 1 : -1;
    } else if (g.path && g.path.length && !frozen) {
      const tg = g.path[0], dx = tg.x - g.x, dy = tg.y - g.y, d = Math.hypot(dx, dy), sp = SPEED * dt;
      if (d <= sp) { g.x = tg.x; g.y = tg.y; g.path.shift(); } else { g.x += dx / d * sp; g.y += dy / d * sp; }
      if (Math.abs(dx - dy) > 0.02) g.facing = (dx - dy) > 0 ? 1 : -1;
      moving = true;
      if (!g.path.length) { g.path = null; if (g.pendingElev) enterElevator(); else if (g.pendingBench) { const e = g.pendingBench; g.pendingBench = null; openLab(e); } }
    }
    if (moving) { g.lastMove = Date.now(); g.danceT = 0; stepAcc += dt; if (stepAcc > 0.32) { stepAcc = 0; NL.audio.play('step'); } }
    if (g.danceT > 0) { g.danceT -= dt; if (g.danceT <= 0) NL.audio.music('calm'); }
    g.anim = moving ? 'walk' : g.help ? 'jump' : g.danceT > 0 ? (g.danceKind === 'special' ? 'special' : 'dance') : 'idle';
    if (g.emote) { g.emoteT += dt; if (g.emoteT > 2.4) g.emote = null; }
    if (clickMark) { clickMark.t += dt; if (clickMark.t > 0.6) clickMark = null; }

    // chạm vùng kích hoạt
    if (!frozen) s.triggers.forEach(tr => {
      const inside = inRect(tr, g.x, g.y), was = insideTrig.has(tr);
      if (inside && !was) { insideTrig.add(tr); onTrigger(tr); }
      if (!inside && was) { insideTrig.delete(tr); if (tr.type === 'bench') { benchPrompt(false); setGuide(null); } }
    });

    // học sinh ảo
    NL.bots.update(dt, Date.now());
    botView = NL.bots.list.map(b => {
      const p = botPos.get(b.id) || { rx: b.x, ry: b.y, scene: b.scene };
      if (p.scene !== b.scene) { p.rx = b.x; p.ry = b.y; p.scene = b.scene; }
      p.rx = b.x; p.ry = b.y; botPos.set(b.id, p);
      return Object.assign({}, b, { rx: p.rx, ry: p.ry });
    });
    // làm mượt người chơi khác
    remote.forEach(r => { r.rx += (r.x - r.rx) * Math.min(1, dt * 10); r.ry += (r.y - r.ry) * Math.min(1, dt * 10); });

    if (g.teacher) NL.teacher.update(dt);

    sendAcc += dt;
    if (sendAcc > 0.1) { sendAcc = 0; NL.net.sendState(myState()); NL.net.prune(); }
  }

  function onTrigger(tr) {
    if (tr.type === 'goto') { NL.audio.play('door'); goScene(tr.to, tr.spawn); }
    else if (tr.type === 'elevator') { enterElevator(); }
    else if (tr.type === 'locked') { toast('Phòng này sắp có, quay lại sau nhé'); }
    else if (tr.type === 'bench' && !g.teacher) { if (!g.pendingBench) benchPrompt(true, tr.exp); }
    else if (tr.type === 'balcony') { if (!g.teacher) toast('🌤 Gió mát quá!', 1500); }
  }

  // ---------- vẽ ----------
  const clouds = Array.from({ length: 6 }, (_, k) => ({ x: Math.random() * 1600, y: 40 + k * 55 + Math.random() * 30, s: 0.6 + Math.random() * 0.8, v: 6 + Math.random() * 10 }));
  function drawSky(dt) {
    const gr = c.createLinearGradient(0, 0, 0, H);
    gr.addColorStop(0, '#8FD0F5'); gr.addColorStop(0.7, '#CDEBFC'); gr.addColorStop(1, '#EAF6FD');
    c.fillStyle = gr; c.fillRect(0, 0, W, H);
    c.fillStyle = 'rgba(255,255,255,.9)';
    clouds.forEach(cl => {
      cl.x += cl.v * dt; if (cl.x > W + 200) cl.x = -200;
      const x = cl.x, y = cl.y, s = cl.s;
      c.beginPath(); c.ellipse(x, y, 60 * s, 20 * s, 0, 0, 7); c.ellipse(x - 30 * s, y + 4 * s, 34 * s, 16 * s, 0, 0, 7); c.ellipse(x + 28 * s, y - 8 * s, 36 * s, 24 * s, 0, 0, 7); c.fill();
    });
    // mặt trời
    c.fillStyle = 'rgba(255,230,120,.9)'; c.beginPath(); c.arc(W - 90, 80, 34, 0, 7); c.fill();
    c.fillStyle = 'rgba(255,230,120,.25)'; c.beginPath(); c.arc(W - 90, 80, 52 + Math.sin(t * 2) * 4, 0, 7); c.fill();
  }

  let guidePath = null;
  function charDrawer(o, isSelf) {
    return () => {
      const p = NL.iso(o.rx !== undefined ? o.rx : o.x, o.ry !== undefined ? o.ry : o.y);
      const anim = o.anim || 'idle';
      NL.drawChar(c, p.x, p.y, o.teacher ? { hair: 1, hairColor: '#2B2B2B', coat: '#2F80C0' } : o.look, { t: t + (o.id ? o.id.length : 0), facing: o.facing, anim, teacher: o.teacher, emote: o.emote, help: o.help });
      const emo = o.emote && o.emote !== 'dance' && o.emote !== 'special' ? EMO_ICON[o.emote] : null;
      NL.drawTag(c, p.x, p.y, o.name + (isSelf ? ' (em)' : o.bot ? ' (ảo)' : ''), {
        self: isSelf, scale: isTouch ? Math.min(2, Math.max(1.3, 0.95 / zoom)) : 1,
        t, help: o.help, teacher: o.teacher, bubble: emo, bubbleAge: o.emoteT || 0,
        status: g.teacher && !o.teacher && o.status ? o.status : null, lift: anim === 'jump' ? 6 : 0
      });
    };
  }

  function render(dt) {
    c.setTransform(DPR, 0, 0, DPR, 0, 0);
    drawSky(dt);
    if (!g.playing) return;
    const s = NL.scenes[g.scene];
    // camera bám theo nhân vật (hoặc bạn được chọn)
    let fx = g.x, fy = g.y;
    if (s.camShift && !g.teacher) { fx += s.camShift.x; fy += s.camShift.y; }
    if (g.teacher) { const f = NL.teacher.focus(); if (f) { fx = f.x; fy = f.y; } }
    if (!g.teacher) { const zt = baseZoom * (s.camZoom || 1); zoom += (zt - zoom) * Math.min(1, dt * 4); if (fade === 1) zoom = zt; }
    const fp = NL.iso(fx, fy);
    const tx = W / 2 - fp.x * zoom, ty = H / 2 + 40 * zoom - fp.y * zoom;
    cam.x += (tx - cam.x) * Math.min(1, dt * 6); cam.y += (ty - cam.y) * Math.min(1, dt * 6);
    if (fade === 1) { cam.x = tx; cam.y = ty; }
    c.setTransform(DPR * zoom, 0, 0, DPR * zoom, DPR * cam.x, DPR * cam.y);

    const chars = [];
    visibleOthers().forEach(o => chars.push({ x: o.rx, y: o.ry, draw: charDrawer(o, false) }));
    if (!(g.teacher && NL.teacher.filming) && !g.inElev) chars.push({ x: g.x, y: g.y, draw: charDrawer(Object.assign({}, g, { id: 'self' }), !g.teacher) });
    NL.drawScene(c, s, t, chars);

    if (clickMark) {
      const p = NL.iso(clickMark.x, clickMark.y); const k = clickMark.t / 0.6;
      c.strokeStyle = `rgba(47,128,192,${1 - k})`; c.lineWidth = 3;
      c.beginPath(); c.ellipse(p.x, p.y, 10 + k * 16, 5 + k * 8, 0, 0, 7); c.stroke();
    }
    // mũi tên dẫn đường
    const gd = nextGuide();
    if (gd && !insideTrig.size && !g.inElev) {
      // lần đầu: tô sáng đường đi tới chỗ cần đến
      if (!g.order.length && (g.scene === 'outside' || g.scene === 'lobby')) {
        if (!guidePath || t - guidePath.t > 0.4) guidePath = { t, pts: NL.findPath(s, g.x, g.y, gd.x, gd.y) || [] };
        guidePath.pts.forEach((q, k) => { if (k % 2) return; const p = NL.iso(q.x, q.y); c.fillStyle = `rgba(255,213,74,${0.55 + 0.35 * Math.sin(t * 5 - k * 0.5)})`; c.beginPath(); c.ellipse(p.x, p.y, 9, 4.5, 0, 0, 7); c.fill(); });
      }
      const p = NL.iso(gd.x, gd.y); NL.drawArrow(c, p.x, p.y, t);
    }
    c.setTransform(DPR, 0, 0, DPR, 0, 0);
    if (fade > 0) {
      c.fillStyle = `rgba(255,255,255,${fade})`; c.fillRect(0, 0, W, H);
      if (fade > 0.4 && g.scene === 'outside') { c.fillStyle = `rgba(31,78,121,${fade})`; c.font = "800 22px 'Baloo 2', sans-serif"; c.textAlign = 'center'; c.fillText('Đang mở cửa…', W / 2, H / 2); }
      fade = Math.max(0, 1 - (performance.now() - fadeAt) / 450);
    }
  }

  // ---------- khởi động ----------
  NL.net.init(id => { g.id = id; }, wantTeacher);
  if (wantTeacher) {
    // Cô đăng nhập bằng tài khoản Firebase (email + mật khẩu); không có mật khẩu nào nằm trong code.
    $('intro').classList.add('hidden');
    $('login').classList.remove('hidden');
    const local = !NL.net.hasFirebase();
    if (local) { $('loginEmail').classList.add('hidden'); $('loginPass').classList.add('hidden'); $('loginErr').textContent = 'Đang chạy thử trên một máy (không có mạng lớp học)'; }
    setTimeout(() => (local ? $('loginName') : $('loginEmail')).focus(), 200);
    const enterTeacher = () => {
      $('login').classList.add('hidden');
      NL.audio.init(); NL.audio.music('calm');
      const nm = ($('loginName').value.trim() || 'Cô Linh').slice(0, 14);
      g.teacher = true; g.name = nm; g.look = { hair: 1, hairColor: '#2B2B2B', coat: '#2F80C0' };
      g.tut.elevator = 1;
      $('hud').classList.remove('hidden'); $('btnHelp').classList.add('hidden');
      document.querySelectorAll('.emo').forEach(b => { if (b.dataset.emo === 'special') b.classList.remove('locked'); });
      g.unlocked = true; g.playing = true;
      goScene('lobby', 'fromElev');
      NL.teacher.init();
      if (isTouch) $('joy').classList.add('on');
    };
    let busy = false;
    $('loginForm').addEventListener('submit', e => {
      e.preventDefault();
      if (local) { enterTeacher(); return; }
      if (busy) return;
      const email = $('loginEmail').value.trim(), pass = $('loginPass').value;
      if (!email || !pass) { $('loginErr').textContent = 'Nhập email và mật khẩu nhé'; return; }
      busy = true; $('loginErr').textContent = 'Đang kiểm tra…';
      NL.net.teacherLogin(email, pass).then(enterTeacher).catch(err => {
        busy = false;
        const code = (err && (err.code || err.message)) || '';
        $('loginErr').textContent = code === 'not-teacher' ? 'Tài khoản này chưa có quyền điều hành'
          : /network/.test(code) ? 'Mất mạng, thử lại nhé'
          : /too-many/.test(code) ? 'Thử sai nhiều quá, đợi một lát nhé'
          : 'Sai email hoặc mật khẩu';
      });
    });
  } else intro();
  requestAnimationFrame(frame);
})();
