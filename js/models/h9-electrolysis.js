// Mô hình Hóa 9: Bình điện phân dung dịch CuSO₄ (anode trơ hoặc anode đồng tan) và NaCl (có hoặc không có màng ngăn, phenolphthalein). Ion di chuyển, bọt khí, khối lượng và thể tích theo định luật Faraday.
(function () {
  const F = 96485, VM = 24.79, VOL = 0.5; // thể tích khí 1 mol ở điều kiện chuẩn (25 °C, 1 bar); 0,5 L dung dịch
  const WARN_CU = 'Khi dùng anode làm bằng kim loại hoạt động (như <b>đồng</b>) trong dung dịch chứa ion của chính nó, kim loại ở anode sẽ <b>tan ra</b> (Cu → Cu²⁺ + 2e) thay vì nước bị oxi hóa. Màu xanh của dung dịch giữ nguyên. Đây là cơ sở của công nghệ <b>mạ điện</b> và <b>tinh luyện đồng</b>!';
  const WARN_MEM = 'Nếu rút màng ngăn xốp, khí Cl₂ (vàng lục) sinh ra ở anode sẽ khuếch tán và phản ứng ngay với dung dịch NaOH ở cathode: Cl₂ + 2NaOH → NaCl + NaClO + H₂O, tạo ra <b>nước Javel</b>. Bạn sẽ không thu được dung dịch kiềm tinh khiết!';
  const SPEEDS = [{ t: '×1', v: 1 }, { t: '×60', v: 60 }, { t: '×600', v: 600 }];
  let s = null, speed = 60;
  const fresh = tab => ({ tab, on: false, I: 2, t: 0, q: 0, cuAnode: false, membrane: true, phenol: true, hist: [], lastH: -1e9 });
  const f3 = (v, d) => NL.chem3d.fmtVN(v, d == null ? 3 : d);
  const tFmt = t => t < 60 ? `${Math.round(t)} s` : t < 3600 ? `${(t / 60).toFixed(1).replace('.', ',')} phút` : `${(t / 3600).toFixed(2).replace('.', ',')} giờ`;
  // lượng chất theo điện lượng q (C)
  function amounts() {
    const ne = s.q / F;
    if (s.tab === 'cuso4') {
      const cu0 = 0.5 * VOL, nCu = Math.min(ne / 2, s.cuAnode ? Infinity : cu0), h2 = s.cuAnode ? 0 : Math.max(0, (ne - 2 * cu0) / 2);
      return { ne, mCu: 63.55 * nCu, cCu: s.cuAnode ? 0.5 : (cu0 - nCu) / VOL, vO2: s.cuAnode ? 0 : ne / 4 * VM, vH2: h2 * VM, mAnode: s.cuAnode ? 63.55 * nCu : 0, H: s.cuAnode ? 0 : ne / VOL };
    }
    const cl0 = 2 * VOL, nCl2 = Math.min(ne / 2, cl0 / 2);
    return { ne, vH2: ne / 2 * VM, vCl2: s.membrane ? nCl2 * VM : 0, cOH: s.membrane ? ne / (VOL / 2) : Math.max(0, (ne - 2 * nCl2) / VOL), cClO: s.membrane ? 0 : nCl2 / VOL };
  }

  function build(api, tab) {
    const T = api.T, V = api.V, R = api.rand(9);
    if (!s || s.tab !== tab) s = fresh(tab);
    const cu = tab === 'cuso4';
    // bình
    const glass = api.mat(0xDDEFFF, { opacity: 0.15, depthWrite: false, side: T.DoubleSide });
    const tank = api.mesh(new T.BoxGeometry(6.4, 3.2, 2.6), glass, [0, 1.6, 0]); tank.userData.noPick = true;
    const liq = api.mesh(new T.BoxGeometry(6.3, 2.6, 2.5), api.mat(cu ? 0x2563EB : 0xE0F2FE, { opacity: cu ? 0.32 : 0.14, depthWrite: false }), [0, 1.3, 0]);
    api.part(liq, cu ? { name: 'Dung dịch CuSO₄', sci: 'Cu²⁺, SO₄²⁻, H₂O', rows: [['Cation', 'Cu²⁺ (xanh lam) chạy về cathode (−)'], ['Anion', 'SO₄²⁻ chạy về anode (+) nhưng không bị oxi hóa; nước bị oxi hóa thay'], ['Màu', 'Nhạt dần khi Cu²⁺ bị khử (nếu anode trơ)']] } : { name: 'Dung dịch NaCl bão hòa', sci: 'Na⁺, Cl⁻, H₂O', rows: [['Cation', 'Na⁺ chạy về cathode nhưng không bị khử; nước bị khử thay'], ['Anion', 'Cl⁻ chạy về anode và bị oxi hóa thành Cl₂']] });
    // điện cực: trái là cathode (−), phải là anode (+)
    const cath = api.box(0.36, 3.2, 0.9, api.mat(0x374151, { roughness: 0.6 }), [-2.2, 2.0, 0]);
    api.part(cath, cu ? { name: 'CATHODE (cực âm −)', sci: 'Cu²⁺ + 2e → Cu', rows: [['Nối với', 'Cực âm của nguồn điện'], ['Quá trình', '<b>Khử</b>: Cu²⁺ + 2e → Cu (đồng đỏ bám vào điện cực)'], ['Khi hết Cu²⁺', '2H₂O + 2e → H₂ + 2OH⁻ (sủi bọt khí)']] } : { name: 'CATHODE (cực âm −)', sci: '2H₂O + 2e → H₂ + 2OH⁻', rows: [['Nối với', 'Cực âm của nguồn điện'], ['Quá trình', '<b>Khử nước</b>: 2H₂O + 2e → H₂↑ + 2OH⁻'], ['Vì sao không khử Na⁺?', 'Na⁺ rất khó bị khử hơn H₂O']] });
    const anode = api.box(0.36, 3.2, 0.9, api.mat(cu && s.cuAnode ? 0xD97745 : 0x374151, { roughness: 0.5, metalness: cu && s.cuAnode ? 0.5 : 0 }), [2.2, 2.0, 0]);
    api.part(anode, cu ? (s.cuAnode ? { name: 'ANODE đồng (cực dương +)', sci: 'Cu → Cu²⁺ + 2e', rows: [['Nối với', 'Cực dương của nguồn điện'], ['Quá trình', '<b>Oxi hóa</b> chính kim loại làm anode: Cu → Cu²⁺ + 2e'], ['Kết quả', 'Anode mòn dần, [Cu²⁺] không đổi: Cu chuyển từ anode sang cathode']] } : { name: 'ANODE than chì (cực dương +, trơ)', sci: '2H₂O → O₂ + 4H⁺ + 4e', rows: [['Nối với', 'Cực dương của nguồn điện'], ['Quá trình', '<b>Oxi hóa nước</b>: 2H₂O → O₂↑ + 4H⁺ + 4e'], ['Vì sao không oxi hóa SO₄²⁻?', 'SO₄²⁻ rất bền, khó bị oxi hóa hơn H₂O'], ['Hệ quả', 'Dung dịch có thêm H⁺ nên tính acid tăng (pH giảm)']] }) : { name: 'ANODE trơ (cực dương +)', sci: '2Cl⁻ → Cl₂ + 2e', rows: [['Nối với', 'Cực dương của nguồn điện'], ['Quá trình', '<b>Oxi hóa</b>: 2Cl⁻ → Cl₂↑ + 2e (khí vàng lục, mùi hắc)']] });
    api.label('CATHODE (−)', [-2.2, 3.9, 0.6], { cls: 'tag', color: '#60A5FA' }); api.label('ANODE (+)', [2.2, 3.9, 0.6], { cls: 'tag', color: '#F87171' });
    // nguồn điện và dây
    const src = api.group(null, [0, 5.0, 0]);
    api.box(1.8, 0.8, 0.8, api.mat(0x1E293B), [0, 0, 0], src);
    api.textSprite('− NGUỒN 1 CHIỀU +', { h: 0.28, pos: [0, 0, 0.45], parent: src, color: '#FDE68A' });
    api.part(src, { name: 'Nguồn điện một chiều', rows: [['Cực âm (−)', 'Nối với cathode: đẩy electron vào cathode'], ['Cực dương (+)', 'Nối với anode: hút electron ra khỏi anode']], focus: false });
    const wL = new T.CatmullRomCurve3([V(-2.2, 3.6, 0), V(-2.2, 5.0, 0), V(-0.9, 5.0, 0)]), wR = new T.CatmullRomCurve3([V(0.9, 5.0, 0), V(2.2, 5.0, 0), V(2.2, 3.6, 0)]);
    [[wL, 0x3B82F6], [wR, 0xEF4444]].forEach(([c, col]) => api.mesh(new T.TubeGeometry(c, 40, 0.05, 8), api.mat(col)).userData.noPick = true);
    const elec = Array.from({ length: 12 }, (_, k) => { const m = api.sphere(0.07, api.mat(0xFDE047, { emissive: 0xFDE047, emissiveIntensity: 1 }), null, null, 8); m.userData = { u: k / 12, noPick: true }; return m; });
    // màng ngăn (NaCl)
    let mem = null, pink = null;
    if (!cu) {
      mem = api.box(0.12, 2.6, 2.5, api.mat(0xF5F5DC, { opacity: 0.55, roughness: 0.9 }), [0, 1.3, 0]);
      api.part(mem, { name: 'Màng ngăn xốp', sci: 'Diaphragm / membrane', rows: [['Vai trò', 'Ngăn Cl₂ ở anode gặp NaOH ở cathode'], ['Kết quả', 'Thu được NaOH và Cl₂ riêng biệt: 2NaCl + 2H₂O → 2NaOH + H₂ + Cl₂ (có màng ngăn)']] });
      mem.visible = s.membrane;
      pink = api.box(1, 2.5, 2.4, api.mat(0xF472B6, { opacity: 0.0, depthWrite: false }), [-2.2, 1.28, 0]); pink.userData.noPick = true;
    }
    // ion
    const ionSpec = cu ? [['Cu²⁺', 0x3B82F6, -1, 12], ['SO₄²⁻', 0xFACC15, 1, 12]] : [['Na⁺', 0xC084FC, -1, 10], ['Cl⁻', 0x86EFAC, 1, 12]];
    const ions = [];
    ionSpec.forEach(([nm, col, dir, n]) => { for (let k = 0; k < n; k++) { const m = api.sphere(0.12, api.mat(col, { emissive: col, emissiveIntensity: 0.5 }), null, null, 10); m.userData = { dir, x: (R() - 0.5) * 3.6, y: 0.3 + R() * 2.1, z: (R() - 0.5) * 2, nm, noPick: true }; ions.push(m); } });
    const tags = ionSpec.map(([nm, col]) => api.label(nm, [0, 0, 0], { cls: 'tag', color: '#' + col.toString(16).padStart(6, '0') }));
    // bọt khí
    const bub = (x, col) => Array.from({ length: 22 }, () => { const m = api.sphere(0.06 + R() * 0.05, api.mat(col, { opacity: 0.85, emissive: col, emissiveIntensity: 0.2 }), null, null, 8); m.userData = { x, y: R() * 2.4, z: (R() - 0.5) * 0.8, noPick: true }; m.visible = false; return m; });
    const bubA = bub(2.45, cu ? 0xF8FAFC : 0xBEF264), bubC = bub(-2.45, 0xF8FAFC);
    const ov = api.overlay('', 'hm-bl');
    let tUI = 0;
    api.onFrame(dt => {
      if (s.on) { s.t += dt * speed; s.q += s.I * dt * speed; if (s.t - s.lastH >= Math.max(1, speed / 4)) { s.lastH = s.t; s.hist.push(Object.assign({ t: s.t }, amounts())); if (s.hist.length > 400) s.hist.shift(); } }
      const a = amounts();
      if (cu) {
        liq.material.opacity = 0.05 + 0.27 * (a.cCu / 0.5);
        const k = Math.min(1, a.mCu / 1.5); cath.material.color.setRGB(0.216 + (0.85 - 0.216) * k, 0.255 + (0.47 - 0.255) * k, 0.318 + (0.27 - 0.318) * k); cath.scale.x = 1 + Math.min(0.5, a.mCu / 10);
        if (s.cuAnode) anode.scale.x = Math.max(0.25, 1 - a.mAnode / 12);
      } else if (pink) {
        const w = Math.min(s.membrane ? 2.1 : 1.2, 0.2 + (s.membrane ? a.cOH : 0.15 * Math.min(1, a.cClO * 20)) * 6);
        pink.scale.x = w; pink.position.x = -3.1 + w / 2; pink.material.opacity = s.phenol && (a.cOH > 0.001 || (!s.membrane && s.on)) ? (s.membrane ? 0.4 : 0.15) : 0;
      }
      elec.forEach(m => { if (s.on) m.userData.u = (m.userData.u + dt * 0.4) % 1; m.visible = s.on; const u = m.userData.u; m.position.copy(u < 0.5 ? wR.getPointAt(1 - u * 2).clone() : wL.getPointAt(1 - (u - 0.5) * 2)); });
      ions.forEach(m => { const u = m.userData; if (s.on) { u.x += u.dir * dt * 0.45; if (u.x * u.dir > 1.95) { u.x = -u.dir * (1.2 + R() * 0.7); u.y = 0.3 + R() * 2.1; } } if (!cu && s.membrane && Math.abs(u.x) < 0.15) u.x += u.dir * 0.3; m.position.set(u.x, u.y + Math.sin(api.time * 3 + u.z * 9) * 0.04, u.z); m.visible = !(cu && u.nm === 'Cu²⁺' && !s.cuAnode && a.cCu < 0.02); });
      ionSpec.forEach((sp, k) => { const m = ions.find(i => i.userData.nm === sp[0] && i.visible); if (m) tags[k].pos ? tags[k].pos.copy(m.position).add(V(0, 0.3, 0)) : 0; });
      const gasA = s.on && (cu ? !s.cuAnode : true), gasC = s.on && (!cu || a.vH2 > 0);
      [[bubA, gasA, !cu && !s.membrane ? 1.6 : 2.6], [bubC, gasC, 2.6]].forEach(([arr, on, top]) => arr.forEach(m => { const u = m.userData; if (on || m.visible) { u.y += dt * (0.8 + u.z); if (u.y > top) { u.y = 0.4; m.visible = on; } else m.visible = true; } m.position.set(u.x + Math.sin(u.y * 5 + u.z * 10) * 0.05, u.y, u.z); }));
      tUI -= dt; if (tUI <= 0) {
        tUI = 0.2;
        ov.innerHTML = `<div class="hm-meter">${cu ? `<div>Cu bám cathode<b>${f3(a.mCu)} g</b></div>${s.cuAnode ? `<div>Anode Cu tan<b>${f3(a.mAnode)} g</b></div>` : `<div>Khí O₂ ở anode<b>${f3(a.vO2 * 1000, 0)} mL</b></div><div>[Cu²⁺]<b>${f3(a.cCu)} M</b></div>`}${a.vH2 > 0 ? `<div>Khí H₂ ở cathode<b>${f3(a.vH2 * 1000, 0)} mL</b></div>` : ''}`
          : `<div>Khí H₂ (cathode)<b>${f3(a.vH2 * 1000, 0)} mL</b></div><div>Khí Cl₂ (anode)<b>${f3(a.vCl2 * 1000, 0)} mL</b></div>${s.membrane ? `<div>[NaOH] ngăn cathode<b>${f3(a.cOH)} M</b></div>` : `<div>[NaClO] (Javel)<b>${f3(a.cClO)} M</b></div>`}`}<div>Thời gian<b>${tFmt(s.t)}</b></div></div>`;
      }
      api.caption(`${cu ? 'CuSO₄' : 'NaCl'} · I = ${s.I} A · t = ${tFmt(s.t)} · q = ${Math.round(s.q)} C`);
    });
    // đồ thị chạy
    api.strip({ h: innerHeight < 500 ? 62 : 100, draw(x, w, h) {
      x.clearRect(0, 0, w, h); x.fillStyle = 'rgba(15,27,43,.88)'; x.fillRect(0, 0, w, h);
      const H = s.hist; const fs = Math.round(h / 7); x.font = `700 ${fs}px 'Baloo 2', sans-serif`; x.fillStyle = '#94A3B8';
      x.fillText(cu ? 'Khối lượng Cu bám cathode theo thời gian' : 'Thể tích khí H₂ (trắng) và Cl₂ (vàng lục) theo thời gian', 12, h - 6);
      if (H.length < 2) return;
      const key = cu ? ['mCu'] : ['vH2', 'vCl2'], col = cu ? ['#F59E0B'] : ['#F8FAFC', '#BEF264'];
      const mx = Math.max(1e-6, ...H.map(p => Math.max(...key.map(k => p[k] || 0)))), t0 = H[0].t, t1 = Math.max(t0 + 1, H[H.length - 1].t);
      key.forEach((k, j) => { x.strokeStyle = col[j]; x.lineWidth = 3; x.beginPath(); H.forEach((p, i) => { const X = 12 + (w - 24) * (p.t - t0) / (t1 - t0), Y = 10 + (h - 36) * (1 - (p[k] || 0) / mx); i ? x.lineTo(X, Y) : x.moveTo(X, Y); }); x.stroke(); });
      x.textAlign = 'right'; x.fillText(tFmt(t1), w - 12, h - 6); x.textAlign = 'left';
    } });
    // điều khiển
    api.toggle({ label: '🔌 Đóng mạch (bật nguồn)', value: s.on, onChange(v) { s.on = v; } });
    api.slider({ label: '⚡ Cường độ dòng điện I', min: 0.5, max: 5, step: 0.5, value: s.I, unit: 'A', lazy: true, onInput(v) { s.I = v; } });
    api.choices({ label: '⏩ Tua nhanh thời gian', items: SPEEDS, value: speed, onPick(v) { speed = v; } });
    if (cu) api.choices({ label: 'Vật liệu anode', items: [{ t: '⬛ Than chì (trơ)', v: 0 }, { t: '🟧 Đồng (tan)', v: 1 }], value: s.cuAnode ? 1 : 0, onPick(v) { s = Object.assign(fresh(tab), { cuAnode: !!v, I: s.I }); if (v) api.warn('cuA', WARN_CU, '🔬 Thông điệp khoa học'); api.setTab(tab); } });
    else {
      api.toggle({ label: '🧱 Màng ngăn xốp', value: s.membrane, onChange(v) { s.membrane = v; mem.visible = v; s.q = 0; s.t = 0; s.hist = []; if (!v) api.warn('mem', WARN_MEM, '🔬 Thông điệp khoa học'); } });
      api.toggle({ label: '🌸 Nhỏ phenolphthalein', value: s.phenol, onChange(v) { s.phenol = v; } });
    }
    api.button('↺ Làm lại', () => { s = Object.assign(fresh(tab), { cuAnode: s.cuAnode }); api.setTab(tab); });
    api.note(cu ? (s.cuAnode ? 'Phương trình: Cu (anode) → Cu (cathode). Dung dịch không đổi.' : 'Phương trình: 2CuSO₄ + 2H₂O → 2Cu + O₂ + 2H₂SO₄') : (s.membrane ? 'Phương trình (có màng ngăn): 2NaCl + 2H₂O → 2NaOH + H₂ + Cl₂' : 'Không màng ngăn: NaCl + H₂O → NaClO + H₂ (nước Javel)'));
    api.note('Định luật Faraday: m = A·I·t / (n·F), F = 96 485 C/mol. Thể tích khí tính ở điều kiện chuẩn (25 °C, 1 bar): 24,79 L/mol.');
    api.view({ pos: [0, 4.6, 11.5], target: [0, 3.0, 0], min: 4, max: 30 });
  }

  NL.m3d.register('HM9', {
    title: 'Bình điện phân',
    tabs: [{ t: '🔵 Dung dịch CuSO₄', v: 'cuso4' }, { t: '🧂 Dung dịch NaCl', v: 'nacl' }],
    init() { s = null; },
    build(api, tab) { build(api, tab); },
    data() {
      const cu = s.tab === 'cuso4', H = s.hist.length ? s.hist : [Object.assign({ t: 0 }, amounts())];
      const step = Math.max(1, Math.ceil(H.length / 40)), rows = H.filter((_, k) => k % step === 0 || k === H.length - 1);
      return {
        title: cu ? `Điện phân CuSO₄ (anode ${s.cuAnode ? 'đồng tan' : 'than chì trơ'})` : `Điện phân NaCl (${s.membrane ? 'có' : 'không có'} màng ngăn)`,
        sub: `I = ${s.I} A · q = I·t = ${Math.round(s.q)} C · số mol electron = ${f3(s.q / F, 4)} mol`,
        sheets: [{ name: 'Lịch sử số liệu', head: cu ? ['Thời gian (s)', 'q (C)', 'm Cu bám cathode (g)', 'V O₂ (mL)', 'V H₂ (mL)', '[Cu²⁺] (M)'] : ['Thời gian (s)', 'q (C)', 'V H₂ (mL)', 'V Cl₂ (mL)', '[NaOH] ngăn cathode (M)', '[NaClO] (M)'],
          rows: rows.map(p => cu ? [Math.round(p.t), Math.round(p.ne * F), f3(p.mCu), f3((p.vO2 || 0) * 1000, 1), f3((p.vH2 || 0) * 1000, 1), f3(p.cCu)] : [Math.round(p.t), Math.round(p.ne * F), f3(p.vH2 * 1000, 1), f3(p.vCl2 * 1000, 1), f3(p.cOH), f3(p.cClO)]) }],
        chart: { type: 'line', title: cu ? 'Khối lượng Cu bám vào cathode' : 'Thể tích khí thu được', xMax: Math.max(1, H[H.length - 1].t / 60), series: cu ? [{ name: 'm Cu (g)', color: '#F59E0B', points: rows.map(p => [p.t / 60, +p.mCu.toFixed(4)]) }] : [{ name: 'V H₂ (mL)', color: '#38BDF8', points: rows.map(p => [p.t / 60, Math.round(p.vH2 * 1000)]) }, { name: 'V Cl₂ (mL)', color: '#84CC16', points: rows.map(p => [p.t / 60, Math.round(p.vCl2 * 1000)]) }], yLabel: cu ? 'gam' : 'mL', xLabel: 'Thời gian (phút)' }
      };
    },
    liveData: true
  });
})();
