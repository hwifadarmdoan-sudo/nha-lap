// Mô hình 3: Tim 4 ngăn bổ dọc, chu kỳ tim + hệ dẫn truyền + điện tâm đồ, bệnh lý, 2 vòng tuần hoàn, trao đổi khí ở mao mạch.
(function () {
  const RED = 0xE8343A, BLUE = 0x4D6FD6, MUSCLE = 0xC8585E;
  const INFO = {
    RA: { name: 'Tâm nhĩ phải', sci: 'Right atrium', rows: [['Nhận máu', 'Máu nghèo O₂ từ tĩnh mạch chủ trên và dưới'], ['Áp lực', '2–6 mmHg'], ['Đặc điểm', 'Thành mỏng; chứa nút xoang nhĩ (máy tạo nhịp)']] },
    LA: { name: 'Tâm nhĩ trái', sci: 'Left atrium', rows: [['Nhận máu', 'Máu giàu O₂ từ 4 tĩnh mạch phổi'], ['Áp lực', '6–12 mmHg'], ['Đặc điểm', 'Đẩy máu xuống tâm thất trái qua van 2 lá']] },
    RV: { name: 'Tâm thất phải', sci: 'Right ventricle', rows: [['Bơm máu', 'Lên động mạch phổi (vòng tuần hoàn nhỏ)'], ['Áp lực', 'Tâm thu 15–30 mmHg, tâm trương 0–8 mmHg'], ['Thành cơ', 'Mỏng (≈ 3–5 mm)']] },
    LV: { name: 'Tâm thất trái', sci: 'Left ventricle', rows: [['Bơm máu', 'Vào động mạch chủ đi nuôi toàn cơ thể (vòng tuần hoàn lớn)'], ['Áp lực', 'Tâm thu 100–140 mmHg, tâm trương 5–12 mmHg'], ['Thành cơ', 'Dày nhất (≈ 10–15 mm, gấp ~3 lần thất phải) vì phải tạo áp lực lớn đẩy máu đi xa']] },
    mitral: { name: 'Van 2 lá', sci: 'Mitral (bicuspid) valve', rows: [['Vị trí', 'Giữa tâm nhĩ trái và tâm thất trái'], ['Hoạt động', 'Mở khi nhĩ co và pha dãn chung; đóng khi thất co (tạo tiếng "LUB")'], ['Bệnh lý', 'Hở van 2 lá: máu trào ngược lên nhĩ trái khi thất co']] },
    tricus: { name: 'Van 3 lá', sci: 'Tricuspid valve', rows: [['Vị trí', 'Giữa tâm nhĩ phải và tâm thất phải'], ['Hoạt động', 'Đóng khi thất co, ngăn máu trào ngược lên nhĩ']] },
    aortic: { name: 'Van động mạch chủ', sci: 'van bán nguyệt', rows: [['Vị trí', 'Giữa tâm thất trái và động mạch chủ'], ['Hoạt động', 'Mở khi thất co; đóng khi thất dãn (tạo tiếng "DUB")']] },
    pulmv: { name: 'Van động mạch phổi', sci: 'Pulmonary valve (van bán nguyệt)', rows: [['Vị trí', 'Giữa tâm thất phải và động mạch phổi'], ['Hoạt động', 'Mở khi thất co; đóng khi thất dãn']] },
    aorta: { name: 'Động mạch chủ', sci: 'Aorta', rows: [['Chở', 'Máu giàu O₂ từ tâm thất trái đi khắp cơ thể'], ['Huyết áp', '≈ 120/80 mmHg'], ['Đặc điểm', 'Thành dày, đàn hồi, lớn nhất cơ thể']] },
    pa: { name: 'Động mạch phổi', sci: 'Pulmonary artery', rows: [['Chở', 'Máu nghèo O₂ từ tâm thất phải lên phổi'], ['Huyết áp', '≈ 25/10 mmHg'], ['Lưu ý', 'Là động mạch duy nhất chở máu nghèo O₂']] },
    vc: { name: 'Tĩnh mạch chủ trên và dưới', sci: 'Superior / inferior vena cava', rows: [['Chở', 'Máu nghèo O₂ từ khắp cơ thể về tâm nhĩ phải'], ['Áp lực', '≈ 0–5 mmHg']] },
    pv: { name: 'Tĩnh mạch phổi', sci: 'Pulmonary veins', rows: [['Chở', 'Máu giàu O₂ từ phổi về tâm nhĩ trái'], ['Lưu ý', 'Là tĩnh mạch duy nhất chở máu giàu O₂']] },
    SA: { name: 'Nút xoang nhĩ', sci: 'Sinoatrial (SA) node', rows: [['Vị trí', 'Thành tâm nhĩ phải, gần chỗ đổ của tĩnh mạch chủ trên'], ['Vai trò', 'Tự phát xung điện theo chu kỳ, là "máy tạo nhịp" của tim'], ['Tần số', '60–100 xung/phút khi nghỉ']] },
    AV: { name: 'Nút nhĩ thất', sci: 'Atrioventricular (AV) node', rows: [['Vị trí', 'Vách giữa nhĩ và thất'], ['Vai trò', 'Nhận xung từ nút xoang nhĩ, làm chậm khoảng 0,09 giây để nhĩ co xong rồi thất mới co']] },
    His: { name: 'Bó His và mạng Purkinje', sci: 'Bundle of His & Purkinje fibers', rows: [['Vị trí', 'Chạy dọc vách liên thất rồi tỏa khắp thành 2 tâm thất'], ['Vai trò', 'Dẫn xung tốc độ cao làm 2 tâm thất co đồng bộ']] },
    septum: { zoom: 5, name: 'Vách liên thất', sci: 'Interventricular septum', rows: [['Vai trò', 'Ngăn hoàn toàn máu giàu O₂ (trái) và máu nghèo O₂ (phải)']] },
    lung: { name: 'Phổi (mao mạch phổi)', sci: 'Lungs', rows: [['Trao đổi khí', 'O₂ từ phế nang vào máu, CO₂ từ máu ra phế nang'], ['Kết quả', 'Máu đỏ thẫm → đỏ tươi']] },
    organ: n => ({ name: n, sci: 'Mao mạch cơ quan', rows: [['Trao đổi chất', 'Máu nhường O₂ và chất dinh dưỡng, nhận CO₂ và chất thải'], ['Kết quả', 'Máu đỏ tươi → đỏ thẫm']] }),
    cap: { name: 'Mao mạch', sci: 'Capillary', rows: [['Đường kính', '7–8 µm, vừa đủ cho 1 hồng cầu đi qua'], ['Thành', 'Chỉ 1 lớp tế bào biểu mô dẹt'], ['Vai trò', 'Nơi trao đổi khí và chất giữa máu với tế bào']] },
    rbc: { name: 'Hồng cầu', sci: 'Erythrocyte (red blood cell)', rows: [['Hình dạng', 'Đĩa lõm 2 mặt, không nhân, đường kính ≈ 7,5 µm'], ['Chứa', 'Hemoglobin gắn O₂ (đỏ tươi) hoặc ít O₂ (đỏ thẫm)'], ['Ý nghĩa', 'Xếp hàng đơn đi chậm qua mao mạch giúp tăng diện tích và thời gian trao đổi khí']] }
  };
  let HR = 75, myoOp = 0.85, plaque = 0, regurg = false, path = 'all', capMode = 'lung';
  const hist = []; // lưu số liệu áp lực + ECG một chu kỳ

  // điện tâm đồ (mV) và áp lực thất trái (mmHg) theo pha u ∈ [0,1) của chu kỳ chuẩn 0,8 s
  function ecg(u) {
    const t = u * 0.8, g = (c, w, a) => a * Math.exp(-((t - c) * (t - c)) / (2 * w * w));
    return g(0.05, 0.022, 0.15) - g(0.165, 0.008, 0.12) + g(0.18, 0.009, 1.1) - g(0.198, 0.009, 0.25) + g(0.42, 0.04, 0.3);
  }
  function lvp(u, sbp) {
    const t = u * 0.8;
    if (t < 0.1) return 6 + 4 * Math.sin(t / 0.1 * Math.PI);
    if (t < 0.4) { const k = (t - 0.1) / 0.3; return 8 + (sbp - 8) * Math.pow(Math.sin(k * Math.PI), 0.8); }
    return 5 + 3 * Math.exp(-(t - 0.4) * 8);
  }
  const sbpNow = () => Math.round(120 + plaque * 0.9 + (HR - 75) * 0.25);
  const dbpNow = () => Math.round(80 + plaque * 0.35 + (HR - 75) * 0.08);

  function halfShell(api, T, r, sx, sy, sz, color, thick, parent) {
    const g = api.group(parent);
    const o = api.mesh(new T.SphereGeometry(r, 40, 28, Math.PI, Math.PI), api.mat(color, { side: T.DoubleSide, opacity: myoOp }), null, g);
    o.scale.set(sx, sy, sz); o.userData.myo = true;
    const i = api.mesh(new T.SphereGeometry(r - thick, 40, 28, Math.PI, Math.PI), api.mat(0x5A1E2A, { side: T.BackSide, opacity: 1 }), null, g);
    i.scale.set(sx, sy, sz); i.userData.inner = true;
    // vành mặt cắt
    const ring = api.mesh(new T.RingGeometry(r - thick, r, 48), api.mat(0xE07A80, { side: T.DoubleSide, opacity: myoOp }), null, g);
    ring.scale.set(sx, sy, 1); ring.userData.myo = true;
    return g;
  }

  // ---------- tim bổ dọc ----------
  function buildHeart(api) {
    const T = api.T, V = api.V;
    const H = api.group(); const s = {};
    // vị trí (nhìn từ phía trước: bên phải người ở bên trái màn hình)
    s.RA = halfShell(api, T, 1, 1.15, 1.0, 1.0, MUSCLE, 0.12, H); s.RA.position.set(-1.35, 1.25, 0);
    s.LA = halfShell(api, T, 1, 1.1, 0.95, 1.0, MUSCLE, 0.12, H); s.LA.position.set(1.35, 1.35, 0);
    s.RV = halfShell(api, T, 1, 1.25, 1.55, 1.1, MUSCLE, 0.18, H); s.RV.position.set(-1.0, -1.05, 0);
    s.LV = halfShell(api, T, 1, 1.25, 1.8, 1.15, MUSCLE, 0.52, H); s.LV.position.set(1.15, -1.25, 0);
    ['RA', 'LA', 'RV', 'LV'].forEach(k => { api.tag(s[k], 'ch'); api.part(s[k], INFO[k]); });
    // máu bên trong (mặt phẳng màu sau mặt cắt)
    const sept = api.box(0.35, 3.1, 1.6, MUSCLE, [0.1, -1.2, -0.75], H); sept.material.opacity = myoOp; sept.userData.myo = true; api.tag(sept, 'ch'); api.part(sept, INFO.septum);
    // van
    const leaf = (x, y, rot, color, info, key) => {
      const g = api.group(H, [x, y, 0.15]); const a = api.box(0.5, 0.06, 0.5, color, [-0.25, 0, 0], g), b = api.box(0.5, 0.06, 0.5, color, [0.25, 0, 0], g);
      const pa = api.group(g, [-0.5, 0, 0]), pb = api.group(g, [0.5, 0, 0]); pa.add(a); pb.add(b); a.position.set(0.25, 0, 0); b.position.set(-0.25, 0, 0);
      g.rotation.z = rot; api.tag(g, 'valve'); api.part(g, info); g.userData.l = [pa, pb]; s[key] = g; return g;
    };
    leaf(-1.2, 0.3, 0, 0xF5F0E6, INFO.tricus, 'tri');
    leaf(1.25, 0.35, 0, 0xF5F0E6, INFO.mitral, 'mit');
    leaf(-0.35, 0.65, 0.5, 0xFFF3C4, INFO.pulmv, 'pul');
    leaf(0.55, 0.45, -0.4, 0xFFF3C4, INFO.aortic, 'aov');
    // mạch máu lớn
    const vs = api.group(H); api.tag(vs, 'vessel');
    const ao = api.tube([[0.55, 0.45, 0], [0.5, 1.6, 0.1], [0.2, 3.0, 0], [-0.6, 3.3, -0.3], [-1.1, 2.6, -0.8], [-1.0, 0.5, -1.4]], 0.32, RED, vs); api.part(ao, INFO.aorta); s.ao = ao;
    const pa = api.tube([[-0.35, 0.65, 0], [-0.2, 1.9, 0.3], [0.7, 2.5, 0.2], [2.2, 2.6, 0], [3.2, 2.5, 0]], 0.27, BLUE, vs); api.part(pa, INFO.pa);
    const pa2 = api.tube([[0.4, 2.45, 0.25], [-1.0, 2.7, 0.3], [-2.8, 2.6, 0.2]], 0.22, BLUE, vs); api.part(pa2, INFO.pa);
    const svc = api.tube([[-1.6, 1.9, 0], [-1.7, 3.2, 0], [-1.7, 4.2, 0]], 0.3, BLUE, vs); const ivc = api.tube([[-1.7, 0.6, -0.3], [-1.9, -0.8, -0.8], [-2.0, -2.8, -0.8]], 0.32, BLUE, vs);
    const vcg = api.group(vs); vcg.add(svc); vcg.add(ivc); api.part(vcg, INFO.vc);
    const pvg = api.group(vs);
    [[2.4, 1.9, 0.2], [2.5, 1.2, 0.3], [2.4, 1.7, -0.6], [2.5, 1.0, -0.5]].forEach(p => pvg.add(api.tube([[1.9, p[1] * 0.85 + 0.2, p[2] * 0.4], [p[0], p[1], p[2]], [p[0] + 0.9, p[1], p[2]]], 0.15, RED, pvg)));
    api.part(pvg, INFO.pv);
    // mảng xơ vữa trong động mạch chủ
    const pl = api.mesh(new T.TorusGeometry(0.26, 0.01, 10, 30), api.mat(0xF2D675), [0.5, 1.75, 0.08], vs); pl.rotation.x = Math.PI / 2; pl.userData.noPick = true; s.plaque = pl;
    // hệ dẫn truyền
    const cd = api.group(H); api.tag(cd, 'cond');
    const glow = c => api.mat(c, { emissive: c, emissiveIntensity: 0.2 });
    s.SA = api.sphere(0.16, 0xFFD54A, [-1.75, 1.85, 0.25], cd); s.SA.material = glow(0xFFD54A); api.part(s.SA, INFO.SA);
    s.AV = api.sphere(0.14, 0xFFD54A, [-0.25, 0.35, 0.25], cd); s.AV.material = glow(0xFFD54A); api.part(s.AV, INFO.AV);
    const hisG = api.group(cd);
    [[[-0.25, 0.35, .25], [0.1, -0.3, .25], [0.1, -2.6, .25]], [[0.1, -1.2, .25], [-0.5, -2.4, .3], [-1.4, -1.6, .3], [-1.9, -0.4, .3]], [[0.1, -1.2, .25], [0.7, -2.6, .3], [1.8, -2.4, .3], [2.3, -0.9, .3]]].forEach(p => api.tube(p, 0.06, 0xFFD54A, hisG).material = glow(0xFFD54A));
    api.part(hisG, INFO.His); s.His = hisG;
    s.H = H;
    // nhãn
    api.label('Tâm nhĩ phải', s.RA, { off: [-0.6, 1.0, 0] }); api.label('Tâm nhĩ trái', s.LA, { off: [0.6, 1.0, 0] });
    api.label('Tâm thất phải', s.RV, { off: [-0.8, -0.6, 0.5] }); api.label('Tâm thất trái', s.LV, { off: [0.9, -0.8, 0.5] });
    api.label('Động mạch chủ', [0.2, 3.5, 0], { cls: 'tag', color: '#E8343A' }); api.label('Động mạch phổi', [2.6, 2.95, 0], { cls: 'tag', color: '#4D6FD6' });
    api.label('Tĩnh mạch chủ trên', [-1.7, 4.45, 0], { cls: 'tag', color: '#4D6FD6' }); api.label('Tĩnh mạch chủ dưới', [-2.0, -3.05, -0.8], { cls: 'tag', color: '#4D6FD6' });
    api.label('Tĩnh mạch phổi', [3.75, 1.45, 0], { cls: 'tag', color: '#E8343A' });
    // hạt máu
    const mkFlow = (pts, color, n) => {
      const curve = new T.CatmullRomCurve3(pts.map(p => V(...p)));
      const ps = []; for (let k = 0; k < n; k++) { const m = api.sphere(0.07, color, null, H, 8); m.material.emissive = new T.Color(color); m.material.emissiveIntensity = 0.5; m.userData.noPick = true; ps.push({ m, u: k / n }); }
      return { curve, ps };
    };
    s.flows = [
      { f: mkFlow([[-1.7, 4.2, 0.2], [-1.6, 2.2, 0.3], [-1.3, 1.1, 0.3], [-1.2, 0.2, 0.3], [-1.0, -1.2, 0.3], [-0.6, -0.4, 0.3], [-0.35, 0.65, 0.3], [-0.2, 1.9, 0.4], [1.5, 2.55, 0.3], [3.2, 2.5, 0.2]], BLUE, 26), side: 'R' },
      { f: mkFlow([[3.3, 1.5, 0.3], [2.3, 1.5, 0.3], [1.4, 1.3, 0.3], [1.25, 0.3, 0.3], [1.2, -1.4, 0.3], [0.8, -0.6, 0.3], [0.55, 0.45, 0.3], [0.5, 1.6, 0.4], [0.2, 3.0, 0.3], [-0.6, 3.3, 0]], RED, 26), side: 'L' }
    ];
    // dòng trào ngược khi hở van 2 lá
    s.jet = api.mesh(new T.ConeGeometry(0.3, 1.3, 16, 1, true), api.mat(0xFF3B3B, { opacity: 0.6, emissive: 0xFF0000, emissiveIntensity: 0.4 }), [1.25, 0.85, 0.35], H); s.jet.userData.noPick = true; s.jet.visible = false;
    return s;
  }

  function heartTab(api) {
    const s = buildHeart(api);
    api.view({ pos: [0, 0.6, 15], target: [0, 0.6, 0], min: 4, max: 26 });
    let u = 0, prevPh = -1, sw = 0;
    api.onFrame(dt => {
      const per = 60 / HR; u = (u + dt / per) % 1; const t = u * 0.8;
      const ph = t < 0.1 ? 0 : t < 0.4 ? 1 : 2;
      if (ph !== prevPh) {
        if (ph === 1) { api.beep(70, 0.16, 'sine', 0.5); api.beep(55, 0.12, 'sine', 0.35, 0.02); }
        if (ph === 2) { api.beep(95, 0.11, 'sine', 0.4); }
        prevPh = ph;
      }
      if (regurg && ph === 1) { sw += dt; if (sw > 0.08) { sw = 0; api.noise(0.1, 0.05, 500); } }
      // co bóp
      const aK = ph === 0 ? 1 - 0.13 * Math.sin(t / 0.1 * Math.PI) : 1;
      const vK = ph === 1 ? 1 - 0.16 * Math.sin((t - 0.1) / 0.3 * Math.PI) : 1;
      const lvT = 1 + plaque / 160;
      s.RA.scale.setScalar(aK); s.LA.scale.setScalar(aK); s.RV.scale.set(vK, vK, vK); s.LV.scale.set(vK * lvT, vK, vK * lvT);
      // van: nhĩ thất mở ở pha 0 và 2; bán nguyệt mở ở pha 1
      const set = (v, open, gap) => { const a = open ? 1.2 : (gap || 0); v.userData.l[0].rotation.z += (-a - v.userData.l[0].rotation.z) * Math.min(1, dt * 18); v.userData.l[1].rotation.z += (a - v.userData.l[1].rotation.z) * Math.min(1, dt * 18); };
      set(s.tri, ph !== 1); set(s.mit, ph !== 1, regurg ? 0.45 : 0); set(s.pul, ph === 1); set(s.aov, ph === 1);
      s.jet.visible = regurg && ph === 1; if (s.jet.visible) s.jet.scale.set(1, 0.6 + 0.4 * Math.sin((t - 0.1) / 0.3 * Math.PI), 1);
      // xung điện
      const e = (m, k) => { if (!m.material.userData.sv) m.material.emissiveIntensity = 0.15 + k; };
      e(s.SA, t < 0.06 ? 1.3 : 0); e(s.AV, t > 0.09 && t < 0.17 ? 1.3 : 0);
      s.His.traverse(o => { if (o.material) e(o, t > 0.16 && t < 0.24 ? 1.2 : 0); });
      // hạt máu: chảy khi van tương ứng mở
      const sp = (ph === 1 ? 0.45 : 0.18) * (HR / 75);
      s.flows.forEach(fl => fl.f.ps.forEach(p => { p.u = (p.u + (dt || 0) * sp * 0.25) % 1; if (!(p.u >= 0 && p.u < 1)) p.u = 0; p.m.position.copy(fl.f.curve.getPointAt(p.u)); }));
      // mảng xơ vữa
      s.plaque.geometry.dispose(); s.plaque.geometry = new api.T.TorusGeometry(0.29 - plaque / 100 * 0.12, 0.01 + plaque / 100 * 0.13, 10, 30);
      api.caption(`Nhịp tim ${HR} nhịp/phút · Huyết áp ${sbpNow()}/${dbpNow()} mmHg`);
    });
    // dải ECG + áp lực
    let x = 0, prevY = null, prevP = null, buf = [];
    api.strip({
      h: 110, draw(c, W, Hh, tt, dt) {
        const per = 60 / HR; const pxs = W / 4.0; // 4 giây trên màn hình
        const steps = Math.max(1, Math.round(dt * pxs));
        for (let k = 0; k < steps; k++) {
          const uu = ((tt - dt + dt * k / steps) / per) % 1;
          const y = Hh * 0.62 - ecg(uu) * Hh * 0.4, py = Hh * 0.95 - lvp(uu, sbpNow()) / 150 * Hh * 0.85;
          c.fillStyle = api.el.classList.contains('light') ? '#FFFFFF' : '#08121E'; c.fillRect(x, 0, 8, Hh);
          c.strokeStyle = '#3DFF8B'; c.lineWidth = 3; if (prevY !== null) { c.beginPath(); c.moveTo(x - 1, prevY); c.lineTo(x, y); c.stroke(); }
          c.strokeStyle = 'rgba(255,120,120,.85)'; c.lineWidth = 2; if (prevP !== null) { c.beginPath(); c.moveTo(x - 1, prevP); c.lineTo(x, py); c.stroke(); }
          prevY = y; prevP = py; x++; if (x >= W) { x = 0; prevY = prevP = null; }
        }
        c.fillStyle = 'rgba(8,18,30,.75)'; c.fillRect(6, 4, 330, 30);
        c.font = "800 26px 'Baloo 2'"; c.fillStyle = '#3DFF8B'; c.fillText(`ECG · ${HR} nhịp/phút`, 12, 26); c.fillStyle = '#FF8A8A'; c.fillText(`Áp lực thất trái`, 200, 26);
        void buf;
      }
    });
    let bp = null;
    api.slider({ label: '💓 Nhịp tim', min: 40, max: 180, step: 1, value: HR, unit: 'nhịp/phút', onInput(v) { HR = v; if (v >= 150) api.warn('hr', 'Khi nghỉ, nhịp tim trên 100 nhịp/phút đã gọi là nhịp nhanh. Nhịp càng nhanh thì pha tâm trương bị rút ngắn nhiều nhất (tâm thu ngắn đi ít), tâm thất không kịp nạp đầy máu nên lượng máu tống đi mỗi nhịp giảm.', '⚠️ Cảnh báo y khoa'); if (v <= 45) api.warn('hr2', 'Nhịp tim dưới 50 nhịp/phút gọi là nhịp chậm. Ở vận động viên đây có thể là bình thường, nhưng ở người thường có thể gây chóng mặt do não thiếu máu.', '⚠️ Cảnh báo y khoa'); } });
    api.slider({ label: 'Độ trong suốt cơ tim', min: 0, max: 100, step: 5, value: Math.round((1 - myoOp) * 100), unit: '%', onInput(v) { myoOp = 1 - v / 100; s.H.traverse(o => { if (o.userData.myo) api.setOpacity(o, Math.max(0.04, myoOp) / 0.85); }); } });
    api.checklist([{ k: 'ch', label: 'Tâm nhĩ và tâm thất' }, { k: 'cond', label: 'Hệ dẫn truyền (SA, AV, His, Purkinje)' }, { k: 'valve', label: 'Van nhĩ – thất và van động mạch' }, { k: 'vessel', label: 'Mạch máu chính' }]);
    api.section('🩺 Mô phỏng bệnh lý');
    api.slider({ label: 'Mảng xơ vữa động mạch chủ', min: 0, max: 80, step: 5, value: plaque, unit: '%', onInput(v) { plaque = v; if (v >= 70) api.warn('plaque', 'Lòng động mạch chủ bị hẹp nặng làm tăng áp lực mà tâm thất trái phải thắng để tống máu (hậu tải). Cơ tim co bóp mạnh kéo dài nên dày lên (phì đại thất trái), lâu dần dễ suy tim. Lưu ý: sức cản ngoại vi của cả hệ tuần hoàn chủ yếu do các tiểu động mạch quyết định; tăng huyết áp kéo dài cũng gây phì đại thất trái.', '⚠️ Cảnh báo y khoa'); bp && bp.set(bpText()); } });
    api.toggle({ label: 'Hở van 2 lá', value: regurg, onChange(v) { regurg = v; bp && bp.set(bpText()); if (v) api.toast('Nghe tiếng thổi tâm thu giữa "LUB" và "DUB"'); } });
    const bpText = () => `Huyết áp: <b>${sbpNow()}/${dbpNow()} mmHg</b><br>Thành thất trái: <b>${(12 * (1 + plaque / 160)).toFixed(1)} mm</b>${regurg ? '<br><b style="color:#E5534B">Máu trào ngược nhĩ trái mỗi nhịp</b>' : ''}`;
    bp = api.note(bpText());
  }

  // ---------- 2 vòng tuần hoàn ----------
  function circTab(api) {
    const T = api.T, V = api.V;
    const heart = api.group(null, [0, 0, 0]);
    api.box(0.9, 1.2, 0.8, 0x6B7FD6, [-0.5, 0, 0], heart); api.box(0.9, 1.2, 0.8, 0xE8343A, [0.5, 0, 0], heart);
    api.part(heart, { name: 'Tim', sci: 'Heart', rows: [['Nửa phải', 'Chứa máu nghèo O₂ (xanh)'], ['Nửa trái', 'Chứa máu giàu O₂ (đỏ)']], text: 'Chuyển sang tab "Tim bổ dọc" để xem chi tiết 4 ngăn' });
    api.label('Tim', heart, { off: [0, 0.95, 0], cls: 'big' });
    const lungs = api.group(null, [0, 3.2, 0]);
    api.mesh(new T.SphereGeometry(1, 24, 18), api.mat(0xF2A7B6), [-1.4, 0, 0], lungs).scale.set(0.9, 1.2, 0.6);
    api.mesh(new T.SphereGeometry(1, 24, 18), api.mat(0xF2A7B6), [1.4, 0, 0], lungs).scale.set(0.9, 1.2, 0.6);
    api.part(lungs, INFO.lung); api.label('Phổi', lungs, { off: [0, 1.5, 0], cls: 'big' });
    const organs = [['Đầu – não', [0, 6.2, 0], 0xF2C94C], ['Gan', [-2.6, -2.0, 0], 0xA0522D], ['Ống tiêu hóa', [0, -3.3, 0], 0xE8A87C], ['Thận', [2.6, -2.2, 0], 0xB04E4E], ['Thân – cơ', [3.6, 0.4, 0], 0xD98C8C], ['Chân', [0, -6.0, 0], 0xD9A066]];
    const og = organs.map(([n, p, c]) => { const m = api.mesh(new T.SphereGeometry(0.75, 20, 14), api.mat(c), p); m.scale.set(1.2, 0.8, 0.6); api.part(m, INFO.organ(n)); api.label(n, m, { off: [0, 0.9, 0] }); return m; });
    void og;
    const small = api.group(), big = api.group();
    const cap = api.group(); api.tag(cap, 'cap');
    const capNet = (c) => { const g = api.group(cap, c); for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; api.tube([[Math.cos(a) * 0.3, Math.sin(a) * 0.3, 0.5], [Math.cos(a + 0.6) * 0.6, Math.sin(a + 0.6) * 0.6, 0.55], [Math.cos(a + 1.2) * 0.3, Math.sin(a + 1.2) * 0.3, 0.5]], 0.025, 0xC060A0, g, 12); } return g; };
    api.part(cap, INFO.cap);
    // vòng nhỏ: thất phải → ĐM phổi → mao mạch phổi → TM phổi → nhĩ trái
    const rSmall = [[-0.5, 0.6, 0.2], [-0.9, 1.8, 0.3], [-1.4, 2.9, 0.4], [-0.2, 3.6, 0.5], [1.4, 2.9, 0.4], [0.9, 1.8, 0.3], [0.5, 0.6, 0.2]];
    const sa = api.tube(rSmall.slice(0, 4), 0.14, BLUE, small), sv = api.tube(rSmall.slice(3), 0.14, RED, small);
    api.part(sa, INFO.pa); api.part(sv, INFO.pv);
    capNet([-1.4, 3.2, 0]); capNet([1.4, 3.2, 0]);
    // vòng lớn: thất trái → ĐM chủ → các cơ quan → TM chủ → nhĩ phải
    const routes = organs.map(([n, p]) => {
      const out = [[0.5, -0.3, 0.3], [0.9 + p[0] * 0.25, p[1] * 0.45, 0.4], [p[0] + 0.5, p[1] + 0.1, 0.45]];
      const back = [[p[0] - 0.5, p[1] - 0.1, 0.45], [-0.9 + p[0] * 0.25, p[1] * 0.45 - 0.3, 0.4], [-0.5, -0.3, 0.3]];
      api.part(api.tube(out, 0.09, RED, big), INFO.aorta); api.part(api.tube(back, 0.09, BLUE, big), INFO.vc);
      capNet(p);
      return { out, back, p };
    });
    // hạt máu
    const parts = [];
    const add = (pts, c1, c2, swap, grp) => { const curve = new T.CatmullRomCurve3(pts.map(p => V(...p))); for (let k = 0; k < 10; k++) { const m = api.sphere(0.09, c1, null, null, 8); m.userData.noPick = true; m.material.emissive = new T.Color(c1); m.material.emissiveIntensity = 0.4; parts.push({ m, curve, u: k / 10, c1, c2, swap, grp }); } };
    add(rSmall, BLUE, RED, 0.5, 'small');
    routes.forEach(r => add(r.out.concat([[r.p[0], r.p[1], 0.5]], r.back), RED, BLUE, 0.5, 'big'));
    api.onFrame(dt => parts.forEach(p => {
      p.u = (p.u + dt * 0.12 * HR / 75) % 1; p.m.position.copy(p.curve.getPointAt(p.u));
      const c = p.u < p.swap ? p.c1 : p.c2; p.m.material.color.setHex(c); if (!p.m.material.userData.sv) p.m.material.emissive.setHex(c);
      p.m.visible = path === 'all' || path === p.grp;
    }));
    const applyPath = () => {
      api.setOpacity(small, path === 'big' ? 0.2 : 1); api.setOpacity(big, path === 'small' ? 0.2 : 1);
      api.caption(path === 'small' ? 'Vòng tuần hoàn nhỏ' : path === 'big' ? 'Vòng tuần hoàn lớn' : '2 vòng tuần hoàn');
      note.set(path === 'small' ? '<b>Vòng nhỏ:</b> Tâm thất phải → Động mạch phổi (đỏ thẫm) → Mao mạch phổi (thải CO₂, nhận O₂) → Tĩnh mạch phổi (đỏ tươi) → Tâm nhĩ trái'
        : path === 'big' ? '<b>Vòng lớn:</b> Tâm thất trái → Động mạch chủ (đỏ tươi) → Mao mạch các cơ quan (nhường O₂, nhận CO₂) → Tĩnh mạch chủ trên, dưới (đỏ thẫm) → Tâm nhĩ phải'
          : 'Màu đỏ: máu giàu O₂. Màu xanh: máu giàu CO₂ (đỏ thẫm). Chọn một vòng để làm sáng đường đi.');
    };
    api.choices({ label: '🔦 Vệt sáng dẫn đường', items: [{ t: 'Cả 2 vòng', v: 'all' }, { t: 'Vòng nhỏ', v: 'small' }, { t: 'Vòng lớn', v: 'big' }], value: path, onPick(v) { path = v; applyPath(); } });
    const note = api.note('');
    api.slider({ label: '💓 Nhịp tim', min: 40, max: 180, step: 1, value: HR, unit: 'nhịp/phút', onInput(v) { HR = v; } });
    api.checklist([{ k: 'cap', label: 'Mạng lưới mao mạch' }]);
    applyPath();
    api.view({ pos: [0, 0, 18], target: [0, 0, 0], min: 5, max: 35 });
  }

  // ---------- mao mạch ----------
  function capTab(api) {
    const T = api.T, V = api.V, R = api.rand(3);
    const tube = api.mesh(new T.CylinderGeometry(1.0, 1.0, 16, 40, 1, true), api.mat(0xF2B8C6, { opacity: 0.22, side: T.DoubleSide, depthWrite: false }));
    tube.rotation.z = Math.PI / 2; api.part(tube, INFO.cap);
    const lungSide = capMode === 'lung';
    const tissue = api.box(16, 1.2, 3, lungSide ? 0xBFE4FA : 0xE8A0A8, [0, 2.0, 0]); tissue.material.opacity = 0.35;
    api.part(tissue, lungSide ? { name: 'Phế nang', sci: 'Alveolus', rows: [['Thành', '1 lớp tế bào mỏng, sát mao mạch'], ['Nồng độ', 'O₂ cao, CO₂ thấp']] } : { name: 'Tế bào cơ quan', sci: 'Tissue cells', rows: [['Nồng độ', 'O₂ thấp (đang dùng để hô hấp), CO₂ cao']] });
    api.label(lungSide ? 'Phế nang (giàu O₂)' : 'Tế bào mô (giàu CO₂)', [0, 3.0, 0], { cls: 'big' });
    // hồng cầu đĩa lõm 2 mặt
    const prof = []; for (let k = 0; k <= 16; k++) { const r = k / 16 * 0.78; const h = 0.12 + 0.2 * Math.pow(r / 0.78, 2) * (1 - Math.pow(r / 0.78, 6)); prof.push(new T.Vector2(r, h)); }
    for (let k = 16; k >= 0; k--) prof.push(new T.Vector2(prof[k].x, -prof[k].y));
    const rbcGeo = new T.LatheGeometry(prof, 32);
    const cells = [];
    for (let k = 0; k < 7; k++) { const m = api.mesh(rbcGeo, api.mat(lungSide ? 0x8B1A2B : 0xE8343A)); m.rotation.z = Math.PI / 2; m.position.x = -8 + k * 2.3; api.part(m, INFO.rbc); cells.push({ m, sat: lungSide ? 0 : 1 }); }
    // phân tử khí
    const mols = [];
    for (let k = 0; k < 40; k++) {
      const o2 = k % 2 === 0, m = api.group();
      api.sphere(0.09, o2 ? 0xFF4D4D : 0x555555, [-0.07, 0, 0], m, 8); api.sphere(0.09, o2 ? 0xFF4D4D : 0x222222, [0.07, 0, 0], m, 8); if (!o2) api.sphere(0.07, 0x111111, [0, 0.08, 0], m, 8);
      m.userData.noPick = true; m.traverse(c => { c.userData.noPick = true; });
      if (k % 3 === 0 || k % 3 === 1 && k % 2) { const sp = api.textSprite(o2 ? 'O₂' : 'CO₂', { h: 0.34, parent: m, pos: [0, 0.3, 0], color: '#FFFFFF', bg: o2 ? 'rgba(220,40,40,.85)' : 'rgba(40,40,40,.85)' }); sp.userData.noPick = true; }
      mols.push({ m, o2, t: R(), x: (R() - 0.5) * 14, z: (R() - 0.5) * 1.6 });
    }
    api.label(lungSide ? 'O₂ vào máu, CO₂ ra phế nang' : 'O₂ ra tế bào, CO₂ vào máu', [0, -1.7, 0], { cls: 'tag', color: '#2F80C0' });
    api.label('<span style="color:#E03030">●● O₂ (oxy)</span> &nbsp; <span style="color:#C9CED6">●●● CO₂ (cacbon điôxit)</span>', [0, -2.4, 0], { cls: 'plain' });
    api.onFrame(dt => {
      cells.forEach(c => {
        c.m.position.x += dt * 0.9; if (c.m.position.x > 8.5) { c.m.position.x = -8.5; c.sat = lungSide ? 0 : 1; }
        c.m.rotation.x += dt * 0.6;
        const k = (c.m.position.x + 8) / 16; c.sat = lungSide ? Math.min(1, Math.max(c.sat, k * 1.3)) : Math.max(0, Math.min(c.sat, 1 - k * 1.3));
        const col = new T.Color(0x6E1424).lerp(new T.Color(0xFF2A2A), c.sat); if (!c.m.material.userData.sv) c.m.material.color.copy(col);
      });
      mols.forEach(q => {
        q.t += dt * 0.35; if (q.t > 1) { q.t = 0; q.x = (R() - 0.5) * 14; }
        const inward = (q.o2 && lungSide) || (!q.o2 && !lungSide); // đi từ trên xuống vào mạch
        const y = inward ? 2.0 - q.t * 2.2 : -0.2 + q.t * 2.2;
        q.m.position.set(q.x + q.t * 0.8, y, q.z);
      });
    });
    api.choices({ label: 'Vị trí mao mạch', items: [{ t: '🫁 Ở phổi', v: 'lung' }, { t: '💪 Ở cơ quan', v: 'tissue' }], value: capMode, onPick(v) { capMode = v; api.setTab('cap'); } });
    api.note('Lòng mao mạch hẹp <b>7–8 µm</b> nên hồng cầu phải đi <b>hàng đơn</b>, chậm, sát thành mạch → khí khuếch tán hiệu quả. Màu hồng cầu: <b>đỏ thẫm</b> (ít O₂) → <b>đỏ tươi</b> (nhiều O₂).');
    api.view({ pos: [0, 1.2, 9], target: [0, 0.4, 0], min: 2, max: 20 });
  }

  NL.m3d.register('M3', {
    title: 'Tim và hệ tuần hoàn',
    tabs: [{ t: '🫀 Tim bổ dọc', v: 'heart' }, { t: '🔁 2 vòng tuần hoàn', v: 'circ' }, { t: '🔬 Mao mạch', v: 'cap' }],
    build(api, tab) { if (tab === 'heart') heartTab(api); else if (tab === 'circ') circTab(api); else capTab(api); },
    data() {
      const sbp = sbpNow(), dbp = dbpNow(), pts = [], ep = [];
      for (let k = 0; k <= 80; k++) { const u = k / 80; pts.push([+(u * 0.8 * 75 / HR).toFixed(3), +lvp(u, sbp).toFixed(1)]); ep.push([+(u * 0.8 * 75 / HR).toFixed(3), +(ecg(u) * 100).toFixed(1)]); }
      const sick = plaque > 0 || regurg;
      return {
        title: 'Hai vòng tuần hoàn và thông số bệnh lý',
        sub: `Nhịp tim ${HR} nhịp/phút · Chu kỳ tim ${(60 / HR).toFixed(2)} s (nhĩ co ${(0.1 * 75 / HR).toFixed(2)} s, thất co ${(0.3 * 75 / HR).toFixed(2)} s, dãn chung ${(0.4 * 75 / HR).toFixed(2)} s)`,
        sheets: [
          { name: 'Thông số', head: ['STT', 'Thông số / Tiêu chí', 'Trạng thái bình thường', 'Trạng thái Xơ vữa / Hở van', 'Đánh giá chẩn đoán y khoa'], rows: [
            [1, 'Huyết áp động mạch (mmHg)', '120/80', `${sbp}/${dbp}`, sbp >= 140 ? 'Tăng huyết áp' : sbp >= 130 ? 'Huyết áp cao' : 'Bình thường'],
            [2, 'Độ dày thành thất trái (mm)', '12', (12 * (1 + plaque / 160)).toFixed(1), plaque >= 40 ? 'Phì đại thất trái' : 'Bình thường'],
            [3, 'Hẹp lòng động mạch chủ (%)', '0', plaque, plaque >= 70 ? 'Hẹp nặng, nguy cơ suy tim, đột quỵ' : plaque >= 30 ? 'Hẹp vừa' : plaque ? 'Hẹp nhẹ' : 'Không hẹp'],
            [4, 'Van 2 lá', 'Đóng kín khi thất co', regurg ? 'Đóng không kín, máu trào ngược nhĩ trái' : 'Đóng kín', regurg ? 'Hở van 2 lá, có tiếng thổi tâm thu' : 'Bình thường'],
            [5, 'Nhịp tim (nhịp/phút)', '60–100', HR, HR > 100 ? 'Nhịp nhanh' : HR < 60 ? 'Nhịp chậm' : 'Bình thường'],
            [6, 'Vòng tuần hoàn nhỏ', 'Thất phải → ĐM phổi → phổi → TM phổi → nhĩ trái', 'Không đổi', 'Trao đổi khí ở phổi'],
            [7, 'Vòng tuần hoàn lớn', 'Thất trái → ĐM chủ → cơ quan → TM chủ → nhĩ phải', sick ? 'Tim phải co bóp mạnh hơn' : 'Không đổi', 'Cung cấp O₂, chất dinh dưỡng']] },
          { name: 'Áp lực và ECG', head: ['Thời gian (s)', 'Áp lực thất trái (mmHg)', 'ECG (mV × 100)'], rows: pts.map((p, k) => [p[0], p[1], ep[k][1]]) }
        ],
        chart: { type: 'line', series: [{ name: 'Áp lực thất trái (mmHg)', color: '#E5534B', points: pts }, { name: 'ECG (mV×100)', color: '#3FB37F', points: ep.map(p => [p[0], Math.max(0, p[1])]) }], xLabel: 'Thời gian trong 1 chu kỳ (s)', yLabel: 'mmHg', yMax: Math.max(160, Math.ceil(Math.max(...pts.map(p => p[1])) / 20) * 20 + 20) }
      };
    },
    liveData: true
  });
})();
