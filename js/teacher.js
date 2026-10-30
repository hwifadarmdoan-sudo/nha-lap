// Màn điều hành của cô Linh, thầy Kiên: danh sách, theo dõi, đến giúp, gọi về, học sinh ảo, quay phim.
window.NL = window.NL || {};
NL.teacher = (function () {
  const $ = id => document.getElementById(id);
  const LABS = NL.EXPERIMENTS.filter(e => e.ready);
  const pn = e => (e.floor === 4 ? 'P' + e.no : e.id);
  const FLOORS = [['outside', 'Ngoài'], ['lobby', 'T1'], ['f4', 'T4 Sinh']].concat(LABS.filter(e => e.floor === 4).map(e => ['lab-' + e.id, pn(e) + ' ' + e.short]), [['f3', 'T3 Hóa']], LABS.filter(e => e.floor === 3).map(e => ['lab-' + e.id, pn(e) + ' ' + e.short]), [['f2', 'T2 Lý']]);
  const SCENE_SHORT = Object.assign({ outside: 'Ngoài', lobby: 'T1', f2: 'T2', f3: 'T3', f4: 'T4' }, Object.fromEntries(LABS.map(e => ['lab-' + e.id, pn(e)])));
  const IDLE_MS = 3 * 60 * 1000;
  let acc = 0, filming = false, filmT = 0, filmIdx = 0, knownHelp = new Set(), alertTarget = null;
  const FILM = ['outside', 'lobby', 'f4'].concat(LABS.flatMap(e => ['lab-' + e.id, 'f4']));

  function people() {
    const h = NL.helpers, out = [];
    h.remote.forEach(r => { if (NL.net.peers.has(r.id) && !r.teacher) out.push(r); });
    h.botView.forEach(b => out.push(b));
    return out;
  }

  function init() {
    $('teacher').classList.remove('hidden');
    $('tFloors').innerHTML = FLOORS.map(([id, nm]) => `<button data-s="${id}">${nm}</button>`).join('');
    $('tFloors').querySelectorAll('button').forEach(b => b.onclick = () => { NL.audio.play('click'); NL.game.followId = null; NL.helpers.goScene(b.dataset.s, 'fromElev'); });
    const z = $('tZoom'); z.value = (NL.helpers.baseZoom * 0.8).toFixed(2); NL.helpers.setZoom(+z.value);
    z.oninput = () => NL.helpers.setZoom(+z.value);
    $('tRecall').onclick = () => {
      NL.audio.play('pop'); NL.net.sendEvent({ type: 'recall' });
      NL.helpers.toast('📣 Đã gọi cả lớp về sảnh');
    };
    $('tBots').onclick = () => { NL.bots.enabled = !NL.bots.enabled; NL.net.sendEvent({ type: 'bots', on: NL.bots.enabled }); syncBots(); NL.audio.play('click'); };
    $('tFilm').onclick = () => film(true);
    $('tToggle').onclick = () => $('teacher').classList.toggle('collapsed');
    $('tAlert').onclick = () => { if (alertTarget) follow(alertTarget); $('tAlert').classList.add('hidden'); };
    $('tResBtn').onclick = () => { NL.audio.play('click'); collect(); showRes(); };
    $('tResClose').onclick = () => $('tRes').classList.add('hidden');
    $('tResCsv').onclick = csv;
    $('tResClear').onclick = () => { if (confirm('Xóa toàn bộ kết quả đã gom trên máy này?')) { store = {}; save(); showRes(); } };
    // nút cảm xúc của giáo viên vẫn dùng được; bàn phím + chuột để đi
    syncBots(); render();
  }
  // ---------- kết quả cả lớp: gom từ trạng thái các em gửi lên, giữ lại trên máy cô kể cả khi em đã thoát ----------
  const KEY = 'nl-class-results';
  let store = (() => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } })();
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) { /* không lưu được */ } };
  function collect() {
    let changed = false;
    NL.helpers.remote.forEach(r => {
      if (r.teacher || !r.res) return;
      const cur = store[r.id] || { name: r.name, labs: {} };
      cur.name = r.name;
      Object.keys(r.res).forEach(id => { if (cur.labs[id] !== r.res[id]) { cur.labs[id] = r.res[id]; changed = true; } });
      store[r.id] = cur;
    });
    if (changed) save();
  }
  const parse = v => { const [sc, w] = String(v).split('|'); return { sc, wrong: w ? w.split('~') : [] }; };
  const qText = (id, w) => /^\d+$/.test(w) && NL.QUIZ[id] && NL.QUIZ[id][+w] ? NL.QUIZ[id][+w].q : w;
  function showRes() {
    const rows = Object.values(store).sort((a, b) => a.name.localeCompare(b.name, 'vi'));
    const esc = NL.report.esc;
    $('tResTable').innerHTML = rows.length ? `<table><tr><th>Học sinh</th>${LABS.map(e => `<th title="${esc(e.name)}">P${e.no}</th>`).join('')}<th>Xong</th></tr>${rows.map(r => `<tr><td>${esc(r.name)}</td>${LABS.map(e => `<td>${r.labs[e.id] ? parse(r.labs[e.id]).sc : ''}</td>`).join('')}<td>${Object.keys(r.labs).length}/${LABS.length}</td></tr>`).join('')}</table>`
      : '<div class="jump-note">Chưa có em nào làm xong thí nghiệm.</div>';
    const miss = {};
    rows.forEach(r => Object.keys(r.labs).forEach(id => parse(r.labs[id]).wrong.forEach(w => { const k = id + '|' + w; miss[k] = (miss[k] || 0) + 1; })));
    const top = Object.entries(miss).sort((a, b) => b[1] - a[1]).slice(0, 8);
    $('tResMiss').innerHTML = top.length ? '<b>Câu nhiều em sai nhất</b><ol>' + top.map(([k, n]) => { const [id, w] = k.split('|'); const e = LABS.find(x => x.id === id); return `<li><b>P${e ? e.no : id}</b> · ${esc(qText(id, w))} <span class="rep-sub">(${n} em sai)</span></li>`; }).join('') + '</ol>' : '';
    $('tRes').classList.remove('hidden');
  }
  function csv() {
    const q = v => '"' + String(v).replace(/"/g, '""') + '"';
    const head = ['Học sinh'].concat(LABS.map(e => `P${e.no} ${e.short}`), ['Câu sai']);
    const lines = [head.map(q).join(',')].concat(Object.values(store).map(r => [r.name].concat(LABS.map(e => r.labs[e.id] ? parse(r.labs[e.id]).sc : ''),
      [Object.keys(r.labs).flatMap(id => parse(r.labs[id]).wrong.map(w => id + ': ' + qText(id, w))).join(' / ')]).map(q).join(',')));
    const url = URL.createObjectURL(new Blob(['\ufeff' + lines.join('\n')], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = 'ket-qua-nha-lap-' + new Date().toISOString().slice(0, 10) + '.csv'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  function syncBots() { $('tBots').textContent = '🤖 Học sinh ảo: ' + (NL.bots.enabled ? 'bật' : 'tắt'); }

  function follow(id) {
    const p = people().find(x => x.id === id); if (!p) return;
    if (p.scene !== NL.game.scene) NL.helpers.goScene(p.scene, NL.scenes[p.scene].spawns.fromElev ? 'fromElev' : 'default');
    NL.game.followId = id;
    NL.helpers.toast(`${p.name}${p.bot ? ' (ảo)' : ''} · ${p.help ? '🆘 ' + (p.helpReason || 'Cần giúp') : (p.status || 'Đang đi dạo')}`, 3500);
  }

  function render() {
    const list = people(), now = Date.now();
    $('tCount').textContent = `· ${list.length} học sinh`;
    $('tFloors').querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.s === NL.game.scene));
    list.sort((a, b) => (b.help - a.help) || a.name.localeCompare(b.name, 'vi'));
    $('tList').innerHTML = list.map(p => {
      const idle = !p.help && now - (p.lastMove || now) > IDLE_MS && !p.status;
      const st = p.help ? '🆘 ' + (p.helpReason || 'Cần giúp') : (p.status || (idle ? 'Đứng yên lâu' : 'Đang đi dạo'));
      return `<div class="t-row ${p.help ? 'help' : ''} ${idle ? 'idle' : ''}" data-id="${p.id}"><span class="dot"></span><span class="nm">${NL.report.esc(p.name)}${p.bot ? ' <small style="color:#9AB">ảo</small>' : ''}</span><span class="st">${SCENE_SHORT[p.scene] || ''}<br>${NL.report.esc(st).slice(0, 34)}</span></div>`;
    }).join('') || '<div style="padding:10px;color:#6C88A3;font-weight:700">Chưa có học sinh nào vào</div>';
    $('tList').querySelectorAll('.t-row').forEach(r => r.onclick = () => { NL.audio.play('click'); follow(r.dataset.id); });
  }

  function update(dt) {
    acc += dt;
    const g = NL.game, list = people();
    // đến gần em đang kêu cứu thì gỡ cờ và gửi gợi ý
    list.forEach(p => {
      if (!p.help || p.scene !== g.scene) return;
      if (Math.hypot(p.rx - g.x, p.ry - g.y) < 1.6) {
        if (p.bot) NL.bots.resolveHelp(p.id);
        else NL.net.sendEvent({ type: 'resolve', target: p.id, name: g.name });
        p.help = false;
        NL.helpers.toast(`Đang giúp ${p.name} 💬`);
      }
    });
    // báo khi có em mới kêu cứu
    list.forEach(p => {
      if (p.help && !knownHelp.has(p.id)) {
        knownHelp.add(p.id); alertTarget = p.id;
        const a = $('tAlert'); a.textContent = `🆘 ${p.name} cần giúp · ${SCENE_SHORT[p.scene]} · bấm để tới`; a.classList.remove('hidden');
        NL.audio.play('help');
      }
      if (!p.help) knownHelp.delete(p.id);
    });
    if (acc > 0.5) { acc = 0; render(); collect(); }
    if (filming) {
      filmT += dt;
      if (filmT > 7) { filmT = 0; filmIdx = (filmIdx + 1) % FILM.length; NL.helpers.goScene(FILM[filmIdx], 'default'); }
      NL.helpers.setZoom(NL.helpers.baseZoom * 0.95 * (NL.scenes[g.scene].camZoom || 1));
    }
  }

  function focus() {
    const g = NL.game;
    if (filming) {
      const s = NL.scenes[g.scene], k = filmT / 7;
      return s.outdoor ? { x: 6 + 3 * k, y: 7 - 2 * k } : { x: s.w * (0.3 + 0.4 * k), y: s.d * (0.65 - 0.25 * k) };
    }
    if (!g.followId) return null;
    const p = people().find(x => x.id === g.followId);
    if (!p || p.scene !== g.scene) return null;
    return { x: p.rx, y: p.ry };
  }

  function film(on) {
    filming = on; document.body.classList.toggle('film', on);
    if (on) {
      if (!NL.bots.enabled) { NL.bots.enabled = true; NL.net.sendEvent({ type: 'bots', on: true }); syncBots(); }
      filmT = 0; filmIdx = 0; NL.helpers.goScene(FILM[0], 'default');
      NL.helpers.setZoom(NL.helpers.baseZoom * 0.95);
      NL.audio.music('calm');
      NL.helpers.toast('🎬 Chạm màn hình hoặc bấm Esc để thoát', 2500);
    } else NL.helpers.setZoom(+$('tZoom').value);
  }

  return { init, update, focus, film, syncBots, get filming() { return filming; } };
})();
