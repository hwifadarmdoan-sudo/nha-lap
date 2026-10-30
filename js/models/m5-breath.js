// Mô hình 5: Hệ hô hấp. Thông khí + chuông Donders (kéo màng cao su), nắp thanh quản (thở / nuốt / vừa ăn vừa nói), cây phế quản – lông rung – phế nang, khói thuốc và bụi mịn, tính dung tích sống.
(function () {
  const PINK = 0xF29BAA, GRAY = 0x4A4A55, BONE = 0xEDE6D6, MUS = 0xC8585E;
  const INFO = {
    lung: { name: 'Phổi', sci: 'Pulmo (Lungs)', rows: [['Cấu tạo', 'Phổi phải 3 thùy, phổi trái 2 thùy; ≈ 300–500 triệu phế nang'], ['Diện tích trao đổi', '70 – 90 m²'], ['Bao ngoài', '2 lớp màng phổi, giữa là dịch màng phổi giúp phổi dãn theo lồng ngực']] },
    dia: { name: 'Cơ hoành', sci: 'Diaphragma', rows: [['Hít vào', 'Co, dẹt phẳng, hạ xuống 1,5 – 3 cm'], ['Thở ra', 'Dãn, vòm cong trở lên'], ['Vai trò', 'Cơ hô hấp chính, tạo ≈ 70% thể tích khí hít vào']] },
    rib: { name: 'Khung xương sườn và cơ liên sườn', sci: 'Costae & Musculi intercostales', rows: [['Hít vào', 'Cơ liên sườn ngoài co, nâng xương sườn lên, xương ức nhô ra trước'], ['Thở ra', 'Cơ liên sườn ngoài dãn, lồng ngực hạ xuống'], ['Số đôi', '12 đôi xương sườn']] },
    trachea: { name: 'Khí quản', sci: 'Trachea', rows: [['Cấu tạo', '16 – 20 vòng sụn hình chữ C, mặt trong có lớp lông rung và tuyến nhầy'], ['Dài', '≈ 10 – 12 cm'], ['Vai trò', 'Dẫn khí, làm ẩm, làm ấm, lọc bụi']] },
    bronchi: { name: 'Cây phế quản', sci: 'Arbor bronchialis', rows: [['Phân nhánh', 'Phế quản chính → thùy → phân thùy → tiểu phế quản (≈ 23 lần chia đôi)'], ['Tận cùng', 'Tiểu phế quản hô hấp nối với ống và túi phế nang']] },
    bell: { name: 'Chuông thủy tinh Donders', sci: 'Donders model', rows: [['Chuông', 'Lồng ngực'], ['Màng cao su', 'Cơ hoành'], ['2 quả bóng', '2 lá phổi'], ['Ống chữ Y', 'Khí quản và 2 phế quản']] },
    rubber: { name: 'Màng cao su (cơ hoành)', sci: 'Rubber membrane', rows: [['Kéo xuống', 'V bình tăng → P bình giảm → bóng phồng (hít vào)'], ['Đẩy lên', 'V bình giảm → P bình tăng → bóng xẹp (thở ra)'], ['Thử ngay', 'Kéo núm tròn dưới đáy chuông']] },
    balloon: { name: 'Quả bóng (lá phổi)', sci: 'Balloon = lung', rows: [['Phồng khi', 'Áp suất trong bình thấp hơn khí quyển'], ['Xẹp khi', 'Áp suất trong bình cao hơn khí quyển']] },
    epi: { name: 'Nắp thanh quản', sci: 'Epiglottis', rows: [['Bản chất', 'Sụn chun hình chiếc lá'], ['Khi thở', 'Mở, giơ lên, khí đi thông xuống khí quản'], ['Khi nuốt', 'Thanh quản nâng lên, nắp đậy kín lối vào khí quản, thức ăn trượt vào thực quản']] },
    larynx: { name: 'Thanh quản', sci: 'Larynx', rows: [['Chứa', 'Dây thanh âm'], ['Vai trò', 'Dẫn khí và phát âm; khi nói luồng khí đi lên làm dây thanh rung']] },
    eso: { name: 'Thực quản', sci: 'Oesophagus', rows: [['Vị trí', 'Phía sau khí quản'], ['Dài', '≈ 25 cm'], ['Vai trò', 'Nhu động đẩy thức ăn xuống dạ dày']] },
    phar: { name: 'Họng (hầu)', sci: 'Pharynx', rows: [['Vai trò', 'Ngã tư chung của đường khí và đường thức ăn'], ['Lưu ý', 'Nhờ nắp thanh quản và lưỡi gà mà thức ăn không lọt vào đường khí']] },
    palate: { name: 'Lưỡi gà (vòm miệng mềm)', sci: 'Uvula & soft palate', rows: [['Khi nuốt', 'Nâng lên đậy lối lên khoang mũi']] },
    tongue: { name: 'Lưỡi', sci: 'Lingua', rows: [['Khi nuốt', 'Đẩy viên thức ăn ra sau xuống họng']] },
    cilia: { name: 'Tế bào biểu mô có lông rung', sci: 'Ciliated epithelium', rows: [['Mỗi tế bào', '≈ 200 – 300 lông rung'], ['Nhịp đập', '10 – 20 lần/giây, theo hướng từ trong ra ngoài'], ['Vai trò', 'Quét lớp chất nhầy chứa bụi, vi khuẩn lên họng']] },
    goblet: { name: 'Tế bào tiết nhầy (tế bào hình đài)', sci: 'Goblet cell', rows: [['Vai trò', 'Tiết chất nhầy giữ bụi và vi khuẩn']] },
    mucus: { name: 'Lớp chất nhầy', sci: 'Mucus', rows: [['Vai trò', 'Bẫy bụi, vi khuẩn; được lông rung đẩy lên họng'], ['Khi hút thuốc', 'Dồn ứ, không được làm sạch → ho đờm']] },
    alv: { name: 'Chùm phế nang', sci: 'Alveoli', rows: [['Đường kính', '≈ 0,2 – 0,3 mm'], ['Thành', '1 lớp tế bào dẹt, dày ≈ 0,2 µm, có mạng mao mạch dày đặc'], ['Trao đổi', 'O₂ khuếch tán vào máu, CO₂ từ máu ra phế nang']] },
    cap: { name: 'Mạng lưới mao mạch phế nang', sci: 'Pulmonary capillaries', rows: [['Máu đến', 'Nghèo O₂ (động mạch phổi)'], ['Máu đi', 'Giàu O₂ (tĩnh mạch phổi)']] }
  };
  const WARN_TALK = 'Cảnh báo vệ sinh hô hấp: Vừa ăn vừa nói làm nắp thanh quản không đậy kín khí quản, thức ăn rơi vào đường dẫn khí sẽ kích hoạt phản xạ ho sặc dồn dập để tống dị vật ra ngoài, nguy hiểm hơn có thể gây tắc nghẽn hô hấp!';
  const WARN_SMOKE = 'Cảnh báo sức khỏe: Nicotine và hắc ín làm lông rung tê liệt, rụng; chất nhầy dồn ứ gây ho đờm, viêm phế quản mạn. Vách phế nang đứt gãy (khí thũng phổi) làm giảm tới 60% diện tích trao đổi khí, phổi chuyển màu đen xám!';

  let rate = 16, op = 1, years = 0, pm = 0, sex = 'm', hgt = 170, wgt = 60, act = 'sport', ventMode = 'body', lv = 1, deepT0 = -99, epiMode = 'breathe', talk = false;
  const dmg = () => Math.min(1, years / 30 * 0.8 + pm / 250 * 0.4);
  const sm = x => x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x);
  function vol() {
    const base = (sex === 'm' ? 25.84 : 20.16) * hgt;
    const k = { low: 0.72, sport: 1, pro: 1.15 }[act];
    const bmi = wgt / Math.pow(hgt / 100, 2);
    const VC = Math.round(base * k * (bmi >= 30 ? 0.9 : bmi < 16 ? 0.93 : 1) * (1 - 0.3 * dmg()) / 10) * 10;
    const TV = 500, ERV = Math.round(0.28 * (VC - TV) / 10) * 10, IRV = VC - TV - ERV;
    const RV = Math.round((sex === 'm' ? 1200 : 1000) * (1 + 0.6 * dmg()) / 10) * 10;
    return { VC, TV, IRV, ERV, RV, FRC: RV + ERV, TLC: VC + RV, bmi };
  }
  // pha thở: trả về thể tích phổi hiện tại (mL) và độ phồng a (0 → 1 với nhịp thường)
  function breathNow(t) {
    const v = vol(), per = 60 / rate, u = (t / per) % 1;
    const b = u < 0.4 ? sm(u / 0.4) : 1 - sm((u - 0.4) / 0.6);
    const dd = t - deepT0;
    let V = v.FRC + v.TV * b;
    if (dd >= 0 && dd < 10) V = dd < 3 ? V + (v.TLC - V) * sm(dd / 3) : dd < 7 ? v.TLC + (v.RV - v.TLC) * sm((dd - 3) / 4) : v.RV + (V - v.RV) * sm((dd - 7) / 3);
    return { V, a: (V - v.FRC) / v.TV, inh: u < 0.4, u, v };
  }
  const lungCol = T => new T.Color(PINK).lerp(new T.Color(GRAY), dmg());

  // ---------- dải phế dung kế ----------
  function spiroStrip(api) {
    let x = 0, prev = null;
    api.strip({
      h: 110, draw(c, W, H, tt, dt) {
        const steps = Math.max(1, Math.round(dt * W / 12)), v = vol(), top = v.TLC + 400;
        const Y = V => H * 0.95 - V / top * H * 0.85;
        const light = api.el.classList.contains('light');
        for (let k = 0; k < steps; k++) {
          const now = tt - dt + dt * (k + 1) / steps, V = breathNow(now).V;
          c.fillStyle = light ? '#FFFFFF' : '#08121E'; c.fillRect(x, 0, 8, H);
          c.fillStyle = 'rgba(140,170,200,.55)'; if (x % 10 < 5) [v.RV, v.FRC, v.TLC].forEach(l => c.fillRect(x, Y(l), 1, 2));
          const y = Y(V); c.strokeStyle = '#5BD1FF'; c.lineWidth = 3;
          if (prev !== null) { c.beginPath(); c.moveTo(x - 1, prev); c.lineTo(x, y); c.stroke(); }
          prev = y; x++; if (x >= W) { x = 0; prev = null; }
        }
        const b = breathNow(tt);
        c.fillStyle = 'rgba(8,18,30,.78)'; c.fillRect(6, 4, 820, 38);
        c.font = "800 30px 'Baloo 2'"; c.fillStyle = '#5BD1FF'; c.fillText(`Phế dung kế · ${Math.round(b.V)} mL · ${b.inh ? 'Hít vào' : 'Thở ra'} · VC = ${v.VC} mL`, 12, 32);
        c.font = "700 20px 'Baloo 2'"; c.fillStyle = '#8FB3D6'; c.fillText('TLC', W - 52, Y(v.TLC) - 4); c.fillText('FRC', W - 52, Y(v.FRC) - 4); c.fillText('RV', W - 44, Y(v.RV) - 4);
      }
    });
  }

  // ---------- Tab 1: thông khí ----------
  function buildBody(api, at) {
    const T = api.T, V = api.V;
    const g = api.group(null, at);
    // cột sống + xương ức
    const spine = api.group(g); for (let k = 0; k < 14; k++) api.box(0.5, 0.32, 0.5, BONE, [0, 3.2 - k * 0.42, -1.9], spine); spine.traverse(o => o.userData.noPick = true);
    const ribs = api.group(g); api.tag(ribs, 'rib');
    const ribList = [];
    for (let k = 0; k < 10; k++) {
      const y = 2.6 - k * 0.42, w = 1.6 + Math.sin((k + 1) / 11 * Math.PI) * 0.9, d = 1.5 + k * 0.04;
      const rg = api.group(ribs, [0, y, -1.9]);
      [-1, 1].forEach(s => { const pts = []; for (let j = 0; j <= 12; j++) { const a = j / 12 * Math.PI; pts.push(V(s * Math.sin(a) * w, -Math.sin(a) * 0.35, (1 - Math.cos(a)) * d * 0.62)); } api.tube(pts, 0.07, api.mat(BONE, { opacity: op }), rg, 40); });
      ribList.push(rg);
    }
    const sternum = api.box(0.4, 3.2, 0.18, api.mat(BONE, { opacity: op }), [0, 1.2, 0.05], ribs);
    api.part(ribs, INFO.rib);
    // phổi
    const lungs = api.group(g); api.tag(lungs, 'tree');
    const L = [-1, 1].map(s => { const m = api.sphere(1, api.mat(lungCol(T), { opacity: 0.85 * op, roughness: 0.7 }), [s * 0.95, 0.7, -0.6], lungs, 40); m.scale.set(0.82, 1.75, 0.95); m.userData.base = m.scale.clone(); return m; });
    api.part(lungs, INFO.lung);
    const tr = api.group(g); api.tag(tr, 'tree');
    api.cyl(0.16, 0.16, 2.2, 0xD9E6F2, [0, 3.6, -0.5], tr, 16); api.lineBetween([0, 2.5, -0.5], [-0.7, 1.9, -0.55], 0.12, 0xD9E6F2, tr); api.lineBetween([0, 2.5, -0.5], [0.7, 1.9, -0.55], 0.12, 0xD9E6F2, tr);
    api.part(tr, INFO.trachea);
    // cơ hoành vòm
    const dia = api.mesh(new T.SphereGeometry(2.2, 40, 16, 0, Math.PI * 2, 0, Math.PI * 0.42), api.mat(MUS, { side: T.DoubleSide, opacity: 0.92 }), [0, -1.6, -0.7], g); dia.scale.set(1, 0.55, 0.85); api.tag(dia, 'rib'); api.part(dia, INFO.dia);
    // hạt khí
    const air = []; for (let k = 0; k < 14; k++) { const m = api.sphere(0.07, api.mat(0x5BD1FF, { emissive: 0x5BD1FF, emissiveIntensity: 0.6 }), null, g, 8); m.userData.noPick = true; air.push(m); }
    api.label('Phổi', L[1], { off: [1.2, 0.6, 0] }); api.label('Cơ hoành', dia, { off: [1.9, -0.2, 0.6] }); api.label('Xương sườn', [-2.4, 1.8, -0.8], { cls: 'plain', parent: g }); api.label('Khí quản', [0, 4.4, -0.5], { cls: 'tag', color: '#5BD1FF', parent: g });
    return {
      g, update(b) {
        const a = Math.max(-2.5, Math.min(6, b.a)), k = a * 0.06;
        L.forEach(m => { m.scale.set(m.userData.base.x * (1 + k), m.userData.base.y * (1 + k * 0.8), m.userData.base.z * (1 + k)); m.material.color.copy(lungCol(T)); });
        dia.scale.y = Math.max(0.12, 0.55 - a * 0.07); dia.position.y = -1.6 - a * 0.08;
        ribList.forEach((r, i) => r.rotation.x = -a * 0.025 * (1 - i * 0.04));
        sternum.position.z = 0.05 + a * 0.05; sternum.position.y = 1.2 + a * 0.03;
        air.forEach((m, i) => { const p = ((b.u * 3 + i / 14) % 1); const y = b.inh ? 4.7 - p * 2.6 : 2.1 + p * 2.6; m.position.set(0.05 * Math.sin(i), y, -0.5); m.material.color.set(b.inh ? 0x5BD1FF : 0xB8C2CC); m.material.emissive.set(b.inh ? 0x5BD1FF : 0x6E7781); });
      },
      opacity(o) { api.setOpacity(ribs, o); api.setOpacity(lungs, o); }
    };
  }
  function buildBell(api, at) {
    const T = api.T;
    const g = api.group(null, at); api.tag(g, 'donders');
    const glass = api.mat(0xBFE6FF, { opacity: 0.18, side: T.DoubleSide, depthWrite: false, roughness: 0.05, metalness: 0.1 });
    const bell = api.group(g);
    api.mesh(new T.CylinderGeometry(2.1, 2.1, 3.6, 48, 1, true), glass, [0, 0, 0], bell); api.mesh(new T.SphereGeometry(2.1, 48, 16, 0, Math.PI * 2, 0, Math.PI / 2), glass, [0, 1.8, 0], bell);
    api.mesh(new T.TorusGeometry(2.1, 0.06, 8, 48), api.mat(0x9FB6C9), [0, -1.8, 0], bell).rotation.x = Math.PI / 2;
    api.cyl(0.35, 0.4, 0.4, 0x6B4A2E, [0, 3.95, 0], bell, 20);
    api.part(bell, INFO.bell);
    const tube = api.group(g); api.cyl(0.09, 0.09, 2.4, 0xE6EEF5, [0, 3.6, 0], tube, 12); api.lineBetween([0, 2.45, 0], [-0.8, 1.6, 0], 0.08, 0xE6EEF5, tube); api.lineBetween([0, 2.45, 0], [0.8, 1.6, 0], 0.08, 0xE6EEF5, tube); tube.traverse(o => o.userData.noPick = true);
    const balls = [-0.85, 0.85].map(x => { const b = api.sphere(0.6, api.mat(0xFF6E8A, { roughness: 0.35 }), [x, 0.9, 0], g, 32); b.scale.set(1, 1.25, 1); return b; });
    balls.forEach(b => api.part(b, INFO.balloon));
    const mem = api.mesh(new T.SphereGeometry(2.08, 40, 12, 0, Math.PI * 2, 0, Math.PI * 0.5), api.mat(0xE0A23A, { side: T.DoubleSide, roughness: 0.8 }), [0, -1.8, 0], g); api.part(mem, INFO.rubber);
    const knob = api.sphere(0.32, api.mat(0xFFD84A, { emissive: 0xFFB000, emissiveIntensity: 0.35 }), [0, -1.8, 0], g, 20); api.part(knob, Object.assign({ focus: false }, INFO.rubber));
    const ptxt = api.label('', [0, -0.4, 2.2], { cls: 'tag', color: '#E0A23A', parent: g });
    api.label('Chuông = lồng ngực', [2.4, 3.6, 0], { cls: 'plain', parent: g }); api.label('Bóng = phổi', balls[1], { off: [1.5, 0, 0], cls: 'plain' }); api.label('Màng cao su = cơ hoành', [0, -3.3, 0], { cls: 'plain', parent: g });
    let m = 0, dragT = -99, last = 0;
    api.draggable(knob, {
      normal: new T.Vector3(0, 0, 1),
      start() { dragT = api.time; },
      move(p) { m = Math.max(-1, Math.min(1, -(p.y - g.position.y + 1.8) / 1.2)); dragT = api.time; },
      end() { dragT = api.time; }
    });
    return {
      g, update(b) {
        const auto = api.time - dragT > 3;
        if (auto) m = Math.max(-1, Math.min(1, b.a * 0.9 - 0.1));
        // m > 0: kéo xuống (hít vào), m < 0: đẩy lên (thở ra)
        mem.scale.y = -0.42 * m || 0.001; knob.position.y = -1.8 - 0.88 * m;
        const s = 0.8 + 0.35 * (m + 1) / 2; balls.forEach(x => x.scale.set(s, s * 1.25, s));
        if (Math.sign(m - last) !== 0 && Math.abs(m - last) > 0.4) { last = m; }
        const dP = (-m * 3).toFixed(1);
        ptxt.el.innerHTML = m > 0.05 ? `V bình ↑ · P bình ${dP} mmHg → bóng phồng` : m < -0.05 ? `V bình ↓ · P bình +${(-dP).toFixed(1)} mmHg → bóng xẹp` : 'P bình = P khí quyển';
        knob.material.emissiveIntensity = auto ? 0.35 + 0.25 * Math.sin(api.time * 5) : 0.9;
      }
    };
  }
  function ventTab(api) {
    const body = buildBody(api, [0, 0, 0]), bell = buildBell(api, [0, 0, 0]);
    const place = () => {
      body.g.visible = ventMode !== 'bell'; bell.g.visible = ventMode !== 'body';
      body.g.position.x = ventMode === 'both' ? -3.3 : 0; bell.g.position.x = ventMode === 'both' ? 3.3 : 0;
    };
    place();
    let wasInh = null;
    api.onFrame(() => {
      const b = breathNow(api.time);
      body.update(b); bell.update(b);
      if (b.inh !== wasInh) { wasInh = b.inh; const per = 60 / rate; api.noise(per * (b.inh ? 0.38 : 0.5), b.inh ? 0.05 : 0.04, b.inh ? 900 : 600); if (!b.inh && dmg() > 0.35) { api.beep(880, per * 0.4, 'triangle', 0.025 * dmg()); api.beep(1170, per * 0.3, 'triangle', 0.015 * dmg(), 0.1); } }
      api.caption(`${b.inh ? 'Hít vào: cơ hoành co hạ xuống, sườn nâng lên → V lồng ngực ↑, P phế nang < P khí quyển' : 'Thở ra: cơ hoành dãn vòm lên, sườn hạ → V lồng ngực ↓, P phế nang > P khí quyển'} · ${rate} nhịp/phút`);
    });
    api.choices({ label: '🔁 Chế độ xem', items: [{ t: '🫁 Cơ thể', v: 'body' }, { t: '🔔 Chuông Donders', v: 'bell' }, { t: '↔ Song song', v: 'both' }], value: ventMode, onPick(v) { ventMode = v; place(); if (v !== 'body') api.toast('Kéo núm vàng dưới đáy chuông lên xuống'); } });
    api.button('🌬 Hít vào thật sâu rồi thở ra hết', () => { deepT0 = api.time; api.toast('Xem phế dung kế: hít tới TLC, thở ra tới RV'); });
    commonCtl(api, o => body.opacity(o));
    vcCtl(api);
    spiroStrip(api);
    api.view({ pos: [0, 1.5, 13], target: [0, 0.8, 0], min: 4, max: 26 });
  }

  // ---------- Tab 2: nắp thanh quản ----------
  function epiTab(api) {
    const T = api.T, V = api.V;
    const soft = (c, o) => api.mat(c, { opacity: o, depthWrite: false, side: T.DoubleSide });
    // bóng mặt nghiêng
    const prof = new T.Shape(); [[-1.6, 5.2], [1.2, 5.6], [2.6, 4.6], [3.4, 3.4], [3.2, 2.9], [3.5, 2.4], [3.3, 1.7], [2.8, 1.3], [2.4, 0.6], [1.6, -0.2], [1.4, -4.5], [-1.6, -4.5], [-1.7, 0.6], [-2.4, 2.4], [-2.2, 4.4]].forEach((p, k) => k ? prof.lineTo(...p) : prof.moveTo(...p));
    const head = api.mesh(new T.ExtrudeGeometry(prof, { depth: 0.2, bevelEnabled: false }), soft(0xF5C9B4, 0.12), [0, 0, -1.2]); head.userData.noPick = true;
    // khoang mũi, khoang miệng, lưỡi
    const nose = api.mesh(new T.CapsuleGeometry(0.42, 2.4, 6, 16), soft(0x9FD8FF, 0.25), [1.4, 3.5, 0]); nose.rotation.z = Math.PI / 2; nose.userData.noPick = true;
    const mouth = api.mesh(new T.CapsuleGeometry(0.42, 2.0, 6, 16), soft(0xFFB7C5, 0.22), [1.6, 2.1, 0]); mouth.rotation.z = Math.PI / 2; mouth.userData.noPick = true;
    const tongue = api.sphere(1, 0xE87A8C, [1.6, 1.5, 0], null, 28); tongue.scale.set(1.35, 0.45, 0.6); api.part(tongue, INFO.tongue);
    const palate = api.group(null, [0.55, 2.75, 0]); const pm_ = api.mesh(new T.CapsuleGeometry(0.12, 0.45, 4, 10), 0xE58B9C, [0, -0.3, 0], palate); palate.rotation.z = -0.2; api.part(palate, INFO.palate);
    // họng
    const phar = api.mesh(new T.CylinderGeometry(0.55, 0.5, 3.4, 24, 1, true), soft(0xFFC9A8, 0.3), [-0.3, 2.0, 0]); api.part(phar, INFO.phar);
    // khí quản (trước) có vòng sụn, thực quản (sau)
    const trG = api.group(); api.tag(trG, 'tree');
    api.mesh(new T.CylinderGeometry(0.42, 0.42, 4.2, 24, 1, true), soft(0x9FD8FF, 0.35), [0.65, -2.0, 0], trG);
    for (let k = 0; k < 9; k++) api.mesh(new T.TorusGeometry(0.44, 0.05, 6, 24), 0xE8EEF3, [0.65, -0.4 - k * 0.42, 0], trG).rotation.x = Math.PI / 2;
    api.part(trG, INFO.trachea);
    const lar = api.mesh(new T.CylinderGeometry(0.5, 0.44, 0.7, 24, 1, true), soft(0x7FC4F0, 0.5), [0.65, 0.05, 0]); api.part(lar, INFO.larynx); api.tag(lar, 'tree');
    const eso = api.mesh(new T.CylinderGeometry(0.36, 0.36, 4.4, 24, 1, true), soft(0xF2A65A, 0.4), [-0.55, -2.1, 0]); eso.scale.z = 0.7; api.part(eso, INFO.eso); api.tag(eso, 'epi');
    // nắp thanh quản: bản lề phía trước lối vào thanh quản
    const epi = api.group(null, [1.12, 0.35, 0]); api.tag(epi, 'epi');
    const leaf = api.mesh(new T.SphereGeometry(0.5, 20, 14), api.mat(0xFFE08A, { emissive: 0xFFB000, emissiveIntensity: 0 }), [0, 0.45, 0], epi); leaf.scale.set(0.22, 1, 0.75);
    api.part(epi, INFO.epi);
    // viên thức ăn + hạt khí
    const bolus = api.sphere(0.32, 0x9A6233, null, null, 20); bolus.userData.noPick = true; bolus.visible = false;
    const air = []; for (let k = 0; k < 16; k++) { const m = api.sphere(0.06, api.mat(0x5BD1FF, { emissive: 0x5BD1FF, emissiveIntensity: 0.6 }), null, null, 8); m.userData.noPick = true; air.push(m); }
    const P = a => new T.CatmullRomCurve3(a.map(p => V(p[0], p[1], 0)));
    const safe = P([[2.6, 2.05], [1.4, 2.0], [0.4, 1.8], [-0.25, 1.0], [-0.5, 0.0], [-0.55, -1.5], [-0.55, -4.2]]);
    const wrong = P([[2.6, 2.05], [1.4, 2.0], [0.4, 1.8], [-0.1, 1.0], [0.5, 0.3], [0.65, -0.8], [0.65, -2.2]]);
    const cough = P([[0.65, -2.2], [0.65, -0.8], [0.5, 0.3], [0.1, 1.4], [0.8, 2.0], [2.2, 2.1], [4.2, 2.3]]);
    const airIn = P([[3.4, 3.5], [1.4, 3.6], [0.1, 3.3], [-0.3, 2.2], [0.3, 0.9], [0.65, 0.0], [0.65, -4]]);
    const airTalk = P([[0.65, -4], [0.65, 0.0], [0.3, 0.9], [0.4, 1.8], [1.6, 2.1], [3.6, 2.1]]);
    api.label('Nắp thanh quản', epi, { off: [1.4, 0.8, 0], cls: 'tag', color: '#E0A100' }); api.label('Khí quản', [0.65, -3, 0], { off: [1.3, 0, 0] }); api.label('Thực quản', [-0.55, -3, 0], { off: [-1.4, 0, 0] });
    api.label('Khoang mũi', nose, { cls: 'plain', off: [0, 0.6, 0] }); api.label('Khoang miệng', [2.2, 2.3, 0], { cls: 'plain' }); api.label('Họng', phar, { cls: 'plain', off: [-1.0, 0.6, 0] }); api.label('Thanh quản', lar, { cls: 'plain', off: [1.4, -0.2, 0] });
    let food = null, ang = 0.15, coughT = -99;
    const feed = () => { if (food) return; food = { t0: api.time, choke: false }; bolus.visible = true; api.beep(330, 0.08, 'sine', 0.1); };
    api.onFrame(dt => {
      const now = api.time;
      let target = 0.15, airMode = epiMode === 'breathe' || !food ? (talk ? 'talk' : 'in') : 'stop';
      if (food) {
        const age = now - food.t0, u = age / 3.2;
        const inThroat = u > 0.32 && u < 0.6;
        if (inThroat && talk && !food.choke && !food.past) { food.choke = true; api.warn('talk', WARN_TALK, '⚠️ Cảnh báo vệ sinh hô hấp'); }
        if (u > 0.6) food.past = true;
        if (food.choke) {
          target = 0.15; airMode = 'talk';
          if (u < 0.75) bolus.position.copy(wrong.getPointAt(Math.min(1, Math.max(0, (u - 0.32) / 0.43 * 0.65 + 0.35))));
          else { if (coughT < food.t0) { coughT = now; } const cu = (now - coughT) / 1.6; airMode = 'cough';
            if (Math.floor(cu * 4) !== food.cn && cu < 1) { food.cn = Math.floor(cu * 4); api.noise(0.18, 0.35, 380); api.beep(140, 0.12, 'sawtooth', 0.12); }
            bolus.position.copy(cough.getPointAt(Math.min(1, sm(cu)))); if (cu >= 1.15) { food = null; bolus.visible = false; api.toast('Ho sặc đã tống dị vật ra ngoài'); } }
        } else {
          target = inThroat || (u > 0.25 && u < 0.7) ? 1.25 : 0.15;
          bolus.position.copy(safe.getPointAt(Math.min(1, u)));
          palate.rotation.z = u > 0.2 && u < 0.6 ? 0.9 : -0.2;
          if (u >= 1) { food = null; bolus.visible = false; }
        }
        if (talk) target = 0.15;
      } else palate.rotation.z = -0.2;
      ang += (target - ang) * Math.min(1, dt * 8); epi.rotation.z = ang;
      leaf.material.emissiveIntensity = ang > 0.8 ? 0.5 : 0;
      lar.position.y = 0.05 + (ang - 0.15) * 0.15; epi.position.y = 0.35 + (ang - 0.15) * 0.15;
      air.forEach((m, i) => {
        m.visible = airMode !== 'stop';
        const sp = airMode === 'cough' ? 1.6 : 0.35, p = (now * sp + i / 16) % 1;
        const c = airMode === 'in' ? airIn : airMode === 'talk' ? airTalk : cough;
        m.position.copy(c.getPointAt(p)); m.material.color.set(airMode === 'cough' ? 0xFF6B6B : airMode === 'talk' ? 0xB8C2CC : 0x5BD1FF);
      });
      api.caption(food && food.choke ? 'Thức ăn lọt vào khí quản → phản xạ ho sặc' : food ? 'Nuốt: lưỡi gà đậy khoang mũi, nắp thanh quản đậy khí quản, thức ăn vào thực quản' : talk ? 'Đang nói: khí từ phổi đi lên qua thanh quản, nắp thanh quản mở' : 'Hít thở: nắp thanh quản mở, khí thông xuống khí quản');
    });
    api.choices({ label: '👅 Chế độ', items: [{ t: '🌬 Hít thở', v: 'breathe' }, { t: '🍙 Nuốt', v: 'swallow' }], value: epiMode, onPick(v) { epiMode = v; if (v === 'swallow') feed(); } });
    api.button('🍙 Cho một miếng ăn', () => feed());
    api.toggle({ label: '🗣 Nói / Cười trong lúc ăn', value: talk, onChange(v) { talk = v; if (v) api.toast('Thử bấm "Cho một miếng ăn" khi đang nói'); } });
    commonCtl(api, o => { api.setOpacity(head, o); api.setOpacity(phar, o); });
    api.view({ pos: [0.6, 0.6, 12], target: [0.6, 0.4, 0], min: 3, max: 22 });
  }

  // ---------- Tab 3: phế quản, lông rung, phế nang ----------
  function treeLv(api) {
    const T = api.T, V = api.V, rnd = api.rand(3);
    const g = api.group(); api.tag(g, 'tree');
    const tips = [];
    const br = (p, d, len, r, depth) => {
      const e = p.clone().add(d.clone().multiplyScalar(len)); api.lineBetween(p, e, r, 0xDCE8F3, g);
      if (!depth) { tips.push(e); return; }
      [-1, 1].forEach(s => { const nd = d.clone().applyAxisAngle(V(0, 0, 1), s * (0.45 + rnd() * 0.2)).applyAxisAngle(V(0, 1, 0), (rnd() - 0.5) * 1.2).normalize(); br(e, nd, len * 0.74, r * 0.72, depth - 1); });
    };
    api.lineBetween([0, 5, 0], [0, 2.5, 0], 0.3, 0xDCE8F3, g);
    br(V(0, 2.5, 0), V(-0.7, -0.7, 0).normalize(), 1.6, 0.22, 5); br(V(0, 2.5, 0), V(0.7, -0.7, 0).normalize(), 1.6, 0.22, 5);
    api.part(g, INFO.bronchi);
    const al = api.group(); api.tag(al, 'alv'); tips.forEach(p => api.sphere(0.12, api.mat(lungCol(T)), [p.x, p.y, p.z], al, 10)); api.part(al, INFO.alv);
    const shell = api.group(); [-1, 1].forEach(s => { const m = api.sphere(1, api.mat(lungCol(T), { opacity: 0.15 * op, depthWrite: false }), [s * 2.1, -0.2, 0], shell, 32); m.scale.set(1.8, 3.2, 1.5); m.userData.noPick = true; });
    api.label('Khí quản', [0, 4.6, 0], { off: [0.9, 0, 0] }); api.label('Phế quản chính', [-1, 1.6, 0], { off: [-1.3, 0, 0] }); api.label('Tiểu phế quản → phế nang', tips[0], { cls: 'plain', off: [-0.5, -0.6, 0] });
    api.view({ pos: [0, 0.5, 13], target: [0, 0.3, 0], min: 5, max: 24 });
    return o => api.setOpacity(shell, o);
  }
  function ciliaLv(api) {
    const T = api.T, rnd = api.rand(9), d = dmg();
    const cells = api.group(); api.tag(cells, 'cilia');
    const NX = 8, NZ = 4, CW = 1.0;
    for (let i = 0; i < NX; i++) for (let j = 0; j < NZ; j++) {
      const gob = (i * 3 + j) % 7 === 3, x = -NX / 2 * CW + i * CW + 0.5, z = -NZ / 2 * CW + j * CW + 0.5;
      const c = api.box(0.94, 2.2, 0.94, api.mat(gob ? 0xC9B8F0 : 0xF3C2CF, { opacity: 0.95 }), [x, -1.1, z], cells);
      api.sphere(0.22, 0x7A4FB5, [x, -1.5, z], cells, 12);
      if (gob) { const cup = api.sphere(0.36, api.mat(0xEFF7B5, { opacity: 0.9 }), [x, -0.15, z], cells, 16); cup.scale.y = 1.3; api.part(c, INFO.goblet); api.part(cup, INFO.goblet); c.userData.gob = true; }
      else api.part(c, INFO.cilia);
    }
    // lông rung (InstancedMesh)
    const N = 900, geo = new T.CylinderGeometry(0.018, 0.024, 0.75, 5); geo.translate(0, 0.375, 0);
    const im = new T.InstancedMesh(geo, api.mat(0xFFFFFF, { roughness: 0.4 }), N); api.root.add(im); api.tag(im, 'cilia'); api.part(im, INFO.cilia);
    const base = []; for (let k = 0; k < N; k++) { const x = (rnd() - 0.5) * NX * CW, z = (rnd() - 0.5) * NZ * CW; const ci = Math.floor((x + NX / 2) / CW), cj = Math.floor((z + NZ / 2) / CW); const gob = (ci * 3 + cj) % 7 === 3; base.push({ x, z, alive: !gob && rnd() > d * 0.95, ph: x * 1.6 + rnd() * 0.3 }); }
    const mucus = api.box(NX * CW, 0.35 + d * 0.5, NZ * CW, api.mat(new T.Color(0xD8F0A8).lerp(new T.Color(0x6B5B3A), d), { opacity: 0.45, depthWrite: false }), [0, 0.95 + d * 0.25, 0]); api.tag(mucus, 'cilia'); api.part(mucus, INFO.mucus);
    const dust = []; for (let k = 0; k < 40; k++) { const m = api.sphere(0.05 + rnd() * 0.04, d > 0.3 && k % 2 ? 0x2E2A25 : 0x8A7C6A, [(rnd() - 0.5) * NX * CW, 1.0 + rnd() * 0.25, (rnd() - 0.5) * NZ * CW], null, 6); m.userData.noPick = true; dust.push(m); }
    const M = new T.Matrix4(), Q = new T.Quaternion(), E = new T.Euler(), S = new T.Vector3(1, 1, 1), P = new T.Vector3();
    api.label('Lông rung', [-3.5, 0.5, 2], { cls: 'tag', color: '#5BA8E0' }); api.label('Lớp chất nhầy + bụi', [2.8, 1.3, 2], { cls: 'tag', color: '#B5D46A' }); api.label('Tế bào tiết nhầy', [-0.5, -0.4, 2.3], { cls: 'plain' });
    api.label('→ Hướng quét lên họng', [0, 2.0, 0], { cls: 'plain' });
    api.onFrame(dt => {
      const t = api.time, amp = 0.7 * (1 - d);
      base.forEach((b, k) => {
        const a = b.alive ? Math.sin(t * 9 - b.ph) * amp : -0.9 * (d > 0.5 ? 1 : 0.3);
        E.set(0, 0, -Math.max(-0.4, a)); Q.setFromEuler(E); P.set(b.x, 0, b.z); S.set(1, b.alive ? 1 : (d > 0.6 ? 0.001 : 0.5), 1); M.compose(P, Q, S); im.setMatrixAt(k, M);
      });
      im.instanceMatrix.needsUpdate = true;
      const v = 0.5 * Math.max(0, 1 - d * 1.15);
      dust.forEach(m => { m.position.x += v * dt; if (m.position.x > NX * CW / 2) m.position.x = -NX * CW / 2; });
      api.caption(d < 0.05 ? 'Lông rung đập nhịp nhàng, quét chất nhầy và bụi từ trong ra ngoài lên họng' : d < 0.6 ? `Độc tố làm lông rung yếu, rụng dần (${Math.round(d * 95)}% bị liệt) → chất nhầy ứ đọng` : 'Lông rung tê liệt, rụng trọc: chất nhầy và bụi không được làm sạch');
    });
    api.view({ pos: [0, 3.2, 9], target: [0, 0.2, 0], min: 3, max: 18 });
  }
  function alvLv(api) {
    const T = api.T, V = api.V, rnd = api.rand(4), d = dmg();
    const g = api.group(); api.tag(g, 'alv');
    api.lineBetween([0, 4.5, 0], [0, 2.2, 0], 0.3, 0xDCE8F3, g);
    const sacs = [], n = 14, merged = Math.round(d * 8);
    for (let k = 0; k < n; k++) { const a = k / n * Math.PI * 2 * 1.6, r = 1.1 + (k % 3) * 0.45; const p = V(Math.cos(a) * r, 1.0 - (k % 4) * 0.55 + rnd() * 0.3, Math.sin(a) * r * 0.9); sacs.push(p); }
    sacs.forEach((p, k) => {
      if (k < merged && k % 2) return;
      const big = k < merged; const m = api.sphere(big ? 0.85 : 0.55, api.mat(lungCol(T), { opacity: big ? 0.5 : 0.7, roughness: 0.6 }), [p.x, p.y, p.z], g, 24);
      if (big) m.scale.set(1.2, 0.9, 1.1); api.lineBetween([0, 2.2, 0], p, 0.12, 0xE8C9D2, g);
    });
    api.part(g, INFO.alv);
    const cap = api.group(); api.tag(cap, 'alv');
    for (let k = 0; k < 9; k++) { const pts = []; for (let j = 0; j <= 16; j++) { const a = j / 16 * Math.PI * 2, y = 1.3 - k * 0.32; pts.push(V(Math.cos(a) * (1.9 + 0.2 * Math.sin(a * 3 + k)), y + 0.15 * Math.sin(a * 2 + k), Math.sin(a) * 1.7)); } const c = new T.Color(0x4D6FD6).lerp(new T.Color(0xE8343A), k / 8); api.tube(pts, 0.05, c.getHex(), cap, 60); }
    api.part(cap, INFO.cap);
    const o2 = [], co2 = [];
    for (let k = 0; k < 24; k++) { const m = api.sphere(0.07, api.mat(0x5BD1FF, { emissive: 0x5BD1FF, emissiveIntensity: 0.5 }), null, null, 8); m.userData.noPick = true; o2.push(m); }
    for (let k = 0; k < 18; k++) { const m = api.sphere(0.07, 0x9AA3AD, null, null, 8); m.userData.noPick = true; co2.push(m); }
    api.label('Phế nang', [sacs[3].x, sacs[3].y, sacs[3].z], { off: [0, 0.8, 0] }); api.label('Mao mạch', [1.9, -1.2, 0], { off: [1, 0, 0] });
    api.label('O₂ vào máu', [2.6, 1.6, 0], { cls: 'tag', color: '#5BD1FF' }); api.label('CO₂ ra phế nang', [-2.8, 1.6, 0], { cls: 'tag', color: '#9AA3AD' });
    api.onFrame(() => {
      const t = api.time, live = 1 - 0.6 * d;
      o2.forEach((m, k) => { const p = (t * 0.4 + k / 24) % 1, s = sacs[k % n], a = k * 0.7; m.visible = k / 24 < live; m.position.lerpVectors(s, V(Math.cos(a) * 1.95, s.y - 0.5, Math.sin(a) * 1.7), p); });
      co2.forEach((m, k) => { const p = (t * 0.4 + k / 18) % 1, s = sacs[(k + 3) % n], a = k * 0.9 + 0.3; m.visible = k / 18 < live; m.position.lerpVectors(V(Math.cos(a) * 1.95, s.y - 0.5, Math.sin(a) * 1.7), s, p); });
      api.caption(d < 0.05 ? 'O₂ khuếch tán từ phế nang vào máu, CO₂ từ máu ra phế nang' : `Khí thũng: vách phế nang đứt gãy, diện tích trao đổi giảm ${Math.round(60 * d)}%`);
    });
    api.view({ pos: [0, 2.5, 9], target: [0, 0.6, 0], min: 3, max: 18 });
  }
  function alvTab(api) {
    api.levels(['Cây phế quản', 'Lông rung', 'Phế nang'], lv, n => { lv = n; api.setTab(api.tab); });
    let opf = null;
    if (lv === 0) opf = treeLv(api); else if (lv === 1) ciliaLv(api); else alvLv(api);
    commonCtl(api, o => opf && opf(o));
  }

  function commonCtl(api, onOp) {
    api.slider({ label: '🌬 Tần số thở', min: 12, max: 60, step: 1, value: rate, unit: 'nhịp/phút', lazy: true, onInput(v) { rate = v; if (v > 20) api.warn('rate', 'Người lớn khi nghỉ thở trên 20 nhịp/phút đã là thở nhanh. Càng nhanh thì càng nông: khí chủ yếu ra vào khoảng chết (khí quản, phế quản), lượng khí thực sự tới phế nang giảm, cơ thể có thể thiếu O₂.', '⚠️ Lưu ý sinh lí'); } });
    api.slider({ label: 'Độ trong suốt sườn và phổi', min: 0, max: 100, step: 5, value: Math.round((1 - op) * 100), unit: '%', lazy: true, onInput(v) { op = Math.max(0.05, 1 - v / 100); onOp && onOp(op); } });
    api.section('🚬 Khói thuốc và bụi mịn');
    const reb = () => { if (api.tab === 'alv' || api.tab === 'vent') { if (api.tab === 'alv') api.setTab(api.tab); } };
    api.slider({ label: 'Số năm hút thuốc', min: 0, max: 30, step: 1, value: years, unit: 'năm', lazy: true, onInput(v) { years = v; if (dmg() > 0.3) api.warn('smoke', WARN_SMOKE, '⚠️ Cảnh báo sức khỏe'); clearTimeout(api.el._rb); api.el._rb = setTimeout(reb, 350); } });
    api.slider({ label: 'Bụi mịn PM₂.₅', min: 0, max: 250, step: 5, value: pm, unit: 'µg/m³', lazy: true, onInput(v) { pm = v; if (v > 15) api.warn('pm', 'WHO khuyến nghị bụi mịn PM₂.₅ trung bình 24 giờ không quá 15 µg/m³. Vượt mức này là bắt đầu có hại, càng cao càng nguy hiểm: hạt nhỏ hơn 2,5 µm đi sâu tới tận phế nang, gây viêm, giảm chức năng phổi. Nên đeo khẩu trang đạt chuẩn và hạn chế ra ngoài.', '⚠️ Cảnh báo ô nhiễm'); clearTimeout(api.el._rb); api.el._rb = setTimeout(reb, 350); } });
    api.checklist([
      { k: 'rib', label: 'Khung xương sườn và Cơ hoành' }, { k: 'donders', label: 'Mô hình Chuông Donders' }, { k: 'epi', label: 'Nắp thanh quản và Thực quản' },
      { k: 'tree', label: 'Khí quản và Cây phế quản' }, { k: 'cilia', label: 'Lớp tế bào lông rung' }, { k: 'alv', label: 'Chùm phế nang và Mạng lưới mao mạch' }
    ]);
  }
  function vcCtl(api) {
    api.section('📏 Tính dung tích sống (VC)');
    const res = () => { const v = vol(); return `TV <b>${v.TV}</b> + IRV <b>${v.IRV}</b> + ERV <b>${v.ERV}</b><br>= VC <b style="font-size:16px;color:#2A8BD8">${v.VC} mL</b> · RV ${v.RV} mL<br>BMI ${v.bmi.toFixed(1)}${dmg() > 0 ? ` · giảm ${Math.round(30 * dmg())}% do khói bụi` : ''}`; };
    let out = null; const up = () => out && out.set(res());
    api.choices({ items: [{ t: '👦 Nam', v: 'm' }, { t: '👧 Nữ', v: 'f' }], value: sex, onPick(v) { sex = v; up(); } });
    api.slider({ label: 'Chiều cao', min: 140, max: 200, step: 1, value: hgt, unit: 'cm', lazy: true, onInput(v) { hgt = v; up(); } });
    api.slider({ label: 'Cân nặng', min: 35, max: 120, step: 1, value: wgt, unit: 'kg', lazy: true, onInput(v) { wgt = v; up(); } });
    api.choices({ items: [{ t: '🛋 Ít vận động', v: 'low' }, { t: '⚽ Tập thể thao', v: 'sport' }, { t: '🏅 Vận động viên', v: 'pro' }], value: act, onPick(v) { act = v; up(); } });
    out = api.note(res());
  }

  NL.m3d.register('M5', {
    title: 'Hệ hô hấp',
    tabs: [{ t: '🫁 Thông khí & Donders', v: 'vent' }, { t: '👅 Nắp thanh quản', v: 'epi' }, { t: '🔬 Phế quản & phế nang', v: 'alv' }],
    init() { lv = 1; deepT0 = -99; food = null; },
    build(api, tab) { if (tab === 'vent') ventTab(api); else if (tab === 'epi') epiTab(api); else alvTab(api); },
    data() {
      const v = vol(), d = dmg(), pts = [];
      const FRC = v.FRC;
      for (let k = 0; k <= 300; k++) {
        const t = k / 10; let V;
        if (t < 12) V = FRC + v.TV * (0.5 - 0.5 * Math.cos(2 * Math.PI * t / 4));
        else if (t < 15) V = FRC + (v.TLC - FRC) * sm((t - 12) / 3);
        else if (t < 19) V = v.TLC + (v.RV - v.TLC) * sm((t - 15) / 4);
        else if (t < 22) V = v.RV + (FRC - v.RV) * sm((t - 19) / 3);
        else V = FRC + v.TV * (0.5 - 0.5 * Math.cos(2 * Math.PI * (t - 22) / 4));
        pts.push([+t.toFixed(1), Math.round(V)]);
      }
      const sick = d > 0;
      return {
        title: 'Thông khí phổi và dung tích sống',
        sub: `${sex === 'm' ? 'Nam' : 'Nữ'} · ${hgt} cm · ${wgt} kg · ${{ low: 'Ít vận động', sport: 'Tập thể thao', pro: 'Vận động viên' }[act]} · Tần số thở ${rate} nhịp/phút · Hút thuốc ${years} năm · PM₂.₅ ${pm} µg/m³`,
        sheets: [
          { name: 'Hít vào – Thở ra', head: ['STT', 'Thông số / Tiêu chí', 'Pha Hít vào', 'Pha Thở ra', 'Trạng thái Bệnh lý / Ô nhiễm'], rows: [
            [1, 'Cơ hoành', 'Co, dẹt phẳng, hạ 1,5 – 3 cm', 'Dãn, vòm cong lên', sick ? 'Phổi giảm đàn hồi, thở ra khó' : 'Bình thường'],
            [2, 'Cơ liên sườn ngoài', 'Co, nâng sườn, ức nhô ra trước', 'Dãn, sườn hạ xuống', 'Không đổi'],
            [3, 'Thể tích lồng ngực', 'Tăng', 'Giảm', sick ? 'Biên độ giảm' : 'Bình thường'],
            [4, 'Áp suất phế nang so với khí quyển', 'Thấp hơn (≈ −1 mmHg)', 'Cao hơn (≈ +1 mmHg)', sick ? 'Sức cản đường thở tăng' : 'Bình thường'],
            [5, 'Khí đi qua', 'Vào, giàu O₂ (≈ 21% O₂)', 'Ra, giàu CO₂ (≈ 4% CO₂)', sick ? 'Thở khò khè' : 'Bình thường'],
            [6, 'Thể tích khí lưu thông TV (mL)', v.TV, v.TV, sick ? 'Thở nông hơn' : 'Bình thường'],
            [7, 'Lông rung phế quản', 'Đập 10 – 20 lần/giây', 'Đập 10 – 20 lần/giây', d > 0 ? `${Math.round(d * 95)}% tê liệt, rụng` : 'Khỏe'],
            [8, 'Diện tích trao đổi khí', '70 – 90 m²', '70 – 90 m²', d > 0 ? `Giảm ${Math.round(60 * d)}%` : 'Bình thường'],
            [9, 'Màu nhu mô phổi', 'Hồng tươi', 'Hồng tươi', d > 0.5 ? 'Đen xám' : d > 0 ? 'Xỉn màu' : 'Hồng tươi']] },
          { name: 'Dung tích sống', head: ['Chỉ số', 'Kí hiệu', 'Giá trị (mL)'], rows: [
            ['Thể tích khí lưu thông', 'TV', v.TV], ['Thể tích khí hít vào dự trữ', 'IRV', v.IRV], ['Thể tích khí thở ra dự trữ', 'ERV', v.ERV],
            ['Dung tích sống = TV + IRV + ERV', 'VC', v.VC], ['Thể tích khí cặn', 'RV', v.RV], ['Dung tích toàn phổi = VC + RV', 'TLC', v.TLC],
            ['Tham khảo: người tập thể thao', 'VC', '4000 – 5000'], ['Tham khảo: người ít vận động', 'VC', '2500 – 3000']] },
          { name: 'Phế dung kế', head: ['Thời gian (s)', 'Thể tích khí trong phổi (mL)'], rows: pts }
        ],
        chart: { type: 'line', series: [{ name: 'Thể tích khí trong phổi (mL)', color: '#2A8BD8', points: pts }], xLabel: 'Thời gian (s)', yLabel: 'mL', yMin: 0, xMax: 30,
          marks: [{ y: v.TLC, label: `TLC ${v.TLC}`, color: '#E5534B' }, { y: FRC + v.TV, label: 'Cuối hít vào thường', color: '#8FA4B8' }, { y: FRC, label: `FRC ${FRC}`, color: '#3FB37F' }, { y: v.RV, label: `RV ${v.RV}`, color: '#7A4FB5' }] }
      };
    },
    liveData: true
  });
  var food = null;
})();
