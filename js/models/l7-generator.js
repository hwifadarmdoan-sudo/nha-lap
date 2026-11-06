// Mô hình Lí 7: máy phát điện xoay chiều (khung dây quay trong từ trường, vành khuyên và cổ góp, e = NBSω·cos, từ thông và suất điện động lệch pha) và dynamo xe đạp.
(function () {
  const vn = (v, d) => (+v).toFixed(d).replace('.', ',');
  const B = 0.2, S = 0.02, SLOW = 50; // T, m², chiếu chậm 50 lần
  let s = null;

  function bulbObj(api, pos, scale) {
    const T = api.T, g = api.group(null, pos); g.scale.setScalar(scale || 1);
    api.cyl(0.32, 0.38, 0.6, api.mat(0x9CA3AF, { metalness: 0.7 }), [0, -0.6, 0], g);
    const gm = api.mat(0xFEF9C3, { opacity: 0.55, emissive: 0xFDE047, emissiveIntensity: 0, depthWrite: false });
    const glass = api.sphere(0.75, gm, [0, 0.35, 0], g);
    const fm = api.mat(0x78350F, { emissive: 0xF97316, emissiveIntensity: 0 });
    api.lineBetween([-0.2, 0.2, 0], [0.2, 0.2, 0], 0.03, fm, g);
    const light = new T.PointLight(0xFDE047, 0, 9); light.position.set(0, 0.4, 0); g.add(light);
    g.userData.glow = (b, dead) => { gm.emissiveIntensity = b * 1.1; fm.emissiveIntensity = b * 2; light.intensity = b * 6; gm.color.set(dead ? 0x52525B : 0xFEF9C3); };
    g.userData.glass = glass;
    return g;
  }

  function generator(api) {
    const T = api.T, W = 1.3, L = 1.6, ZC = 2.4, K_DECAY = 1.2; // tay quay thả ra: ω giảm dần e^(−k·dt)
    // nền có lưới
    const grid = new T.GridHelper(40, 40, 0x334155, 0x1E293B); grid.position.y = -4.7; grid.userData.noPick = true; api.root.add(grid);
    api.box(40, 0.05, 40, api.mat(0x0B1220, { roughness: 1 }), [0, -4.75, 0]).userData.noPick = true;
    // cực từ cong ôm khung (mặt lõm hướng vào trục), chữ N/S dán lên mặt ngoài
    const pole = (a0, col, letter, x) => {
      const R1 = 2.1, R2 = 3.1, sh = new T.Shape();
      sh.absarc(0, 0, R2, a0 - 0.75, a0 + 0.75, false); sh.absarc(0, 0, R1, a0 + 0.75, a0 - 0.75, true);
      const g = new T.ExtrudeGeometry(sh, { depth: 4.4, bevelEnabled: false }); g.translate(0, 0, -2.2);
      const m = api.mesh(g, api.mat(col, { roughness: 0.5 }));
      const c = document.createElement('canvas'); c.width = c.height = 128; const x2 = c.getContext('2d');
      x2.fillStyle = '#FFFFFF'; x2.font = "800 96px 'Baloo 2', sans-serif"; x2.textAlign = 'center'; x2.textBaseline = 'middle'; x2.fillText(letter, 64, 70);
      const tx = new T.CanvasTexture(c); tx.colorSpace = T.SRGBColorSpace;
      const pl = api.mesh(new T.PlaneGeometry(0.9, 0.9), new T.MeshBasicMaterial({ map: tx, transparent: true }), [x, 0, 2.21]); pl.userData.noPick = true; // dán lên mặt đầu (phía người xem)
      return m;
    };
    const mN = pole(Math.PI, 0xEF4444, 'N', -2.6), mS = pole(0, 0x3B82F6, 'S', 2.6);
    api.part(mN, { name: 'Cực từ N (phần cảm)', rows: [['Vai trò', 'Tạo từ trường. Trong máy phát lớn, phần cảm thường là nam châm điện'], ['Cảm ứng từ', `B = ${vn(B, 1)} T`], ['Mặt cong', 'Ôm sát khung để từ trường trong khe hở gần như đều']] });
    api.part(mS, { name: 'Cực từ S (phần cảm)', rows: mN.userData.part.rows });
    const fl = api.group(); fl.userData.group = 'field';
    [[1.4, 1.2], [1.4, -1.2], [-1.4, 1.2], [-1.4, -1.2], [0, 1.9], [0, -1.9], [0.7, 0], [-0.7, 0]].forEach(([y, z]) => {
      api.lineBetween([-2.05, y, z], [2.05, y, z], 0.018, api.mat(0xFDE047, { opacity: 0.45, depthWrite: false }), fl).userData.noPick = true;
      const c = api.mesh(new T.ConeGeometry(0.08, 0.24, 8), api.mat(0xFDE047, { opacity: 0.6 }), [0.9, y, z], fl); c.rotation.z = -Math.PI / 2; c.userData.noPick = true;
    });
    const rotor = api.group();
    const coilM = api.mat(0xD97706, { metalness: 0.6, roughness: 0.35 }), darkM = api.mat(0x111827, { metalness: 0.3, roughness: 0.6 });
    let coil = null;
    const buildCoil = () => {
      if (coil) rotor.remove(coil);
      coil = api.group(rotor); const n = Math.round(2 + s.N / 70);
      for (let k = 0; k < n; k++) { const o = (k - (n - 1) / 2) * 0.05, p = [[W + o, o * 0.6, -L - o], [W + o, o * 0.6, L + o], [-W - o, o * 0.6, L + o], [-W - o, o * 0.6, -L - o]]; p.forEach((a, j) => api.lineBetween(a, p[(j + 1) % 4], 0.035, j === 0 ? darkM : coilM, coil)); }
      api.part(coil, { name: `Khung dây ${s.N} vòng (phần ứng)`, rows: [['Diện tích', '200 cm²'], ['Cạnh tô đen', 'Để thấy chiều quay và góc θ giữa pháp tuyến khung với đường sức'], ['Khi quay', 'Từ thông qua khung biến thiên liên tục nên trong khung xuất hiện suất điện động cảm ứng']] });
    };
    api.cyl(0.07, 0.07, 7.4, api.mat(0xCBD5E1, { metalness: 0.8 }), [0, 0, 0.9], rotor).rotation.x = Math.PI / 2;
    // hai vành khuyên dẹt (trắng, đen) và cổ góp hai nửa vành
    const rings = api.group(rotor), split = api.group(rotor);
    [[ZC, 0xF1F5F9], [ZC + 0.55, 0x111827]].forEach(([z, col]) => { const r = api.cyl(0.45, 0.45, 0.2, api.mat(col, { metalness: 0.4, roughness: 0.4 }), [0, 0, z], rings); r.rotation.x = Math.PI / 2; });
    api.part(rings, { name: 'Hai vành khuyên', rows: [['Cấu tạo', 'Hai vòng kim loại liền (một trắng, một đen), mỗi vòng nối với một đầu khung dây, quay cùng khung'], ['Kết quả', 'Dòng điện đưa ra ngoài đổi chiều theo khung: dòng điện XOAY CHIỀU']] });
    [0, Math.PI].forEach((st, k) => { const m = api.mesh(new T.CylinderGeometry(0.45, 0.45, 0.5, 24, 1, false, st + 0.12, Math.PI - 0.24), api.mat(k ? 0x111827 : 0xF1F5F9, { metalness: 0.4 }), [0, 0, ZC + 0.25], split); m.rotation.x = Math.PI / 2; });
    api.part(split, { name: 'Cổ góp (hai nửa vành)', rows: [['Vai trò', 'Đổi đầu nối mỗi nửa vòng quay'], ['Kết quả', 'Dòng điện ra ngoài chỉ chạy MỘT CHIỀU (nhưng độ lớn vẫn thay đổi)']] });
    api.lineBetween([W, 0, L], [0.42, 0, ZC], 0.03, coilM, rotor); api.lineBetween([-W, 0, L], [-0.42, 0, ZC + 0.55], 0.03, coilM, rotor);
    // chổi than tì sát cạnh bên vành
    const brM = api.mat(0x8A8A8F, { roughness: 0.9 });
    const b1 = api.box(0.26, 0.5, 0.22, brM, [0, -0.7, ZC]), b2 = api.box(0.26, 0.5, 0.22, brM, [0, -0.7, ZC + 0.55]);
    api.part(b1, { name: 'Chổi than', rows: [['Vai trò', 'Đứng yên, tì vào vành khuyên đang quay để đưa điện ra mạch ngoài']] }); api.part(b2, b1.userData.part);
    // bóng đèn và mạch ngoài khép kín: chổi than 1 → đáy đui → (dây tóc) → ren đui → chổi than 2
    const bulb = bulbObj(api, [0, -3.0, ZC + 0.3], 0.9);
    api.part(bulb.userData.glass, { name: 'Bóng đèn 220 V – 100 W', rows: [['Sáng đúng định mức', 'Khi điện áp hiệu dụng ≈ 220 V'], ['Độ sáng', 'Tỉ lệ với e²/R nên nhấp nháy với tần số 2f khi quay chậm'], ['Quá áp', 'Dây tóc đứt']] });
    const wm = api.mat(0xFFF1C9, { roughness: 0.6 });
    const wire = pts => { const g = api.group(); for (let k = 0; k < pts.length - 1; k++) api.lineBetween(pts[k], pts[k + 1], 0.02, wm, g); pts.slice(1, -1).forEach(q => api.sphere(0.03, wm, q, g, 8)); g.traverse(o => o.userData.noPick = true); return g; };
    const capY = -3.0 - 0.6 * 0.9, capR = 0.36 * 0.9; // đui đèn: tâm và bán kính
    const w1 = wire([[0, -0.95, ZC], [0, -1.5, ZC], [-1.0, -1.5, ZC], [-1.0, capY - 0.75, ZC + 0.3], [0, capY - 0.75, ZC + 0.3], [0, capY - 0.27, ZC + 0.3]]);
    const w2 = wire([[0, -0.95, ZC + 0.55], [0, -1.5, ZC + 0.55], [1.0, -1.5, ZC + 0.55], [1.0, capY, ZC + 0.3], [capR, capY, ZC + 0.3]]);
    const hbW = api.hitbox(2.4, 3.6, 1, [0, -2.3, ZC + 0.3]); api.part(hbW, { name: 'Mạch ngoài', rows: [['Đường đi', 'Chổi than 1 → đáy đui đèn → dây tóc → ren đui → chổi than 2: mạch khép kín'], ['Dòng điện', 'Chỉ chạy khi khung quay (từ thông biến thiên)']] });
    // tay quay trên trục: đĩa gá, cánh tay, chốt, tay nắm cam
    const crank = api.group(rotor, [0, 0, 3.7]); // phía trước vành khuyên, gần người xem
    api.cyl(0.4, 0.4, 0.12, api.mat(0x475569, { metalness: 0.6 }), [0, 0, 0], crank).rotation.x = Math.PI / 2;
    api.box(0.14, 1.2, 0.14, api.mat(0x475569), [0, 0.6, 0.1], crank);
    api.cyl(0.05, 0.05, 0.3, api.mat(0x94A3B8), [0, 1.2, 0.3], crank).rotation.x = Math.PI / 2;
    const handle = api.cyl(0.11, 0.11, 0.7, api.mat(0xF97316, { roughness: 0.5 }), [0, 1.2, 0.75], crank); handle.rotation.x = Math.PI / 2;
    api.part(handle, { name: 'Tay quay', rows: [['Cách dùng', 'Kéo tay nắm quanh trục để quay khung; thả ra thì quay chậm dần'], ['Hộp số', 'Tay quay nối qua hộp số tăng tốc 1:50 nên khung thật quay nhanh gấp 50 lần tay (cũng là tỉ lệ chiếu chậm)']] });
    api.hitbox(0.6, 1.0, 0.6, [0, 0, 0], handle, handle);
    api.label('Tay quay', handle, { cls: 'plain', off: [0, 0.5, 0.3] });
    // mũi tên pháp tuyến để thấy từ thông
    const nm = api.mat(0xA855F7, { emissive: 0xA855F7, emissiveIntensity: 0.6 });
    const nArr = api.group(rotor); api.cyl(0.05, 0.05, 1.4, nm, [0, 0.7, 0], nArr); api.mesh(new T.ConeGeometry(0.14, 0.35, 10), nm, [0, 1.55, 0], nArr); nArr.userData.group = 'normal';
    nArr.children.forEach(c => { c.userData.noPick = true; c.userData.group = 'normal'; });
    const eLab = api.label('', [0, 3.6, 0], { cls: 'tag', color: '#FDE047' });
    api.label('Chổi than', b1, { cls: 'plain', off: [-0.9, -0.1, 0] }); api.label('Vành khuyên', rings.children[0], { cls: 'plain', off: [0.9, 0.5, 0] });

    const info = api.note(''), hist = [];
    let t = 0, lastA = null, lastT = 0;
    // kéo tay quay: góc tay nắm quanh trục z, ω lấy từ độ đổi góc giữa hai khung hình
    api.draggable(handle, {
      normal: new T.Vector3(0, 0, 1), anchor: new T.Vector3(0, 0, 4.45),
      start(p) { s.auto = false; s.w = 0; lastA = Math.atan2(p.y, p.x); lastT = api.time; s.grab = true; },
      move(p) {
        const a = Math.atan2(p.y, p.x); let da = a - lastA; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI;
        const dt = Math.max(1e-3, api.time - lastT); s.phi += da; s.w = Math.max(-6.3, Math.min(6.3, 0.7 * s.w + 0.3 * (da / dt))); lastA = a; lastT = api.time; // tối đa ≈ 3000 vòng/phút
      },
      end() { s.grab = false; },
      tapSelect: true
    });
    const nEff = () => s.auto ? s.n : Math.abs(s.w) * SLOW / (2 * Math.PI); // vòng/s của khung thật
    const E0 = () => s.N * B * S * 2 * Math.PI * nEff();
    const fresh = () => { if (s.burnt) { s.burnt = false; api.toast('🔄 Đã lắp bóng mới'); } };
    api.section('⚡ Máy phát điện');
    const autoBtn = api.button(s.auto ? '⏹ Dừng quay tự động' : '▶ Quay tự động', b => { s.auto = !s.auto; s.w = 0; b.textContent = s.auto ? '⏹ Dừng quay tự động' : '▶ Quay tự động'; if (!s.auto) api.toast('Kéo tay quay màu cam để tự quay khung'); });
    void autoBtn;
    api.slider({ label: 'Tốc độ quay tự động', min: 0, max: 3000, step: 60, value: Math.round(s.n * 60), unit: 'vòng/phút', onInput(v) { s.n = v / 60; s.auto = true; fresh(); if (v === 0) api.toast('Khung đứng yên: từ thông không đổi, không có điện'); } });
    api.slider({ label: 'Số vòng dây N', min: 50, max: 500, step: 50, value: s.N, unit: 'vòng', lazy: true, onInput(v) { s.N = v; fresh(); buildCoil(); } });
    api.choices({ label: 'Bộ phận lấy điện ra', items: [{ t: '◎ Vành khuyên', v: 'ring' }, { t: '◐ Cổ góp', v: 'split' }], value: s.out, onPick(v) { s.out = v; rings.visible = v === 'ring'; split.visible = v === 'split'; api.toast(v === 'ring' ? 'Vành khuyên: dòng điện xoay chiều' : 'Cổ góp: dòng điện một chiều'); } });
    api.note('🎯 Thắp đèn 220 V sáng đúng định mức như điện lưới: chọn tốc độ và N để E hiệu dụng ≈ 220 V. Điện lưới 50 Hz ứng với máy 2 cực quay 3000 vòng/phút.');
    api.button('⏸ Dừng hình / ▶ Chạy tiếp', () => { s.pause = !s.pause; });
    api.checklist([{ k: 'field', label: 'Đường sức từ' }, { k: 'normal', label: 'Pháp tuyến của khung' }]);
    api.note('❓ Khi mặt khung <b>song song</b> với đường sức thì từ thông qua khung bằng 0. Lúc đó suất điện động cảm ứng bằng bao nhiêu?');
    const qa = api.note('<span style="opacity:.6">Chọn một đáp án bên dưới.</span>');
    api.choices({ label: '', items: [{ t: 'Bằng 0', v: 0 }, { t: 'Lớn nhất', v: 1 }], value: -1, onPick(v) {
      if (v === 1) { qa.set('✅ Đúng. Suất điện động phụ thuộc <b>tốc độ biến thiên</b> của từ thông, không phụ thuộc từ thông lớn hay nhỏ. Lúc từ thông qua 0, nó đổi nhanh nhất.'); api.beep(880, 0.12, 'sine', 0.1); }
      else { qa.set('❌ Chưa đúng, xem giải thích.'); api.warn(null, 'Từ thông bằng 0 không có nghĩa là suất điện động bằng 0. Định luật Faraday: e = −ΔΦ/Δt, tức e phụ thuộc từ thông <b>thay đổi nhanh hay chậm</b>.<br>Bấm Dừng hình đúng lúc mặt khung song song đường sức (mũi tên tím vuông góc đường sức) và nhìn dải đồ thị: e đang ở đỉnh.', '🤔 Từ thông và suất điện động'); }
    } });
    buildCoil(); split.visible = false;

    api.strip({ h: innerHeight < 500 ? 62 : 100, draw(x, w, h) {
      x.clearRect(0, 0, w, h); x.fillStyle = '#0B1220'; x.fillRect(0, 0, w, h);
      const mid = h / 2 + 6, A = h / 2 - 16, mx = 500;
      x.strokeStyle = '#334155'; x.lineWidth = 1; x.beginPath(); x.moveTo(0, mid); x.lineTo(w, mid); x.stroke();
      [[1, '#FDE047', 1], [2, '#A855F7', 0]].forEach(([k, c, sc]) => { x.strokeStyle = c; x.lineWidth = 2; x.setLineDash(k === 2 ? [5, 4] : []); x.beginPath(); hist.forEach((p, i) => { const px = w - (hist.length - i) * 2, py = mid - (sc ? p[k] / mx : p[k]) * A; i ? x.lineTo(px, py) : x.moveTo(px, py); }); x.stroke(); });
      x.setLineDash([]);
      x.font = `700 ${Math.round(h / 7)}px 'Baloo 2', sans-serif`; let tx = 10; [['e(t) suất điện động', '#FDE047'], ['Φ(t) từ thông (nét đứt)', '#A855F7'], [`chiếu chậm ${SLOW} lần`, '#64748B']].forEach(([str, c]) => { x.fillStyle = c; x.fillText(str, tx, 18); tx += x.measureText(str).width + 18; });
    } });

    api.onFrame(dt => {
      const h = Math.min(dt, 0.05);
      if (!s.pause) {
        if (s.auto) { t += h / SLOW; s.phi += 2 * Math.PI * s.n * h / SLOW; }
        else { if (!s.grab) { s.phi += s.w * h; s.w *= Math.exp(-K_DECAY * h); if (Math.abs(s.w) < 0.02) s.w = 0; } t += h / SLOW; }
      }
      rotor.rotation.z = s.phi;
      const c = Math.cos(s.phi), e0 = E0(), eRaw = e0 * c, e = s.out === 'ring' ? eRaw : Math.abs(eRaw), Phi = -Math.sin(s.phi);
      if (!s.pause) { hist.push([t, e, Phi]); if (hist.length > 900) hist.shift(); }
      const Erms = e0 / Math.SQRT2, ratio = s.burnt ? 0 : Erms / 220;
      if (!s.burnt && ratio > 1.35) {
        s.burnt = true; api.beep(160, 0.4, 'sawtooth', 0.15); api.toast('💥 Bóng đèn cháy! Giảm tốc độ hoặc số vòng là có bóng mới');
        api.warn('burn', `Suất điện động cực đại E₀ = N·B·S·ω = ${vn(e0, 0)} V, giá trị hiệu dụng E = E₀/√2 = ${vn(Erms, 0)} V, quá lớn so với 220 V của đèn nên dây tóc đứt.<br>E₀ tỉ lệ với cả số vòng dây N và tốc độ quay n.`, '💥 Bóng đèn cháy');
      }
      const inst = s.burnt ? 0 : (e / 311) ** 2;
      bulb.userData.glow(Math.min(1.5, inst), s.burnt);
      eLab.set(`e = ${vn(e, 0)} V`);
      const n = nEff(), rpm = Math.round(n * 60);
      info.set(`${s.auto ? 'Quay tự động' : s.grab ? 'Đang quay tay' : s.w ? 'Quay theo đà (chậm dần)' : 'Khung đứng yên: kéo tay quay hoặc bấm Quay tự động'}: <b>${rpm} vòng/phút</b> = ${vn(n, 1)} vòng/s → f = <b>${vn(n, 1)} Hz</b><br>E₀ = N·B·S·ω = ${s.N} × ${vn(B, 1)} × ${vn(S, 2)} × 2π×${vn(n, 1)} = <b>${vn(e0, 0)} V</b> · E hiệu dụng = E₀/√2 = <b>${vn(Erms, 0)} V</b><br>e = E₀·sin θ (θ: góc giữa pháp tuyến khung và đường sức) · ${s.burnt ? '💥 Đèn đã cháy' : ratio < 0.05 ? 'Đèn tắt' : ratio < 0.8 ? 'Đèn sáng yếu' : ratio <= 1.1 ? 'Đèn sáng đúng định mức' : 'Đèn quá sáng!'}`);
    });
    api.view({ pos: [5.5, 4.5, 12.5], target: [0, -0.8, 0.4], min: 4, max: 30 });
  }

  // ---------- dynamo xe đạp ----------
  function dynamo(api) {
    const T = api.T;
    const wheel = api.group(null, [-3.47, 0, 0]);
    const tire = api.mesh(new T.TorusGeometry(3, 0.22, 12, 60), api.mat(0x1F2937, { roughness: 0.9 }), [0, 0, 0], wheel);
    api.mesh(new T.TorusGeometry(2.75, 0.07, 8, 60), api.mat(0xCBD5E1, { metalness: 0.8 }), [0, 0, 0], wheel);
    for (let k = 0; k < 16; k++) { const a = k * Math.PI / 8; api.lineBetween([0, 0, 0], [2.75 * Math.cos(a), 2.75 * Math.sin(a), 0], 0.015, api.mat(0xE5E7EB, { metalness: 0.8 }), wheel); }
    api.cyl(0.25, 0.25, 0.4, api.mat(0x94A3B8, { metalness: 0.8 }), [0, 0, 0], wheel).rotation.x = Math.PI / 2;
    api.part(tire, { name: 'Bánh xe đạp', rows: [['Bán kính', '35 cm'], ['Khi xe chạy', 'Lốp xe làm quay núm của dynamo']] });
    // dynamo: núm tì vào lốp, trục song song trục bánh xe, thân nằm phía sau
    const dy = api.group(null, [0, 0, 0]), ZB = -1.7;
    const roller = api.cyl(0.25, 0.25, 0.5, api.mat(0x475569, { metalness: 0.6 }), [0, 0, 0], dy); roller.rotation.x = Math.PI / 2;
    api.cyl(0.05, 0.05, 1.6, api.mat(0xCBD5E1, { metalness: 0.8 }), [0, 0, -0.8], dy).rotation.x = Math.PI / 2;
    const shell = api.cyl(0.95, 0.95, 1.6, api.mat(0x94A3B8, { metalness: 0.5, opacity: 0.18, depthWrite: false }), [0, 0, ZB], dy); shell.rotation.x = Math.PI / 2;
    api.part(shell, { name: 'Dynamo xe đạp', rows: [['Bên trong', 'Một nam châm quay và một cuộn dây đứng yên'], ['Khác máy phát ở tab trước', 'Ở đây nam châm quay (rotor), cuộn dây đứng yên (stator). Kết quả như nhau: từ thông qua cuộn dây biến thiên']] });
    const mag = api.group(dy, [0, 0, ZB]);
    api.box(0.5, 0.6, 0.8, api.mat(0xEF4444), [0, 0.3, 0], mag); api.box(0.5, 0.6, 0.8, api.mat(0x3B82F6), [0, -0.3, 0], mag);
    api.part(mag, { name: 'Nam châm quay', rows: [['Quay cùng núm', 'Mỗi vòng quay làm từ thông qua cuộn dây đổi chiều hai lần']] });
    const coil = api.mesh(new T.TorusGeometry(1.05, 0.14, 10, 40), api.mat(0xD97706, { metalness: 0.6 }), [0, 0, ZB], dy); coil.rotation.x = Math.PI / 2;
    api.part(coil, { name: 'Cuộn dây đứng yên', rows: [['Nối với', 'Đèn pha xe đạp 6 V – 3 W']] });
    const lamp = bulbObj(api, [3.2, 1.4, ZB], 0.8);
    api.part(lamp.userData.glass, { name: 'Đèn xe đạp 6 V – 3 W', rows: [['Sáng định mức', 'Khi xe chạy khoảng 15 km/h']] });
    api.lineBetween([1.05, 0.1, ZB], [2.95, 0.95, ZB], 0.03, api.mat(0x94A3B8)); api.lineBetween([1.05, -0.1, ZB + 0.1], [3.45, 0.95, ZB], 0.03, api.mat(0x94A3B8));
    const info = api.note(''), hist = [];
    let t = 0, ph = 0, wp = 0;
    api.section('🚲 Dynamo xe đạp');
    api.slider({ label: 'Tốc độ xe', min: 0, max: 30, step: 1, value: s.v, unit: 'km/h', onInput(v) { s.v = v; if (v === 0) api.toast('Xe dừng: đèn tắt ngay'); } });
    api.note('Đạp nhanh hơn thì nam châm quay nhanh hơn: từ thông biến thiên nhanh hơn nên điện áp <b>lớn hơn</b> và tần số cũng <b>lớn hơn</b>. Nhìn dải đồ thị bên dưới.');
    api.strip({ h: innerHeight < 500 ? 62 : 100, draw(x, w, h) {
      x.clearRect(0, 0, w, h); x.fillStyle = '#0B1220'; x.fillRect(0, 0, w, h);
      const mid = h / 2 + 6, A = h / 2 - 16;
      x.strokeStyle = '#334155'; x.beginPath(); x.moveTo(0, mid); x.lineTo(w, mid); x.stroke();
      x.strokeStyle = '#FDE047'; x.lineWidth = 2; x.beginPath(); hist.forEach((p, i) => { const px = w - (hist.length - i) * 2, py = mid - p / 12 * A; i ? x.lineTo(px, py) : x.moveTo(px, py); }); x.stroke();
      x.font = `700 ${Math.round(h / 7)}px 'Baloo 2', sans-serif`; x.fillStyle = '#FDE047'; x.fillText('u(t) ở hai đầu đèn', 10, 18); const tw = x.measureText('u(t) ở hai đầu đèn').width; x.fillStyle = '#64748B'; x.fillText('chiếu chậm 40 lần', 28 + tw, 18);
    } });
    api.onFrame(dt => {
      const h = Math.min(dt, 0.05), vm = s.v / 3.6, nRoll = vm / (2 * Math.PI * 0.012), U0 = 6 * Math.SQRT2 * s.v / 15;
      t += h / 40; ph += 2 * Math.PI * nRoll * h / 40; wp += vm / 0.35 * h / 40 * 6;
      wheel.rotation.z = -wp; mag.rotation.z = ph; roller.rotation.y = ph;
      const u = U0 * Math.sin(ph); hist.push(u); if (hist.length > 900) hist.shift();
      lamp.userData.glow(Math.min(1.5, (u / 8.5) ** 2));
      info.set(`Tốc độ ${s.v} km/h → núm quay ${vn(nRoll, 0)} vòng/s → tần số <b>${vn(nRoll, 0)} Hz</b><br>Điện áp hiệu dụng ≈ <b>${vn(6 * s.v / 15, 1)} V</b> · ${s.v === 0 ? 'đèn tắt' : s.v < 10 ? 'đèn sáng yếu' : s.v <= 18 ? 'đèn sáng tốt' : 'đèn rất sáng'}`);
    });
    api.view({ pos: [5, 4, 9], target: [-0.6, 0, -0.8], min: 4, max: 30 });
  }

  NL.m3d.register('LM7', {
    title: 'Máy phát điện xoay chiều',
    tabs: [{ t: '⚡ Máy phát điện', v: 'gen' }, { t: '🚲 Dynamo xe đạp', v: 'dyn' }],
    init() { s = { n: 20, N: 250, out: 'ring', phi: 0.3, pause: false, burnt: false, v: 15, auto: true, w: 0, grab: false }; },
    build(api, tab) { if (tab === 'gen') generator(api); else dynamo(api); },
    data() {
      const ns = [0, 10, 20, 30, 40, 50, 60], Ns = [100, s.N, 400].filter((v, k, a) => a.indexOf(v) === k);
      const e0 = (N, n) => N * B * S * 2 * Math.PI * n;
      return {
        title: 'Suất điện động cực đại của máy phát', sub: `E₀ = N·B·S·ω với B = ${vn(B, 1)} T, S = 200 cm², ω = 2πn. Ở Việt Nam điện lưới có tần số 50 Hz, điện áp hiệu dụng 220 V.`,
        sheets: [{ name: 'E₀ theo n', head: ['n (vòng/s = Hz)', ...Ns.map(N => `E₀ với ${N} vòng (V)`), `E hiệu dụng với ${s.N} vòng (V)`], rows: ns.map(n => [n, ...Ns.map(N => vn(e0(N, n), 0)), vn(e0(s.N, n) / Math.SQRT2, 0)]) }],
        chart: { type: 'line', xLabel: 'n (vòng/s)', yLabel: 'E₀ (V)', xMin: 0, xMax: 60, yMin: 0, yMax: Math.ceil(e0(400, 60) / 100) * 100,
          series: Ns.map((N, k) => ({ name: `${N} vòng`, color: ['#38BDF8', '#F59E0B', '#E86A92'][k], dots: true, points: ns.map(n => [n, +e0(N, n).toFixed(1)]) })) }
      };
    }
  });
})();
