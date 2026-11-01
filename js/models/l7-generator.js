// Mô hình Lí 7: máy phát điện xoay chiều (khung dây quay trong từ trường, vành khuyên và cổ góp, e = NBSω·cos, từ thông và suất điện động lệch pha) và đinamô xe đạp.
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
    const T = api.T, W = 1.3, L = 1.6, ZC = 2.4;
    const mN = api.box(1.2, 3.4, 4.4, api.mat(0xEF4444, { roughness: 0.45 }), [-3.7, 0, 0]), mS = api.box(1.2, 3.4, 4.4, api.mat(0x3B82F6, { roughness: 0.45 }), [3.7, 0, 0]);
    api.textSprite('N', { h: 0.8, pos: [-3.7, 2.3, 0] }); api.textSprite('S', { h: 0.8, pos: [3.7, 2.3, 0] });
    api.part(mN, { name: 'Nam châm (phần cảm)', rows: [['Vai trò', 'Tạo từ trường. Trong máy phát lớn, phần cảm thường là nam châm điện'], ['Cảm ứng từ', `B = ${vn(B, 1)} T`]] }); api.part(mS, mN.userData.part);
    const fl = api.group(); fl.userData.group = 'field';
    [[1.7, 1.2], [1.7, -1.2], [-1.7, 1.2], [-1.7, -1.2], [0, 1.9], [0, -1.9]].forEach(([y, z]) => {
      api.lineBetween([-3.1, y, z], [3.1, y, z], 0.018, api.mat(0xFDE047, { opacity: 0.45, depthWrite: false }), fl).userData.noPick = true;
      const c = api.mesh(new T.ConeGeometry(0.08, 0.24, 8), api.mat(0xFDE047, { opacity: 0.6 }), [0.9, y, z], fl); c.rotation.z = -Math.PI / 2; c.userData.noPick = true;
    });
    const rotor = api.group();
    const coilM = api.mat(0xD97706, { metalness: 0.6, roughness: 0.35 });
    let coil = null;
    const buildCoil = () => {
      if (coil) rotor.remove(coil);
      coil = api.group(rotor); const n = Math.round(2 + s.N / 70);
      for (let k = 0; k < n; k++) { const o = (k - (n - 1) / 2) * 0.05, p = [[W + o, o * 0.6, -L - o], [W + o, o * 0.6, L + o], [-W - o, o * 0.6, L + o], [-W - o, o * 0.6, -L - o]]; p.forEach((a, j) => api.lineBetween(a, p[(j + 1) % 4], 0.035, coilM, coil)); }
      api.part(coil, { name: `Khung dây ${s.N} vòng (phần ứng)`, rows: [['Diện tích', '200 cm²'], ['Khi quay', 'Từ thông qua khung biến thiên liên tục nên trong khung xuất hiện suất điện động cảm ứng']] });
    };
    api.cyl(0.07, 0.07, 7, api.mat(0xCBD5E1, { metalness: 0.8 }), [0, 0, 0.9], rotor).rotation.x = Math.PI / 2;
    // vành khuyên (hai vòng liền) và cổ góp (hai nửa vòng)
    const rings = api.group(rotor), split = api.group(rotor);
    [ZC, ZC + 0.55].forEach((z, k) => { const r = api.mesh(new T.TorusGeometry(0.42, 0.09, 10, 36), api.mat(k ? 0xB87333 : 0xC2410C, { metalness: 0.85, roughness: 0.25 }), [0, 0, z], rings); r.userData.noPick = false; });
    api.part(rings, { name: 'Hai vành khuyên', rows: [['Cấu tạo', 'Hai vòng đồng liền, mỗi vòng nối với một đầu khung dây, quay cùng khung'], ['Kết quả', 'Dòng điện đưa ra ngoài đổi chiều theo khung: dòng điện XOAY CHIỀU']] });
    [0, Math.PI].forEach((st, k) => { const m = api.mesh(new T.CylinderGeometry(0.4, 0.4, 0.5, 24, 1, false, st + 0.12, Math.PI - 0.24), api.mat(k ? 0xC2410C : 0xB87333, { metalness: 0.8 }), [0, 0, ZC + 0.25], split); m.rotation.x = Math.PI / 2; });
    api.part(split, { name: 'Cổ góp (hai nửa vành)', rows: [['Vai trò', 'Đổi đầu nối mỗi nửa vòng quay'], ['Kết quả', 'Dòng điện ra ngoài chỉ chạy MỘT CHIỀU (nhưng độ lớn vẫn thay đổi)']] });
    api.lineBetween([W, 0, L], [0.42, 0, ZC], 0.03, coilM, rotor); api.lineBetween([-W, 0, L], [-0.42, 0, ZC + 0.55], 0.03, coilM, rotor);
    const brM = api.mat(0x27272A, { roughness: 0.9 });
    const b1 = api.box(0.26, 0.5, 0.3, brM, [0, -0.72, ZC]), b2 = api.box(0.26, 0.5, 0.3, brM, [0, -0.72, ZC + 0.55]);
    api.part(b1, { name: 'Chổi than', rows: [['Vai trò', 'Đứng yên, tì vào vành khuyên đang quay để đưa điện ra mạch ngoài']] }); api.part(b2, b1.userData.part);
    const bulb = bulbObj(api, [0, -3.2, ZC + 0.3], 0.9);
    api.part(bulb.userData.glass, { name: 'Bóng đèn 220 V – 100 W', rows: [['Sáng đúng định mức', 'Khi điện áp hiệu dụng ≈ 220 V'], ['Quá áp', 'Dây tóc đứt']] });
    const wm = api.mat(0x94A3B8);
    api.lineBetween([0, -0.97, ZC], [-0.4, -2.6, ZC + 0.3], 0.03, wm); api.lineBetween([0, -0.97, ZC + 0.55], [0.4, -2.6, ZC + 0.3], 0.03, wm);
    const crank = api.group(rotor); api.box(0.15, 1.2, 0.15, api.mat(0x475569), [0, 0.6, -3.2], crank); api.cyl(0.12, 0.12, 0.5, api.mat(0xF59E0B), [0, 1.2, -3.45], crank).rotation.x = Math.PI / 2;
    // mũi tên pháp tuyến để thấy từ thông
    const nm = api.mat(0xA855F7, { emissive: 0xA855F7, emissiveIntensity: 0.6 });
    const nArr = api.group(rotor); api.cyl(0.05, 0.05, 1.4, nm, [0, 0.7, 0], nArr); api.mesh(new T.ConeGeometry(0.14, 0.35, 10), nm, [0, 1.55, 0], nArr); nArr.userData.group = 'normal';
    nArr.children.forEach(c => { c.userData.noPick = true; c.userData.group = 'normal'; });
    const eLab = api.label('', [0, 3.2, 0], { cls: 'tag', color: '#FDE047' });

    const info = api.note(''), hist = [];
    let t = 0;
    const E0 = () => s.N * B * S * 2 * Math.PI * s.n;
    const fresh = () => { if (s.burnt) { s.burnt = false; api.toast('🔄 Đã lắp bóng mới'); } };
    api.section('⚡ Máy phát điện');
    api.slider({ label: 'Tốc độ quay n', min: 0, max: 80, step: 5, value: s.n, unit: 'vòng/s', onInput(v) { s.n = v; fresh(); if (v === 0) api.toast('Khung đứng yên: từ thông không đổi, không có điện'); } });
    api.slider({ label: 'Số vòng dây N', min: 50, max: 500, step: 50, value: s.N, unit: 'vòng', lazy: true, onInput(v) { s.N = v; fresh(); buildCoil(); } });
    api.choices({ label: 'Bộ phận lấy điện ra', items: [{ t: '◎ Vành khuyên', v: 'ring' }, { t: '◐ Cổ góp', v: 'split' }], value: s.out, onPick(v) { s.out = v; rings.visible = v === 'ring'; split.visible = v === 'split'; api.toast(v === 'ring' ? 'Vành khuyên: dòng điện xoay chiều' : 'Cổ góp: dòng điện một chiều'); } });
    api.note('🎯 Thắp đèn 220 V sáng đúng định mức như điện lưới: chọn n và N để E hiệu dụng ≈ 220 V.');
    api.button('⏸ Dừng hình / ▶ Chạy tiếp', () => { s.pause = !s.pause; });
    api.checklist([{ k: 'field', label: 'Đường sức từ' }, { k: 'normal', label: 'Pháp tuyến của khung' }]);
    api.note('❓ Khi mặt khung <b>song song</b> với đường sức thì từ thông qua khung bằng 0. Lúc đó suất điện động cảm ứng bằng bao nhiêu?');
    const qa = api.note('');
    api.choices({ label: '', items: [{ t: 'Bằng 0', v: 0 }, { t: 'Lớn nhất', v: 1 }], value: -1, onPick(v) {
      if (v === 1) { qa.set('✅ Đúng. Suất điện động phụ thuộc <b>tốc độ biến thiên</b> của từ thông, không phụ thuộc từ thông lớn hay nhỏ. Lúc từ thông qua 0, nó đổi nhanh nhất.'); api.beep(880, 0.12, 'sine', 0.1); }
      else { qa.set('❌ Chưa đúng, xem giải thích.'); api.warn(null, 'Từ thông bằng 0 không có nghĩa là suất điện động bằng 0. Định luật Faraday: e = −ΔΦ/Δt, tức e phụ thuộc từ thông <b>thay đổi nhanh hay chậm</b>.<br>Bấm Dừng hình đúng lúc mặt khung song song đường sức (mũi tên tím vuông góc đường sức) và nhìn dải đồ thị: đường từ thông Φ đi qua 0 đúng lúc đường e đạt đỉnh.', '🤔 Từ thông và suất điện động'); }
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
      if (!s.pause) { const h = Math.min(dt, 0.05) / SLOW; t += h; s.phi += 2 * Math.PI * s.n * h; }
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
      info.set(`E₀ = N·B·S·ω = ${s.N} × ${vn(B, 1)} × ${vn(S, 2)} × 2π×${s.n} = <b>${vn(e0, 0)} V</b><br>Hiệu dụng E = E₀/√2 = <b>${vn(Erms, 0)} V</b> · tần số f = n = <b>${s.n} Hz</b><br>${s.burnt ? '💥 Đèn đã cháy' : ratio < 0.05 ? 'Đèn tắt' : ratio < 0.8 ? 'Đèn sáng yếu' : ratio <= 1.1 ? 'Đèn sáng đúng định mức' : 'Đèn quá sáng!'}`);
    });
    api.view({ pos: [5, 4.5, 12], target: [0, -0.6, 0.6], min: 4, max: 30 });
  }

  // ---------- đinamô xe đạp ----------
  function dynamo(api) {
    const T = api.T;
    const wheel = api.group(null, [-3.47, 0, 0]);
    const tire = api.mesh(new T.TorusGeometry(3, 0.22, 12, 60), api.mat(0x1F2937, { roughness: 0.9 }), [0, 0, 0], wheel);
    api.mesh(new T.TorusGeometry(2.75, 0.07, 8, 60), api.mat(0xCBD5E1, { metalness: 0.8 }), [0, 0, 0], wheel);
    for (let k = 0; k < 16; k++) { const a = k * Math.PI / 8; api.lineBetween([0, 0, 0], [2.75 * Math.cos(a), 2.75 * Math.sin(a), 0], 0.015, api.mat(0xE5E7EB, { metalness: 0.8 }), wheel); }
    api.cyl(0.25, 0.25, 0.4, api.mat(0x94A3B8, { metalness: 0.8 }), [0, 0, 0], wheel).rotation.x = Math.PI / 2;
    api.part(tire, { name: 'Bánh xe đạp', rows: [['Bán kính', '35 cm'], ['Khi xe chạy', 'Lốp xe làm quay núm của đinamô']] });
    // đinamô: núm tì vào lốp, trục song song trục bánh xe, thân nằm phía sau
    const dy = api.group(null, [0, 0, 0]), ZB = -1.7;
    const roller = api.cyl(0.25, 0.25, 0.5, api.mat(0x475569, { metalness: 0.6 }), [0, 0, 0], dy); roller.rotation.x = Math.PI / 2;
    api.cyl(0.05, 0.05, 1.6, api.mat(0xCBD5E1, { metalness: 0.8 }), [0, 0, -0.8], dy).rotation.x = Math.PI / 2;
    const shell = api.cyl(0.95, 0.95, 1.6, api.mat(0x94A3B8, { metalness: 0.5, opacity: 0.18, depthWrite: false }), [0, 0, ZB], dy); shell.rotation.x = Math.PI / 2;
    api.part(shell, { name: 'Đinamô xe đạp', rows: [['Bên trong', 'Một nam châm quay và một cuộn dây đứng yên'], ['Khác máy phát ở tab trước', 'Ở đây nam châm quay (rô to), cuộn dây đứng yên (stato). Kết quả như nhau: từ thông qua cuộn dây biến thiên']] });
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
    api.section('🚲 Đinamô xe đạp');
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
    tabs: [{ t: '⚡ Máy phát điện', v: 'gen' }, { t: '🚲 Đinamô xe đạp', v: 'dyn' }],
    init() { s = { n: 20, N: 250, out: 'ring', phi: 0.3, pause: false, burnt: false, v: 15 }; },
    build(api, tab) { if (tab === 'gen') generator(api); else dynamo(api); },
    data() {
      const ns = [0, 10, 20, 30, 40, 50, 60], Ns = [100, s.N, 400].filter((v, k, a) => a.indexOf(v) === k);
      const e0 = (N, n) => N * B * S * 2 * Math.PI * n;
      return {
        title: 'Suất điện động cực đại của máy phát', sub: `E₀ = N·B·S·ω với B = ${vn(B, 1)} T, S = 200 cm², ω = 2πn. Ở Việt Nam điện lưới có tần số 50 Hz, điện áp hiệu dụng 220 V.`,
        sheets: [{ name: 'E₀ theo n', head: ['n (vòng/s)', ...Ns.map(N => `E₀ với ${N} vòng (V)`), `E hiệu dụng với ${s.N} vòng (V)`], rows: ns.map(n => [n, ...Ns.map(N => vn(e0(N, n), 0)), vn(e0(s.N, n) / Math.SQRT2, 0)]) }],
        chart: { type: 'line', xLabel: 'n (vòng/s)', yLabel: 'E₀ (V)', xMin: 0, xMax: 60, yMin: 0, yMax: Math.ceil(e0(400, 60) / 100) * 100,
          series: Ns.map((N, k) => ({ name: `${N} vòng`, color: ['#38BDF8', '#F59E0B', '#E86A92'][k], dots: true, points: ns.map(n => [n, +e0(N, n).toFixed(1)]) })) }
      };
    }
  });
})();
