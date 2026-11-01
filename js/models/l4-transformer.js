// Mô hình Lí 4: máy biến áp một pha (U₂/U₁ = N₂/N₁, cấp điện một chiều thì không chạy, đèn cháy khi quá áp) và truyền tải điện đi xa (hao phí ΔP = P²R/U²).
(function () {
  const vn = (v, d) => (+v).toFixed(d).replace('.', ',');
  const LOADS = { b220: { t: '💡 Đèn 220 V – 100 W', U: 220, P: 100 }, b12: { t: '🔦 Đèn 12 V – 24 W', U: 12, P: 24 } };
  const RW = 2; // điện trở dây cuộn sơ cấp (Ω)
  let s = null;

  function calc() {
    const ld = LOADS[s.load], R = ld.U * ld.U / ld.P;
    if (s.src === 'dc') return { U2: 0, I2: 0, I1: s.U1 / RW, P2: 0, R };
    const U2 = s.burnt ? s.U1 * s.N2 / s.N1 : s.U1 * s.N2 / s.N1, I2 = s.burnt ? 0 : U2 / R;
    return { U2, I2, I1: I2 * s.N2 / s.N1, P2: U2 * I2, R };
  }

  function coilPts(T, x, r, turns, y0, y1) {
    const pts = [], n = turns * 20;
    for (let k = 0; k <= n; k++) { const t = k / n, a = t * turns * 2 * Math.PI; pts.push(new T.Vector3(x + r * Math.cos(a), y0 + (y1 - y0) * t, r * Math.sin(a))); }
    return pts;
  }

  function transformer(api) {
    const T = api.T, coreM = api.mat(0x64748B, { metalness: 0.75, roughness: 0.35 });
    const core = api.group();
    [[0, 2.5, 8, 1], [0, -2.5, 8, 1]].forEach(([x, y, w, h]) => api.box(w, h, 1, coreM, [x, y, 0], core));
    [[-3.5, 0], [3.5, 0]].forEach(([x]) => api.box(1, 4, 1, coreM, [x, 0, 0], core));
    for (let k = -4; k <= 4; k++) { const l = api.box(8.04, 0.012, 1.02, api.mat(0x334155), [0, 2.5, k * 0.11], core); l.userData.noPick = true; }
    api.part(core, { name: 'Lõi thép kỹ thuật điện', rows: [['Cấu tạo', 'Nhiều lá thép mỏng ghép cách điện với nhau'], ['Vai trò', 'Dẫn từ thông đi khép kín qua cả hai cuộn dây'], ['Vì sao ghép lá mỏng', 'Giảm dòng điện Fu-cô làm nóng lõi']] });

    let c1 = null, c2 = null;
    const m1 = api.mat(0xD97706, { metalness: 0.6, roughness: 0.35, emissive: 0xFF2200, emissiveIntensity: 0 });
    const m2 = api.mat(0x0EA5E9, { metalness: 0.5, roughness: 0.35 });
    const coils = () => {
      [c1, c2].forEach(o => o && o.parent && o.parent.remove(o));
      c1 = api.tube(coilPts(T, -3.5, 0.78, Math.round(4 + s.N1 / 120), -1.7, 1.7), 0.06, m1, null, 600);
      c2 = api.tube(coilPts(T, 3.5, 0.78, Math.round(4 + s.N2 / 160), -1.7, 1.7), 0.06, m2, null, 600);
      api.part(c1, { name: `Cuộn sơ cấp N₁ = ${s.N1} vòng`, rows: [['Nối với', 'Nguồn điện'], ['Nhiệm vụ', 'Dòng điện xoay chiều trong cuộn này tạo từ thông biến thiên trong lõi']] });
      api.part(c2, { name: `Cuộn thứ cấp N₂ = ${s.N2} vòng`, rows: [['Nối với', 'Tải tiêu thụ (bóng đèn)'], ['Nhiệm vụ', 'Từ thông biến thiên xuyên qua cuộn này sinh ra suất điện động cảm ứng']] });
    };

    // nguồn, dây nối, bóng đèn
    const src = api.box(1.8, 1.4, 1.2, api.mat(0x1E293B, { roughness: 0.5 }), [-7.4, -1.4, 0]);
    api.part(src, { name: 'Nguồn điện', rows: [['Xoay chiều (~)', 'Điện áp đổi chiều 50 lần mỗi giây'], ['Một chiều (=)', 'Điện áp không đổi, như pin, ắc quy']] });
    const srcTxt = api.label('', [-7.4, 0, 0], { cls: 'tag', color: '#FDE047' });
    const wm = api.mat(0x94A3B8, { metalness: 0.4 });
    api.lineBetween([-6.5, -1, 0], [-4.28, -1.7, 0.2], 0.04, wm); api.lineBetween([-6.5, -1.8, 0], [-4.28, 1.7, 0.2], 0.04, wm);
    api.lineBetween([4.28, -1.7, 0.2], [6.6, -1.6, 0], 0.04, wm); api.lineBetween([4.28, 1.7, 0.2], [6.6, -0.9, 0], 0.04, wm);
    const bulb = api.group(null, [7.3, -1, 0]);
    api.cyl(0.32, 0.38, 0.6, api.mat(0x9CA3AF, { metalness: 0.7 }), [0, -0.6, 0], bulb);
    const glassM = api.mat(0xFEF9C3, { opacity: 0.55, emissive: 0xFDE047, emissiveIntensity: 0, depthWrite: false });
    const glass = api.sphere(0.75, glassM, [0, 0.35, 0], bulb);
    const fil = api.lineBetween([-0.2, 0.2, 0], [0.2, 0.2, 0], 0.03, api.mat(0x78350F, { emissive: 0xF97316, emissiveIntensity: 0 }), bulb);
    const halo = new T.PointLight(0xFDE047, 0, 9); halo.position.set(0, 0.4, 0); bulb.add(halo);
    api.part(glass, { name: 'Bóng đèn (tải)', rows: [['Điện áp định mức', 'Ghi trên đèn. Vượt quá nhiều thì dây tóc đứt'], ['Độ sáng', 'Theo công suất P = U·I']] });

    const lab1 = api.label('', [-3.5, 3.6, 0], { cls: 'tag', color: '#F59E0B' }), lab2 = api.label('', [3.5, 3.6, 0], { cls: 'tag', color: '#38BDF8' });
    const lab3 = api.label('', [7.3, 0.9, 0], { cls: 'plain' });

    // mũi tên từ thông chạy vòng trong lõi
    const loop = [[-3.5, 0, 0], [0, 2.5, -Math.PI / 2], [3.5, 0, Math.PI], [0, -2.5, Math.PI / 2], [-2, 2.5, -Math.PI / 2], [2, 2.5, -Math.PI / 2], [2, -2.5, Math.PI / 2], [-2, -2.5, Math.PI / 2]];
    const fm = api.mat(0xA855F7, { emissive: 0xA855F7, emissiveIntensity: 0.8 });
    const arrows = loop.map(([x, y, rz]) => { const c = api.mesh(new T.ConeGeometry(0.28, 0.6, 12), fm, [x, y, 0.62]); c.rotation.z = rz; c.userData.base = rz; c.userData.noPick = true; return c; });
    arrows.forEach(a => api.tag(a, 'flux'));

    const info = api.note(''), hist = [];
    let t = 0, hot = 0;
    const refresh = () => {
      const r = calc(), ld = LOADS[s.load];
      srcTxt.set(s.src === 'ac' ? `~ ${s.U1} V` : `= ${s.U1} V`);
      lab1.set(`U₁ = ${s.U1} V · N₁ = ${s.N1}`);
      lab2.set(`U₂ = ${vn(r.U2, r.U2 < 100 ? 1 : 0)} V · N₂ = ${s.N2}`);
      const kind = s.src === 'dc' ? '' : s.N2 > s.N1 ? ' → <b>máy tăng áp</b>' : s.N2 < s.N1 ? ' → <b>máy hạ áp</b>' : '';
      info.set(s.src === 'dc'
        ? `Nguồn một chiều: dòng điện không đổi nên từ thông trong lõi <b>không biến thiên</b>. Cuộn thứ cấp không có suất điện động cảm ứng: <b>U₂ = 0</b>.<br>Cuộn sơ cấp chỉ còn điện trở dây ~${RW} Ω nên dòng I₁ = ${vn(r.I1, 0)} A, rất lớn.`
        : `U₂ / U₁ = N₂ / N₁ = ${s.N2} / ${s.N1}${kind}<br>U₂ = ${s.U1} × ${s.N2} / ${s.N1} = <b>${vn(r.U2, 1)} V</b><br>${s.burnt ? 'Bóng đã cháy, mạch thứ cấp hở: I₂ = 0.' : `I₂ = ${vn(r.I2, 2)} A, I₁ = I₂·N₂/N₁ = ${vn(r.I1, 2)} A (máy lí tưởng: U₁I₁ = U₂I₂)`}`);
      const ratio = s.burnt ? 0 : r.U2 / ld.U;
      lab3.set(s.burnt ? '💥 Đèn cháy' : r.U2 < 0.05 ? 'Đèn tắt' : ratio < 0.5 ? 'Sáng yếu' : ratio <= 1.1 ? 'Sáng đúng định mức' : 'Quá sáng!');
      const b = Math.min(1.4, ratio * ratio);
      glassM.emissiveIntensity = b * 1.1; fil.material.emissiveIntensity = b * 2; halo.intensity = b * 6;
      glassM.color.set(s.burnt ? 0x52525B : 0xFEF9C3);
      if (!s.burnt && s.src === 'ac' && ratio > 1.35) {
        s.burnt = true; api.beep(160, 0.4, 'sawtooth', 0.15); api.toast('💥 Bóng đèn cháy! Chỉnh lại số vòng dây là có bóng mới');
        api.warn('burn', `Điện áp ra U₂ = ${vn(r.U2, 1)} V, lớn hơn nhiều so với điện áp định mức ${ld.U} V của đèn. Dây tóc nóng quá mức và <b>đứt</b>.<br>Muốn hạ áp xuống đúng ${ld.U} V thì cần N₂/N₁ = ${ld.U}/${s.U1}, tức cuộn thứ cấp phải có <b>ít vòng hơn</b> cuộn sơ cấp.`, '💥 Bóng đèn cháy');
        refresh(); return;
      }
      if (r.U2 > 1000) api.warn('hv', `U₂ = ${vn(r.U2, 0)} V là điện <b>cao thế</b>. Máy tăng áp như vậy dùng ở trạm phát điện để truyền tải đi xa, không dùng cho đồ điện trong nhà.`, '⚡ Nguy hiểm');
    };

    const fresh = () => { if (s.burnt) { s.burnt = false; api.toast('🔄 Đã lắp bóng mới'); } };
    api.section('🔌 Máy biến áp');
    api.choices({ label: 'Loại nguồn', items: [{ t: '~ Xoay chiều', v: 'ac' }, { t: '= Một chiều', v: 'dc' }], value: s.src, onPick(v) {
      s.src = v; hot = 0; refresh();
      if (v === 'dc') api.warn('dc', 'Máy biến áp <b>không</b> hoạt động với dòng điện một chiều. Dòng không đổi tạo từ thông không đổi, cuộn thứ cấp không có dòng cảm ứng nên đèn tắt.<br>Tệ hơn, cuộn sơ cấp lúc này như một đoạn dây điện trở nhỏ nối thẳng vào nguồn: dòng rất lớn làm cuộn dây <b>nóng đỏ</b>, có thể cháy cách điện.', '🔥 Sai cách dùng');
    } });
    api.slider({ label: 'Điện áp nguồn U₁', min: 0, max: 240, step: 10, value: s.U1, unit: 'V', onInput(v) { s.U1 = v; fresh(); refresh(); } });
    api.slider({ label: 'Số vòng sơ cấp N₁', min: 100, max: 2000, step: 100, value: s.N1, unit: 'vòng', lazy: true, onInput(v) { s.N1 = v; coils(); fresh(); refresh(); } });
    api.slider({ label: 'Số vòng thứ cấp N₂', min: 100, max: 4000, step: 100, value: s.N2, unit: 'vòng', lazy: true, onInput(v) { s.N2 = v; coils(); fresh(); refresh(); } });
    api.choices({ label: 'Tải ở cuộn thứ cấp', items: Object.keys(LOADS).map(k => ({ t: LOADS[k].t, v: k })), value: s.load, onPick(v) { s.load = v; s.burnt = false; refresh(); } });
    api.checklist([{ k: 'flux', label: 'Mũi tên từ thông trong lõi' }]);
    api.note('🎯 Thử thách: dùng nguồn 220 V thắp sáng đúng định mức <b>đèn 12 V</b>. Chọn N₁, N₂ thế nào?');

    api.strip({ h: innerHeight < 500 ? 62 : 100, draw(x, w, h) {
      x.clearRect(0, 0, w, h); x.fillStyle = '#0B1220'; x.fillRect(0, 0, w, h);
      const mid = h / 2, A = (h / 2 - 10), mx = Math.max(20, ...hist.map(p => Math.max(Math.abs(p[1]), Math.abs(p[2])))) * 1.05;
      x.strokeStyle = '#334155'; x.beginPath(); x.moveTo(0, mid); x.lineTo(w, mid); x.stroke();
      [[1, '#F59E0B'], [2, '#38BDF8']].forEach(([k, c]) => { x.strokeStyle = c; x.lineWidth = 2; x.beginPath(); hist.forEach((p, i) => { const px = w - (hist.length - i) * 3, py = mid - p[k] / mx * A; i ? x.lineTo(px, py) : x.moveTo(px, py); }); x.stroke(); });
      x.font = `700 ${Math.round(h / 7)}px 'Baloo 2', sans-serif`; x.fillStyle = '#F59E0B'; x.fillText('u₁(t)', 10, 18); x.fillStyle = '#38BDF8'; x.fillText('u₂(t)', 70, 18);
      x.fillStyle = '#64748B'; x.fillText('chiếu chậm: 50 Hz thật được làm chậm 100 lần', 140, 18);
    } });

    api.onFrame(dt => {
      t += dt;
      const ac = s.src === 'ac', ph = Math.sin(2 * Math.PI * 0.5 * t), f = ac ? ph : (s.U1 > 0 ? 1 : 0);
      arrows.forEach(a => { const k = 0.25 + 0.75 * Math.abs(f); a.scale.setScalar(f === 0 ? 0.001 : k); a.rotation.z = a.userData.base + (f < 0 ? Math.PI : 0); });
      const r = calc(), pk = Math.SQRT2;
      hist.push([t, ac ? s.U1 * pk * ph : s.U1, ac ? r.U2 * pk * ph : 0]); if (hist.length > 600) hist.shift();
      if (!ac && s.U1 > 0) hot = Math.min(1, hot + dt * 0.35 * s.U1 / 220); else hot = Math.max(0, hot - dt * 0.5);
      if (c1) c1.material.emissiveIntensity = hot * 1.6;
      if (!s.burnt && ac) { const fl = 0.92 + 0.08 * Math.abs(ph); halo.intensity *= fl; }
    });
    coils(); refresh();
    api.view({ pos: [1.6, 3, 16], target: [1.6, 0, 0], min: 4, max: 35 });
  }

  // ---------- truyền tải điện năng ----------
  const PW = 1e6, RL = 5; // công suất phát 1 MW, điện trở đường dây 5 Ω
  const ULIST = [0.4, 6, 22, 110, 500];
  const loss = U => { const I = PW / (U * 1000), dP = I * I * RL; return { I, dP: Math.min(dP, PW), frac: Math.min(1, dP / PW) }; };

  function transmit(api) {
    const T = api.T;
    api.box(60, 0.1, 30, api.mat(0x14532D, { roughness: 1 }), [0, -0.05, 0]).userData.noPick = true;
    const plant = api.group(null, [-11, 0, 0]);
    api.box(3, 2.4, 2.4, api.mat(0x475569), [0, 1.2, 0], plant); api.cyl(0.4, 0.55, 3.2, api.mat(0x94A3B8), [0.8, 3.2, 0], plant);
    api.part(plant, { name: 'Nhà máy điện', rows: [['Công suất phát', '1 MW (1 000 000 W)'], ['Điện áp ở máy phát', 'Khoảng 0,4 kV']] });
    const tf = (x, name, rows) => { const g = api.group(null, [x, 0, 0]); api.box(1.2, 1.6, 1.2, api.mat(0x0F766E), [0, 0.8, 0], g); [-0.3, 0, 0.3].forEach(z => api.cyl(0.08, 0.08, 0.6, api.mat(0xE2E8F0), [0, 1.9, z], g)); api.part(g, { name, rows }); return g; };
    tf(-8, 'Máy tăng áp ở đầu đường dây', [['Nhiệm vụ', 'Nâng điện áp lên rất cao trước khi truyền đi'], ['Vì sao', 'U tăng thì I giảm, hao phí I²R giảm rất mạnh']]);
    tf(8, 'Máy hạ áp ở trạm gần khu dân cư', [['Nhiệm vụ', 'Hạ điện áp xuống 220 V dùng trong nhà']]);
    const towers = [-5, -1.7, 1.7, 5], tm = api.mat(0x9CA3AF, { metalness: 0.6 });
    towers.forEach(x => { const g = api.group(null, [x, 0, 0]); api.lineBetween([-0.5, 0, -0.5], [0, 4.2, 0], 0.07, tm, g); api.lineBetween([0.5, 0, 0.5], [0, 4.2, 0], 0.07, tm, g); api.lineBetween([0.5, 0, -0.5], [0, 4.2, 0], 0.07, tm, g); api.lineBetween([-0.5, 0, 0.5], [0, 4.2, 0], 0.07, tm, g); api.box(0.15, 0.15, 2, tm, [0, 3.7, 0], g); });
    const lineM = api.mat(0x1F2937, { emissive: 0xFF3300, emissiveIntensity: 0 });
    const wires = [];
    [-0.85, 0.85].forEach(z => {
      const pts = [new T.Vector3(-8, 1.9, z * 0.35)];
      towers.forEach((x, k) => { if (k) { const x0 = towers[k - 1]; for (let j = 1; j < 8; j++) { const u = j / 8; pts.push(new T.Vector3(x0 + (x - x0) * u, 3.7 - 0.8 * Math.sin(Math.PI * u), z)); } } pts.push(new T.Vector3(x, 3.7, z)); });
      pts.push(new T.Vector3(8, 1.9, z * 0.35));
      const w = api.tube(pts, 0.06, lineM.clone(), null, 200); wires.push(w);
      api.part(w, { name: 'Đường dây tải điện', rows: [['Điện trở tổng', `R = ${RL} Ω`], ['Hao phí', 'ΔP = I²R = P²R/U², biến thành nhiệt làm nóng dây']] });
    });
    const houses = [[10.5, -1.6], [12, 0.6], [10.6, 2.2], [12.6, -2.6]].map(([x, z]) => {
      const g = api.group(null, [x, 0, z]); api.box(1.3, 1, 1.1, api.mat(0xFDE68A), [0, 0.5, 0], g);
      const roof = api.mesh(new T.ConeGeometry(1.05, 0.7, 4), api.mat(0xB91C1C), [0, 1.35, 0], g); roof.rotation.y = Math.PI / 4;
      const win = api.box(0.4, 0.35, 0.02, api.mat(0x1E293B, { emissive: 0xFDE047, emissiveIntensity: 0 }), [0, 0.55, 0.56], g);
      api.part(g, { name: 'Nhà dân', rows: [['Nhận điện', '220 V từ máy hạ áp']] }); return win;
    });
    const lbl = api.label('', [0, 5.6, 0], { cls: 'tag', color: '#FDE047' });
    const info = api.note('');
    const set = U => {
      s.UT = U; const r = loss(U), got = 1 - r.frac;
      const ei = Math.min(2.2, r.frac * 4 + (r.frac > 0.01 ? 0.25 : 0)); wires.forEach(w => { w.material.emissiveIntensity = ei; });
      houses.forEach((w, k) => { w.material.emissiveIntensity = got > (k + 0.5) / 4.5 ? 1.4 * got : 0.05; });
      lbl.set(`U = ${vn(U, U < 1 ? 1 : 0)} kV · I = ${vn(r.I, r.I < 10 ? 1 : 0)} A · hao phí ${vn(r.frac * 100, r.frac < 0.01 ? 3 : 1)}%`);
      info.set(`I = P / U = 1 000 000 / ${(U * 1000).toLocaleString('vi-VN')} = <b>${vn(r.I, 1)} A</b><br>ΔP = I²·R = ${vn(r.I, 1)}² × ${RL} = <b>${r.frac >= 1 ? 'lớn hơn cả công suất phát' : vn(r.dP / 1000, r.dP < 1000 ? 3 : 1) + ' kW'}</b><br>Điện tới nơi tiêu thụ: <b>${vn(got * 100, 1)}%</b>`);
      if (U < 1) api.warn('low', 'Truyền tải ở 0,4 kV thì dòng trên dây tới 2500 A. Hao phí I²R tính ra còn lớn hơn cả công suất nhà máy: dây nóng đỏ, gần như không còn điện tới nhà dân.<br>Vì ΔP = P²R/U², tăng U lên 10 lần thì hao phí giảm <b>100 lần</b>. Đó là lí do phải dùng máy tăng áp.', '🔥 Dây nóng đỏ');
    };
    api.section('🗼 Truyền tải điện năng đi xa');
    api.choices({ label: 'Điện áp trên đường dây', items: ULIST.map(U => ({ t: vn(U, U < 1 ? 1 : 0) + ' kV', v: U })), value: s.UT, onPick: set });
    api.note(`Nhà máy phát P = 1 MW, đường dây có điện trở R = ${RL} Ω. Đổi điện áp truyền tải và nhìn màu dây, đèn nhà dân.`);
    set(s.UT);
    api.view({ pos: [3, 11, 22], target: [3, 1, 0], min: 5, max: 45 });
  }

  NL.m3d.register('LM4', {
    title: 'Máy biến áp và truyền tải điện',
    tabs: [{ t: '🔌 Máy biến áp', v: 'tf' }, { t: '🗼 Truyền tải điện', v: 'line' }],
    init() { s = { src: 'ac', U1: 220, N1: 1000, N2: 500, load: 'b220', burnt: false, UT: 22 }; },
    build(api, tab) { if (tab === 'tf') transformer(api); else transmit(api); },
    data() {
      const N2s = [100, 200, 500, 1000, 2000, 4000];
      return {
        title: 'Máy biến áp và hao phí truyền tải', sub: `Đang chọn U₁ = ${s.U1} V, N₁ = ${s.N1} vòng · Truyền tải 1 MW trên dây ${RL} Ω`,
        sheets: [
          { name: 'U₂ theo N₂', head: ['N₂ (vòng)', 'N₂/N₁', 'U₂ (V)', 'Loại máy'], rows: N2s.map(n => [n, vn(n / s.N1, 2), vn(s.U1 * n / s.N1, 1), n > s.N1 ? 'Tăng áp' : n < s.N1 ? 'Hạ áp' : 'U₂ = U₁']) },
          { name: 'Hao phí truyền tải', head: ['U (kV)', 'I (A)', 'ΔP (kW)', 'Hao phí (%)'], rows: ULIST.map(U => { const r = loss(U); return [vn(U, 1), vn(r.I, 1), r.frac >= 1 ? '> 1000' : vn(r.dP / 1000, 3), r.frac >= 1 ? '100' : vn(r.frac * 100, 3)]; }) }
        ],
        chart: { type: 'line', xLabel: 'N₂ (vòng)', yLabel: 'U₂ (V)', xMin: 0, xMax: 4000, yMin: 0, yMax: Math.ceil(s.U1 * 4000 / s.N1 / 100) * 100 || 100, series: [{ name: `N₁ = ${s.N1} vòng`, color: '#38BDF8', dots: true, points: N2s.map(n => [n, +(s.U1 * n / s.N1).toFixed(1)]) }] }
      };
    }
  });
})();
