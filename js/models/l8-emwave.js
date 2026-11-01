// Mô hình Lí 8: sóng điện từ (E ⊥ B ⊥ phương truyền, thang sóng điện từ, λ = c/f, đi vào nước thì tần số giữ nguyên) và ăng-ten phát, thu (phân cực, cường độ giảm theo khoảng cách).
(function () {
  const vn = (v, d) => (+v).toFixed(d).replace('.', ',');
  const C = 3e8;
  const BANDS = [
    { t: 'Sóng vô tuyến', lo: 3, hi: 8.48, col: '#F59E0B', use: 'Phát thanh AM, FM, truyền hình', risk: 'An toàn ở mức thường gặp' },
    { t: 'Vi sóng', lo: 8.48, hi: 11.48, col: '#FB923C', use: 'Lò vi sóng, wifi, điện thoại di động, ra-đa', risk: 'Cường độ lớn làm nóng mô (lò vi sóng có vỏ chắn)' },
    { t: 'Tia hồng ngoại', lo: 11.48, hi: 14.6, col: '#EF4444', use: 'Điều khiển TV, camera nhiệt, sưởi ấm', risk: 'Tác dụng nhiệt' },
    { t: 'Ánh sáng nhìn thấy', lo: 14.6, hi: 14.9, col: '#22C55E', use: 'Mắt người nhìn thấy, quang hợp', risk: 'Quá chói có thể hại mắt' },
    { t: 'Tia tử ngoại', lo: 14.9, hi: 16.5, col: '#A855F7', use: 'Diệt khuẩn, tạo vitamin D', risk: 'Gây cháy nắng, hại mắt, có thể gây ung thư da' },
    { t: 'Tia X', lo: 16.5, hi: 19.5, col: '#38BDF8', use: 'Chụp X-quang, soi hành lý', risk: 'Ion hóa, phá hủy tế bào: phải hạn chế liều' },
    { t: 'Tia gamma', lo: 19.5, hi: 21, col: '#E86A92', use: 'Xạ trị ung thư, khử trùng dụng cụ y tế', risk: 'Ion hóa rất mạnh, rất nguy hiểm' }
  ];
  const band = lf => BANDS.find(b => lf < b.hi) || BANDS[BANDS.length - 1];
  function wl2hex(l) {
    if (l < 380) return 0xB57BFF; if (l > 750) return 0xFF6B6B;
    let r = 0, g = 0, b = 0;
    if (l < 440) { r = (440 - l) / 60; b = 1; } else if (l < 490) { g = (l - 440) / 50; b = 1; } else if (l < 510) { g = 1; b = (510 - l) / 20; } else if (l < 580) { r = (l - 510) / 70; g = 1; } else if (l < 645) { r = 1; g = (645 - l) / 65; } else r = 1;
    return (Math.round(255 * r) << 16) | (Math.round(255 * g) << 8) | Math.round(255 * b);
  }
  function fmtF(f) { const u = [[1e18, 'EHz'], [1e15, 'PHz'], [1e12, 'THz'], [1e9, 'GHz'], [1e6, 'MHz'], [1e3, 'kHz']]; for (const [k, n] of u) if (f >= k) return vn(f / k, f / k < 10 ? 2 : 0) + ' ' + n; return vn(f, 0) + ' Hz'; }
  function fmtL(l) { const u = [[1e3, 'km'], [1, 'm'], [1e-2, 'cm'], [1e-3, 'mm'], [1e-6, 'µm'], [1e-9, 'nm'], [1e-12, 'pm']]; for (const [k, n] of u) if (l >= k * 0.999) return vn(l / k, l / k < 10 ? 2 : 0) + ' ' + n; return vn(l / 1e-15, 2) + ' fm'; }
  let s = null;

  function wave(api) {
    const T = api.T, NP = 240, X0 = -8, X1 = 8, AE = 2, AB = 2;
    api.lineBetween([X0, 0, 0], [X1 + 0.6, 0, 0], 0.02, api.mat(0x94A3B8));
    const tip = api.mesh(new T.ConeGeometry(0.15, 0.4, 10), api.mat(0x94A3B8), [X1 + 0.8, 0, 0]); tip.rotation.z = -Math.PI / 2;
    api.label('Phương truyền sóng →', [3, -0.6, 0], { cls: 'plain' });
    const mkLine = col => { const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(new Float32Array(NP * 3), 3)); const l = new T.Line(g, new T.LineBasicMaterial({ color: col })); api.root.add(l); return l; };
    const mkSeg = col => { const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(new Float32Array(NP / 4 * 6), 3)); const l = new T.LineSegments(g, new T.LineBasicMaterial({ color: col, transparent: true, opacity: 0.55 })); api.root.add(l); return l; };
    const eL = mkLine(0xEF4444), bL = mkLine(0x3B82F6), eS = mkSeg(0xEF4444), bS = mkSeg(0x3B82F6);
    eL.userData.group = eS.userData.group = 'E'; bL.userData.group = bS.userData.group = 'B';
    const eLab = api.label('E (điện trường)', [0, 0, 0], { cls: 'tag', color: '#EF4444' }), bLab = api.label('B (từ trường)', [0, 0, 0], { cls: 'tag', color: '#3B82F6' });
    // vùng nước
    const water = api.box(8, 5, 5, api.mat(0x38BDF8, { opacity: 0.16, depthWrite: false }), [4, 0, 0]); water.visible = false;
    api.part(water, { name: 'Nước (chiết suất n ≈ 1,33)', rows: [['Tốc độ sóng', 'v = c/n, chậm hơn trong chân không'], ['Tần số', 'Giữ nguyên, do nguồn phát quyết định'], ['Bước sóng', 'λ = v/f nên ngắn lại']] });
    const wLab = api.label('Nước', [4, 2.8, 0], { cls: 'plain', color: '#38BDF8' }); wLab.show(false);
    const axisGlow = api.cyl(0.05, 0.05, X1 - X0, api.mat(0xFFFFFF, { emissive: 0xFFFFFF, emissiveIntensity: 0.9, opacity: 0.5 }), [0, 0, 0]); axisGlow.rotation.z = Math.PI / 2; axisGlow.userData.noPick = true;
    const info = api.note('');
    let t = 0;
    const lamVis = () => 7.5 - (s.lf - 3) * (6 / 18);
    const refresh = () => {
      const f = 10 ** s.lf, lam = C / f, b = band(s.lf), nm = lam * 1e9;
      axisGlow.visible = b.t === 'Ánh sáng nhìn thấy'; if (axisGlow.visible) axisGlow.material.color.set(wl2hex(nm)); axisGlow.material.emissive.set(wl2hex(nm));
      water.visible = s.water; wLab.show(s.water);
      info.set(`<b style="color:${b.col}">${b.t}</b><br>f = ${fmtF(f)} · λ = c/f = <b>${fmtL(lam)}</b>${s.water ? ` · trong nước λ' = λ/1,33 = <b>${fmtL(lam / 1.33)}</b>` : ''}<br>Ứng dụng: ${b.use}<br>Lưu ý: ${b.risk}`);
    };
    api.section('🌊 Sóng điện từ');
    const fs = api.slider({ label: 'lg f (tần số f = 10^lg f Hz)', min: 3, max: 21, step: 0.05, value: s.lf, onInput(v) { s.lf = v; refresh(); } });
    const pr = [['📻 FM 100 MHz', 8], ['📶 Wifi 2,4 GHz', 9.38], ['📺 Điều khiển TV', 14.5], ['🟢 Ánh sáng lục', 14.75], ['☀️ Tử ngoại', 15.2], ['🦴 Tia X', 18]];
    api.choices({ label: 'Chọn nhanh', items: pr.map(([t2, v]) => ({ t: t2, v })), value: -1, onPick(v) { fs.set(v); } });
    api.toggle({ label: '💧 Cho sóng đi vào nước', value: false, onChange(v) { s.water = v; refresh(); } });
    api.checklist([{ k: 'E', label: 'Điện trường E' }, { k: 'B', label: 'Từ trường B' }]);
    api.note('❓ Khi sóng đi từ chân không vào nước, đại lượng nào <b>giữ nguyên</b>?');
    const qa = api.note('<span style="opacity:.6">Chọn một đáp án bên dưới.</span>');
    api.choices({ label: '', items: [{ t: 'Tốc độ', v: 'v' }, { t: 'Bước sóng', v: 'l' }, { t: 'Tần số', v: 'f' }], value: -1, onPick(v) {
      if (v === 'f') { qa.set('✅ Đúng. Tần số do nguồn phát quyết định. Vào nước, tốc độ giảm nên bước sóng ngắn lại.'); api.beep(880, 0.12, 'sine', 0.1); }
      else { qa.set('❌ Chưa đúng.'); api.warn(null, 'Bật "Cho sóng đi vào nước" và quan sát: trong nước các đỉnh sóng <b>dồn sát lại</b> (bước sóng ngắn đi) và sóng đi chậm hơn. Nhưng số dao động mỗi giây ở hai bên không đổi: <b>tần số giữ nguyên</b>.<br>Công thức: v = c/n, λ = v/f.', '🤔 Xem lại'); }
    } });

    api.strip({ h: innerHeight < 500 ? 62 : 90, draw(x, w, h) {
      x.clearRect(0, 0, w, h); x.fillStyle = '#0B1220'; x.fillRect(0, 0, w, h);
      const X = lf => 10 + (w - 20) * (lf - 3) / 18;
      BANDS.forEach(b => { x.fillStyle = b.col; x.globalAlpha = 0.35; x.fillRect(X(b.lo), 8, X(b.hi) - X(b.lo), h - 36); x.globalAlpha = 1; });
      for (let lf = 14.6; lf < 14.9; lf += 0.01) { const c = wl2hex(C / 10 ** lf * 1e9); x.fillStyle = '#' + c.toString(16).padStart(6, '0'); x.fillRect(X(lf), 8, X(lf + 0.01) - X(lf) + 1, h - 36); }
      x.font = `700 ${Math.max(10, Math.round(h / 8))}px 'Baloo 2', sans-serif`; x.fillStyle = '#E2E8F0';
      BANDS.forEach(b => { const tw = x.measureText(b.t).width, mx = (X(b.lo) + X(b.hi)) / 2; if (X(b.hi) - X(b.lo) > tw + 4) x.fillText(b.t, mx - tw / 2, h / 2 - 2); });
      x.fillStyle = '#94A3B8'; [['λ dài', 10], ['λ ngắn', w - 60]].forEach(([str, px]) => x.fillText(str, px, h - 8));
      x.fillText('f thấp → f cao, năng lượng photon tăng', w / 2 - 120, h - 8);
      x.fillStyle = '#FFFFFF'; x.fillRect(X(s.lf) - 2, 2, 4, h - 26);
    } });

    api.onFrame(dt => {
      t += Math.min(dt, 0.05);
      const lv = lamVis(), k0 = 2 * Math.PI / lv, w = 2 * Math.PI * 0.5, pe = eL.geometry.attributes.position.array, pb = bL.geometry.attributes.position.array, se = eS.geometry.attributes.position.array, sb = bS.geometry.attributes.position.array;
      let phase = 0, prevX = X0;
      for (let i = 0; i < NP; i++) {
        const xx = X0 + (X1 - X0) * i / (NP - 1), kk = s.water && xx > 0 ? k0 * 1.33 : k0;
        phase += kk * (xx - prevX); prevX = xx;
        const v = Math.sin(phase - w * t);
        pe.set([xx, AE * v, 0], i * 3); pb.set([xx, 0, AB * v], i * 3);
        if (i % 4 === 0) { const j = i / 4; se.set([xx, 0, 0, xx, AE * v, 0], j * 6); sb.set([xx, 0, 0, xx, 0, AB * v], j * 6); }
      }
      [eL, bL, eS, bS].forEach(l => { l.geometry.attributes.position.needsUpdate = true; });
      eLab.pos.set(-6.5, AE + 0.5, 0); bLab.pos.set(-6.5, -0.3, AB + 0.6);
    });
    refresh();
    api.view({ pos: [-4, 5, 13], target: [0, 0, 0], min: 4, max: 35 });
  }

  // ---------- ăng-ten phát và thu ----------
  function antenna(api) {
    const T = api.T;
    api.box(24, 0.1, 14, api.mat(0x1E293B, { roughness: 1 }), [0, -2.6, 0]).userData.noPick = true;
    const tx = api.group(null, [-5, 0, 0]);
    const rod = api.cyl(0.08, 0.08, 4, api.mat(0xCBD5E1, { metalness: 0.8 }), [0, 0, 0], tx);
    api.box(1, 0.6, 1, api.mat(0x334155), [0, -2.3, 0], tx);
    const qTop = api.sphere(0.22, api.mat(0xEF4444, { emissive: 0xEF4444, emissiveIntensity: 0.6 }), [0, 1.9, 0], tx), qBot = api.sphere(0.22, api.mat(0x3B82F6, { emissive: 0x3B82F6, emissiveIntensity: 0.6 }), [0, -1.9, 0], tx);
    api.part(rod, { name: 'Ăng-ten phát (thẳng đứng)', rows: [['Hoạt động', 'Điện tích chạy lên xuống dọc thanh, dao động với tần số cao'], ['Phát ra', 'Sóng điện từ có điện trường E dao động theo phương thẳng đứng']] });
    const rings = [];
    const cg = new T.BufferGeometry().setFromPoints(Array.from({ length: 96 }, (_, i) => new T.Vector3(Math.cos(i / 96 * 2 * Math.PI), Math.sin(i / 96 * 2 * Math.PI), 0)));
    for (let k = 0; k < 7; k++) { const m = new T.LineLoop(cg, new T.LineBasicMaterial({ color: 0xFDE047, transparent: true, opacity: 0.6 })); tx.add(m); m.rotation.x = Math.PI / 2; m.userData.noPick = true; m.userData.ph = k / 7; rings.push(m); }
    const rx = api.group(null, [0, 0, 0]);
    const rrod = api.cyl(0.07, 0.07, 3, api.mat(0xCBD5E1, { metalness: 0.8 }), [0, 0, 0], rx);
    api.part(rrod, { name: 'Ăng-ten thu', rows: [['Hoạt động', 'Điện trường của sóng làm electron trong thanh dao động, sinh ra dòng điện'], ['Thu tốt nhất', 'Khi thanh song song với điện trường E của sóng']] });
    const ledM = api.mat(0x14532D, { emissive: 0x22C55E, emissiveIntensity: 0 });
    const led = api.sphere(0.3, ledM, [0, -2.2, 0]); const ledLight = new T.PointLight(0x22C55E, 0, 6); led.add(ledLight);
    api.part(led, { name: 'Đèn LED báo tín hiệu', rows: [['Độ sáng', 'Theo cường độ tín hiệu thu được']] });
    const info = api.note('');
    let t = 0, sig = 0;
    api.section('📡 Ăng-ten phát và thu');
    api.slider({ label: 'Khoảng cách tới ăng-ten phát', min: 2, max: 12, step: 0.5, value: s.dist, unit: 'm', onInput(v) { s.dist = v; } });
    api.slider({ label: 'Góc nghiêng ăng-ten thu', min: 0, max: 90, step: 5, value: s.tilt, unit: '°', onInput(v) {
      s.tilt = v; if (v >= 85) api.warn('perp', 'Ăng-ten thu nằm ngang, <b>vuông góc</b> với điện trường E của sóng (E dao động thẳng đứng vì ăng-ten phát thẳng đứng). Điện trường không đẩy được electron chạy dọc thanh nên gần như không thu được tín hiệu.<br>Đó là lí do ăng-ten thu phải đặt <b>cùng phương</b> với ăng-ten phát.', '📵 Mất sóng');
    } });
    api.note('Sóng điện từ mang năng lượng. Càng xa nguồn, năng lượng trải ra trên mặt cầu lớn hơn nên cường độ giảm, tỉ lệ với 1/r².');
    api.onFrame(dt => {
      t += Math.min(dt, 0.05);
      const v = Math.sin(2 * Math.PI * 1.2 * t);
      qTop.scale.setScalar(0.6 + 0.6 * Math.max(0, v)); qBot.scale.setScalar(0.6 + 0.6 * Math.max(0, -v));
      qTop.material.color.set(v >= 0 ? 0xEF4444 : 0x3B82F6); qBot.material.color.set(v >= 0 ? 0x3B82F6 : 0xEF4444);
      rings.forEach(r => { const p = (r.userData.ph + t * 0.25) % 1, R = 0.5 + p * 13; r.scale.set(R, R, 1); r.material.opacity = 0.6 * (1 - p); });
      rx.position.set(-5 + s.dist, 0, 0); rx.rotation.z = s.tilt * Math.PI / 180; led.position.set(-5 + s.dist, -2.2, 0);
      const target = (Math.cos(s.tilt * Math.PI / 180) ** 2) * Math.min(1, (3 / s.dist) ** 2);
      sig += (target - sig) * Math.min(1, dt * 5);
      const flick = 0.85 + 0.15 * Math.abs(v);
      ledM.emissiveIntensity = sig * 2.2 * flick; ledLight.intensity = sig * 4 * flick;
      info.set(`Cường độ tín hiệu: <b>${vn(sig * 100, 0)}%</b><br>Theo khoảng cách: (3/${vn(s.dist, 1)})² · theo góc: cos²${s.tilt}° = ${vn(Math.cos(s.tilt * Math.PI / 180) ** 2, 2)}`);
    });
    api.view({ pos: [0, 5, 14], target: [-1, 0, 0], min: 4, max: 35 });
  }

  NL.m3d.register('LM8', {
    title: 'Sóng điện từ',
    tabs: [{ t: '🌊 Sóng điện từ', v: 'wave' }, { t: '📡 Ăng-ten phát, thu', v: 'ant' }],
    init() { s = { lf: 8, water: false, dist: 4, tilt: 0 }; },
    build(api, tab) { if (tab === 'wave') wave(api); else antenna(api); },
    data() {
      return {
        title: 'Thang sóng điện từ', sub: 'Mọi sóng điện từ truyền trong chân không với cùng tốc độ c = 3·10⁸ m/s. λ = c/f: tần số càng cao thì bước sóng càng ngắn.',
        sheets: [{ name: 'Thang sóng', head: ['Loại sóng', 'Tần số từ', 'Đến', 'Bước sóng từ', 'Đến', 'Ứng dụng'], rows: BANDS.map(b => [b.t, fmtF(10 ** b.lo), fmtF(10 ** b.hi), fmtL(C / 10 ** b.lo), fmtL(C / 10 ** b.hi), b.use]) }],
        chart: { type: 'line', xLabel: 'lg f', yLabel: 'lg λ', xMin: 3, xMax: 21, yMin: -13, yMax: 6, series: [{ name: 'λ = c/f', color: '#38BDF8', dots: true, points: [3, 6, 9, 12, 15, 18, 21].map(lf => [lf, +Math.log10(C / 10 ** lf).toFixed(2)]) }] }
      };
    }
  });
})();
