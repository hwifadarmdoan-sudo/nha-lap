// Mô hình Lí 9: ba loại tia phóng xạ α, β, γ (lệch trong điện trường, khả năng đâm xuyên qua giấy, nhôm, chì) và chu kì bán rã (400 hạt nhân phân rã ngẫu nhiên, N = N₀·2^(−t/T)).
(function () {
  const vn = (v, d) => (+v).toFixed(d).replace('.', ',');
  const TYPES = {
    a: { t: 'Tia α (alpha)', col: 0xEF4444, r: 0.17, v: 3.2, ay: -1.6, stop: 1, what: 'Hạt nhân helium ⁴₂He, mang điện +2e' },
    b: { t: 'Tia β⁻ (beta)', col: 0x38BDF8, r: 0.09, v: 6, ay: 9, stop: 2, what: 'Electron, mang điện −e, rất nhẹ' },
    g: { t: 'Tia γ (gamma)', col: 0xFDE047, r: 0.08, v: 8, ay: 0, stop: 9, what: 'Sóng điện từ năng lượng rất cao (photon), không mang điện' }
  };
  const SHIELD = [{ t: 'Không chắn', v: 0 }, { t: '📄 Tờ giấy', v: 1 }, { t: '🥫 Nhôm 5 mm', v: 2 }, { t: '🧱 Chì 5 cm', v: 3 }];
  let s = null;

  function rays(api) {
    const T = api.T, XB = 4.4, XD = 7.6;
    const src = api.group(null, [-6.5, 0, 0]);
    api.box(1.4, 1.4, 1.4, api.mat(0x64748B, { metalness: 0.7 }), [0, 0, 0], src);
    api.sphere(0.3, api.mat(0x84CC16, { emissive: 0x84CC16, emissiveIntensity: 0.9 }), [0.55, 0, 0], src);
    api.part(src, { name: 'Nguồn phóng xạ trong hộp chì', rows: [['Hộp chì', 'Chặn tia phóng xạ, chỉ cho chùm tia đi ra qua một khe hẹp'], ['Phát ra', 'Tia α, β, γ']] });
    const pm = api.mat(0xCBD5E1, { metalness: 0.7, opacity: 0.85 });
    const pTop = api.box(4.2, 0.12, 2, pm, [-1.5, 1.8, 0]), pBot = api.box(4.2, 0.12, 2, pm, [-1.5, -1.8, 0]);
    const lp = api.label('+ + + +', [-1.5, 2.25, 0], { cls: 'plain', color: '#EF4444' }), ln = api.label('− − − −', [-1.5, -2.25, 0], { cls: 'plain', color: '#38BDF8' });
    api.part(pTop, { name: 'Bản tụ điện tích dương', rows: [['Điện trường', 'Hướng từ bản dương xuống bản âm'], ['Hút', 'Hạt mang điện âm (β⁻)']] });
    api.part(pBot, { name: 'Bản tụ điện tích âm', rows: [['Hút', 'Hạt mang điện dương (α)']] });
    const shield = api.box(0.25, 4.6, 3, api.mat(0xF8FAFC), [XB, 0, 0]);
    const shLab = api.label('', [XB, 2.7, 0], { cls: 'tag', color: '#94A3B8' });
    const det = api.group(null, [XD, 0, 0]);
    api.cyl(0.9, 0.9, 1.4, api.mat(0x334155, { metalness: 0.6 }), [0, 0, 0], det).rotation.z = Math.PI / 2;
    api.part(det, { name: 'Máy đếm Geiger', rows: [['Vai trò', 'Đếm số hạt phóng xạ bay tới mỗi giây']] });
    const detL = api.label('', [XD, 1.6, 0], { cls: 'tag', color: '#22C55E' });
    // hạt
    const pool = [], geo = new T.SphereGeometry(1, 10, 8);
    Object.keys(TYPES).forEach(k => { const m = api.mat(TYPES[k].col, { emissive: TYPES[k].col, emissiveIntensity: 0.9 }); for (let i = 0; i < 40; i++) { const o = api.mesh(geo, m); o.scale.setScalar(TYPES[k].r); if (k === 'g') o.scale.set(0.24, 0.06, 0.06); o.visible = false; o.userData = { k, on: false, noPick: true }; pool.push(o); } });
    const counts = { a: 0, b: 0, g: 0 }; let cWin = { a: [], b: [], g: [] };
    let acc = 0, t = 0;
    const setShield = v => {
      s.sh = v; shield.visible = v > 0;
      shield.material.color.set([0, 0xF8FAFC, 0xCBD5E1, 0x52525B][v]); shield.scale.x = [1, 0.3, 1, 3][v];
      shLab.set(SHIELD[v].t.replace(/^\S+ /, '')); shLab.show(v > 0);
    };
    api.section('☢️ Ba loại tia phóng xạ');
    api.checklist([{ k: 'a', label: 'Tia α' }, { k: 'b', label: 'Tia β⁻' }, { k: 'g', label: 'Tia γ' }], (k, on) => { s.emit[k] = on; });
    api.toggle({ label: '⚡ Bật điện trường giữa hai bản', value: s.field, onChange(v) { s.field = v; lp.show(v); ln.show(v); } });
    api.choices({ label: 'Tấm chắn', items: SHIELD, value: s.sh, onPick: setShield });
    api.note('❓ Bật điện trường. Tia nào bị lệch <b>nhiều nhất</b>?');
    const qa = api.note('<span style="opacity:.6">Chọn một đáp án bên dưới.</span>');
    api.choices({ label: '', items: [{ t: 'α', v: 'a' }, { t: 'β⁻', v: 'b' }, { t: 'γ', v: 'g' }], value: -1, onPick(v) {
      if (v === 'b') { qa.set('✅ Đúng. Electron nhẹ hơn hạt α khoảng 7300 lần nên dù điện tích nhỏ hơn vẫn bị lệch mạnh hơn nhiều, và lệch về phía bản dương.'); api.beep(880, 0.12, 'sine', 0.1); }
      else if (v === 'g') { qa.set('❌ Chưa đúng.'); api.warn(null, 'Tia γ là sóng điện từ, <b>không mang điện</b> nên đi thẳng, không lệch trong điện trường.<br>Nhìn lại: tia α (đỏ) lệch nhẹ về bản âm, tia β⁻ (xanh) lệch mạnh về bản dương.', '🤔 Xem lại'); }
      else { qa.set('❌ Chưa đúng.'); api.warn(null, 'Hạt α mang điện +2e, lớn gấp đôi electron, nhưng lại <b>nặng</b> gấp khoảng 7300 lần electron. Lực điện như nhau thì vật càng nặng càng khó đổi hướng, nên α chỉ lệch nhẹ.<br>Tia β⁻ (electron) rất nhẹ nên lệch mạnh nhất.', '🤔 Xem lại'); }
    } });
    api.note('Thử chắn lần lượt: tờ giấy chặn được tia α; nhôm vài milimét chặn tia β; tia γ đi xuyên qua cả nhôm, phải dùng chì dày hoặc bê tông mới giảm mạnh được.');
    const info = api.note('');
    setShield(s.sh); lp.show(s.field); ln.show(s.field);
    api.onFrame(dt => {
      dt = Math.min(dt, 0.05); t += dt; acc += dt;
      while (acc > 0.07) {
        acc -= 0.07;
        Object.keys(TYPES).forEach(k => { if (!s.emit[k] || Math.random() > 0.7) return; const o = pool.find(p => p.userData.k === k && !p.userData.on); if (!o) return; o.userData.on = true; o.visible = true; o.position.set(-5.7, (Math.random() - 0.5) * 0.12, (Math.random() - 0.5) * 0.3); o.userData.vy = 0; o.userData.ph = Math.random() * 6; });
      }
      pool.forEach(o => {
        if (!o.userData.on) return; const ty = TYPES[o.userData.k];
        const x0 = o.position.x; o.position.x += ty.v * dt;
        if (s.field && o.position.x > -3.6 && o.position.x < 0.6) o.userData.vy += ty.ay * dt;
        o.position.y += o.userData.vy * dt;
        if (o.userData.k === 'g') { o.rotation.z = Math.atan2(o.userData.vy, ty.v); }
        if (Math.abs(o.position.y) > 1.75 && o.position.x > -3.6 && o.position.x < 0.6) { o.userData.on = false; o.visible = false; return; }
        if (s.sh && x0 < XB - 0.1 && o.position.x >= XB - 0.1) { const stopped = ty.stop <= s.sh || (o.userData.k === 'g' && s.sh === 3 && Math.random() < 0.85); if (stopped) { o.userData.on = false; o.visible = false; return; } }
        if (o.position.x >= XD - 0.7) { o.userData.on = false; o.visible = false; if (Math.abs(o.position.y) < 0.9) cWin[o.userData.k].push(t); }
      });
      Object.keys(cWin).forEach(k => { cWin[k] = cWin[k].filter(x => t - x < 2); counts[k] = Math.round(cWin[k].length / 2); });
      const tot = counts.a + counts.b + counts.g;
      detL.set(`${tot} hạt/giây`);
      info.set(`Máy đếm nhận được: α ${counts.a}, β⁻ ${counts.b}, γ ${counts.g} hạt/giây${s.field ? '<br><span style="opacity:.75">Khi bật điện trường, tia α và β bị lệch khỏi khe máy đếm.</span>' : ''}`);
    });
    api.view({ pos: [1.8, 4, 15], target: [1.8, 0, 0], min: 4, max: 30 });
  }

  // ---------- chu kì bán rã ----------
  const ISO = { i131: { t: 'iodine-131', T: 8, u: 'ngày', use: 'Chẩn đoán và điều trị bệnh tuyến giáp' }, c14: { t: 'Carbon-14', T: 5730, u: 'năm', use: 'Xác định tuổi cổ vật, hóa thạch' }, rn222: { t: 'Radon-222', T: 3.8, u: 'ngày', use: 'Khí phóng xạ tự nhiên trong đất đá' } };
  function halfLife(api) {
    const T = api.T, NG = 20, N0 = NG * NG;
    const im = new T.InstancedMesh(new T.SphereGeometry(0.2, 12, 8), api.mat(0xFFFFFF, { emissive: 0xFFFFFF, emissiveIntensity: 0.25 }), N0), m4 = new T.Matrix4();
    const cAlive = new T.Color(0x22C55E), cDead = new T.Color(0x475569), cFlash = new T.Color(0xFDE047);
    let alive, flash, tSim, hist;
    const reset = () => {
      alive = new Array(N0).fill(true); flash = new Array(N0).fill(0); tSim = 0; hist = [[0, N0]];
      for (let i = 0; i < N0; i++) { m4.makeTranslation((i % NG - (NG - 1) / 2) * 0.5, Math.floor(i / NG) * 0.5 - (NG - 1) / 4 + 0.2, 0); im.setMatrixAt(i, m4); im.setColorAt(i, cAlive); }
      im.instanceMatrix.needsUpdate = true; im.instanceColor.needsUpdate = true;
    };
    im.userData.noPick = true; api.root.add(im);
    const hit = api.box(10.2, 10.2, 0.4, api.mat(0x0F172A, { opacity: 0.01, depthWrite: false }), [0, 0.2, -0.3]);
    api.part(hit, { name: `400 hạt nhân ${ISO[s.iso].t}`, rows: [['Xanh', 'Chưa phân rã'], ['Xám', 'Đã phân rã thành hạt nhân khác'], ['Ngẫu nhiên', 'Không biết trước hạt nào sẽ phân rã lúc nào, chỉ biết sau mỗi chu kì bán rã còn lại khoảng một nửa']] });
    const cnt = api.label('', [0, 5.6, 0], { cls: 'tag', color: '#22C55E' });
    const info = api.note('');
    reset();
    api.section('⏳ Chu kì bán rã');
    api.choices({ label: 'Chất phóng xạ', items: Object.keys(ISO).map(k => ({ t: ISO[k].t, v: k })), value: s.iso, onPick(v) { s.iso = v; reset(); } });
    api.slider({ label: 'Tốc độ thời gian', min: 0, max: 3, step: 0.5, value: s.speed, unit: '× ', onInput(v) { s.speed = v; } });
    api.button('🔄 Làm lại với 400 hạt mới', reset);
    api.note('❓ Sau <b>2 chu kì bán rã</b>, còn lại bao nhiêu hạt nhân chưa phân rã?');
    const qa = api.note('<span style="opacity:.6">Chọn một đáp án bên dưới.</span>');
    api.choices({ label: '', items: [{ t: 'Hết sạch', v: 0 }, { t: '1/4', v: 4 }, { t: '1/2', v: 2 }], value: -1, onPick(v) {
      if (v === 4) { qa.set('✅ Đúng. Mỗi chu kì còn một nửa: 1/2 rồi 1/2 của 1/2 = 1/4, tức khoảng 100 trên 400 hạt.'); api.beep(880, 0.12, 'sine', 0.1); }
      else { qa.set('❌ Chưa đúng.'); api.warn(null, v === 0 ? 'Hiểu lầm hay gặp: "một nửa mất đi sau T, nửa còn lại mất đi sau T nữa nên hết". Thật ra sau mỗi chu kì, <b>số hạt còn lại</b> giảm một nửa: 400 → 200 → 100 → 50... Không bao giờ hết hẳn trong một số chu kì hữu hạn.<br>Cho chạy và xem bộ đếm khi t = 2T.' : 'Sau 1 chu kì mới còn 1/2. Sau 2 chu kì còn 1/2 × 1/2 = <b>1/4</b>.', '🤔 Xem lại'); }
    } });
    api.strip({ h: innerHeight < 500 ? 62 : 100, draw(x, w, h) {
      x.clearRect(0, 0, w, h); x.fillStyle = '#0B1220'; x.fillRect(0, 0, w, h);
      const L0 = 40, X = tt => L0 + (w - L0 - 12) * tt / 5, Y = n => h - 18 - (h - 30) * n / N0;
      x.strokeStyle = '#334155'; x.lineWidth = 1; for (let k = 0; k <= 5; k++) { x.beginPath(); x.moveTo(X(k), 8); x.lineTo(X(k), h - 18); x.stroke(); }
      x.font = `700 ${Math.round(h / 8)}px 'Baloo 2', sans-serif`; x.fillStyle = '#94A3B8';
      for (let k = 0; k <= 5; k++) x.fillText(k ? k + 'T' : '0', X(k) - 6, h - 4);
      x.fillText('N', 10, 18);
      x.strokeStyle = '#A855F7'; x.setLineDash([5, 4]); x.lineWidth = 2; x.beginPath(); for (let k = 0; k <= 100; k++) { const tt = k / 20, px = X(tt), py = Y(N0 * 2 ** -tt); k ? x.lineTo(px, py) : x.moveTo(px, py); } x.stroke(); x.setLineDash([]);
      x.strokeStyle = '#22C55E'; x.beginPath(); hist.forEach((p, i) => { const px = X(p[0]), py = Y(p[1]); i ? x.lineTo(px, py) : x.moveTo(px, py); }); x.stroke();
      const l1 = 'mô phỏng', l2 = 'lí thuyết N₀·2^(−t/T)', w2 = x.measureText(l2).width, w1 = x.measureText(l1).width; x.fillStyle = '#A855F7'; x.fillText(l2, w - w2 - 14, 18); x.fillStyle = '#22C55E'; x.fillText(l1, w - w2 - w1 - 30, 18);
    } });
    api.onFrame(dt => {
      dt = Math.min(dt, 0.05);
      const step = dt * s.speed * 0.25; // đơn vị: chu kì bán rã
      let n = 0;
      if (step > 0 && tSim < 5) {
        tSim += step; const p = 1 - 2 ** -step;
        for (let i = 0; i < N0; i++) if (alive[i] && Math.random() < p) { alive[i] = false; flash[i] = 0.5; }
        if (hist.length === 0 || tSim - hist[hist.length - 1][0] > 0.02) hist.push([tSim, alive.filter(Boolean).length]);
      }
      for (let i = 0; i < N0; i++) { if (alive[i]) n++; if (flash[i] > 0) { flash[i] -= dt; im.setColorAt(i, flash[i] > 0 ? cFlash : cDead); } }
      im.instanceColor.needsUpdate = true;
      const iso = ISO[s.iso], tReal = tSim * iso.T;
      cnt.set(`Còn ${n}/${N0} hạt · t = ${vn(tSim, 2)}T`);
      info.set(`${iso.t}: chu kì bán rã T = <b>${vn(iso.T, iso.T < 10 ? 1 : 0).replace(/(\d)(?=(\d{3})+$)/g, '$1 ')} ${iso.u}</b><br>Thời gian đã trôi: ${vn(tReal, tReal < 100 ? 1 : 0)} ${iso.u}<br>Lí thuyết: N = 400 × 2^(−${vn(tSim, 2)}) ≈ <b>${Math.round(N0 * 2 ** -tSim)}</b> · mô phỏng: <b>${n}</b><br>Ứng dụng: ${iso.use}`);
    });
    api.view({ pos: [0, 0.5, 15], target: [0, 0.4, 0], min: 5, max: 30 });
  }

  NL.m3d.register('LM9', {
    title: 'Phóng xạ',
    tabs: [{ t: '☢️ Tia α, β, γ', v: 'rays' }, { t: '⏳ Chu kì bán rã', v: 'half' }],
    init() { s = { emit: { a: true, b: true, g: true }, field: false, sh: 0, iso: 'i131', speed: 1 }; },
    build(api, tab) { if (tab === 'rays') rays(api); else halfLife(api); },
    data() {
      const iso = ISO[s.iso], ks = [0, 1, 2, 3, 4, 5];
      return {
        title: 'Định luật phóng xạ', sub: `N = N₀·2^(−t/T). Chất đang chọn: ${iso.t}, T = ${iso.T} ${iso.u}.`,
        sheets: [
          { name: 'Số hạt còn lại', head: ['t', `t (${iso.u})`, 'N/N₀', 'Còn lại trên 400 hạt'], rows: ks.map(k => [k ? k + 'T' : '0', vn(k * iso.T, 1), k ? '1/' + 2 ** k : '1', Math.round(400 / 2 ** k)]) },
          { name: 'Ba loại tia', head: ['Tia', 'Bản chất', 'Lệch trong điện trường', 'Bị chặn bởi'], rows: [['α', TYPES.a.what, 'Lệch nhẹ về bản âm', 'Tờ giấy, vài cm không khí'], ['β⁻', TYPES.b.what, 'Lệch mạnh về bản dương', 'Nhôm vài mm'], ['γ', TYPES.g.what, 'Không lệch', 'Chì dày, bê tông (chỉ giảm bớt)']] }
        ],
        chart: { type: 'line', xLabel: 't (số chu kì bán rã)', yLabel: 'Số hạt còn lại', xMin: 0, xMax: 5, yMin: 0, yMax: 400, series: [{ name: 'N = 400·2^(−t/T)', color: '#A855F7', dots: true, points: ks.map(k => [k, Math.round(400 / 2 ** k)]) }] }
      };
    }
  });
})();
