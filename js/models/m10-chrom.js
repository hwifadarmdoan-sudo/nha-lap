// Mô hình 10: Đột biến cấu trúc NST. Mất đoạn, lặp đoạn, đảo đoạn (có / không chứa tâm động), chuyển đoạn (cùng NST / không tương hỗ / tương hỗ); hoạt cảnh đứt – xoay – nối, tự cắt và kéo thả, bảng tóm tắt, lưu ảnh, xuất PDF.
(function () {
  const GC = { A: 0xE5534B, B: 0xF28C28, C: 0xF2C230, D: 0x7BC043, E: 0x2BB3A6, F: 0x3E8EDE, G: 0x7A5BD6, H: 0xD158A8, M: 0x8D6E63, N: 0xA1887F, O: 0x5C9EAD, P: 0x9CCC65, Q: 0xFFB74D, R: 0x90A4AE };
  const CEN = 0xFF4FA3;
  const FACT = {
    del: { t: 'Mất đoạn', q: 'Thiếu gene → mất cân bằng hệ gene, thường gây chết hoặc giảm sức sống', ex: 'Mất đoạn nhánh ngắn NST số 5 ở người gây hội chứng tiếng mèo kêu (cri du chat); mất đoạn nhỏ ở NST 21 làm giảm sức sống. Ứng dụng: loại bỏ gene không mong muốn ở cây trồng.' },
    dup: { t: 'Lặp đoạn', q: 'Thừa gene (tăng số bản sao) → tăng hoặc giảm mức biểu hiện tính trạng', ex: 'Lặp đoạn ở đại mạch làm tăng hoạt tính enzyme amylase, có lợi cho công nghiệp sản xuất bia. Lặp đoạn tạo nguyên liệu cho tiến hóa (gene mới).' },
    inv: { t: 'Đảo đoạn', q: 'Không mất, không thừa gene; thay đổi trật tự gene → có thể thay đổi mức hoạt động của gene', ex: 'Đảo đoạn góp phần tăng sự đa dạng giữa các thứ, các nòi trong cùng một loài (ví dụ ở ruồi giấm, muỗi), là nguyên liệu cho tiến hóa.' },
    tra: { t: 'Chuyển đoạn', q: 'Thay đổi nhóm gene liên kết; chuyển đoạn lớn thường giảm khả năng sinh sản', ex: 'Chuyển đoạn giữa NST 9 và 22 tạo NST Philadelphia gây ung thư máu tủy mãn tính (CML). Ứng dụng: chuyển gene mong muốn giữa các loài, tạo dòng côn trùng bất thụ để phòng trừ sâu hại.' }
  };

  let mode = 'del', sub = 'peri', tsub = 'recip', speed = 1, playing = true, manual = false, tool = 'cut';
  let log = [], last = null;
  const sm = x => x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x);
  const seqStr = rows => rows.map(r => r.filter(Boolean).map(u => u.c ? '●' : u.g).join('-')).join('  |  ');

  // ---------- kịch bản: các trạng thái liên tiếp ----------
  function tok(g, extra) { return Object.assign({ uid: Math.random().toString(36).slice(2), g, c: g === '●' }, extra || {}); }
  function scenario() {
    const T = s => s.split(' ').map(g => tok(g));
    let init, fin, moving = [], drop = [], flip = [], spawn = [], label;
    if (mode === 'del') { init = [T('A B C D ● E F G H')]; const r = init[0]; drop = [r[2], r[3]]; fin = [[r[0], r[1], r[4], r[5], r[6], r[7], r[8]]]; label = 'Mất đoạn C – D'; }
    else if (mode === 'dup') { init = [T('A B C D ● E F G H')]; const r = init[0]; const b2 = tok('B', { src: r[1] }), c2 = tok('C', { src: r[2] }); spawn = [b2, c2]; fin = [[r[0], r[1], r[2], b2, c2, ...r.slice(3)]]; label = 'Lặp đoạn B – C'; }
    else if (mode === 'inv') {
      if (sub === 'peri') { init = [T('A B C D ● E F G H')]; const r = init[0]; moving = flip = [r[2], r[3], r[4], r[5]]; fin = [[r[0], r[1], r[5], r[4], r[3], r[2], r[6], r[7], r[8]]]; label = 'Đảo đoạn C – D – E (chứa tâm động)'; }
      else { init = [T('A ● B C D E F G H')]; const r = init[0]; moving = flip = [r[3], r[4], r[5]]; fin = [[r[0], r[1], r[2], r[5], r[4], r[3], r[6], r[7], r[8]]]; label = 'Đảo đoạn C – D – E (không chứa tâm động)'; }
    } else {
      if (tsub === 'same') { init = [T('A B C ● D E F')]; const r = init[0]; moving = [r[0], r[1]]; fin = [[r[2], r[3], r[4], r[0], r[1], r[5], r[6]]]; label = 'Chuyển đoạn A – B trên cùng NST'; }
      else if (tsub === 'nonrec') { init = [T('A B C ● D E F'), T('M N O ● P Q R')]; const a = init[0], b = init[1]; moving = [a[0], a[1]]; fin = [a.slice(2), [...b, a[0], a[1]]]; label = 'Chuyển đoạn không tương hỗ A – B sang NST 2'; }
      else { init = [T('A B C ● D E F'), T('M N O ● P Q R')]; const a = init[0], b = init[1]; moving = [a[0], a[1], b[0], b[1]]; fin = [[b[0], b[1], ...a.slice(2)], [a[0], a[1], ...b.slice(2)]]; label = 'Chuyển đoạn tương hỗ A – B ↔ M – N'; }
    }
    const mv = new Set([...moving, ...drop].map(t => t.uid)), sp = new Set(spawn.map(t => t.uid));
    // S1: chèn khoảng hở quanh các đoạn bị đứt
    const gapped = rows => rows.map(r => { const o = []; r.forEach((t, i) => { const prev = r[i - 1]; const srcMv = x => mv.has(x.uid) || spawn.some(s => s.src === x); if (i && srcMv(t) !== srcMv(prev)) o.push(null); o.push(t); }); return o; });
    const S1 = gapped(init);
    const lifts = [];
    S1.forEach((r, ri) => r.forEach((t, i) => { if (t && moving.includes(t)) lifts.push({ u: t, row: ri, at: i }); spawn.forEach(s => { if (t && s.src === t) lifts.push({ u: s, row: ri, at: i, grow: true }); }); }));
    const S2rows = S1.map(r => r.map(t => t && moving.includes(t) ? null : t));
    const S3rows = fin.map(r => r.map(t => moving.includes(t) || sp.has(t.uid) ? null : t));
    const finLift = []; fin.forEach((r, ri) => r.forEach((t, i) => { if (moving.includes(t) || sp.has(t.uid)) finLift.push({ u: t, row: ri, at: i }); }));
    const lasers = []; S1.forEach((r, ri) => r.forEach((t, i) => { if (!t) lasers.push({ row: ri, at: i }); }));
    const all = [...init.flat(), ...spawn];
    return {
      label, all, init, fin, flip: new Set(flip.map(t => t.uid)),
      states: [
        { rows: init, over: [], cap: 'NST ban đầu' },
        { rows: S1, over: [], lasers, cap: 'Xuất hiện các điểm đứt gãy (tia laser cắt)', snd: 'cut' },
        { rows: S2rows, over: lifts, drop: drop.map(t => t.uid), cap: drop.length ? 'Đoạn bị đứt rơi ra ngoài và bị tiêu hủy' : spawn.length ? 'Đoạn B – C được nhân đôi' : 'Đoạn đứt tách khỏi NST', snd: flip.length ? 'twist' : null },
        { rows: S3rows, over: finLift, drop: drop.map(t => t.uid), flipOn: true, cap: flip.length ? 'Đoạn quay ngược 180°' : 'Đoạn di chuyển tới vị trí mới' },
        { rows: fin, over: [], drop: drop.map(t => t.uid), flipOn: true, cap: 'Các đoạn nối lại: NST đột biến', snd: 'join' }
      ]
    };
  }

  function build(api) {
    const T = api.T, V = api.V;
    let sc = scenario();
    const meshes = new Map();
    const mkTok = t => {
      const g = api.group();
      if (t.c) { const m = api.sphere(0.3, api.mat(CEN, { emissive: CEN, emissiveIntensity: 0.25 }), null, g, 20); api.part(m, { name: 'Tâm động', sci: 'Centromere', rows: [['Vai trò', 'Nơi đính thoi phân bào, giúp NST di chuyển về 2 cực'], ['Vị trí', 'Eo thứ nhất, chia NST thành 2 cánh']] }); }
      else {
        const m = api.mesh(new T.CapsuleGeometry(0.42, 0.5, 6, 18), api.mat(GC[t.g], { roughness: 0.45, emissive: GC[t.g], emissiveIntensity: 0.05 }), null, g); m.rotation.z = Math.PI / 2;
        api.part(m, { name: `Gene ${t.g}`, sci: 'Gene band', rows: [['Trên', 'xyz'.includes(t.g) ? '' : (('MNOPQR'.includes(t.g)) ? 'NST số 2' : 'NST số 1')], ['Lưu ý', 'Mỗi băng màu đại diện cho một gene hoặc một nhóm gene']] });
        const ar = api.mesh(new T.ConeGeometry(0.12, 0.3, 10), api.mat(0xFFFFFF), [0.05, 0, 0.42], g); ar.rotation.z = -Math.PI / 2; ar.userData.noPick = true;
        const sp = api.textSprite(t.g, { h: 0.55, parent: g, pos: [0, 0.82, 0], color: '#FFFFFF', bg: 'rgba(15,30,50,.7)' }); sp.userData.noPick = true;
      }
      g.userData.t = t; g.scale.setScalar(0.001); meshes.set(t.uid, g); return g;
    };
    const ensure = () => sc.all.forEach(t => { if (!meshes.has(t.uid)) mkTok(t); });
    ensure();
    const rowY = (ri, n) => n === 1 ? 0 : ri === 0 ? 1.5 : -1.5;
    const xAt = (r, at) => (at - (r.length - 1) / 2) * 1.0;
    const laserG = api.group(); const lasers = [];
    for (let k = 0; k < 6; k++) { const m = api.mesh(new T.CylinderGeometry(0.03, 0.03, 2.4, 6), api.mat(0xFF3B5C, { emissive: 0xFF3B5C, emissiveIntensity: 1.6, opacity: 0.9 }), null, laserG); m.visible = false; m.userData.noPick = true; lasers.push(m); }
    const rowLab = [api.label('NST số 1', [-6.2, 1.5, 0], { cls: 'tag', color: '#2A8BD8' }), api.label('NST số 2', [-6.2, -1.5, 0], { cls: 'tag', color: '#8D6E63' })];
    const seqLab = api.label('', [2.5, -3.4, 0], { cls: 'plain' });
    // trạng thái hiển thị
    let si = 0, u = 0, slow = 1, cutMarks = new Set(), sel = null, manRows = null, dropped = new Set(), dragging = null;
    const targetOf = () => {
      const tgt = new Map();
      const S = manual ? { rows: manRows, over: [], drop: [...dropped], flipOn: true } : sc.states[si];
      const n = S.rows.length;
      S.rows.forEach((r, ri) => r.forEach((t, i) => { if (t) tgt.set(t.uid, { x: xAt(r, i), y: rowY(ri, n), s: 1 }); }));
      (S.over || []).forEach(o => { const r = S.rows[o.row]; tgt.set(o.u.uid, { x: xAt(r, o.at), y: rowY(o.row, n) + 1.5, s: 1 }); });
      return { tgt, S };
    };
    const reflow = () => { const { S } = targetOf(); const n = S.rows.length; rowLab[0].el.style.display = n > 1 ? '' : 'none'; rowLab[1].el.style.display = n > 1 ? '' : 'none'; seqLab.el.innerHTML = seqStr(S.rows.map(r => r.filter(Boolean))); };
    reflow();
    const step = () => {
      if (si >= sc.states.length - 1) return; si++; u = 0; const S = sc.states[si];
      if (S.snd === 'cut') { api.noise(0.06, 0.25, 3500); api.beep(1800, 0.04, 'square', 0.05); }
      if (S.snd === 'twist') { api.beep(300, 0.4, 'sawtooth', 0.04); api.beep(500, 0.4, 'sawtooth', 0.03, 0.15); }
      if (S.snd === 'join') { api.beep(880, 0.06, 'square', 0.06); api.beep(1320, 0.1, 'sine', 0.06, 0.06); }
      reflow();
      if (si === sc.states.length - 1) record(sc.label, sc.init, sc.fin, mode);
    };
    const reset = () => { si = 0; u = 0; manual = false; manRows = null; dropped.clear(); cutMarks.clear(); sel = null; meshes.forEach(g => g.parent && g.parent.remove(g)); meshes.clear(); sc = scenario(); ensure(); reflow(); };
    api.onFrame(dt => {
      if (!manual && playing && si < sc.states.length - 1) { u += dt * speed * slow / 1.3; if (u >= 1) step(); }
      const { tgt, S } = targetOf();
      const k = Math.min(1, dt * 6 * Math.max(0.4, speed * slow));
      meshes.forEach((g, uid) => {
        if (dragging && dragging.uids.includes(uid)) return;
        const t = g.userData.t, d = tgt.get(uid), drp = (S.drop || []).includes(uid);
        if (drp) { g.position.y -= dt * 1.6; g.rotation.z += dt * 1.5; g.scale.multiplyScalar(1 - dt * 0.9); g.visible = g.scale.x > 0.05; return; }
        g.visible = true;
        if (!d) { g.scale.setScalar(Math.max(0.001, g.scale.x * (1 - k))); return; }
        if (g.scale.x < 0.01 && t.src) { const sm_ = meshes.get(t.src.uid); if (sm_) g.position.copy(sm_.position); }
        g.position.x += (d.x - g.position.x) * k; g.position.y += (d.y - g.position.y) * k;
        g.scale.setScalar(g.scale.x + (d.s - g.scale.x) * k);
        const flipped = manual ? !!t.flip : (S.flipOn && sc.flip.has(uid));
        const tr = flipped ? Math.PI : 0; g.rotation.y += (tr - g.rotation.y) * k; g.rotation.z += (0 - g.rotation.z) * k;
        const isSel = sel && sel.includes(uid); g.children.forEach(c => { if (c.material && c.material.emissive && !c.userData.noPick) c.material.emissiveIntensity = isSel ? 0.6 : 0.05; });
      });
      // laser và vết cắt
      lasers.forEach(m => m.visible = false);
      if (!manual && S.lasers) S.lasers.forEach((l, k2) => { const m = lasers[k2]; if (!m) return; const r = S.rows[l.row]; m.visible = true; m.position.set(xAt(r, l.at), rowY(l.row, S.rows.length), 0); m.material.opacity = 0.5 + 0.5 * Math.abs(Math.sin(api.time * 12)); });
      if (manual) [...cutMarks].slice(0, 6).forEach((c, k2) => { const [ri, i] = c.split(':').map(Number), r = manRows[ri]; if (!r) return; const m = lasers[k2]; m.visible = true; m.position.set(xAt(r, i + 0.5), rowY(ri, manRows.length), 0); m.material.opacity = 0.8; });
      api.caption(manual ? (tool === 'cut' ? 'Chạm vào một gene để đặt / bỏ vết cắt bên phải gene đó' : 'Chạm chọn một đoạn, kéo thả sang vị trí mới; kéo xuống thật thấp để bỏ đoạn') : `${sc.label} · ${sc.states[si].cap}`);
    });
    // ---------- tự cắt và kéo thả ----------
    const segOf = (ri, i) => { const r = manRows[ri]; let a = i, b = i; while (a > 0 && !cutMarks.has(`${ri}:${a - 1}`)) a--; while (b < r.length - 1 && !cutMarks.has(`${ri}:${b}`)) b++; return { ri, a, b }; };
    const locate = uid => { for (let ri = 0; ri < manRows.length; ri++) { const i = manRows[ri].findIndex(t => t.uid === uid); if (i >= 0) return [ri, i]; } return null; };
    const startManual = () => { manual = true; manRows = sc.states[si === sc.states.length - 1 ? si : 0].rows.map(r => r.filter(Boolean).map(t => t)); if (si !== sc.states.length - 1) { /* bắt đầu từ NST ban đầu */ } cutMarks.clear(); sel = null; dropped.clear(); reflow(); };
    const before = () => manRows.map(r => r.slice());
    const commit = (name, b4, m) => { record(name, b4, manRows, m); cutMarks.clear(); sel = null; reflow(); };
    meshes.forEach(g => api.draggable(g, {
      normal: new T.Vector3(0, 0, 1),
      start(p) { if (!manual) return; this.p0 = p.clone(); this.moved = false; const loc = locate(g.userData.t.uid); if (!loc) return; if (tool === 'drag' && sel && sel.includes(g.userData.t.uid)) { dragging = { uids: sel.slice(), off: sel.map(uid => meshes.get(uid).position.clone().sub(p)) }; } },
      move(p) { if (!manual || !dragging) return; this.moved = true; dragging.uids.forEach((uid, k) => meshes.get(uid).position.copy(p.clone().add(dragging.off[k])).setZ(0.6)); },
      end() {
        if (!manual) return;
        const uid = g.userData.t.uid, loc = locate(uid);
        if (dragging && this.moved) {
          const p = meshes.get(dragging.uids[0]).position, b4 = before(), seg = dragging.uids.map(id => { const [ri, i] = locate(id); return manRows[ri][i]; });
          const from = locate(dragging.uids[0])[0];
          manRows.forEach((r, ri) => manRows[ri] = r.filter(t => !dragging.uids.includes(t.uid)));
          const n = manRows.length, lowest = rowY(n - 1, n);
          if (p.y < lowest - 2.2) { seg.forEach(t => dropped.add(t.uid)); dragging = null; api.noise(0.06, 0.2, 3000); commit('Mất đoạn (tự làm)', b4, 'del'); return; }
          let ri = 0, best = 1e9; manRows.forEach((r, k) => { const dy = Math.abs(rowY(k, n) - p.y); if (dy < best) { best = dy; ri = k; } });
          const r = manRows[ri]; let at = r.length; for (let i = 0; i < r.length; i++) { if (p.x < xAt(r.concat(seg), i)) { at = i; break; } }
          r.splice(at, 0, ...seg); dragging = null; api.beep(880, 0.06, 'square', 0.06);
          commit(ri === from ? 'Chuyển đoạn trên cùng NST (tự làm)' : 'Chuyển đoạn sang NST khác (tự làm)', b4, 'tra'); return;
        }
        dragging = null;
        if (!loc) return;
        if (tool === 'cut') { const key = `${loc[0]}:${loc[1]}`; if (loc[1] < manRows[loc[0]].length - 1) { if (cutMarks.has(key)) cutMarks.delete(key); else { cutMarks.add(key); api.noise(0.05, 0.2, 3500); } } }
        else { const s = segOf(loc[0], loc[1]); sel = manRows[s.ri].slice(s.a, s.b + 1).map(t => t.uid); api.beep(660, 0.05, 'sine', 0.06); }
      }
    }));
    const opSel = (name, fn) => { if (!manual) { api.toast('Bật chế độ "Tự cắt & ghép" trước'); return; } if (!sel) { api.toast('Chọn một đoạn trước (công cụ ✋)'); return; } const loc = locate(sel[0]); const b4 = before(); fn(loc); commit(name, b4, name.startsWith('Mất') ? 'del' : name.startsWith('Lặp') ? 'dup' : name.startsWith('Đảo') ? 'inv' : 'tra'); };
    // bảng điều khiển
    const fact = api.overlay('', 'm3d-fact');
    const drawFact = () => { const f = FACT[mode]; fact.innerHTML = `<b>${f.t}</b> · ${f.q}<br><span>${f.ex}</span>`; };
    drawFact();
    if (mode === 'inv') api.choices({ label: 'Tùy chọn', items: [{ t: 'Chứa tâm động', v: 'peri' }, { t: 'Không chứa tâm động', v: 'para' }], value: sub, onPick(v) { sub = v; reset(); } });
    if (mode === 'tra') api.choices({ label: 'Tùy chọn', items: [{ t: 'Cùng 1 NST', v: 'same' }, { t: 'Không tương hỗ', v: 'nonrec' }, { t: 'Tương hỗ', v: 'recip' }], value: tsub, onPick(v) { tsub = v; reset(); } });
    api.section('🎬 Hoạt cảnh');
    const pb = api.button(playing ? '⏸ Tạm dừng' : '▶ Phát', b => { if (manual) reset(); if (si >= sc.states.length - 1) { reset(); playing = true; } else playing = !playing; b.textContent = playing ? '⏸ Tạm dừng' : '▶ Phát'; });
    api.button('🐢 Tua chậm', b => { slow = slow === 1 ? 0.35 : 1; b.textContent = slow === 1 ? '🐢 Tua chậm' : '🐇 Tốc độ thường'; });
    api.button('⏭ Bước tiếp', () => { if (manual) return; playing = false; pb.textContent = '▶ Phát'; step(); });
    api.button('↺ Đặt lại', () => { reset(); playing = true; pb.textContent = '⏸ Tạm dừng'; });
    api.slider({ label: 'Tốc độ hoạt hình', min: 0.25, max: 2, step: 0.25, value: speed, unit: '×', lazy: true, onInput(v) { speed = v; } });
    api.section('✂ Tự cắt & ghép');
    api.toggle({ label: 'Bật chế độ tự làm', value: manual, onChange(v) { if (v) { playing = false; pb.textContent = '▶ Phát'; startManual(); api.toast('Công cụ ✂: chạm gene để đặt vết cắt. Công cụ ✋: chọn đoạn rồi kéo thả'); } else reset(); } });
    api.choices({ items: [{ t: '✂ Cắt', v: 'cut' }, { t: '✋ Chọn & kéo', v: 'drag' }], value: tool, onPick(v) { tool = v; } });
    api.button('🗑 Bỏ đoạn đã chọn', () => opSel('Mất đoạn (tự làm)', ([ri]) => { manRows[ri] = manRows[ri].filter(t => { if (sel.includes(t.uid)) { dropped.add(t.uid); return false; } return true; }); }));
    api.button('⧉ Nhân đôi đoạn', () => opSel('Lặp đoạn (tự làm)', ([ri]) => { const r = manRows[ri], i = r.findIndex(t => t.uid === sel[sel.length - 1]); const copies = sel.map(uid => { const o = r.find(t => t.uid === uid); const c = tok(o.g, { src: o, flip: o.flip }); sc.all.push(c); mkTok(c); return c; }); r.splice(i + 1, 0, ...copies); }));
    api.button('↻ Đảo đoạn 180°', () => opSel('Đảo đoạn (tự làm)', ([ri]) => { const r = manRows[ri], a = r.findIndex(t => sel.includes(t.uid)); const segT = r.slice(a, a + sel.length).reverse(); segT.forEach(t => t.flip = !t.flip); r.splice(a, sel.length, ...segT); api.beep(300, 0.4, 'sawtooth', 0.04); }));
    api.view({ pos: [0, 1.2, 13], target: [0, -0.3, 0], min: 4, max: 26 });
    return { reset };
  }

  function record(name, b4, after, m) {
    const g0 = b4.flat().filter(t => t && !t.c).length, g1 = after.flat().filter(t => t && !t.c).length;
    const l0 = b4.map(r => r.filter(Boolean).length), l1 = after.map(r => r.filter(Boolean).length);
    const len = l0.length === 1 ? (l1[0] > l0[0] ? 'Dài ra' : l1[0] < l0[0] ? 'Ngắn đi' : 'Không đổi') : l0.map((v, k) => `NST ${k + 1}: ${l1[k] > v ? 'dài ra' : l1[k] < v ? 'ngắn đi' : 'không đổi'}`).join(', ');
    last = { name, b4: b4.map(r => r.filter(Boolean)), after: after.map(r => r.filter(Boolean)), m };
    log.push([log.length + 1, name, `${seqStr(b4)} → ${seqStr(after)}`, len, g1 > g0 ? `Tăng (${g0} → ${g1})` : g1 < g0 ? `Giảm (${g0} → ${g1})` : `Không đổi (${g0})`]);
    if (log.length > 40) log.shift();
  }

  function chromSVG() {
    const W = 640, H = 300;
    let s = `<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-height:${H}px;font-family:'Baloo 2',sans-serif">`;
    if (!last) return s + `<text x="20" y="40" font-size="15" fill="#6C88A3">Chạy một hoạt cảnh để có hình so sánh trước và sau đột biến</text></svg>`;
    const hex = n => '#' + n.toString(16).padStart(6, '0');
    const drawRows = (rows, y0) => rows.forEach((r, ri) => { const y = y0 + ri * 44; const x0 = 320 - r.length * 22; r.forEach((t, i) => { const x = x0 + i * 44; if (t.c) s += `<circle cx="${x + 22}" cy="${y}" r="10" fill="${hex(CEN)}"/>`; else s += `<rect x="${x + 2}" y="${y - 16}" width="40" height="32" rx="16" fill="${hex(GC[t.g])}"/><text x="${x + 22}" y="${y + 6}" font-size="16" font-weight="800" fill="#fff" text-anchor="middle">${t.g}</text>${t.flip ? `<text x="${x + 22}" y="${y - 20}" font-size="11" fill="#1F4E79" text-anchor="middle">↺</text>` : ''}`; }); });
    s += `<text x="20" y="26" font-size="14" font-weight="800" fill="#1F4E79">Trước đột biến</text>`; drawRows(last.b4, 60);
    s += `<text x="20" y="${last.b4.length > 1 ? 168 : 132}" font-size="14" font-weight="800" fill="#E5534B">Sau: ${last.name}</text>`; drawRows(last.after, last.b4.length > 1 ? 202 : 170);
    return s + '</svg>';
  }
  function pdfReport() {
    const w = window.open('', '_blank'); if (!w) { NL.m3d.api.toast('Trình duyệt chặn cửa sổ mới, em cho phép pop-up nhé'); return; }
    const row = (k, a, b) => `<tr><td><b>${FACT[k].t}</b></td><td><code>${a}</code></td><td><code>${b}</code></td><td>${FACT[k].q}</td><td>${FACT[k].ex}</td></tr>`;
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Đột biến cấu trúc NST</title><style>body{font-family:Arial,sans-serif;padding:24px;color:#1F4E79}h1{font-size:22px}table{border-collapse:collapse;width:100%;font-size:12px}td,th{border:1px solid #9FB6C9;padding:6px;vertical-align:top}th{background:#EAF3FA}code{font-size:13px}</style></head><body>
      <h1>Sơ đồ tổng hợp 4 dạng đột biến cấu trúc nhiễm sắc thể</h1><p>Nhà Láp · Phòng Mô hình 3D · Mô hình 10</p>
      <table><tr><th>Dạng</th><th>Trước</th><th>Sau</th><th>Hậu quả</th><th>Ví dụ & ứng dụng</th></tr>
      ${row('del', 'A-B-C-D-●-E-F-G-H', 'A-B-●-E-F-G-H')}${row('dup', 'A-B-C-D-●-E-F-G-H', 'A-B-C-B-C-D-●-E-F-G-H')}${row('inv', 'A-B-C-D-●-E-F-G-H', 'A-B-E-●-D-C-F-G-H')}${row('tra', 'A-B-C-●-D-E-F | M-N-O-●-P-Q-R', 'M-N-C-●-D-E-F | A-B-O-●-P-Q-R')}</table>
      <h2 style="font-size:16px;margin-top:20px">Các thao tác em đã thực hiện</h2>
      <table><tr><th>STT</th><th>Dạng</th><th>Ban đầu → Sau</th><th>Chiều dài</th><th>Số gene</th></tr>${log.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('') || '<tr><td colspan="5">Chưa có</td></tr>'}</table>
      <p style="font-size:12px;margin-top:16px">Ghi nhớ: Mất đoạn làm giảm số gene; lặp đoạn làm tăng số gene; đảo đoạn không đổi số gene nhưng đổi trật tự; chuyển đoạn đổi nhóm gene liên kết.</p>
      <script>setTimeout(()=>print(),400)<\/script></body></html>`);
    w.document.close();
  }

  NL.m3d.register('M10', {
    title: 'Đột biến cấu trúc NST',
    tabs: [{ t: '✂ Mất đoạn', v: 'del' }, { t: '⧉ Lặp đoạn', v: 'dup' }, { t: '↻ Đảo đoạn', v: 'inv' }, { t: '⇄ Chuyển đoạn', v: 'tra' }],
    init() { playing = true; manual = false; },
    build(api, tab) { mode = tab; manual = false; playing = true; build(api); api.section('📄 Báo cáo'); api.button('📄 Xuất báo cáo PDF (4 dạng)', () => pdfReport()); },
    data() {
      return {
        title: 'Tóm tắt các dạng đột biến cấu trúc NST đã mô phỏng',
        sub: 'Bấm "Lưu ảnh biểu đồ" để lưu ảnh NST trước và sau đột biến',
        sheets: [
          { name: 'Tóm tắt', head: ['STT', 'Tên dạng đột biến', 'Cấu trúc ban đầu → Cấu trúc sau đột biến', 'Biến đổi chiều dài NST', 'Số lượng gene'], rows: log.length ? log : [['–', 'Chưa chạy hoạt cảnh nào', '–', '–', '–']] },
          { name: 'Hậu quả & ứng dụng', head: ['Dạng', 'Hậu quả', 'Ví dụ & ứng dụng'], rows: Object.values(FACT).map(f => [f.t, f.q, f.ex]) }
        ],
        chart: { svg: chromSVG() }
      };
    },
    liveData: true
  });
})();
