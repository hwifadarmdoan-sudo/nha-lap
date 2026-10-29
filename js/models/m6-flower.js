// Mô hình 6: Hoa lưỡng tính. Giải phẫu, ong / gió thụ phấn, tua nhanh hoa thành quả; nhị – nhụy, cuộc đua ống phấn, hướng hóa, tự bất thụ; túi phôi 8 nhân 7 tế bào và thụ tinh kép.
(function () {
  const GREEN = 0x5FAE4E, PET = 0xFF5C8A, ANTH = 0xF2B233, POL = 0xFFD84A, STG = 0xC9E86A;
  const INFO = {
    recept: { name: 'Đế hoa', sci: 'Receptaculum', rows: [['Vai trò', 'Nơi đính các bộ phận của hoa'], ['Bộ NST', '2n']] },
    sepal: { name: 'Đài hoa', sci: 'Sepals (Calyx)', rows: [['Vai trò', 'Bảo vệ nụ hoa khi còn non'], ['Bộ NST', '2n']] },
    petal: { name: 'Cánh hoa', sci: 'Petals (Corolla)', rows: [['Vai trò', 'Màu sắc, hương thơm, mật hấp dẫn côn trùng thụ phấn'], ['Bộ NST', '2n']] },
    stamen: { name: 'Bộ nhị', sci: 'Stamens (Androecium)', rows: [['Gồm', 'Chỉ nhị và bao phấn'], ['Vai trò', 'Cơ quan sinh sản đực, tạo hạt phấn']] },
    anther: { name: 'Bao phấn', sci: 'Anther', rows: [['Chứa', '4 túi phấn, trong có tế bào mẹ hạt phấn (2n)'], ['Giảm phân', 'Mỗi tế bào mẹ (2n) → 4 tiểu bào tử (n) → hạt phấn'], ['Bộ NST', 'Vách 2n, hạt phấn n']] },
    fil: { name: 'Chỉ nhị', sci: 'Filament', rows: [['Vai trò', 'Nâng đỡ bao phấn, dẫn chất dinh dưỡng'], ['Bộ NST', '2n']] },
    pollen: { name: 'Hạt phấn', sci: 'Pollen grain (thể giao tử đực)', rows: [['Gồm', 'Tế bào sinh dưỡng (tạo ống phấn) + tế bào sinh sản'], ['Bộ NST', 'n'], ['Nảy mầm', 'Hút dịch nhầy trên đầu nhụy, mọc ống phấn'], ['Tế bào sinh sản', 'Nguyên phân → 2 tinh tử (n)']] },
    pistil: { name: 'Bộ nhụy', sci: 'Pistil (Gynoecium)', rows: [['Gồm', 'Đầu nhụy, vòi nhụy, bầu nhụy'], ['Vai trò', 'Cơ quan sinh sản cái']] },
    stigma: { name: 'Đầu nhụy', sci: 'Stigma', rows: [['Đặc điểm', 'Có lớp chất nhầy dính giữ hạt phấn'], ['Vai trò', 'Nơi hạt phấn đáp xuống và nảy mầm'], ['Bộ NST', '2n']] },
    style: { name: 'Vòi nhụy', sci: 'Style', rows: [['Đặc điểm', 'Dạng ống dài, mô dẫn giàu dinh dưỡng'], ['Vai trò', 'Đường đi của ống phấn; nhận diện protein S khi tự thụ'], ['Bộ NST', '2n']] },
    ovary: { name: 'Bầu nhụy', sci: 'Ovary', rows: [['Chứa', 'Noãn'], ['Sau thụ tinh', 'Phát triển thành quả'], ['Bộ NST', '2n']] },
    ovule: { name: 'Noãn', sci: 'Ovule', rows: [['Gồm', 'Vỏ noãn, phôi tâm, túi phôi'], ['Lỗ noãn', 'Nơi ống phấn đi vào'], ['Sau thụ tinh', 'Phát triển thành hạt'], ['Bộ NST', 'Vỏ noãn 2n']] },
    integ: { name: 'Vỏ noãn', sci: 'Integuments', rows: [['Sau thụ tinh', 'Thành vỏ hạt'], ['Bộ NST', '2n']] },
    sac: { name: 'Túi phôi', sci: 'Embryo sac (thể giao tử cái)', rows: [['Hình thành', 'Đại bào tử (n) nguyên phân 3 lần → 8 nhân'], ['Gồm', '7 tế bào, 8 nhân'], ['Bộ NST', 'n']] },
    egg: { name: 'Tế bào trứng', sci: 'Egg cell', rows: [['Vị trí', 'Gần lỗ noãn, giữa 2 tế bào kèm'], ['Bộ NST', 'n'], ['Thụ tinh', 'Tinh tử 1 (n) + trứng (n) → hợp tử (2n) → phôi']] },
    syn: { name: 'Tế bào kèm', sci: 'Synergids', rows: [['Số lượng', '2'], ['Vai trò', 'Tiết chất dẫn đường ống phấn; ống phấn vỡ ra tại đây'], ['Bộ NST', 'n']] },
    polar: { name: 'Nhân cực', sci: 'Polar nuclei (tế bào trung tâm)', rows: [['Số lượng', '2 nhân (n + n) → nhân lưỡng bội 2n'], ['Thụ tinh', 'Tinh tử 2 (n) + 2n → nhân tam bội 3n → phôi nhũ']] },
    anti: { name: 'Tế bào đối cực', sci: 'Antipodal cells', rows: [['Số lượng', '3'], ['Vị trí', 'Đầu đối diện lỗ noãn'], ['Bộ NST', 'n']] },
    tube: { name: 'Ống phấn', sci: 'Pollen tube', rows: [['Tạo bởi', 'Tế bào sinh dưỡng của hạt phấn'], ['Mang theo', '2 tinh tử (n)'], ['Định hướng', 'Hướng hóa: theo nồng độ Ca²⁺ và đường từ noãn']] },
    zyg: { name: 'Hợp tử', sci: 'Zygote', rows: [['Bộ NST', '2n'], ['Phát triển thành', 'Phôi (rễ mầm, thân mầm, chồi mầm, lá mầm)']] },
    endo: { name: 'Nhân tam bội', sci: 'Primary endosperm nucleus', rows: [['Bộ NST', '3n'], ['Phát triển thành', 'Phôi nhũ (nội nhũ) giàu chất dinh dưỡng']] },
    fruit: { name: 'Quả', sci: 'Fructus', rows: [['Do', 'Bầu nhụy phát triển thành'], ['Vai trò', 'Bảo vệ hạt và giúp phát tán hạt'], ['Bộ NST', '2n']] },
    seed: { name: 'Hạt', sci: 'Semen', rows: [['Do', 'Noãn đã thụ tinh phát triển thành'], ['Gồm', 'Vỏ hạt (2n), phôi (2n), phôi nhũ (3n)']] },
    bee: { name: 'Ong mật', sci: 'Apis mellifera', rows: [['Vai trò', 'Côn trùng thụ phấn: lông trên thân dính hạt phấn'], ['Thử ngay', 'Kéo ong vào bao phấn, rồi sang đầu nhụy hoa kia']] }
  };
  const WARN_SI = 'Cảnh báo hiện tượng sinh học: Cơ chế tự bất thụ (Self-incompatibility) dựa trên sự nhận diện protein giữa vòi nhụy và hạt phấn của cùng một cây, giúp ngăn cản quá trình tự thụ phấn để ưu tiên thụ phấn chéo, duy trì sự đa dạng di truyền cho quần thể!';
  const STAGES = ['Thụ phấn và cuộc đua ống phấn', 'Hướng hóa học: ống phấn tìm lỗ noãn', 'Thụ tinh kép trong túi phôi'];

  let op = 1, speed = 3, vector = 'none', wind = 4, ripe = 0, fruitType = 'flesh', src = 'cross', fertilized = false;
  let log = [];
  const sm = x => x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x);
  const addLog = (a, r) => { log.push([log.length + 1, a, r]); if (log.length > 30) log.shift(); };

  function petalGeo(T, w, l) { const g = new T.SphereGeometry(1, 20, 12); g.scale(w, 0.06, l); g.translate(0, 0, l); return g; }
  function flower(api, pos, s) {
    const T = api.T, V = api.V;
    const g = api.group(null, pos); g.scale.setScalar(s);
    const stem = api.tube([[0, -0.1, 0], [0.15, -2, 0.1], [0, -4.2, 0]], 0.09, GREEN, g, 30); stem.userData.noPick = true;
    const rec = api.cyl(0.38, 0.2, 0.4, GREEN, [0, 0.05, 0], g); api.part(rec, INFO.recept);
    const peri = api.group(g); api.tag(peri, 'peri');
    const sepals = [], petals = [];
    for (let k = 0; k < 5; k++) { const p = api.group(peri, [0, 0.15, 0]); p.rotation.y = k * 1.2566 + 0.63; const m = api.mesh(petalGeo(T, 0.32, 0.75), api.mat(GREEN, { side: T.DoubleSide }), null, p); m.rotation.x = -0.3; api.part(m, INFO.sepal); sepals.push(m); }
    for (let k = 0; k < 5; k++) { const p = api.group(peri, [0, 0.25, 0]); p.rotation.y = k * 1.2566; const m = api.mesh(petalGeo(T, 0.62, 1.45), api.mat(PET, { side: T.DoubleSide, roughness: 0.45 }), null, p); m.rotation.x = -0.75; api.part(m, INFO.petal); petals.push(m); }
    const pis = api.group(g); api.tag(pis, 'pistil');
    const ovary = api.group(pis, [0, 0.62, 0]); const ovM = api.sphere(0.36, api.mat(0x9FD36B), null, ovary, 24); ovM.scale.y = 1.25; api.part(ovM, INFO.ovary);
    const style = api.cyl(0.06, 0.07, 2.2, api.mat(0xE9F5B8), [0, 1.95, 0], pis, 10); api.part(style, INFO.style);
    const stigma = api.group(pis, [0, 3.1, 0]); for (let k = 0; k < 3; k++) { const a = k * 2.094; api.sphere(0.12, api.mat(STG, { roughness: 0.15, metalness: 0.1 }), [0.1 * Math.cos(a), 0, 0.1 * Math.sin(a)], stigma, 14); } api.part(stigma, INFO.stigma);
    const feather = api.group(stigma); for (let k = 0; k < 14; k++) { const a = k / 14 * 6.28; api.lineBetween([0, 0, 0], [0.45 * Math.cos(a), 0.15 + (k % 3) * 0.1, 0.45 * Math.sin(a)], 0.012, 0xEFF7C8, feather); } feather.visible = false; feather.traverse(o => o.userData.noPick = true);
    const sta = api.group(g); api.tag(sta, 'stamen'); const anthers = [];
    for (let k = 0; k < 6; k++) {
      const a = k * 1.047 + 0.3;
      const f = api.tube([[0.12 * Math.cos(a), 0.6, 0.12 * Math.sin(a)], [0.35 * Math.cos(a), 1.5, 0.35 * Math.sin(a)], [0.8 * Math.cos(a), 2.4, 0.8 * Math.sin(a)]], 0.025, 0xF7F0D2, sta, 20); api.part(f, INFO.fil);
      const an = api.mesh(new T.CapsuleGeometry(0.08, 0.28, 4, 10), api.mat(ANTH, { roughness: 0.8 }), [0.8 * Math.cos(a), 2.46, 0.8 * Math.sin(a)], sta); an.rotation.set(0, -a, Math.PI / 2); api.part(an, INFO.anther); anthers.push(an);
    }
    return { g, peri, sepals, petals, ovary, ovM, style, stigma, feather, sta, anthers, pis };
  }

  // ---------- Tab 1: giải phẫu, vector thụ phấn, tua nhanh ----------
  function anatTab(api) {
    const T = api.T, V = api.V;
    const A = flower(api, [0, 0, 0], 1), B = flower(api, [6.5, -0.3, -1.5], 0.85);
    const bLab = api.label('Hoa khác cùng loài', [0, 3.9, 0], { cls: 'plain', parent: B.g });
    api.label('Cánh hoa', A.petals[1], { off: [0.4, 0.6, 1.4] }); api.label('Đài hoa', A.sepals[2], { off: [0, -0.2, 0.9], cls: 'plain' });
    api.label('Bao phấn', A.anthers[0], { cls: 'tag', color: '#E09A00', off: [0.5, 0.25, 0] }); api.label('Đầu nhụy', A.stigma, { cls: 'tag', color: '#8DB33A', off: [0, 0.45, 0] });
    const oLab = api.label('Bầu nhụy', A.ovary, { cls: 'plain', off: [-0.8, -0.1, 0.5] });
    // hạt trong quả
    const seeds = api.group(A.ovary); api.tag(seeds, 'fruit'); const seedL = [];
    for (let k = 0; k < 5; k++) { const a = k * 1.256, sg = api.group(seeds, [0.14 * Math.cos(a), (k - 2) * 0.09, 0.14 * Math.sin(a)]); const coat = api.sphere(0.07, api.mat(0x6B4226, { opacity: 0.55 }), null, sg, 12); coat.scale.set(0.8, 1.2, 0.8); api.sphere(0.04, 0xFFF1C9, [0, 0.01, 0], sg, 8); api.sphere(0.025, 0x4CAF50, [0, -0.04, 0], sg, 8); seedL.push(sg); }
    api.part(seeds, INFO.seed); seeds.visible = false;
    const fLab = api.label('Quả', A.ovary, { off: [1.2, 0.4, 0], cls: 'tag', color: '#E5534B' }), sLab = api.label('Hạt: phôi 2n + phôi nhũ 3n, vỏ hạt 2n', A.ovary, { off: [-1.4, -0.9, 0.6], cls: 'plain' });
    // ong
    const bee = api.group(null, [-3.2, 3.6, 1.5]); const bb = api.sphere(0.32, 0xF6C02C, null, bee, 20); bb.scale.set(1.5, 1, 1);
    [-0.15, 0.15].forEach(x => { const st_ = api.mesh(new T.TorusGeometry(0.3, 0.06, 6, 20), 0x2B2420, [x, 0, 0], bee); st_.rotation.y = Math.PI / 2; });
    api.sphere(0.2, 0x2B2420, [0.5, 0.05, 0], bee, 14);
    const wings = [-1, 1].map(s => { const w = api.mesh(new T.SphereGeometry(0.35, 14, 8), api.mat(0xDDF3FF, { opacity: 0.55 }), [0, 0.3, s * 0.25], bee); w.scale.set(0.6, 0.08, 1); return w; });
    const fuzz = api.group(bee); for (let k = 0; k < 30; k++) { const m = api.sphere(0.035, POL, [(Math.random() - 0.5) * 0.7, 0.28 + Math.random() * 0.06, (Math.random() - 0.5) * 0.4], fuzz, 6); m.visible = false; }
    api.part(bee, Object.assign({ focus: false }, INFO.bee));
    let beeLoad = 0, beeFrom = null, lastTouch = '', buzzT = 0;
    api.draggable(bb, { start() { api.beep(220, 0.08, 'sawtooth', 0.04); }, move(p) { bee.position.copy(p); buzzT = 0.25; }, obj: bb });
    // gió
    const cloud = []; for (let k = 0; k < 60; k++) { const m = api.sphere(0.04, api.mat(POL, { emissive: POL, emissiveIntensity: 0.4 }), null, null, 6); m.userData.noPick = true; m.visible = false; m.userData.v = V(); cloud.push(m); }
    let landed = 0, windT = 0;
    const stigW = o => o.stigma.getWorldPosition(new T.Vector3());
    const stigPol = []; for (let k = 0; k < 12; k++) { const m = api.sphere(0.035, POL, [(Math.random() - 0.5) * 0.25, 0.1, (Math.random() - 0.5) * 0.25], B.stigma, 6); m.visible = false; stigPol.push(m); }
    const showB = () => { B.g.visible = vector !== 'none'; bee.visible = vector === 'bee'; B.feather.visible = vector === 'wind'; cloud.forEach(m => m.visible = false); };
    showB();
    const applyRipe = () => {
      const f1 = sm(ripe / 0.3), g2 = sm((ripe - 0.3) / 0.4), g3 = sm((ripe - 0.7) / 0.3);
      A.petals.forEach((m, k) => { m.rotation.x = -0.75 + 1.9 * f1; m.position.y = -f1 * (1 + k * 0.3); api.setOpacity(m, (1 - f1) * op); m.visible = f1 < 1; });
      A.sepals.forEach(m => { m.rotation.x = -0.3 + 1.2 * f1; api.setOpacity(m, 1 - f1); m.visible = f1 < 1; });
      A.sta.children.forEach(m => { m.visible = f1 < 1; }); A.sta.position.y = -f1 * 1.5; api.setOpacity(A.sta, 1 - f1);
      A.style.visible = A.stigma.visible = f1 < 1; api.setOpacity(A.style, (1 - f1) * op);
      const flesh = fruitType === 'flesh';
      const sc = flesh ? V(1 + 3 * g2, 1 + 2.4 * g2, 1 + 3 * g2) : V(1 + 0.5 * g2, 1 + 5 * g2, 1 + 0.9 * g2);
      A.ovary.scale.copy(sc); A.ovary.position.y = 0.62 + (flesh ? 0.9 : 1.5) * g2;
      A.ovM.material.color.copy(new T.Color(0x9FD36B).lerp(new T.Color(flesh ? 0xE23B3B : 0xC9A46A), g2));
      api.setOpacity(A.ovM, g3 > 0 ? Math.max(0.35, 1 - g3 * 0.65) * op : op);
      seeds.visible = g3 > 0; seedL.forEach(s => s.scale.setScalar(Math.max(0.01, g3)));
      fLab.el.style.visibility = ripe > 0.45 ? '' : 'hidden'; oLab.el.style.visibility = ripe > 0.45 ? 'hidden' : ''; sLab.el.style.visibility = ripe > 0.8 ? '' : 'hidden';
    };
    applyRipe();
    let prevRipe = ripe;
    api.onFrame(dt => {
      const t = api.time;
      if (vector === 'bee') {
        wings.forEach((w, k) => w.rotation.x = Math.sin(t * 60) * 0.6 * (k ? 1 : -1));
        bee.position.y += Math.sin(t * 3) * 0.002;
        if (buzzT > 0) { buzzT -= dt; if (Math.random() < 0.3) api.beep(190 + Math.random() * 30, 0.06, 'sawtooth', 0.025); }
        const bp = bee.getWorldPosition(new T.Vector3());
        [['A', A], ['B', B]].forEach(([id, F]) => {
          if (!F.g.visible) return;
          if (F.anthers.some(a => a.getWorldPosition(new T.Vector3()).distanceTo(bp) < 0.75)) {
            if (beeLoad < 30) { beeLoad = Math.min(30, beeLoad + 1); beeFrom = id; fuzz.children.forEach((m, k) => m.visible = k < beeLoad); }
            if (lastTouch !== 'an' + id) { lastTouch = 'an' + id; api.toast(`Lưng ong dính hạt phấn của hoa ${id === 'A' ? 'giữa' : 'bên phải'}`); }
          }
          if (stigW(F).distanceTo(bp) < 0.75 && beeLoad > 0 && lastTouch !== 'st' + id) {
            lastTouch = 'st' + id;
            if (beeFrom !== id) { api.beep(660, 0.12, 'sine', 0.12); api.beep(990, 0.18, 'sine', 0.1, 0.1); api.toast('Thụ phấn chéo thành công! Hạt phấn bám vào chất nhầy đầu nhụy'); addLog('Ong mang phấn sang đầu nhụy hoa khác', 'Thụ phấn chéo'); if (F === B) stigPol.forEach(m => m.visible = true); beeLoad = Math.max(0, beeLoad - 12); fuzz.children.forEach((m, k) => m.visible = k < beeLoad); }
            else { api.toast('Phấn rơi lên đầu nhụy của chính hoa đó: tự thụ phấn. Thử ở tab Nhị & nhụy xem điều gì xảy ra'); addLog('Ong mang phấn về đầu nhụy cùng hoa', 'Tự thụ phấn'); }
          }
        });
      }
      if (vector === 'wind') {
        const w = wind;
        [...A.anthers, ...B.anthers].forEach((a, k) => a.rotation.x = Math.sin(t * (4 + w) + k) * 0.05 * w);
        windT += dt; if (w > 0 && windT > 1.2) { windT = 0; api.noise(1.3, 0.012 * w, 300 + w * 30); }
        const tgt = stigW(B);
        cloud.forEach((m, k) => {
          if (!m.visible) { if (w > 0 && Math.random() < 0.02 * w) { const a = A.anthers[k % 6].getWorldPosition(new T.Vector3()); m.position.copy(a); m.userData.v.set(0.25 * w + Math.random() * 0.3, 0.2 + Math.random() * 0.3, (Math.random() - 0.5) * 0.4); m.visible = true; } return; }
          m.userData.v.y -= dt * 0.18; m.position.addScaledVector(m.userData.v, dt);
          if (m.position.distanceTo(tgt) < 0.5) { m.visible = false; landed++; stigPol.forEach((s, j) => s.visible = j < landed); if (landed === 1) { api.toast('Hạt phấn nhỏ, nhẹ, khô bay theo gió đến đầu nhụy dạng lông chim'); addLog(`Gió ${w} m/s`, 'Hạt phấn đến đầu nhụy hoa khác'); } }
          if (m.position.y < -3 || m.position.x > 12) m.visible = false;
        });
      }
      if (ripe !== prevRipe) { prevRipe = ripe; applyRipe(); }
      api.caption(ripe > 0 ? `Tua nhanh ${Math.round(ripe * 100)}%: ${ripe < 0.3 ? 'cánh hoa, nhị, vòi nhụy héo rụng' : ripe < 0.7 ? 'bầu nhụy phình to thành quả' : 'noãn thành hạt, hợp tử thành phôi, nhân 3n thành phôi nhũ'}` : vector === 'bee' ? `Kéo ong: chạm bao phấn rồi chạm đầu nhụy hoa kia · phấn trên lưng ong: ${beeLoad}` : vector === 'wind' ? `Gió ${wind} m/s · hạt phấn đáp lên đầu nhụy: ${landed}` : 'Hoa lưỡng tính: có cả bộ nhị và bộ nhụy');
    });
    api.choices({ label: '🐝 Nhập vai thụ phấn', items: [{ t: 'Không', v: 'none' }, { t: '🐝 Ong', v: 'bee' }, { t: '🌬 Gió', v: 'wind' }], value: vector, onPick(v) { vector = v; showB(); if (v === 'bee') api.toast('Kéo con ong vào bao phấn'); api.view({ pos: v === 'none' ? [1, 4, 9] : [3.6, 5, 13], target: v === 'none' ? [0, 1.4, 0] : [3.2, 1.2, 0], min: 3, max: 24 }); api.homeView(); } });
    api.slider({ label: '🌬 Tốc độ gió', min: 0, max: 10, step: 1, value: wind, unit: 'm/s', lazy: true, onInput(v) { wind = v; } });
    api.section('⏩ Tua nhanh hoa → quả');
    api.choices({ items: [{ t: '🍎 Quả thịt', v: 'flesh' }, { t: '🫛 Quả khô (đậu)', v: 'dry' }], value: fruitType, onPick(v) { fruitType = v; applyRipe(); } });
    api.slider({ label: 'Thời gian sau thụ tinh', min: 0, max: 100, step: 1, value: Math.round(ripe * 100), unit: '%', lazy: true, onInput(v) { ripe = v / 100; if (v > 0 && !fertilized) api.warn('nofert', 'Lưu ý: quả và hạt chỉ hình thành sau khi thụ tinh kép. Mô hình đang giả sử noãn đã được thụ tinh; em có thể xem thụ tinh kép ở tab Túi phôi.', '💡 Gợi ý'); if (v === 100) addLog(`Tua nhanh ${fruitType === 'flesh' ? 'quả thịt' : 'quả khô'}`, 'Bầu → quả, noãn → hạt'); } });
    commonCtl(api, o => { op = o; applyRipe(); [A, B].forEach(F => { F.petals.forEach(m => api.setOpacity(m, o)); api.setOpacity(F.style, o); api.setOpacity(F.ovM, o); }); });
    api.view(vector === 'none' ? { pos: [1, 4, 9], target: [0, 1.4, 0], min: 3, max: 24 } : { pos: [3.6, 5, 13], target: [3.2, 1.2, 0], min: 3, max: 24 });
    void bLab;
  }

  // ---------- Tab 2: nhị, nhụy, đua ống phấn ----------
  function microTab(api) {
    const T = api.T, V = api.V, rnd = api.rand(17);
    // nhị bóc tách
    const st_ = api.group(null, [-4.2, 0, 0]); api.tag(st_, 'stamen');
    const fil = api.cyl(0.12, 0.14, 5, 0xF7F0D2, [0, -0.5, 0], st_, 14); api.part(fil, INFO.fil);
    const sacs = api.group(st_, [0, 2.6, 0]);
    [[-0.45, 0.3], [0.45, 0.3], [-0.45, -0.3], [0.45, -0.3]].forEach(p => { const m = api.mesh(new T.CapsuleGeometry(0.38, 1.4, 6, 16), api.mat(ANTH, { opacity: 0.35, depthWrite: false }), [p[0], 0, p[1]], sacs); api.part(m, INFO.anther); });
    const pg = new T.IcosahedronGeometry(0.11, 1);
    for (let k = 0; k < 60; k++) { const m = api.mesh(pg, api.mat(POL, { roughness: 0.9 }), [(k % 2 ? 0.45 : -0.45) + (rnd() - 0.5) * 0.4, (rnd() - 0.5) * 1.6, (k % 4 < 2 ? 0.3 : -0.3) + (rnd() - 0.5) * 0.35], sacs); api.part(m, INFO.pollen); }
    api.label('Bao phấn (4 túi phấn)', sacs, { off: [0, 1.6, 0] }); api.label('Chỉ nhị', fil, { off: [-0.9, -1, 0], cls: 'plain' }); api.label('Hạt phấn (n)', [-3.75, 2.6, 0.6], { cls: 'tag', color: '#E0A100' });
    // nhụy cắt dọc
    const pis = api.group(); api.tag(pis, 'pistil');
    const stig = api.mesh(new T.SphereGeometry(0.9, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.55), api.mat(STG, { roughness: 0.1, metalness: 0.15, opacity: 0.9 }), [0, 4.8, 0], pis); stig.scale.y = 0.6; api.part(stig, INFO.stigma);
    const sty = api.mesh(new T.CylinderGeometry(0.4, 0.5, 4.6, 24, 1, true), api.mat(0xE9F5B8, { opacity: 0.3 * op, depthWrite: false, side: T.DoubleSide }), [0, 2.5, 0], pis); api.part(sty, INFO.style);
    const ova = api.sphere(1.9, api.mat(0x9FD36B, { opacity: 0.25 * op, depthWrite: false, side: T.DoubleSide }), [0, -1.3, 0], pis, 32); ova.scale.y = 0.9; api.part(ova, INFO.ovary);
    const ovG = api.group(); api.tag(ovG, 'ovule');
    const OV = [V(-0.9, -1.5, 0.3), V(0.9, -1.5, -0.3), V(0, -2.2, 0.8)];
    const mic = OV.map(p => p.clone().add(V(-p.x * 0.25, 0.5, -p.z * 0.25)));
    OV.forEach(p => { const m = api.sphere(0.5, 0xF2E4A8, [p.x, p.y, p.z], ovG, 20); m.scale.y = 1.25; api.part(m, INFO.ovule); });
    api.label('Đầu nhụy (chất nhầy dính)', stig, { off: [1.6, 0.4, 0] }); api.label('Vòi nhụy', sty, { off: [1.2, 0.6, 0], cls: 'plain' }); api.label('Bầu nhụy', ova, { off: [2.2, -0.6, 0], cls: 'plain' }); api.label('Noãn', [0.9, -1.5, -0.3], { off: [0.9, -0.5, 0], cls: 'tag', color: '#C9A100' });
    // hạt phấn và ống phấn
    const N = 7, tubes = [], tubeG = api.group(); api.tag(tubeG, 'tube');
    const chem = []; for (let k = 0; k < 40; k++) { const m = api.sphere(0.05, api.mat(0xFF9A3C, { emissive: 0xFF9A3C, emissiveIntensity: 0.5, opacity: 0.8 }), null, null, 6); m.userData.noPick = true; m.visible = false; chem.push(m); }
    const steps = api.note('');
    let stage = -1, run = null;
    const showSteps = () => steps.set(`<b>Tiến trình sinh sản</b><ol class="m3d-steps">${STAGES.map((s, k) => `<li class="${k === stage ? 'on' : k < stage ? 'done' : ''}">${s}</li>`).join('')}</ol>`);
    showSteps();
    const clear = () => { tubes.forEach(tb => { [tb.mesh, tb.grain, ...tb.nuc].forEach(o => o.parent && o.parent.remove(o)); }); tubes.length = 0; };
    const release = () => {
      clear(); stage = 0; showSteps();
      const self = src === 'self';
      for (let k = 0; k < N; k++) {
        const a = k / N * 6.28 + rnd(), r = 0.25 + rnd() * 0.4, top = V(r * Math.cos(a), 5.15, r * Math.sin(a)), tgt = k % 3;
        let pts;
        if (self) { pts = [top]; for (let j = 1; j <= 14; j++) { const aa = a + j * 0.9, rr = 0.25 * (1 - j / 16); pts.push(V(top.x + rr * Math.cos(aa), 5.0 - j * 0.035, top.z + rr * Math.sin(aa))); } }
        else pts = [top, V(top.x * 0.4, 4.2, top.z * 0.4), V((rnd() - 0.5) * 0.4, 2.6, (rnd() - 0.5) * 0.4), V((rnd() - 0.5) * 0.4, 0.8, (rnd() - 0.5) * 0.3), mic[tgt].clone().add(V(0, 0.55, 0)), mic[tgt]];
        const curve = new T.CatmullRomCurve3(pts), seg = 120;
        const mesh = api.mesh(new T.TubeGeometry(curve, seg, 0.045, 6, false), api.mat(self ? 0xC77B4A : 0xFFF0B0, { emissive: 0xFFE27A, emissiveIntensity: 0.25 }), null, tubeG);
        mesh.geometry.setDrawRange(0, 0); api.part(mesh, INFO.tube);
        const grain = api.mesh(pg, api.mat(POL, { roughness: 0.9 }), [top.x, 7.5 + rnd() * 1.5, top.z], tubeG); grain.scale.setScalar(1.6); api.part(grain, INFO.pollen);
        const nuc = [api.sphere(0.07, 0x7A4FB5, null, tubeG, 8), api.sphere(0.06, 0x3E7BFA, null, tubeG, 8), api.sphere(0.06, 0x3E7BFA, null, tubeG, 8)]; nuc.forEach(n => { n.visible = false; n.userData.noPick = true; });
        tubes.push({ mesh, curve, seg, grain, top, nuc, f: 0, v: 0.11 + rnd() * 0.06, stop: false, delay: rnd() * 0.6 });
      }
      run = { t0: api.time, winner: null, self };
      api.beep(520, 0.08, 'sine', 0.08);
      addLog(self ? 'Thả phấn cùng cây lên đầu nhụy' : 'Thả phấn cây khác lên đầu nhụy', '…');
    };
    api.onFrame(dt => {
      if (!run) return;
      const age = api.time - run.t0;
      tubes.forEach(tb => {
        const land = sm((age - tb.delay) / 1.0);
        tb.grain.position.y = 7.5 + (tb.top.y + 0.05 - 7.5) * land;
        if (land < 1 || tb.stop) return;
        const lim = run.self ? 1 : run.winner && run.winner !== tb ? Math.min(tb.f, 0.93) : 1;
        tb.f = Math.min(lim, tb.f + dt * tb.v * speed / 3 * (run.self ? 0.9 : 1));
        if (run.winner && run.winner !== tb && !run.self) { tb.stop = true; tb.mesh.material.color.set(0x8C8C8C); tb.mesh.material.emissiveIntensity = 0; }
        tb.mesh.geometry.setDrawRange(0, Math.floor(tb.f * tb.seg) * 6 * 6);
        const head = tb.curve.getPointAt(Math.max(0.001, tb.f)), back = tb.curve.getPointAt(Math.max(0, tb.f - 0.04)), back2 = tb.curve.getPointAt(Math.max(0, tb.f - 0.07));
        tb.nuc[0].visible = true; tb.nuc[0].position.copy(head);
        const split = tb.f > 0.35; tb.nuc[1].visible = true; tb.nuc[1].position.copy(back); tb.nuc[2].visible = split; tb.nuc[2].position.copy(back2); tb.nuc[1].scale.setScalar(split ? 1 : 1.3);
        if (!run.self && tb.f >= 1 && !run.winner) { run.winner = tb; tb.mesh.material.emissiveIntensity = 0.9; api.beep(784, 0.15, 'sine', 0.12); api.beep(1046, 0.25, 'sine', 0.1, 0.12); api.toast('Ống phấn đầu tiên chạm lỗ noãn! Các ống đến sau dừng mọc'); stage = 2; showSteps(); log[log.length - 1][2] = 'Ống phấn mọc tới lỗ noãn'; }
        if (run.self && tb.f >= 1 && !tb.stop) { tb.stop = true; if (!run.warned) { run.warned = true; api.warn('si', WARN_SI, '⚠️ Cảnh báo hiện tượng sinh học'); log[log.length - 1][2] = 'Ống phấn xoăn lại, ngừng mọc (tự bất thụ)'; } }
      });
      const lead = Math.max(...tubes.map(t => t.f));
      if (!run.self && stage === 0 && lead > 0.4) { stage = 1; showSteps(); }
      // dải hóa chất dẫn đường từ noãn
      chem.forEach((m, k) => {
        m.visible = !run.self && stage >= 1 && stage < 2 || (!run.self && stage === 2 && age % 1 < 0);
        if (run.self) { m.visible = age > 1.2 && k < 20; const a = k * 0.7 + api.time; m.position.set(0.5 * Math.cos(a), 4.7 + 0.15 * Math.sin(api.time * 2 + k), 0.5 * Math.sin(a)); m.material.color.set(0xE5534B); m.material.emissive.set(0xE5534B); return; }
        m.material.color.set(0xFF9A3C); m.material.emissive.set(0xFF9A3C);
        const p = (api.time * 0.25 + k / 40) % 1, s = mic[k % 3];
        m.position.set(s.x * (1 - p) + Math.sin(k) * 0.15, s.y + p * 5.5, s.z * (1 - p) + Math.cos(k) * 0.15); m.material.opacity = 0.9 * (1 - p);
      });
      api.caption(run.self ? 'Protein S trùng nhau → S-RNase của vòi nhụy phân hủy RNA ống phấn, ống phấn xoăn lại' : stage === 0 ? 'Hạt phấn hút dịch nhầy, nảy mầm, ống phấn đâm vào vòi nhụy' : stage === 1 ? 'Noãn tiết Ca²⁺ và đường: ống phấn mọc theo hướng nồng độ tăng dần' : 'Ống phấn thắng cuộc đã tới lỗ noãn: sang tab Túi phôi để xem thụ tinh kép');
    });
    api.choices({ label: '🌼 Nguồn hạt phấn', items: [{ t: '🌸 Cây khác (thụ chéo)', v: 'cross' }, { t: '🌼 Cùng cây (tự thụ)', v: 'self' }], value: src, onPick(v) { src = v; } });
    api.button('▶ Thả hạt phấn lên đầu nhụy', () => release());
    api.button('➡ Bước 3: Thụ tinh kép', () => api.setTab('sac'));
    api.slider({ label: '🚀 Tốc độ mọc ống phấn', min: 1, max: 10, step: 1, value: speed, unit: '×', lazy: true, onInput(v) { speed = v; } });
    commonCtl(api, o => { op = o; api.setOpacity(sty, o); api.setOpacity(ova, o); });
    api.view({ pos: [-1.6, 2, 13], target: [-1.6, 1.2, 0], min: 3, max: 24 });
  }

  // ---------- Tab 3: túi phôi, thụ tinh kép ----------
  function sacTab(api) {
    const T = api.T, V = api.V;
    const ov = api.group(); api.tag(ov, 'ovule');
    const oi = api.sphere(3, api.mat(0xC9E3A0, { opacity: 0.16 * op, depthWrite: false, side: T.DoubleSide }), [0, 0, 0], ov, 40); oi.scale.set(1, 1.45, 1); api.part(oi, INFO.integ);
    const ii = api.sphere(2.6, api.mat(0xE6F0B8, { opacity: 0.16 * op, depthWrite: false, side: T.DoubleSide }), [0, 0, 0], ov, 40); ii.scale.set(1, 1.42, 1); ii.userData.noPick = true;
    const sac = api.sphere(1.6, api.mat(0xFFFFFF, { opacity: 0.18, depthWrite: false, side: T.DoubleSide }), [0, 0, 0], ov, 36); sac.scale.set(1, 1.85, 1); api.part(sac, INFO.sac);
    const cell = (r, c, p, info) => { const g = api.group(null, p); const m = api.sphere(r, api.mat(c, { opacity: 0.75, emissive: c, emissiveIntensity: 0 }), null, g, 24); api.sphere(r * 0.35, 0x5B3A8C, null, g, 12); api.part(g, info); api.tag(g, 'ovule'); g.userData.m = m; return g; };
    const egg = cell(0.48, 0xFF9DBB, [0, -1.95, 0], INFO.egg);
    const syn = [cell(0.36, 0xC9A9F2, [-0.55, -2.45, 0.1], INFO.syn), cell(0.36, 0xC9A9F2, [0.55, -2.45, -0.1], INFO.syn)];
    const anti = [[0, 2.55, 0], [-0.45, 2.2, 0.15], [0.45, 2.2, -0.15]].map(p => cell(0.3, 0x8FD06B, p, INFO.anti));
    const pol = [V(-0.3, 0.2, 0), V(0.3, 0.2, 0)].map(p => { const m = api.sphere(0.22, api.mat(0xFFD84A, { emissive: 0xFFD84A, emissiveIntensity: 0.2 }), [p.x, p.y, p.z], null, 18); api.part(m, INFO.polar); api.tag(m, 'ovule'); return m; });
    const tubeCurve = new T.CatmullRomCurve3([V(0.2, -6.2, 0.5), V(0.1, -5, 0.2), V(0, -4.3, 0), V(-0.2, -3.2, 0.05), V(-0.5, -2.55, 0.1)]);
    const tube = api.mesh(new T.TubeGeometry(tubeCurve, 80, 0.1, 8, false), api.mat(0xFFF0B0, { emissive: 0xFFE27A, emissiveIntensity: 0.3 }), null); tube.geometry.setDrawRange(0, 0); api.part(tube, INFO.tube); api.tag(tube, 'tube');
    const sp = [0, 1].map(() => { const m = api.sphere(0.13, api.mat(0x3E7BFA, { emissive: 0x3E7BFA, emissiveIntensity: 0.8 }), null, null, 12); m.visible = false; m.userData.noPick = true; api.tag(m, 'tube'); return m; });
    const flash = api.sphere(0.6, api.mat(0xFFFFFF, { emissive: 0xFFFFFF, emissiveIntensity: 2, opacity: 0 }), null, null, 16); flash.userData.noPick = true;
    const lE = api.label('Tế bào trứng (n)', egg, { off: [-1.6, 0, 0], cls: 'tag', color: '#E5537F' });
    api.label('2 Tế bào kèm (n)', syn[1], { off: [1.5, -0.3, 0], cls: 'plain' });
    const lP = api.label('2 Nhân cực (n + n)', pol[1], { off: [1.6, 0, 0], cls: 'tag', color: '#C9A100' });
    api.label('3 Tế bào đối cực (n)', anti[0], { off: [1.6, 0.3, 0], cls: 'plain' });
    api.label('Lỗ noãn', [0, -4.3, 0], { off: [1.1, 0, 0], cls: 'plain' }); api.label('Vỏ noãn (2n)', [2.6, 2.2, 0], { cls: 'plain' }); api.label('Túi phôi: 8 nhân / 7 tế bào', [0, 3.3, 0], { cls: 'plain' });
    let run = null;
    const reset = () => { run = null; tube.geometry.setDrawRange(0, 0); sp.forEach(m => m.visible = false); syn[0].visible = true; api.setOpacity(syn[0], 1); pol[0].position.set(-0.3, 0.2, 0); pol[1].position.set(0.3, 0.2, 0); pol[0].visible = true; pol[1].scale.setScalar(1); egg.userData.m.material.color.set(0xFF9DBB); egg.userData.m.material.emissiveIntensity = 0; pol[1].material.color.set(0xFFD84A); lE.el.innerHTML = 'Tế bào trứng (n)'; lP.el.innerHTML = '2 Nhân cực (n + n)'; };
    if (fertilized) { egg.userData.m.material.color.set(0xFF6FA0); lE.el.innerHTML = 'Hợp tử (2n)'; pol[0].visible = false; pol[1].position.set(0, 0.2, 0); pol[1].scale.setScalar(1.35); pol[1].material.color.set(0xFFA53C); lP.el.innerHTML = 'Nhân tam bội (3n)'; egg.userData.part = INFO.zyg; }
    const go = () => { reset(); run = { t0: api.time, f1: false, f2: false }; api.beep(440, 0.08, 'sine', 0.08); };
    api.onFrame(dt => {
      if (!run) return;
      const k = speed / 3, t = (api.time - run.t0) * k;
      tube.geometry.setDrawRange(0, Math.floor(Math.min(1, t / 2) * 80) * 8 * 6);
      if (t > 2) { syn[0].visible = t < 2.6; api.setOpacity(syn[0], Math.max(0, 1 - (t - 2) / 0.6)); }
      const burst = V(-0.5, -2.45, 0.1);
      sp.forEach(m => m.visible = t > 2.2 && t < 4.2);
      if (t > 2.2) { const u = sm((t - 2.4) / 1.4); sp[0].position.lerpVectors(burst, egg.position, u); sp[1].position.lerpVectors(burst, V(0, 0.2, 0), u); }
      if (t > 2.6) { const u = sm((t - 2.6) / 1.2); pol[0].position.lerpVectors(V(-0.3, 0.2, 0), V(0, 0.2, 0), u); pol[1].position.lerpVectors(V(0.3, 0.2, 0), V(0, 0.2, 0), u); }
      if (t > 4 && !run.f1) {
        run.f1 = true; egg.userData.m.material.emissiveIntensity = 1; egg.userData.m.material.color.set(0xFF6FA0); lE.el.innerHTML = 'Hợp tử (2n)'; egg.userData.part = INFO.zyg;
        pol[0].visible = false; pol[1].scale.setScalar(1.35); pol[1].material.color.set(0xFFA53C); pol[1].material.emissiveIntensity = 1; lP.el.innerHTML = 'Nhân tam bội (3n)';
        [523, 659, 784, 1046].forEach((f, j) => api.beep(f, 0.4, 'sine', 0.09, j * 0.06)); api.noise(0.3, 0.06, 2500);
        fertilized = true; addLog('Thụ tinh kép', 'Hợp tử 2n + nhân tam bội 3n');
        api.toast('Thụ tinh kép xong! Kéo thanh tua nhanh ở tab Giải phẫu để xem quả và hạt');
      }
      const fl = t > 4 && t < 4.8 ? 1 - (t - 4) / 0.8 : 0; flash.material.opacity = fl * 0.7; flash.position.copy(egg.position); flash.scale.setScalar(1 + (1 - fl) * 2);
      if (t > 4.8) { egg.userData.m.material.emissiveIntensity = Math.max(0.2, egg.userData.m.material.emissiveIntensity - dt); pol[1].material.emissiveIntensity = Math.max(0.3, pol[1].material.emissiveIntensity - dt); }
      api.caption(t < 2 ? 'Ống phấn đi qua lỗ noãn vào một tế bào kèm' : t < 2.6 ? 'Ống phấn vỡ ra, giải phóng 2 tinh tử (n)' : t < 4 ? 'Tinh tử 1 → tế bào trứng; tinh tử 2 → 2 nhân cực ở trung tâm' : 'Thụ tinh 1: trứng (n) + tinh tử (n) = hợp tử (2n) · Thụ tinh 2: nhân cực (2n) + tinh tử (n) = nhân tam bội (3n)');
    });
    const st = api.note(`<b>Giai đoạn 3: Thụ tinh kép</b><br>Cả 2 tinh tử đều tham gia thụ tinh, chỉ có ở thực vật hạt kín.`);
    void st;
    api.button('▶ Thụ tinh kép', () => go());
    api.button('↺ Về trước thụ tinh', () => { fertilized = false; reset(); });
    api.slider({ label: '🚀 Tốc độ', min: 1, max: 10, step: 1, value: speed, unit: '×', lazy: true, onInput(v) { speed = v; } });
    commonCtl(api, o => { op = o; api.setOpacity(oi, o); api.setOpacity(ii, o); });
    api.view({ pos: [0, 0, 12], target: [0, -0.4, 0], min: 3, max: 22 });
  }

  function commonCtl(api, onOp) {
    api.slider({ label: 'Độ trong suốt cánh hoa, vòi, bầu', min: 0, max: 100, step: 5, value: Math.round((1 - op) * 100), unit: '%', lazy: true, onInput(v) { onOp(Math.max(0.05, 1 - v / 100)); } });
    api.checklist([
      { k: 'peri', label: 'Cánh hoa và Đài hoa' }, { k: 'stamen', label: 'Bộ nhị (Bao phấn, Chỉ nhị, Hạt phấn)' }, { k: 'pistil', label: 'Bộ nhụy (Đầu, Vòi, Bầu nhụy)' },
      { k: 'ovule', label: 'Noãn và Túi phôi' }, { k: 'tube', label: 'Ống phấn và 2 Tinh tử' }, { k: 'fruit', label: 'Vỏ Hạt và Thịt Quả' }
    ]);
  }

  function flowSVG() {
    const box = (x, y, w, t, c) => `<rect x="${x}" y="${y}" width="${w}" height="44" rx="12" fill="${c}" stroke="#1F4E79" stroke-width="1.5"/><text x="${x + w / 2}" y="${y + 27}" font-size="13" font-weight="800" fill="#1F4E79" text-anchor="middle">${t}</text>`;
    const ar = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#1F4E79" stroke-width="2" marker-end="url(#ah)"/>`;
    return `<svg viewBox="0 0 640 300" width="100%" style="max-height:300px;font-family:'Baloo 2',sans-serif"><defs><marker id="ah" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#1F4E79"/></marker></defs>` +
      box(10, 20, 190, 'Hạt phấn: 2 tinh tử (n)', '#FFF3C4') + box(10, 120, 190, 'Túi phôi: trứng (n), 2 nhân cực', '#FFE0EA') +
      box(240, 70, 140, 'Thụ tinh kép', '#DDEBFF') + ar(200, 42, 240, 85) + ar(200, 142, 240, 105) +
      box(420, 10, 200, 'Tinh tử + trứng → Hợp tử 2n', '#FFE0EA') + box(420, 130, 200, 'Tinh tử + 2n → Nhân 3n', '#FFE7C7') + ar(380, 85, 420, 35) + ar(380, 100, 420, 150) +
      box(450, 70, 140, 'Phôi', '#D9F2D0') + ar(520, 54, 520, 70) + box(450, 190, 140, 'Phôi nhũ', '#FFF3C4') + ar(520, 174, 520, 190) +
      box(240, 240, 160, 'Hạt (vỏ hạt từ vỏ noãn)', '#E9D9C9') + ar(450, 100, 400, 250) + ar(450, 212, 400, 258) +
      box(440, 250, 180, 'Quả (từ bầu nhụy)', '#FFD2CC') + ar(400, 262, 440, 270) + `</svg>`;
  }

  NL.m3d.register('M6', {
    title: 'Hoa và thụ tinh kép',
    tabs: [{ t: '🌺 Giải phẫu hoa', v: 'anat' }, { t: '🔬 Nhị & nhụy', v: 'micro' }, { t: '🥚 Túi phôi', v: 'sac' }],
    init() { ripe = 0; vector = 'none'; },
    build(api, tab) { if (tab === 'anat') anatTab(api); else if (tab === 'micro') microTab(api); else sacTab(api); },
    data() {
      return {
        title: 'Bộ nhiễm sắc thể và biến đổi sau thụ tinh',
        sub: `Thụ tinh kép: ${fertilized ? 'đã xảy ra' : 'chưa'} · Tua nhanh ${Math.round(ripe * 100)}% · ${fruitType === 'flesh' ? 'Quả thịt' : 'Quả khô'}`,
        sheets: [
          { name: 'Thụ tinh kép', head: ['STT', 'Tên cấu trúc trước thụ tinh', 'Bộ NST', 'Cấu trúc biến đổi tương ứng sau thụ tinh', 'Vai trò sinh học'], rows: [
            [1, 'Tế bào trứng', 'n', 'Hợp tử (2n) → Phôi', 'Phát triển thành cây con'],
            [2, '2 Nhân cực (nhân lưỡng bội)', 'n + n = 2n', 'Nhân tam bội (3n) → Phôi nhũ', 'Dự trữ dinh dưỡng nuôi phôi'],
            [3, 'Tinh tử thứ nhất', 'n', 'Kết hợp với trứng', 'Thụ tinh 1'],
            [4, 'Tinh tử thứ hai', 'n', 'Kết hợp với nhân lưỡng bội', 'Thụ tinh 2'],
            [5, 'Tế bào kèm (2)', 'n', 'Tiêu biến', 'Dẫn đường ống phấn, nơi ống phấn vỡ'],
            [6, 'Tế bào đối cực (3)', 'n', 'Tiêu biến', 'Tham gia nuôi túi phôi'],
            [7, 'Tế bào sinh dưỡng (hạt phấn)', 'n', 'Ống phấn', 'Dẫn tinh tử tới noãn'],
            [8, 'Tế bào sinh sản (hạt phấn)', 'n', 'Nguyên phân → 2 tinh tử', 'Tạo giao tử đực'],
            [9, 'Vỏ noãn', '2n', 'Vỏ hạt', 'Bảo vệ phôi'],
            [10, 'Noãn', '2n (vỏ, phôi tâm)', 'Hạt', 'Mang phôi, phát tán'],
            [11, 'Bầu nhụy', '2n', 'Quả', 'Bảo vệ hạt, giúp phát tán hạt'],
            [12, 'Cánh hoa, đài, nhị, vòi nhụy', '2n', 'Héo, rụng', 'Hoàn thành nhiệm vụ thu hút, thụ phấn']] },
          { name: 'Nhật ký thí nghiệm', head: ['STT', 'Thao tác', 'Kết quả'], rows: log.length ? log : [['–', 'Chưa có thao tác', '–']] }
        ],
        chart: { svg: flowSVG() }
      };
    },
    liveData: true
  });
})();
