// Mô hình Hóa 4: Pin Daniell Zn – Cu. Công tắc, cầu muối, nồng độ, nhiệt độ; dòng electron trong dây, ion trong dung dịch và cầu muối; E tính theo phương trình Nernst.
(function () {
  const F = 96485, Rg = 8.314, VOL = 0.1, RES = 10; // thể tích mỗi cốc 0,1 L, điện trở mạch 10 Ω
  const SPEEDS = [{ t: '×1', v: 1 }, { t: '×60', v: 60 }, { t: '×600', v: 600 }, { t: '×3600', v: 3600 }, { t: '×36000', v: 36000 }];
  const WARN_BRIDGE = 'Cầu muối bị tháo! Sự tích tụ điện tích (dư Zn²⁺ bên cốc Zn, dư SO₄²⁻ bên cốc Cu) ngăn cản dòng electron tiếp tục di chuyển, <b>dòng điện ngắt</b>!';
  const WARN_DEAD = 'Hệ thống đã đạt trạng thái <b>cân bằng hóa học (ΔG = 0)</b>, E<sub>pin</sub> = 0 V: pin đã cạn. Gần như toàn bộ Cu²⁺ đã bị khử thành Cu.';
  let s = null, speed = 600;
  const fresh = () => ({ cZn: 1, cCu: 1, mZn: 10, mCu: 10, T: 25, on: false, bridge: true, t: 0, E: 1.10, I: 0, hist: [], lastH: -1e9, dead: false });
  function emf() {
    if (s.cCu <= 1e-6) return 0;
    return Math.max(0, 1.10 - Rg * (s.T + 273.15) / (2 * F) * Math.log(s.cZn / s.cCu));
  }
  const f2 = (v, d) => NL.chem3d.fmtVN(v, d == null ? 3 : d);
  const tFmt = t => t < 60 ? `${Math.round(t)} s` : t < 3600 ? `${(t / 60).toFixed(1).replace('.', ',')} phút` : `${(t / 3600).toFixed(2).replace('.', ',')} giờ`;

  function build(api) {
    const T = api.T, V = api.V;
    if (!s) s = fresh();
    const glassM = () => api.mat(0xDDEFFF, { opacity: 0.16, depthWrite: false, side: T.DoubleSide, roughness: 0.1 });
    // cốc, dung dịch
    const beaker = (x, name, sol) => {
      const g = api.group(null, [x, 0, 0]);
      const gl = api.mesh(new T.CylinderGeometry(1.45, 1.4, 3, 40, 1, true), glassM(), [0, 1.5, 0], g); gl.userData.noPick = true;
      api.mesh(new T.CircleGeometry(1.4, 40), glassM(), [0, 0.01, 0], g).rotation.x = -Math.PI / 2;
      const liq = api.mesh(new T.CylinderGeometry(1.38, 1.36, 2.2, 40), api.mat(sol, { opacity: 0.3, depthWrite: false }), [0, 1.1, 0], g);
      api.part(liq, name);
      return { g, liq };
    };
    const L = beaker(-3, { name: 'Dung dịch ZnSO₄', sci: 'Zn²⁺ + SO₄²⁻', rows: [['Vai trò', 'Nhận thêm ion Zn²⁺ do thanh Zn tan ra'], ['Màu', 'Không màu']] }, 0xCBD5E1);
    const Rb = beaker(3, { name: 'Dung dịch CuSO₄', sci: 'Cu²⁺ + SO₄²⁻', rows: [['Vai trò', 'Cung cấp Cu²⁺ để bị khử ở cathode'], ['Màu', 'Xanh lam do ion Cu²⁺; nhạt dần khi Cu²⁺ bị khử']] }, 0x2563EB);
    // điện cực
    const zn = api.box(0.7, 3, 0.14, api.mat(0x9CA3AF, { metalness: 0.6, roughness: 0.35 }), [-3, 1.9, 0.3]);
    api.part(zn, { name: 'Điện cực kẽm: ANODE (cực âm −)', sci: 'Zn → Zn²⁺ + 2e', rows: [['Quá trình', '<b>Oxi hóa</b>: Zn → Zn²⁺ + 2e'], ['Electron', 'Đi ra khỏi thanh Zn, theo dây dẫn sang Cu'], ['Thanh Zn', 'Mòn dần, khối lượng giảm'], ['E° (Zn²⁺/Zn)', '−0,76 V']] });
    const cu = api.box(0.7, 3, 0.14, api.mat(0xD97745, { metalness: 0.6, roughness: 0.35 }), [3, 1.9, 0.3]);
    api.part(cu, { name: 'Điện cực đồng: CATHODE (cực dương +)', sci: 'Cu²⁺ + 2e → Cu', rows: [['Quá trình', '<b>Khử</b>: Cu²⁺ + 2e → Cu'], ['Electron', 'Từ dây dẫn đi vào thanh Cu'], ['Thanh Cu', 'Dày lên do Cu bám vào, khối lượng tăng'], ['E° (Cu²⁺/Cu)', '+0,34 V']] });
    // cầu muối
    const bPts = [V(-2.3, 1.2, -0.55), V(-2.3, 3.0, -0.55), V(-1.6, 3.7, -0.55), V(1.6, 3.7, -0.55), V(2.3, 3.0, -0.55), V(2.3, 1.2, -0.55)];
    const bridgeG = api.group();
    const bridge = api.tube(bPts, 0.26, api.mat(0xF1F5F9, { opacity: 0.55, depthWrite: false, roughness: 0.2 }), bridgeG, 80);
    api.part(bridgeG, { name: 'Cầu muối KNO₃', sci: 'K⁺ + NO₃⁻', rows: [['Vai trò', 'Trung hòa điện tích 2 cốc, khép kín mạch điện bên trong pin'], ['NO₃⁻', 'Đi về cốc Zn (bù cho Zn²⁺ sinh ra)'], ['K⁺', 'Đi về cốc Cu (bù cho Cu²⁺ mất đi)'], ['Nếu tháo ra', 'Dòng điện ngắt ngay']] });
    void bridge;
    // dây dẫn, công tắc, vôn kế
    const wPts = [V(-3, 3.35, 0.3), V(-3, 4.7, 0.3), V(-2.2, 5.1, 0.3), V(-1, 5.1, 0.3), V(1, 5.1, 0.3), V(2.2, 5.1, 0.3), V(3, 4.7, 0.3), V(3, 3.35, 0.3)];
    const wire = new T.CatmullRomCurve3(wPts, false, 'catmullrom', 0.2);
    const wm = api.mesh(new T.TubeGeometry(wire, 120, 0.05, 8, false), api.mat(0xEF4444, { roughness: 0.4 }));
    api.part(wm, { name: 'Dây dẫn mạch ngoài', rows: [['Chiều electron', 'Từ Zn (cực âm) sang Cu (cực dương)'], ['Chiều dòng điện quy ước', 'Ngược lại: từ Cu sang Zn']] });
    const meter = api.group(null, [0, 5.1, 0.3]);
    const body = api.box(1.7, 1.05, 0.45, api.mat(0x1E293B, { roughness: 0.5 }), [0, 0.15, 0], meter);
    api.part(meter, { name: 'Vôn kế', rows: [['Đo', 'Suất điện động của pin E = E°(Cu²⁺/Cu) − E°(Zn²⁺/Zn) khi nồng độ 1 M, 25 °C: 0,34 − (−0,76) = 1,10 V']] });
    void body;
    const dc = document.createElement('canvas'); dc.width = 256; dc.height = 128; const dx = dc.getContext('2d');
    const dtex = new T.CanvasTexture(dc); dtex.colorSpace = T.SRGBColorSpace;
    const disp = api.mesh(new T.PlaneGeometry(1.45, 0.72), new T.MeshBasicMaterial({ map: dtex }), [0, 0.18, 0.231], meter); disp.userData.noPick = true;
    const drawDisp = () => { dx.fillStyle = '#052e16'; dx.fillRect(0, 0, 256, 128); dx.fillStyle = s.E > 0 && s.bridge ? '#4ADE80' : '#F87171'; dx.font = "800 64px ui-monospace, monospace"; dx.textAlign = 'center'; dx.fillText((s.bridge ? s.E : 0).toFixed(3) + ' V', 128, 70); dx.font = "700 24px 'Baloo 2', sans-serif"; dx.fillStyle = '#A7F3D0'; dx.fillText(s.on ? `I = ${(s.I * 1000).toFixed(0)} mA` : 'mạch hở', 128, 112); dtex.needsUpdate = true; };
    const sw = api.group(null, [-1.6, 5.1, 0.3]);
    const lever = api.box(0.9, 0.08, 0.12, api.mat(0xFACC15, { metalness: 0.5 }), [0.45, 0, 0], sw);
    api.part(sw, { name: 'Công tắc', rows: [['Đóng', 'Electron chạy qua dây, pin phát điện'], ['Mở', 'Mạch hở: không có dòng điện, vôn kế vẫn chỉ E của pin']], focus: false, onSelect() { swCtl.set(!s.on); api.deselect(); } });
    void lever;
    // nhãn
    api.label('ANODE (−)<br><small>Zn → Zn²⁺ + 2e</small>', [-4.9, 3.3, 0], { cls: 'tag', color: '#94A3B8' });
    api.label('CATHODE (+)<br><small>Cu²⁺ + 2e → Cu</small>', [4.9, 3.3, 0], { cls: 'tag', color: '#F59E0B' });
    api.label('Cầu muối KNO₃', [0, 4.15, -0.55], { cls: 'plain' });
    const eLab = api.label('', [0, 5.9, 0.3], { cls: 'plain' });

    // hạt: electron, ion
    const R = api.rand(3);
    const mk = (c, r) => { const m = api.sphere(r || 0.08, api.mat(c, { emissive: c, emissiveIntensity: 0.7 }), null, null, 10); m.userData.noPick = true; return m; };
    const elec = Array.from({ length: 26 }, (_, k) => { const m = mk(0xFDE047, 0.08); m.userData.u = k / 26; return m; });
    const ionTxt = (t, c) => api.textSprite(t, { h: 0.26, color: c, bg: 'rgba(15,27,43,.6)' });
    const znIons = Array.from({ length: 10 }, () => { const m = mk(0xCBD5E1, 0.11); m.userData.p = R(); m.userData.s = R(); return m; });
    const cuIons = Array.from({ length: 10 }, () => { const m = mk(0x3B82F6, 0.11); m.userData.p = R(); m.userData.s = R(); return m; });
    const k1 = ionTxt('Zn²⁺', '#E2E8F0'), k2 = ionTxt('Cu²⁺', '#93C5FD');
    const bridgeCurve = new T.CatmullRomCurve3(bPts);
    const no3 = Array.from({ length: 8 }, (_, k) => { const m = mk(0x34D399, 0.09); m.userData.u = k / 8; return m; });
    const kp = Array.from({ length: 8 }, (_, k) => { const m = mk(0xF472B6, 0.09); m.userData.u = k / 8; return m; });
    const k3 = ionTxt('NO₃⁻', '#6EE7B7'), k4 = ionTxt('K⁺', '#F9A8D4');

    let tDisp = 0;
    api.onFrame(dt => {
      // mô phỏng
      const sdt = dt * speed;
      s.E = emf();
      const flow = s.on && s.bridge && s.E > 0 && s.mZn > 0;
      s.I = flow ? s.E / RES * Math.min(1, s.cCu / 0.02) : 0;
      if (flow) {
        const dn = Math.min(s.I * sdt / (2 * F), s.cCu * VOL, s.mZn / 65.38);
        s.cCu -= dn / VOL; s.cZn += dn / VOL; s.mZn -= 65.38 * dn; s.mCu += 63.55 * dn; s.t += sdt;
        if (s.cCu < 1e-6 && !s.dead) { s.cCu = 0; s.dead = true; s.E = 0; api.warn('dead', WARN_DEAD, '🔋 Pin đã cạn'); api.beep(220, 0.5, 'square', 0.05); }
        if (s.mZn <= 0.001) { s.mZn = 0; s.on = false; swCtl.set(false, true); api.toast('Thanh Zn đã tan hết'); }
        if (s.t - s.lastH >= Math.max(1, speed / 6)) { s.lastH = s.t; s.hist.push({ t: s.t, E: s.E, I: s.I, cZn: s.cZn, cCu: s.cCu, mZn: s.mZn, mCu: s.mCu }); if (s.hist.length > 400) s.hist.shift(); }
      }
      // hình ảnh
      Rb.liq.material.opacity = 0.08 + 0.32 * Math.min(1, s.cCu / 1);
      zn.scale.set(Math.max(0.15, s.mZn / 10), 1, Math.max(0.3, s.mZn / 10));
      cu.scale.set(Math.min(1.6, s.mCu / 10), 1, Math.min(2.2, s.mCu / 10));
      bridgeG.visible = s.bridge; no3.concat(kp).forEach(m => { m.visible = s.bridge; }); k3.visible = k4.visible = s.bridge;
      const v = flow ? 0.12 + 0.25 * Math.min(1, s.I / 0.1) : 0;
      elec.forEach(m => { m.userData.u = (m.userData.u + v * dt) % 1; m.position.copy(wire.getPointAt(m.userData.u)); });
      znIons.forEach((m, k) => { if (flow) m.userData.p = (m.userData.p + dt * 0.25) % 1; const p = m.userData.p, a = m.userData.s * 6.28 + k; m.position.set(-3 + Math.cos(a) * (0.25 + p * 0.9), 0.5 + m.userData.s * 1.5 + Math.sin(api.time * 2 + k) * 0.05, 0.3 + Math.sin(a) * (0.25 + p * 0.9)); m.material.opacity = 0.35 + 0.65 * Math.min(1, p * 3); });
      cuIons.forEach((m, k) => { if (flow) m.userData.p = (m.userData.p + dt * 0.25) % 1; const p = 1 - m.userData.p, a = m.userData.s * 6.28 + k; m.position.set(3 + Math.cos(a) * (0.2 + p * 0.95), 0.5 + m.userData.s * 1.5 + Math.sin(api.time * 2 + k) * 0.05, 0.3 + Math.sin(a) * (0.2 + p * 0.95)); m.visible = s.cCu > 0.01; });
      no3.forEach(m => { if (flow) m.userData.u = (m.userData.u - dt * 0.08 + 1) % 1; m.position.copy(bridgeCurve.getPointAt(m.userData.u)).add(V(0, 0.07, 0.08)); });
      kp.forEach(m => { if (flow) m.userData.u = (m.userData.u + dt * 0.08) % 1; m.position.copy(bridgeCurve.getPointAt(m.userData.u)).add(V(0, -0.07, -0.08)); });
      k1.position.set(-3.9, 2.55, 0.6); k2.position.set(3.9, 2.55, 0.6); k3.position.copy(bridgeCurve.getPointAt(0.32)).add(V(0, 0.45, 0)); k4.position.copy(bridgeCurve.getPointAt(0.68)).add(V(0, 0.45, 0));
      tDisp -= dt; if (tDisp <= 0) { tDisp = 0.2; drawDisp(); eLab.set(flow ? '<b style="color:#FDE047">e⁻ →</b> từ Zn sang Cu' : s.on && !s.bridge ? '⛔ Không có dòng: thiếu cầu muối' : s.dead ? 'Pin đã cạn' : 'Mạch hở'); }
      api.caption(`E = ${f2(s.E)} V · [Zn²⁺] = ${f2(s.cZn)} M · [Cu²⁺] = ${f2(s.cCu, 4)} M · t = ${tFmt(s.t)}`);
    });
    // đồ thị E chạy ở dải dưới
    api.strip({ h: innerHeight < 500 ? 62 : 104, draw(x, w, h) {
      x.clearRect(0, 0, w, h); x.fillStyle = 'rgba(15,27,43,.88)'; x.fillRect(0, 0, w, h);
      const pad = 40 * (w / 1000 + 0.6), ih = h - 30, Y = e => 12 + ih * (1 - e / 1.2);
      x.strokeStyle = 'rgba(148,163,184,.3)'; x.lineWidth = 1; [0, 0.4, 0.8, 1.2].forEach(e => { x.beginPath(); x.moveTo(pad, Y(e)); x.lineTo(w - 10, Y(e)); x.stroke(); });
      x.fillStyle = '#94A3B8'; x.font = `700 ${Math.round(h / 7)}px 'Baloo 2', sans-serif`; [0, 0.4, 0.8, 1.2].forEach(e => x.fillText(e.toFixed(1), 6, Y(e) + 5));
      x.fillText('E (V) theo thời gian', pad + 8, h - 6);
      const H = s.hist; if (H.length < 2) return;
      const t0 = H[0].t, t1 = Math.max(H[H.length - 1].t, t0 + 1);
      x.strokeStyle = '#4ADE80'; x.lineWidth = 3; x.beginPath();
      H.forEach((p, k) => { const X = pad + (w - pad - 12) * (p.t - t0) / (t1 - t0); k ? x.lineTo(X, Y(p.E)) : x.moveTo(X, Y(p.E)); }); x.stroke();
      x.fillStyle = '#A7F3D0'; x.textAlign = 'right'; x.fillText(tFmt(t1), w - 12, h - 6); x.textAlign = 'left';
    } });
    // điều khiển
    const swCtl = api.toggle({ label: '🔌 Đóng công tắc', value: s.on, onChange(v) { s.on = v; lever.rotation.z = v ? 0 : 0.6; if (v && !s.bridge) api.warn('bridge', WARN_BRIDGE, '⚠️ Thông điệp khoa học'); } });
    lever.rotation.z = s.on ? 0 : 0.6;
    api.toggle({ label: '🌉 Cầu muối KNO₃', value: s.bridge, onChange(v) { s.bridge = v; if (!v) { api.warn('bridge', WARN_BRIDGE, '⚠️ Thông điệp khoa học'); api.beep(300, 0.3, 'square', 0.05); } } });
    api.slider({ label: '[Zn²⁺] bên cốc Zn', min: 0.01, max: 2, step: 0.01, value: +s.cZn.toFixed(2), unit: 'M', lazy: true, onInput(v) { s.cZn = v; s.dead = false; } });
    api.slider({ label: '[Cu²⁺] bên cốc Cu', min: 0.01, max: 2, step: 0.01, value: Math.max(0.01, +s.cCu.toFixed(2)), unit: 'M', lazy: true, onInput(v) { s.cCu = v; s.dead = false; } });
    api.slider({ label: '🌡 Nhiệt độ', min: 0, max: 80, step: 1, value: s.T, unit: '°C', lazy: true, onInput(v) { s.T = v; } });
    api.choices({ label: '⏩ Tua nhanh thời gian', items: SPEEDS, value: speed, onPick(v) { speed = v; } });
    api.button('↺ Làm lại pin mới', () => { s = fresh(); api.setTab(api.tab); });
    api.note('E = 1,10 − <span style="white-space:nowrap">(RT / 2F)·ln([Zn²⁺]/[Cu²⁺])</span><br>Tăng [Cu²⁺] hoặc giảm [Zn²⁺] thì E tăng.');
    api.view({ pos: [0, 4.2, 13.5], target: [0, 2.3, 0], min: 4, max: 30 });
  }

  NL.m3d.register('HM4', {
    title: 'Pin điện hóa Zn – Cu (pin Daniell)',
    init() { s = fresh(); },
    build(api) { build(api); },
    data() {
      const H = s.hist.length ? s.hist : [{ t: 0, E: s.E, I: 0, cZn: s.cZn, cCu: s.cCu, mZn: s.mZn, mCu: s.mCu }];
      const step = Math.max(1, Math.ceil(H.length / 40)), rows = H.filter((_, k) => k % step === 0 || k === H.length - 1);
      return {
        title: 'Diễn biến pin Daniell theo thời gian',
        sub: `Nhiệt độ ${s.T} °C · mạch 10 Ω · mỗi cốc 0,1 L · Δm(Zn) = −${f2(10 - s.mZn)} g, Δm(Cu) = +${f2(s.mCu - 10)} g`,
        sheets: [{ name: 'Lịch sử số liệu', head: ['Thời gian (s)', 'E (V)', 'I (mA)', '[Zn²⁺] (M)', '[Cu²⁺] (M)', 'Khối lượng Zn (g)', 'Khối lượng Cu (g)'], rows: rows.map(p => [Math.round(p.t), f2(p.E), Math.round(p.I * 1000), f2(p.cZn), f2(p.cCu, 5), f2(p.mZn), f2(p.mCu)]) }],
        chart: { type: 'line', title: 'Suất điện động E theo thời gian', yMax: 1.2, xMax: Math.max(1, H[H.length - 1].t / 60), series: [{ name: 'E (V)', color: '#22C55E', points: rows.map(p => [p.t / 60, +p.E.toFixed(3)]) }], yLabel: 'E (V)', xLabel: 'Thời gian (phút)' }
      };
    },
    liveData: true
  });
})();
