// Mô hình 8: Tháp sinh thái. Tháp số lượng / sinh khối / năng lượng, 4 hệ sinh thái mẫu, tháp đảo ngược, chia đôi màn hình, dòng năng lượng 10%, đánh bắt bậc N₂.
(function () {
  const COL = [0x4CAF50, 0xF2C230, 0xF28C28, 0xE5534B], DEC = 0x8D6E4A;
  const LV = ['N₁ · Sinh vật sản xuất', 'N₂ · Sinh vật tiêu thụ bậc 1', 'N₃ · Sinh vật tiêu thụ bậc 2', 'N₄ · Sinh vật tiêu thụ bậc 3'];
  const UNIT = { num: 'cá thể/ha', bio: 'g/m²', ene: 'kcal/m²/năm' };
  const KIND = { num: 'Tháp số lượng', bio: 'Tháp sinh khối', ene: 'Tháp năng lượng' };
  const PRE = {
    grass: { name: 'Đồng cỏ', ground: 0x6FAE4E, sp: ['🌾 Cỏ', '🦗 Châu chấu', '🐸 Ếch', '🦅 Đại bàng'], dec: '🍄 Nấm, vi khuẩn',
      num: [5000000, 700000, 35000, 3], bio: [809, 37, 11, 1.5], ene: [15000, 1500, 150, 15], decv: { num: 1e9, bio: 5, ene: 3000 } },
    forest: { name: 'Rừng mưa nhiệt đới', ground: 0x2F7D3A, sp: ['🌳 Cây gỗ, dây leo', '🐛 Sâu, khỉ ăn lá', '🐍 Rắn, chim ăn sâu', '🐆 Báo'], dec: '🍄 Nấm, giun, vi khuẩn',
      num: [120000, 20000, 600, 10], bio: [45000, 450, 50, 5], ene: [25000, 2500, 250, 25], decv: { num: 2e9, bio: 20, ene: 6000 } },
    parasite: { name: 'Ký sinh trùng trên cây', ground: 0x5E8F3A, sp: ['🌳 1 cây gỗ lớn', '🐛 Sâu ăn lá', '🦠 Ký sinh trùng', '🧫 Siêu ký sinh'], dec: '🍄 Vi khuẩn phân hủy',
      num: [1, 3000, 40000, 150000], bio: [50000, 300, 3, 0.3], ene: [12000, 1200, 120, 12], decv: { num: 5e8, bio: 4, ene: 2400 } },
    pond: { name: 'Ao / biển mở', ground: 0x2E7FB8, sp: ['🟢 Tảo phù du', '🦐 Động vật phù du', '🐟 Cá nhỏ', '🐬 Cá lớn'], dec: '🦠 Vi khuẩn đáy',
      num: [9000000, 400000, 2000, 20], bio: [4, 21, 3, 0.5], ene: [8000, 800, 80, 8], decv: { num: 3e9, bio: 2, ene: 1600 } }
  };
  const WARN_ENE = 'Cảnh báo kiến thức trọng tâm: Tháp Năng lượng LUÔN LUÔN có dạng chuẩn (đáy rộng, đỉnh nhọn) và KHÔNG BAO GIỜ bị đảo ngược! Do năng lượng luôn bị thất thoát khoảng 90% qua mỗi bậc dinh dưỡng theo quy luật nhiệt động lực học!';
  const INV_WHY = {
    num: 'Có thể đảo: 1 sinh vật sản xuất rất lớn (cây gỗ) nuôi hàng nghìn sâu và hàng vạn ký sinh trùng',
    bio: 'Có thể đảo tạm thời (hệ nước): tảo sinh khối nhỏ nhưng sinh sản cực nhanh nuôi động vật phù du sinh khối lớn hơn',
    ene: 'Không bao giờ đảo: năng lượng thất thoát ≈ 90% qua mỗi bậc'
  };

  let preset = 'grass', speed = 2, cut = 0, split = false;
  const cur = { n: [0, 0, 0, 0] }; // giá trị hiện tại (có hiệu ứng nhiễu loạn)
  const fmt = v => v >= 1e6 ? (v / 1e6).toLocaleString('vi-VN', { maximumFractionDigits: 1 }) + ' triệu' : v >= 1000 ? Math.round(v).toLocaleString('vi-VN') : (+v.toFixed(v < 10 ? 1 : 0)).toLocaleString('vi-VN');
  // phản ứng dây chuyền khi giảm N₂
  function perturbed(kind) {
    const b = PRE[preset][kind], r = cut / 100;
    return [b[0] * (1 + 1.6 * r), b[1] * (1 - r), b[2] * (1 - 0.9 * r), b[3] * (1 - 0.95 * r)];
  }
  const widthOf = (v, max) => 0.5 + 5.5 * Math.log10(v + 1) / Math.log10(max + 1);

  // dựng một tháp vào nhóm cha; trả về các tầng để cập nhật
  function pyramid(api, parent, kind, off) {
    const T = api.T, p = PRE[preset];
    const g = api.group(parent, [off || 0, 0, 0]);
    const ground = api.mesh(new T.CylinderGeometry(5.2, 5.4, 0.25, 48), api.mat(p.ground, { roughness: 0.9 }), [0, -0.15, 0], g); ground.userData.noPick = true;
    const tiers = [];
    for (let k = 0; k < 4; k++) {
      const box = api.mesh(new T.BoxGeometry(1, 0.9, 1), api.mat(COL[k], { roughness: 0.5, emissive: COL[k], emissiveIntensity: 0.05 }), [0, 0.45 + k * 0.95, 0], g);
      api.tag(box, 'n' + (k + 1));
      const em = api.textSprite(p.sp[k].split(' ')[0], { h: 0.55, parent: g, pos: [0, 0.45 + k * 0.95, 0] }); api.tag(em, 'n' + (k + 1));
      const tx = api.textSprite('', { h: 0.34, parent: g, pos: [3.6, 0.45 + k * 0.95, 0], color: '#FFFFFF', bg: 'rgba(20,40,60,.72)' }); api.tag(tx, 'n' + (k + 1));
      tiers.push({ box, em, tx, w: 1, k });
    }
    const dec = api.mesh(new T.BoxGeometry(1.6, 0.5, 1.6), api.mat(DEC, { roughness: 0.9 }), [-4.0, 0.25, 1.6], g); api.tag(dec, 'dec');
    const dEm = api.textSprite(p.dec.split(' ')[0], { h: 0.5, parent: g, pos: [-4.0, 0.95, 1.6] }); api.tag(dEm, 'dec');
    const title = api.textSprite(`${KIND[kind]} · ${p.name}`, { h: 0.42, parent: g, pos: [0, 4.75, 0], color: '#FFFFFF', bg: 'rgba(42,139,216,.85)' }); title.userData.noPick = true;
    const setInfo = () => {
      const vals = perturbed(kind);
      tiers.forEach(t => {
        const v = vals[t.k], eff = t.k ? (vals[t.k] / vals[t.k - 1] * 100) : null;
        api.part(t.box, { name: LV[t.k], sci: p.sp[t.k], rows: [[KIND[kind], `${fmt(v)} ${UNIT[kind]}`], ...(t.k ? [['Hiệu suất so với bậc dưới', kind === 'ene' ? `eff = E${['₂', '₃', '₄'][t.k - 1]} / E${['₁', '₂', '₃'][t.k - 1]} × 100% = ${eff.toFixed(1)}%` : `${eff.toFixed(eff < 1 ? 3 : 1)}%`]] : [['Nguồn', kind === 'ene' ? 'Chỉ hấp thụ ≈ 1% năng lượng Mặt Trời để quang hợp' : 'Tự tổng hợp chất hữu cơ']]), ['Đại diện', p.sp[t.k]]] });
      });
      api.part(dec, { name: 'Sinh vật phân hủy', sci: p.dec, rows: [[KIND[kind], `${fmt(p.decv[kind])} ${UNIT[kind]}`], ['Vai trò', 'Phân giải xác, chất thải thành chất vô cơ trả lại môi trường'], ['Năng lượng', 'Nhận ≈ 10% năng lượng mỗi bậc qua xác và chất thải']] });
    };
    setInfo();
    return {
      g, tiers, kind, setInfo,
      update(dt) {
        const vals = perturbed(kind), max = Math.max(...vals, 1);
        tiers.forEach(t => {
          const tw = widthOf(vals[t.k], max); t.w += (tw - t.w) * Math.min(1, dt * 3);
          t.box.scale.set(t.w, 1, t.w * 0.8);
          const txt = `${['N₁', 'N₂', 'N₃', 'N₄'][t.k]} ${p.sp[t.k].split(' ').slice(1).join(' ')} · ${fmt(vals[t.k])}`;
          if (t.tx.userData.txt !== txt) { t.tx.userData.txt = txt; const ns = api.textSprite(txt, { h: 0.34, parent: g, pos: [0, 0, 0], color: '#FFFFFF', bg: 'rgba(20,40,60,.72)' }); t.tx.material.map.dispose(); t.tx.material.map = ns.material.map; t.tx.scale.copy(ns.scale); g.remove(ns); }
          t.tx.position.set(t.w / 2 + 0.25 + t.tx.scale.x / 2, 0.45 + t.k * 0.95, 0);
        });
      }
    };
  }

  // dòng hạt năng lượng
  function energyFlow(api, P) {
    const T = api.T, V = api.V, g = P.g;
    const sun = api.sphere(0.5, api.mat(0xFFD84A, { emissive: 0xFFC107, emissiveIntensity: 1.4 }), [-3.2, 6.2, -1], g, 20); sun.userData.noPick = true;
    const beam = api.mesh(new T.CylinderGeometry(0.15, 1.6, 5.6, 24, 1, true), api.mat(0xFFE88A, { opacity: 0.12, depthWrite: false, side: T.DoubleSide, emissive: 0xFFE070, emissiveIntensity: 0.6 }), [-1.6, 3.4, -0.5], g); beam.rotation.z = 0.5; beam.userData.noPick = true;
    const mk = (c, n, r) => { const a = []; for (let k = 0; k < n; k++) { const m = api.sphere(r || 0.07, api.mat(c, { emissive: c, emissiveIntensity: 0.8 }), null, g, 8); m.userData.noPick = true; m.userData.r = Math.random(); a.push(m); } return a; };
    const per = [mk(0xFFF27A, 60), mk(0xFFF27A, 20), mk(0xFFF27A, 7), mk(0xFFF27A, 3)];
    const loss = [mk(0xFF6B6B, 21), mk(0xB0B8C0, 3), mk(0xA07A50, 3)];
    const photons = mk(0xFFE070, 16, 0.06);
    let wave = 0;
    api.onFrame(dt => {
      const t = api.time * speed / 2;
      photons.forEach((m, k) => { const q = (t * 0.5 + k / 16) % 1; m.position.lerpVectors(V(-3.2, 6.2, -1), V((k % 4 - 1.5) * 0.6, 0.6, (k % 3 - 1) * 0.4), q); });
      per.forEach((arr, lv) => arr.forEach((m, k) => {
        const tier = P.tiers[lv], w = tier.w;
        m.visible = tier.box.visible;
        const q = (t * 0.6 + m.userData.r) % 1;
        m.position.set((m.userData.r - 0.5) * w * 0.85, 0.05 + lv * 0.95 + q * 0.95, ((k * 0.37) % 1 - 0.5) * w * 0.65);
        m.scale.setScalar(1 - lv * 0.18);
      }));
      // thất thoát bên hông mỗi tầng: hô hấp (đỏ), chất thải (xám), phân hủy (nâu)
      loss.forEach((arr, j) => arr.forEach((m, k) => {
        const lv = k % 3, tier = P.tiers[lv], q = (t * 0.7 + k / arr.length) % 1, s = j === 0 ? 1 : -1;
        m.visible = tier.box.visible;
        m.position.set(s * (tier.w / 2 + q * 1.6), 0.5 + lv * 0.95 + (j === 0 ? q * 0.8 : -q * 0.3), (j - 1) * 0.5);
      }));
      wave -= dt; if (wave <= 0) { wave = 1.6 / speed; api.noise(1.2 / speed, 0.012, 420); }
    });
  }

  function buildTab(api, kind) {
    const P = pyramid(api, null, kind, 0);
    if (kind === 'ene' || split) energyFlow(api, P);
    let Q = null;
    const other = kind === 'ene' ? 'bio' : 'ene';
    if (split) { const sc = api.splitScene(); const holder = new api.T.Group(); sc.add(holder); Q = pyramid(api, holder, other, 0); }
    api.label('Thất thoát ≈ 90% mỗi bậc: hô hấp 70%, chất thải 10%, phân hủy 10%', [0, -0.9, 3], { cls: 'plain' });
    let warned = 0;
    api.onFrame(dt => {
      P.update(dt); if (Q) Q.update(dt);
      const v = perturbed(kind);
      if (cut >= 60 && warned < 1) { warned = 1; api.beep(330, 0.25, 'square', 0.06); api.beep(262, 0.35, 'square', 0.06, 0.2); }
      if (cut < 60) warned = 0;
      api.caption(`${KIND[kind]} · ${PRE[preset].name}${cut ? ` · N₂ giảm ${cut}%: N₁ bùng nổ, N₃ suy giảm` : ''} · eff N₂/N₁ = ${(v[1] / v[0] * 100).toFixed(v[1] / v[0] < 0.01 ? 3 : 1)}%`);
    });
    api.choices({ label: '🌍 Hệ sinh thái mẫu', items: [{ t: '🌾 Đồng cỏ', v: 'grass' }, { t: '🌳 Rừng mưa', v: 'forest' }, { t: '🐛 Ký sinh', v: 'parasite' }, { t: '🌊 Ao / biển', v: 'pond' }], value: preset, onPick(v) { preset = v; chime(api); api.setTab(api.tab); } });
    api.choices({ label: '🔺 Dạng tháp', items: [{ t: '▲ Chuẩn', v: 'std' }, { t: '▼ Đảo ngược', v: 'inv' }], value: isInverted(kind) ? 'inv' : 'std', onPick(v, c) {
      if (kind === 'ene' && v === 'inv') { api.warn('ene', WARN_ENE, '⚠️ Cảnh báo kiến thức trọng tâm'); api.beep(300, 0.3, 'square', 0.06); c.set('std', true); return; }
      preset = v === 'inv' ? (kind === 'num' ? 'parasite' : 'pond') : 'grass';
      if (v === 'inv') api.toast(INV_WHY[kind]);
      chime(api); api.setTab(api.tab);
    } });
    api.toggle({ label: `↔ So sánh với ${KIND[other]}`, value: split, onChange(v) { split = v; api.setTab(api.tab); } });
    api.slider({ label: '⚡ Tốc độ dòng năng lượng', min: 1, max: 5, step: 1, value: speed, unit: '×', lazy: true, onInput(v) { speed = v; } });
    api.section('🎣 Đánh bắt / phun thuốc trừ sâu');
    api.slider({ label: 'Giảm số lượng N₂', min: 0, max: 80, step: 5, value: cut, unit: '%', lazy: true, onInput(v) { cut = v; P.setInfo(); Q && Q.setInfo(); if (v >= 80) api.toast('N₂ giảm 80% → N₁ không bị ăn nên bùng nổ, N₃ thiếu thức ăn nên suy giảm mạnh'); } });
    api.checklist([
      { k: 'n1', label: 'Sinh vật sản xuất (N₁)' }, { k: 'n2', label: 'Sinh vật tiêu thụ bậc 1 (N₂)' }, { k: 'n3', label: 'Sinh vật tiêu thụ bậc 2 (N₃)' },
      { k: 'n4', label: 'Sinh vật tiêu thụ bậc 3 (N₄)' }, { k: 'dec', label: 'Sinh vật phân hủy' }
    ]);
    api.view(split ? { pos: [1, 4.5, 16], target: [1, 2, 0], min: 5, max: 30 } : { pos: [2, 4.5, 13], target: [1.2, 2, 0], min: 5, max: 30 });
  }
  function isInverted(kind) { const v = PRE[preset][kind]; return v[1] > v[0]; }
  function chime(api) { [880, 1175, 1568].forEach((f, k) => api.beep(f, 0.3, 'sine', 0.06, k * 0.07)); }

  NL.m3d.register('M8', {
    title: 'Tháp sinh thái',
    tabs: [{ t: '🔢 Tháp số lượng', v: 'num' }, { t: '⚖️ Tháp sinh khối', v: 'bio' }, { t: '⚡ Tháp năng lượng', v: 'ene' }],
    init() { cut = 0; split = false; },
    build(api, tab) { buildTab(api, tab); },
    data() {
      const p = PRE[preset], n = perturbed('num'), b = perturbed('bio'), e = perturbed('ene');
      const row = k => [k + 4, `${LV[k]} (${p.sp[k].split(' ').slice(1).join(' ')})`, `${fmt(n[k])} ${UNIT.num}`, `${fmt(b[k])} ${UNIT.bio}`, `${fmt(e[k])} ${UNIT.ene}`, k ? `eff năng lượng = ${(e[k] / e[k - 1] * 100).toFixed(1)}%` : '–'];
      return {
        title: `So sánh 3 dạng tháp sinh thái · ${p.name}`,
        sub: `Giảm N₂: ${cut}% · Năng lượng Mặt Trời: N₁ chỉ hấp thụ ≈ 1% để quang hợp`,
        sheets: [
          { name: 'So sánh 3 tháp', head: ['STT', 'Tiêu chí so sánh', 'Tháp Số lượng', 'Tháp Sinh khối', 'Tháp Năng lượng', 'Khả năng bị đảo ngược & Nguyên nhân'], rows: [
            [1, 'Đại lượng xây dựng tầng', 'Số cá thể', 'Tổng khối lượng khô', 'Tổng năng lượng tích lũy', '–'],
            [2, 'Đơn vị', UNIT.num, UNIT.bio, UNIT.ene, '–'],
            [3, 'Dạng tháp ở hệ đang xem', n[1] > n[0] ? 'Đảo ngược' : 'Chuẩn', b[1] > b[0] ? 'Đảo ngược' : 'Chuẩn', 'Luôn chuẩn', '–'],
            row(0), row(1), row(2), row(3),
            [8, 'Khả năng đảo ngược', 'Có', 'Có (tạm thời, hệ nước)', 'Không bao giờ', `${INV_WHY.num}. ${INV_WHY.bio}. ${INV_WHY.ene}`]] },
          { name: 'Hiệu suất sinh thái', head: ['Bậc', 'Năng lượng (kcal/m²/năm)', 'Hiệu suất eff = Eₙ₊₁ / Eₙ × 100%', 'Thất thoát qua hô hấp (70%)', 'Chất thải (10%)', 'Phân hủy (10%)'], rows: e.map((v, k) => [['N₁', 'N₂', 'N₃', 'N₄'][k], Math.round(v * 10) / 10, k ? (e[k] / e[k - 1] * 100).toFixed(1) + '%' : '≈ 1% năng lượng Mặt Trời', Math.round(v * 0.7 * 10) / 10, Math.round(v * 0.1 * 10) / 10, Math.round(v * 0.1 * 10) / 10]) }
        ],
        chart: { type: 'pie', title: 'Năng lượng của một bậc đi về đâu', labels: ['Hô hấp, tỏa nhiệt 70%', 'Chất thải, rơi rụng 10%', 'Sinh vật phân hủy 10%', 'Truyền lên bậc sau 10%'], values: [70, 10, 10, 10], colors: ['#E5534B', '#9AA3AD', '#8D6E4A', '#F2C230'] }
      };
    },
    liveData: true
  });
})();
