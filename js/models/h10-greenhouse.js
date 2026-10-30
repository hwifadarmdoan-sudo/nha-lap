// Mô hình Hóa 10: Hiệu ứng nhà kính. Photon Mặt Trời (vàng) đi xuyên khí quyển; photon hồng ngoại từ mặt đất (đỏ) bị CO₂, CH₄, H₂O, N₂O hấp thụ rồi phát lại theo mọi hướng; N₂, O₂ không hấp thụ.
// ΔF = 5,35·ln(C/280) + 0,036·(√M − √720) + 0,12·(√N − √270) (W/m², Myhre 1998, bỏ qua phần chồng phổ); T = 14 + 0,8·ΔF (°C).
(function () {
  const C3 = () => NL.chem3d;
  const GAS = {
    CO2: { f: 'CO₂', gh: true, gwp: '1', life: 'Hàng trăm đến hàng nghìn năm (một phần)', src: 'Đốt than, dầu, khí; phá rừng', why: 'Khi dao động uốn cong hoặc co giãn lệch, moment lưỡng cực thay đổi → hấp thụ hồng ngoại' },
    CH4: { f: 'CH₄', gh: true, gwp: '≈ 27 – 30', life: '≈ 12 năm', src: 'Ruộng lúa ngập nước, chăn nuôi gia súc, bãi rác, rò rỉ khí đốt', why: 'Dao động của các liên kết C–H làm moment lưỡng cực thay đổi → hấp thụ hồng ngoại' },
    H2O: { f: 'H₂O', gh: true, gwp: '– (phản hồi, không tính)', life: 'Khoảng 9 ngày', src: 'Bay hơi từ biển, hồ; Trái Đất càng nóng hơi nước càng nhiều', why: 'Phân tử phân cực, dao động làm moment lưỡng cực thay đổi → hấp thụ mạnh' },
    N2O: { f: 'N₂O', gh: true, gwp: '≈ 273', life: '≈ 110 năm', src: 'Phân bón chứa nitrogen, đốt nhiên liệu', why: 'Phân tử thẳng không đối xứng, dao động làm moment lưỡng cực thay đổi' },
    N2: { f: 'N₂', gh: false, gwp: '0', life: 'Bền', src: '78% khí quyển', why: 'Hai nguyên tử giống hệt nhau: dao động co giãn không tạo moment lưỡng cực → không hấp thụ hồng ngoại' },
    O2: { f: 'O₂', gh: false, gwp: '0', life: 'Bền', src: '21% khí quyển', why: 'Hai nguyên tử giống hệt nhau: không có moment lưỡng cực khi dao động → không hấp thụ hồng ngoại' }
  };
  const SKY = [[14, '#e0f2fe'], [16.5, '#fef08a'], [20, '#f97316'], [24, '#ef4444'], [28, '#991b1b']];
  let co2 = 280, ch4 = 720, n2o = 270, mode = 'both', labels = true, speed = 1, stat = { abs: 0, esc: 0, down: 0 };
  const dF = () => 5.35 * Math.log(co2 / 280) + 0.036 * (Math.sqrt(ch4) - Math.sqrt(720)) + 0.12 * (Math.sqrt(n2o) - Math.sqrt(270));
  const temp = () => 14 + 0.8 * dF();
  const tAt = (c) => 14 + 0.8 * (5.35 * Math.log(c / 280) + 0.036 * (Math.sqrt(ch4) - Math.sqrt(720)) + 0.12 * (Math.sqrt(n2o) - Math.sqrt(270)));
  const fmt = (v, d) => C3().fmtVN(v, d == null ? 1 : d);
  function skyColor(T, t) { let k = 0; while (k < SKY.length - 1 && t > SKY[k + 1][0]) k++; if (k >= SKY.length - 1) return new T.Color(SKY[SKY.length - 1][1]); const [a, ca] = SKY[k], [b, cb] = SKY[k + 1]; return new T.Color(ca).lerp(new T.Color(cb), Math.max(0, Math.min(1, (t - a) / (b - a)))); }

  function molecule(api, key, parent) {
    const T = api.T, V = api.V, g = api.group(parent), at = (el, p, sc) => C3().atom(api, el, p, g, { scale: sc || 0.8, seg: 14 });
    const bond = (a, b, o) => C3().bond(api, a, b, o, g, { r: 0.06 });
    if (key === 'CO2') { at('C', V(0, 0, 0)); at('O', V(-0.9, 0, 0)); at('O', V(0.9, 0, 0)); bond(V(0, 0, 0), V(-0.9, 0, 0), 2); bond(V(0, 0, 0), V(0.9, 0, 0), 2); }
    else if (key === 'N2O') { at('N', V(-0.9, 0, 0)); at('N', V(0, 0, 0)); at('O', V(0.9, 0, 0)); bond(V(-0.9, 0, 0), V(0, 0, 0), 2); bond(V(0, 0, 0), V(0.9, 0, 0), 2); }
    else if (key === 'H2O') { const a = V(0.62, -0.5, 0), b = V(-0.62, -0.5, 0); at('O', V(0, 0, 0)); at('H', a); at('H', b); bond(V(0, 0, 0), a, 1); bond(V(0, 0, 0), b, 1); }
    else if (key === 'CH4') { at('C', V(0, 0, 0)); C3().tetraFill(T, [], 4).forEach(d => { const p = d.multiplyScalar(0.8); at('H', p); bond(V(0, 0, 0), p, 1); }); }
    else { const el = key === 'N2' ? 'N' : 'O'; at(el, V(-0.45, 0, 0)); at(el, V(0.45, 0, 0)); bond(V(-0.45, 0, 0), V(0.45, 0, 0), key === 'N2' ? 3 : 2); }
    const G = GAS[key];
    api.part(g, { name: `Phân tử ${G.f}`, sci: G.gh ? 'Khí nhà kính' : 'Không phải khí nhà kính', rows: [['Hấp thụ hồng ngoại?', G.gh ? '<b>Có</b>' : '<b>Không</b>'], ['Vì sao', G.why], ['GWP (100 năm, so với CO₂)', G.gwp], ['Tồn tại trong khí quyển', G.life], ['Nguồn', G.src]], focus: false, onSelect() { if (!G.gh) api.warn('dip', 'N₂ và O₂ chiếm 99% khí quyển nhưng <b>không</b> hấp thụ bức xạ hồng ngoại: phân tử chỉ hấp thụ được khi dao động làm <b>moment lưỡng cực điện thay đổi</b> (∂μ/∂q ≠ 0). Phân tử 2 nguyên tử giống nhau luôn có μ = 0.', '🌍 Thông điệp khoa học'); } });
    return g;
  }

  function build(api) {
    const T = api.T, V = api.V, R = api.rand(21);
    stat = { abs: 0, esc: 0, down: 0 };
    const earth = api.sphere(40, api.mat(0x2F9E6E, { roughness: 0.85 }), [0, -40, 0], null, 96);
    api.part(earth, { name: 'Bề mặt Trái Đất', rows: [['Nhận', 'Ánh sáng Mặt Trời (chủ yếu khả kiến, sóng ngắn) làm mặt đất nóng lên'], ['Phát ra', 'Bức xạ nhiệt hồng ngoại (sóng dài) đi ngược lên trời'], ['Nhiệt độ trung bình', '≈ 14 °C nhờ hiệu ứng nhà kính tự nhiên (không có thì khoảng −18 °C)']], focus: false });
    const sun = api.sphere(1.3, api.mat(0xFFE066, { emissive: 0xFFC400, emissiveIntensity: 1.6 }), [-9, 12, -5]);
    api.part(sun, { name: 'Mặt Trời', rows: [['Bức xạ', 'Chủ yếu ánh sáng khả kiến sóng ngắn: đi xuyên qua khí quyển gần như không bị khí nhà kính hấp thụ']], focus: false });
    api.label('☀️ Mặt Trời', [-9, 14, -5], { cls: 'tag', color: '#F59E0B' });
    const top = api.mesh(new T.PlaneGeometry(22, 10), api.mat(0xFFFFFF, { opacity: 0.05, depthWrite: false, side: T.DoubleSide }), [0, 10, 0]); top.rotation.x = Math.PI / 2; top.userData.noPick = true;
    api.label('Ra ngoài vũ trụ ↑', [7.5, 10.3, 0], { cls: 'plain' });
    // phân tử khí
    const count = { N2: 12, O2: 5, H2O: 4, CO2: 30, CH4: 7, N2O: 4 };
    const want = () => ({ N2: 12, O2: 5, H2O: 4, CO2: Math.min(30, Math.round(co2 / 280 * 3)), CH4: Math.min(7, Math.round(ch4 / 720)), N2O: Math.min(4, Math.round(n2o / 270)) });
    const showCounts = () => { const w = want(), seen = {}; mols.forEach(g => { const k = g.userData.key; seen[k] = (seen[k] || 0) + 1; g.visible = seen[k] <= w[k]; g.userData.label.show(labels && g.visible); }); };
    const mols = [];
    Object.keys(count).forEach(k => { for (let i = 0; i < count[k]; i++) { const g = molecule(api, k, null); g.position.set((R() - 0.5) * 17, 0.8 + R() * 8.4, (R() - 0.5) * 6); g.userData.v = V(R() - 0.5, R() - 0.5, R() - 0.5).multiplyScalar(0.6); g.userData.key = k; g.userData.glow = 0; g.rotation.set(R() * 6, R() * 6, R() * 6); mols.push(g); const l = api.label(GAS[k].f, g, { cls: 'tag', color: GAS[k].gh ? '#F87171' : '#94A3B8', off: [0, 0.75, 0] }); l.el.dataset.mol = 1; l.show(labels); g.userData.label = l; } });
    showCounts();
    // photon
    const ph = [];
    const mkPh = (ir) => { const m = api.mesh(new T.SphereGeometry(0.15, 10, 8), api.mat(ir ? 0xFF4D6D : 0xFFE066, { emissive: ir ? 0xFF1F4B : 0xFFD000, emissiveIntensity: 1.4 })); m.scale.set(1, 1, 2.2); m.userData.noPick = true; m.userData.ir = ir; m.visible = false; return m; };
    for (let k = 0; k < 90; k++) ph.push(mkPh(k >= 30));
    const free = ir => ph.find(p => !p.visible && p.userData.ir === ir);
    const launch = (ir, pos, dir) => { const p = free(ir); if (!p) return; p.visible = true; p.position.copy(pos); p.userData.d = dir.clone().normalize(); p.userData.cool = 0.25; p.lookAt(pos.clone().add(dir)); };
    let tSun = 0, tIR = 0;
    const ov = api.overlay('', 'hm-tr');
    let tUI = 0;
    api.onFrame(dt => {
      const sp = speed, t = temp();
      api.scene.background = skyColor(T, t).multiplyScalar(0.55);
      earth.material.color.copy(new T.Color(0x2F9E6E).lerp(new T.Color(0x8B3A1A), Math.max(0, Math.min(1, (t - 14) / 12))));
      mols.forEach(g => {
        const u = g.userData; g.position.addScaledVector(u.v, dt * sp);
        if (g.position.y < 0.7 || g.position.y > 9.4) u.v.y *= -1; if (Math.abs(g.position.x) > 8.8) u.v.x *= -1; if (Math.abs(g.position.z) > 3.2) u.v.z *= -1;
        g.rotation.y += dt * 0.4;
        if (u.glow > 0) { u.glow -= dt * sp; const k = Math.sin(api.time * 60) * 0.12; g.scale.set(1 + k, 1 - k, 1 + k); g.traverse(c => { if (c.material && c.material.emissive) { c.material.emissive.setHex(0xFF3355); c.material.emissiveIntensity = 0.9 * Math.max(0, u.glow) / 0.7; } });
          if (u.glow <= 0) { g.scale.set(1, 1, 1); g.traverse(c => { if (c.material && c.material.emissive) c.material.emissiveIntensity = 0; }); const a = R() * Math.PI * 2, z = R() * 2 - 1; launch(true, g.position, V(Math.sqrt(1 - z * z) * Math.cos(a), z, Math.sqrt(1 - z * z) * Math.sin(a) * 0.4)); }
        }
      });
      tSun -= dt * sp; if (tSun <= 0 && mode !== 'earth') { tSun = 0.25; launch(false, V(-9 + R() * 2, 11.5, -5 + R() * 2), V(9 + (R() - 0.5) * 14, -12, 5 + (R() - 0.5) * 6)); }
      tIR -= dt * sp; if (tIR <= 0 && mode === 'earth') { tIR = 0.25; launch(true, V((R() - 0.5) * 16, 0.05, (R() - 0.5) * 6), V((R() - 0.5) * 0.8, 1, (R() - 0.5) * 0.4)); }
      ph.forEach(p => {
        if (!p.visible) return; const u = p.userData; p.position.addScaledVector(u.d, dt * sp * (u.ir ? 4 : 7)); u.cool -= dt * sp;
        if (p.position.y <= 0) { p.visible = false; if (!u.ir) launch(true, V(p.position.x, 0.05, p.position.z), V((R() - 0.5) * 0.8, 1, (R() - 0.5) * 0.4)); else stat.down++; return; }
        if ((u.ir && p.position.y > 10.5) || p.position.y > 12.5 || Math.abs(p.position.x) > 12 || Math.abs(p.position.z) > 6) { p.visible = false; if (u.ir) stat.esc++; return; }
        if (u.ir && u.cool <= 0) for (const g of mols) { if (g.visible && GAS[g.userData.key].gh && g.userData.glow <= 0 && g.position.distanceToSquared(p.position) < 0.36) { p.visible = false; g.userData.glow = 0.7; stat.abs++; break; } }
      });
      tUI -= dt; if (tUI <= 0) {
        tUI = 0.25;
        const col = t < 15 ? '#0EA5E9' : t < 18 ? '#CA8A04' : t < 22 ? '#EA580C' : t < 26 ? '#DC2626' : '#7F1D1D';
        const kept = stat.abs + stat.esc ? Math.round(stat.abs / (stat.abs + stat.esc) * 100) : 0;
        ov.innerHTML = `<div class="hm-meter"><div>Nhiệt độ<b style="color:${col}">${fmt(t)} °C</b></div><div>ΔF<b style="color:${col}">${fmt(dF(), 2)}</b>W/m²</div><div>IR bị giữ lại<b>${kept}%</b></div></div>`;
      }
      api.caption(`CO₂ ${co2} ppm · CH₄ ${ch4} ppb · N₂O ${n2o} ppb → ΔF = ${fmt(dF(), 2)} W/m², T = ${fmt(t)} °C`);
    });
    // điều khiển
    const upd = () => { if (temp() >= 26) api.warn('hot', `Nhiệt độ trung bình toàn cầu ${fmt(temp())} °C: cao hơn mức tự nhiên hơn 12 °C. Băng hai cực tan, mực nước biển dâng, hạn hán và thời tiết cực đoan gia tăng mạnh.`, '🔥 Cảnh báo'); };
    api.slider({ label: 'CO₂', min: 280, max: 5000, step: 10, value: co2, unit: 'ppm', lazy: true, onInput(v) { const was = co2; co2 = v; if (was < 560 && v >= 560) api.toast('CO₂ gấp đôi thời tiền công nghiệp: ΔF ≈ 3,7 W/m²'); upd(); showCounts(); } });
    api.slider({ label: 'CH₄', min: 720, max: 5000, step: 10, value: ch4, unit: 'ppb', lazy: true, onInput(v) { ch4 = v; upd(); showCounts(); } });
    api.slider({ label: 'N₂O', min: 270, max: 1000, step: 5, value: n2o, unit: 'ppb', lazy: true, onInput(v) { n2o = v; upd(); showCounts(); } });
    api.button('🕰 Năm 1750 (tiền công nghiệp)', () => { co2 = 280; ch4 = 720; n2o = 270; api.setTab(api.tab); });
    api.button('📅 Hiện nay (khoảng 2025)', () => { co2 = 425; ch4 = 1930; n2o = 337; api.setTab(api.tab); });
    api.choices({ label: '✨ Chùm photon', items: [{ t: '☀️ + 🌍 Cả hai', v: 'both' }, { t: '🌍 Chỉ hồng ngoại', v: 'earth' }], value: mode, onPick(v) { mode = v; } });
    api.slider({ label: '⏩ Tốc độ', min: 0.5, max: 3, step: 0.5, value: speed, unit: '×', lazy: true, onInput(v) { speed = v; } });
    api.toggle({ label: '🏷 Nhãn tên phân tử', value: labels, onChange(v) { labels = v; showCounts(); } });
    api.note('<span style="color:#FFE066">●</span> photon Mặt Trời đi xuyên qua · <span style="color:#FF4D6D">●</span> photon hồng ngoại bị <span style="color:#F87171">khí nhà kính</span> bắt rồi phát lại theo mọi hướng, một phần quay về mặt đất.');
    api.note('Mô hình đơn giản: chưa tính bụi khí (làm mát) và độ trễ của đại dương, nên nhiệt độ ra cao hơn số đo thực tế hiện nay (tăng khoảng 1,3 °C).');
    api.view({ pos: [0, 5, 18], target: [0, 4.5, 0], min: 5, max: 40 });
  }

  NL.m3d.register('HM10', {
    title: 'Hiệu ứng nhà kính',
    init() { co2 = 280; ch4 = 720; n2o = 270; mode = 'both'; },
    build(api) { build(api); },
    data() {
      const pts = []; for (let c = 280; c <= 5000; c += c < 1000 ? 40 : 200) pts.push([c, +tAt(c).toFixed(2)]);
      return {
        title: 'Nồng độ khí nhà kính và nhiệt độ toàn cầu',
        sub: `Hiện tại: ΔF = ${fmt(dF(), 2)} W/m², T = ${fmt(temp())} °C (T = 14 + 0,8·ΔF)`,
        sheets: [
          { name: 'Khí trong mô hình', head: ['Khí', 'Nồng độ đang đặt', 'Thời tiền công nghiệp', 'Hấp thụ hồng ngoại', 'GWP 100 năm', 'Tồn tại'], rows: [
            ['CO₂', co2 + ' ppm', '280 ppm', 'Có', GAS.CO2.gwp, GAS.CO2.life], ['CH₄', ch4 + ' ppb', '720 ppb', 'Có', GAS.CH4.gwp, GAS.CH4.life], ['N₂O', n2o + ' ppb', '270 ppb', 'Có', GAS.N2O.gwp, GAS.N2O.life],
            ['H₂O', 'Thay đổi theo nhiệt độ', '–', 'Có', GAS.H2O.gwp, GAS.H2O.life], ['N₂', '78%', '78%', 'Không', '0', 'Bền'], ['O₂', '21%', '21%', 'Không', '0', 'Bền']] },
          { name: 'Nhiệt độ theo CO₂', head: ['CO₂ (ppm)', 'ΔF (W/m²)', 'Nhiệt độ (°C)'], rows: pts.filter((_, k) => k % 2 === 0).map(([c, t]) => [c, fmt((t - 14) / 0.8, 2), fmt(t)]) }
        ],
        chart: { type: 'line', title: 'Nhiệt độ toàn cầu theo nồng độ CO₂', xMin: 0, xMax: 5000, yMin: 10, yMax: 30, series: [{ name: 'T (°C)', color: '#EF4444', points: pts }, { name: 'Đang đặt', color: '#0EA5E9', points: [[co2, +temp().toFixed(2)]] }], yLabel: '°C', xLabel: 'CO₂ (ppm)' }
      };
    },
    liveData: true
  });
})();
