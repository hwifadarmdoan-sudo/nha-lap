// Mô hình Hóa 7: Lò cao luyện gang (bổ đôi). 5 vùng nhiệt độ, nguyên liệu rơi xuống và đổi màu theo từng nấc khử, khí CO bay lên, gió nóng, gang và xỉ dâng lên rồi tháo ra.
(function () {
  const PROF = [[1.6, 0], [1.6, 1.2], [1.7, 2.0], [2.4, 3.2], [2.4, 4.0], [1.6, 8.8], [1.45, 9.6]];
  const rAt = y => { for (let k = 1; k < PROF.length; k++) { const [r1, y1] = PROF[k - 1], [r2, y2] = PROF[k]; if (y <= y2) return r1 + (r2 - r1) * (y - y1) / (y2 - y1); } return 1.45; };
  const M = 30 / 9.6; // đổi chiều cao mô hình ra mét (lò thật cao khoảng 30 m)
  const ZONES = [
    { k: 'z1', y: [7.6, 9.6], c: 0xFCD34D, name: 'Vùng sấy và khử nhẹ', t: '400 – 600 °C', tv: 500, rx: ['Nguyên liệu được sấy khô, nước bay hơi', '3Fe₂O₃ + CO → 2Fe₃O₄ + CO₂'] },
    { k: 'z2', y: [6.0, 7.6], c: 0xFB923C, name: 'Vùng khử trung gian', t: '700 – 800 °C', tv: 750, rx: ['Fe₃O₄ + CO → 3FeO + CO₂'] },
    { k: 'z3', y: [4.4, 6.0], c: 0xF97316, name: 'Vùng khử hoàn toàn, phân hủy đá vôi', t: '800 – 1000 °C', tv: 900, rx: ['FeO + CO → Fe + CO₂', 'CaCO₃ → CaO + CO₂'] },
    { k: 'z4', y: [2.6, 4.4], c: 0xEF4444, name: 'Vùng nóng chảy và tạo xỉ', t: '1200 – 1500 °C', tv: 1350, rx: ['CaO + SiO₂ → CaSiO₃ (xỉ)', 'Sắt nóng chảy, hòa tan carbon → gang (2 – 5% C)'] },
    { k: 'z5', y: [1.2, 2.6], c: 0xFEF3C7, name: 'Buồng đốt (mắt gió)', t: '1500 – 2000 °C', tv: 1800, rx: ['C + O₂ → CO₂ (tỏa rất nhiều nhiệt)', 'CO₂ + C → 2CO (tạo chất khử CO)'] }
  ];
  const WARN_SLAG = 'Xỉ lỏng (CaSiO₃) có khối lượng riêng <b>nhẹ hơn gang lỏng</b> nên nổi lên trên, tạo thành lớp màn bảo vệ ngăn luồng gió nóng giàu O₂ từ mắt gió oxi hóa ngược gang lỏng thành oxide sắt!';
  const WARN_CO = 'Trong lò cao, chất khử chính đối với các oxide sắt là <b>khí CO</b> (khử gián tiếp), do chất khí len lỏi và tiếp xúc được với bề mặt từng cục quặng; than cốc rắn (C) chỉ khử trực tiếp được ở chỗ tiếp xúc.';
  let blast = true, iron = 0.25, slag = 0.15, speed = 1, heat = 1;

  function build(api) {
    const T = api.T, V = api.V, R = api.rand(11);
    heat = blast ? 1 : heat;
    // vỏ lò bổ đôi (nửa sau) và vành gạch chịu lửa
    const outer = PROF.map(([r, y]) => new T.Vector2(r + 0.4, y)).concat([new T.Vector2(1.85, 10.1)]);
    const shell = api.mesh(new T.LatheGeometry(outer, 48, Math.PI / 2, Math.PI), api.mat(0x7C2D12, { side: T.DoubleSide, roughness: 0.9 }));
    api.part(shell, { name: 'Thành lò', sci: 'Gạch chịu lửa', rows: [['Cấu tạo', 'Vỏ thép bên ngoài, bên trong xây gạch chịu lửa'], ['Chiều cao lò thật', 'Khoảng 30 m, đường kính bụng lò 8 – 10 m']], focus: false });
    api.tag(shell, 'wall');
    // mặt cắt vành gạch (2 dải ở mép)
    [-1, 1].forEach(sd => { const sh = new T.Shape(); PROF.forEach(([r, y], k) => k ? sh.lineTo(sd * r, y) : sh.moveTo(sd * r, y)); for (let k = PROF.length - 1; k >= 0; k--) sh.lineTo(sd * (PROF[k][0] + 0.4), PROF[k][1]); const m = api.mesh(new T.ShapeGeometry(sh), api.mat(0xB45309, { side: T.DoubleSide, roughness: 0.95 })); m.userData.noPick = true; api.tag(m, 'wall'); });
    // 5 vùng nhiệt độ
    const zoneMats = [];
    ZONES.forEach((z, i) => {
      const g = api.group(); api.tag(g, z.k);
      const pts = []; for (let y = z.y[0]; y <= z.y[1] + 1e-6; y += 0.2) pts.push(new T.Vector2(rAt(y) - 0.02, y));
      const back = api.mesh(new T.LatheGeometry(pts, 40, Math.PI / 2, Math.PI), api.mat(z.c, { opacity: 0.5, depthWrite: false, side: T.DoubleSide, emissive: z.c, emissiveIntensity: 0.5 }), null, g);
      const sh = new T.Shape(); pts.forEach((p, k) => k ? sh.lineTo(-p.x, p.y) : sh.moveTo(-p.x, p.y)); for (let k = pts.length - 1; k >= 0; k--) sh.lineTo(pts[k].x, pts[k].y);
      const face = api.mesh(new T.ShapeGeometry(sh), api.mat(z.c, { opacity: 0.22, depthWrite: false, side: T.DoubleSide, emissive: z.c, emissiveIntensity: 0.6 }), [0, 0, 0.01], g);
      zoneMats.push(back.material, face.material);
      api.part(g, { name: `${i + 1}. ${z.name}`, sci: z.t, rows: [['Nhiệt độ', z.t], ...z.rx.map((r, k) => [k ? '' : 'Phản ứng', r]), ['Độ cao (lò 30 m)', `${Math.round(z.y[0] * M)} – ${Math.round(z.y[1] * M)} m tính từ đáy`]], focus: false, onSelect() { if (i <= 2) api.warn('co', WARN_CO, '🔬 Thông điệp khoa học'); } });
      api.label(`${z.t}`, [rAt((z.y[0] + z.y[1]) / 2) + 0.75, (z.y[0] + z.y[1]) / 2, 0], { cls: 'tag', color: '#' + z.c.toString(16) });
    });
    // nồi lò: gang và xỉ
    const hearthR = 1.58;
    const ironM = api.mesh(new T.CylinderGeometry(hearthR, hearthR, 1, 40, 1, false, Math.PI / 2, Math.PI), api.mat(0xF97316, { emissive: 0xFF7A1A, emissiveIntensity: 1.1, roughness: 0.3, side: T.DoubleSide }));
    api.part(ironM, { name: 'Gang lỏng', sci: 'Fe + 2 – 5% C', rows: [['Thành phần', 'Sắt có hòa tan 2 – 5% carbon, ít Si, Mn, P, S'], ['Vị trí', 'Đáy lò, vì nặng nhất'], ['Tháo ra', 'Qua lỗ tháo gang ở đáy lò']], focus: false });
    const slagM = api.mesh(new T.CylinderGeometry(hearthR, hearthR, 1, 40, 1, false, Math.PI / 2, Math.PI), api.mat(0xD6C08F, { emissive: 0xC2410C, emissiveIntensity: 0.35, roughness: 0.6, side: T.DoubleSide }));
    api.part(slagM, { name: 'Xỉ lỏng', sci: 'CaSiO₃', rows: [['Hình thành', 'CaO + SiO₂ → CaSiO₃: đá vôi kéo tạp chất cát (SiO₂) ra khỏi quặng'], ['Vị trí', 'Nổi trên gang lỏng vì nhẹ hơn'], ['Tận dụng', 'Làm xi măng, vật liệu xây dựng']], focus: false, onSelect() { api.warn('slag', WARN_SLAG, '🔬 Thông điệp khoa học'); } });
    const setLevels = () => { ironM.scale.y = Math.max(0.02, iron); ironM.position.y = iron / 2; slagM.scale.y = Math.max(0.02, slag); slagM.position.y = iron + slag / 2; };
    setLevels();
    // mắt gió và ống gió nóng
    const blastG = api.group();
    [-1, 1].forEach(sd => { api.lineBetween(V(sd * 3.6, 2.0, -0.3), V(sd * 1.75, 2.0, -0.3), 0.18, api.mat(0x64748B, { metalness: 0.6 }), blastG); });
    const ring = api.mesh(new T.TorusGeometry(3.6, 0.22, 10, 48, Math.PI), api.mat(0x64748B, { metalness: 0.6 }), [0, 2.0, 0], blastG); ring.rotation.x = -Math.PI / 2;
    api.part(blastG, { name: 'Ống và mắt gió nóng', rows: [['Thổi vào', 'Không khí nóng khoảng 900 – 1200 °C (đôi khi giàu O₂)'], ['Vai trò', 'Đốt cháy than cốc, tạo nhiệt độ cao nhất lò và sinh ra CO']], focus: false });
    const flames = [-1, 1].map(sd => { const f = api.mesh(new T.ConeGeometry(0.28, 0.9, 16), api.mat(0xFFF7AE, { emissive: 0xFFD54A, emissiveIntensity: 1.6, opacity: 0.85 }), [sd * 1.35, 2.0, -0.3]); f.rotation.z = sd * Math.PI / 2; f.userData.noPick = true; return f; });
    // phễu nạp liệu và ống thoát khí lò
    api.cyl(1.3, 0.4, 0.7, api.mat(0x475569, { metalness: 0.5 }), [0, 10.45, -0.1]).userData.noPick = true;
    [-1, 1].forEach(sd => api.lineBetween(V(sd * 1.0, 9.9, -0.4), V(sd * 2.4, 11.2, -0.4), 0.16, api.mat(0x475569, { metalness: 0.5 })).userData.noPick = true);
    api.label('Quặng hematite Fe₂O₃ · than cốc C · đá vôi CaCO₃', [-1.6, 12.0, 0], { cls: 'plain' });
    api.label('Khí lò (CO₂, CO, N₂)', [3.4, 11.4, -0.4], { cls: 'tag', color: '#94A3B8' });
    api.label('Gió nóng', [-3.9, 2.6, 0], { cls: 'tag', color: '#FDE68A' });
    api.label('Gang lỏng ⇢ lỗ tháo gang', [3.2, 0.3, 0.4], { cls: 'tag', color: '#FB923C' });
    api.label('Xỉ ⇢ lỗ tháo xỉ', [-3.0, 0.9, 0.4], { cls: 'tag', color: '#D6C08F' });
    // hạt nguyên liệu rơi xuống (quặng đổi màu theo nấc khử)
    const chargeG = api.group(); api.tag(chargeG, 'charge');
    const ORE = [[7.6, 0x9F1239, 'Fe₂O₃'], [6.0, 0x1F2937, 'Fe₃O₄'], [4.4, 0x57534E, 'FeO'], [0, 0xD1D5DB, 'Fe']];
    const charge = Array.from({ length: 70 }, (_, k) => {
      const kind = k % 3, m = api.sphere(kind === 1 ? 0.13 : 0.11, api.mat(kind === 0 ? 0x9F1239 : kind === 1 ? 0x111111 : 0xF5F5F4, { roughness: 0.8 }), null, chargeG, 10);
      m.userData = { kind, y: 2.6 + R() * 7, a: R(), rr: R() }; return m;
    });
    const oreInfo = { name: 'Quặng sắt đang bị khử từng nấc', sci: 'Fe₂O₃ → Fe₃O₄ → FeO → Fe', rows: [['Màu trong mô hình', 'Đỏ nâu (Fe₂O₃) → đen (Fe₃O₄) → xám (FeO) → bạc (Fe)'], ['Chất khử', 'Khí CO bay từ dưới lên']] };
    api.part(chargeG, oreInfo);
    // khí CO / CO₂ bay lên
    const gasG = api.group(); api.tag(gasG, 'gas');
    const gas = Array.from({ length: 60 }, () => { const m = api.sphere(0.07, api.mat(0x60A5FA, { emissive: 0x60A5FA, emissiveIntensity: 0.8 }), null, gasG, 8); m.userData = { y: 1.6 + R() * 8, a: R(), rr: R() }; return m; });
    api.part(gasG, { name: 'Dòng khí đi lên', sci: 'CO (xanh) → CO₂ (xám)', rows: [['Sinh ra ở', 'Buồng đốt: C + O₂ → CO₂ rồi CO₂ + C → 2CO'], ['Trên đường đi lên', 'CO lấy O của oxide sắt, biến thành CO₂ (hạt chuyển sang xám)']], onSelect() { api.warn('co', WARN_CO, '🔬 Thông điệp khoa học'); } });
    const cCO = new T.Color(0x60A5FA), cCO2 = new T.Color(0x9CA3AF);
    let tapT = 0, tapKind = null;
    const stream = api.mesh(new T.CylinderGeometry(0.07, 0.07, 1, 8), api.mat(0xF97316, { emissive: 0xFF7A1A, emissiveIntensity: 1.2 })); stream.visible = false; stream.userData.noPick = true;
    api.onFrame(dt => {
      heat += ((blast ? 1 : 0.35) - heat) * Math.min(1, dt * 0.4);
      zoneMats.forEach(m => { m.emissiveIntensity = 0.55 * heat; });
      flames.forEach((f, i) => { f.visible = blast; f.scale.setScalar(0.9 + 0.2 * Math.sin(api.time * 18 + i)); });
      ironM.material.emissiveIntensity = 0.4 + 0.7 * heat;
      const v = speed * heat;
      charge.forEach(m => {
        const u = m.userData; if (blast) u.y -= dt * 0.35 * v; if (u.y < 2.6) u.y += 7;
        const r = rAt(u.y) * 0.85 * Math.sqrt(u.rr), a = Math.PI + u.a * Math.PI;
        m.position.set(Math.cos(a) * r, u.y, Math.sin(a) * r * 0.9);
        if (u.kind === 0) { const st = ORE.find(o => u.y >= o[0]); m.material.color.setHex(st[1]); }
        if (u.kind === 2) m.material.color.setHex(u.y < 6.0 ? 0xE7E5E4 : 0xF5F5F4);
        m.scale.setScalar(u.kind === 1 && u.y < 3.2 ? Math.max(0.3, (u.y - 2.6) / 0.6) : 1);
      });
      gas.forEach(m => {
        const u = m.userData; m.visible = heat > 0.5; if (blast) u.y += dt * 1.2 * v; if (u.y > 9.6) u.y = 1.8;
        const r = rAt(u.y) * 0.8 * Math.sqrt(u.rr), a = Math.PI + u.a * Math.PI + Math.sin(api.time + u.rr * 6) * 0.1;
        m.position.set(Math.cos(a) * r, u.y, Math.sin(a) * r * 0.9);
        m.material.color.copy(cCO).lerp(cCO2, Math.max(0, Math.min(1, (u.y - 4) / 5.6))); m.material.emissive.copy(m.material.color);
      });
      if (blast) { iron = Math.min(0.75, iron + dt * 0.006 * v); slag = Math.min(0.42, slag + dt * 0.004 * v); setLevels(); }
      if (tapT > 0) {
        tapT -= dt; stream.visible = true;
        if (tapKind === 'iron') { iron = Math.max(0.05, iron - dt * 0.35); stream.position.set(2.15, -0.25, 0.2); stream.material.color.setHex(0xF97316); }
        else { slag = Math.max(0.03, slag - dt * 0.3); stream.position.set(-2.15, 0.35, 0.2); stream.material.color.setHex(0xD6C08F); }
        stream.scale.y = 0.9; setLevels(); if (tapT <= 0) stream.visible = false;
      }
      api.caption(blast ? `Lò đang chạy · gang dày ${(iron * M).toFixed(1).replace('.', ',')} m · xỉ dày ${(slag * M).toFixed(1).replace('.', ',')} m` : 'Đã tắt gió nóng: than cốc không cháy, lò nguội dần, phản ứng dừng lại');
    });
    // điều khiển
    api.toggle({ label: '🔥 Thổi gió nóng', value: blast, onChange(v) { blast = v; api.toast(v ? 'Gió nóng đốt than cốc: lò nóng lên, CO sinh ra' : 'Không có O₂ thì than cốc không cháy, không có nhiệt và không có CO'); } });
    api.slider({ label: '⏩ Tốc độ', min: 0.5, max: 4, step: 0.5, value: speed, unit: '×', lazy: true, onInput(v) { speed = v; } });
    api.button('🟠 Tháo gang', () => { tapKind = 'iron'; tapT = 1.6; api.noise(1.2, 0.03, 300); });
    api.button('🟡 Tháo xỉ', () => { tapKind = 'slag'; tapT = 1.4; api.noise(1, 0.03, 500); });
    api.checklist(ZONES.map((z, i) => ({ k: z.k, label: `<span style="color:#${z.c.toString(16)}">■</span> ${i + 1}. ${z.name} (${z.t})` })).concat([{ k: 'charge', label: 'Nguyên liệu rơi xuống' }, { k: 'gas', label: 'Khí CO / CO₂ bay lên' }, { k: 'wall', label: 'Thành lò' }]));
    api.note('Nguyên liệu đi <b>xuống</b>, khí nóng đi <b>lên</b> (ngược chiều): khí CO gặp quặng ở mọi độ cao và khử dần Fe₂O₃ → Fe₃O₄ → FeO → Fe.');
    api.view({ pos: [2.5, 6, 21], target: [0, 5.4, 0], min: 4, max: 40 });
  }

  NL.m3d.register('HM7', {
    title: 'Lò cao luyện gang',
    init() { blast = true; iron = 0.25; slag = 0.15; heat = 1; },
    build(api) { build(api); },
    data() {
      const k = heat, H = [[0.3, 1500], [2.0, 1900], [3.5, 1350], [5.2, 900], [6.8, 750], [8.6, 500], [9.6, 250]];
      return {
        title: 'Nhiệt độ theo chiều cao lò cao',
        sub: blast ? 'Nóng nhất ở mắt gió (gió nóng đốt than cốc), nguội dần lên đỉnh lò' : `Đã tắt gió nóng: nhiệt độ đang giảm (còn khoảng ${Math.round(k * 100)}%)`,
        sheets: [{ name: 'Các vùng của lò', head: ['Vùng', 'Nhiệt độ', 'Độ cao (m, lò 30 m)', 'Phản ứng chính'], rows: ZONES.map((z, i) => [`${i + 1}. ${z.name}`, z.t, `${Math.round(z.y[0] * M)} – ${Math.round(z.y[1] * M)}`, z.rx.join('; ')]).concat([['Nồi lò', '≈ 1500 °C', `0 – ${Math.round(1.2 * M)}`, 'Gang lỏng ở đáy, xỉ nổi trên']]) },
          { name: 'Gang và xỉ', head: ['Lớp', 'Thành phần', 'Độ dày hiện tại (m)', 'Vị trí'], rows: [['Gang lỏng', 'Fe + 2 – 5% C', (iron * M).toFixed(2), 'Dưới cùng'], ['Xỉ lỏng', 'CaSiO₃', (slag * M).toFixed(2), 'Nổi trên gang']] }],
        chart: { type: 'line', title: 'Nhiệt độ theo chiều cao', xMin: 0, xMax: 30, yMax: 2000, series: [{ name: 'Nhiệt độ (°C)', color: '#EF4444', points: H.map(([y, t]) => [+(y * M).toFixed(1), Math.round(25 + (t - 25) * k)]) }], yLabel: '°C', xLabel: 'Độ cao từ đáy lò (m)' }
      };
    },
    liveData: true
  });
})();
