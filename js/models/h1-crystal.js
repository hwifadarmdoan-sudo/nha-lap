// Mô hình Hóa 1: Mạng tinh thể. NaCl (ion), kim cương (nguyên tử), than chì (lớp), nước đá → nước lỏng → hơi nước theo nhiệt độ (liên kết hydrogen).
(function () {
  const C3 = () => NL.chem3d;
  const COMPARE = [
    ['NaCl (muối ăn)', 'Tinh thể ion', 'Ion Na⁺ và Cl⁻', 'Hút tĩnh điện giữa ion trái dấu (liên kết ion)', 801, '2,5', 'Không dẫn khi rắn; dẫn khi nóng chảy hoặc tan trong nước'],
    ['Kim cương', 'Tinh thể nguyên tử (cộng hóa trị)', 'Nguyên tử C', 'Liên kết cộng hóa trị C–C, mỗi C nối 4 C (tứ diện)', 3550, '10', 'Không dẫn điện'],
    ['Than chì', 'Tinh thể lớp', 'Nguyên tử C', 'Cộng hóa trị trong lớp (mỗi C nối 3 C); giữa các lớp chỉ có lực van der Waals yếu', 3650, '1–2', 'Dẫn điện tốt (electron π linh động trong lớp)'],
    ['Nước đá (H₂O rắn)', 'Tinh thể phân tử', 'Phân tử H₂O', 'Liên kết hydrogen giữa các phân tử; liên kết cộng hóa trị O–H bên trong phân tử', 0, '1,5', 'Gần như không dẫn điện']
  ];
  const HB_TREND = [[-50, 4.0], [-25, 4.0], [0, 4.0], [1, 3.6], [25, 3.45], [50, 3.3], [75, 3.15], [99, 3.0], [100, 0], [125, 0], [150, 0]];
  let cells = 2, fill = false, temp = -20, labels = true, slide = 0, flowE = true;
  let liveHB = 0, waterState = 'ice';

  // ---------- NaCl ----------
  function buildNaCl(api) {
    const T = api.T, d = 1.41, n = cells * 2, o = -n * d / 2;
    const INFO_NA = { name: 'Ion Na⁺ (cation sodium)', sci: 'Na⁺', rows: [['Hình thành', 'Na (2, 8, 1) nhường 1 electron lớp ngoài → Na⁺ (2, 8) bền như khí hiếm Ne'], ['Bán kính ion', '102 pm (nhỏ hơn nguyên tử Na 166 pm)'], ['Số phối trí', '6: mỗi Na⁺ được 6 Cl⁻ bao quanh theo hình bát diện'], ['Khoảng cách Na⁺–Cl⁻', '282 pm (0,282 nm)']], text: 'Chạm vào ion để thấy 6 ion trái dấu xung quanh nó.' };
    const INFO_CL = { name: 'Ion Cl⁻ (anion chloride)', sci: 'Cl⁻', rows: [['Hình thành', 'Cl (2, 8, 7) nhận 1 electron → Cl⁻ (2, 8, 8) bền như khí hiếm Ar'], ['Bán kính ion', '181 pm (lớn hơn nguyên tử Cl 102 pm)'], ['Số phối trí', '6 ion Na⁺'], ['Mạng', 'Lập phương tâm mặt, cạnh ô mạng a = 564 pm']] };
    const ions = [], grid = {};
    for (let i = 0; i <= n; i++) for (let j = 0; j <= n; j++) for (let k = 0; k <= n; k++) {
      const cl = (i + j + k) % 2 === 0, r = fill ? (cl ? 0.9 : 0.51) : (cl ? 0.42 : 0.25);
      const m = api.sphere(r, api.mat(cl ? 0x34D399 : 0xA78BFA, { roughness: 0.3 }), [o + i * d, o + j * d, o + k * d], null, fill ? 24 : 18);
      api.tag(m, cl ? 'cl' : 'na'); api.part(m, Object.assign(cl ? INFO_CL : INFO_NA, { zoom: 6, onSelect: showCoord }));
      m.userData.ijk = [i, j, k]; grid[i + ',' + j + ',' + k] = m; ions.push(m);
    }
    if (!fill) {
      const pts = [];
      ions.forEach(m => { const [i, j, k] = m.userData.ijk; [[1, 0, 0], [0, 1, 0], [0, 0, 1]].forEach(([a, b, c]) => { const q = grid[(i + a) + ',' + (j + b) + ',' + (k + c)]; if (q) pts.push(m.position, q.position); }); });
      const geo = new T.BufferGeometry().setFromPoints(pts), ls = new T.LineSegments(geo, new T.LineBasicMaterial({ color: 0x8FA3B8, transparent: true, opacity: 0.55 }));
      ls.userData.noPick = true; api.root.add(ls); api.tag(ls, 'stick');
    }
    // ô mạng cơ sở
    const a = 2 * d, box = new T.LineSegments(new T.EdgesGeometry(new T.BoxGeometry(a, a, a)), new T.LineBasicMaterial({ color: 0xFACC15 }));
    box.position.set(o + d, o + d, o + d); box.userData.noPick = true; api.root.add(box); api.tag(box, 'cell');
    let coord = [];
    function showCoord(m) {
      coord.forEach(x => x.parent && x.parent.remove(x)); coord = [];
      const [i, j, k] = m.userData.ijk;
      [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]].forEach(([x, y, z]) => {
        const q = grid[(i + x) + ',' + (j + y) + ',' + (k + z)]; if (!q) return;
        const l = api.lineBetween(m.position, q.position, 0.05, api.mat(0xFDE047, { emissive: 0xFDE047, emissiveIntensity: 0.8 })); l.userData.noPick = true; coord.push(l);
      });
      api.caption(`Số phối trí: ${coord.length} ion trái dấu ở sát bên${coord.length < 6 ? ' (ion ở mặt ngoài nên thiếu bớt)' : ''}`);
    }
    api.onFrame(() => { if (!api.sel && coord.length) { coord.forEach(x => x.parent && x.parent.remove(x)); coord = []; } });
    api.label('Na⁺', [o - 0.9, o + n * d + 0.6, o], { cls: 'tag', color: '#A78BFA' }); api.label('Cl⁻', [o + 0.5, o + n * d + 0.6, o], { cls: 'tag', color: '#34D399' });
    api.choices({ label: 'Số ô mạng mỗi cạnh', items: [{ t: '1 ô', v: 1 }, { t: '2 × 2 × 2', v: 2 }, { t: '3 × 3 × 3', v: 3 }], value: cells, onPick(v) { cells = v; api.setTab('nacl'); } });
    api.choices({ label: 'Kiểu hiển thị', items: [{ t: 'Quả cầu – que', v: 0 }, { t: 'Đặc khít (đúng tỉ lệ)', v: 1 }], value: fill ? 1 : 0, onPick(v) { fill = !!v; api.setTab('nacl'); } });
    api.checklist([{ k: 'na', label: '<span style="color:#A78BFA">●</span> Ion Na⁺' }, { k: 'cl', label: '<span style="color:#34D399">●</span> Ion Cl⁻' }, { k: 'cell', label: 'Khung ô mạng cơ sở' }].concat(fill ? [] : [{ k: 'stick', label: 'Que nối (chỉ để dễ nhìn)' }]));
    api.note('Tinh thể NaCl <b>không có phân tử riêng lẻ</b>: mỗi ion bị 6 ion trái dấu hút đều về mọi phía. Vì vậy công thức NaCl chỉ cho biết tỉ lệ 1 : 1.');
    api.view({ pos: [n * d * 1.3, n * d * 0.9, n * d * 1.6], target: [0, 0, 0], min: 2, max: 40 });
  }

  // ---------- kim cương ----------
  function buildDiamond(api) {
    const T = api.T, a = 3.2, n = 2, o = -n * a / 2, base = [[0, 0, 0], [0, .5, .5], [.5, 0, .5], [.5, .5, 0]];
    const pts = [];
    for (let i = -1; i <= n; i++) for (let j = -1; j <= n; j++) for (let k = -1; k <= n; k++) base.forEach(b => [0, 0.25].forEach(s => {
      const p = [(i + b[0] + s) * a, (j + b[1] + s) * a, (k + b[2] + s) * a];
      if (p.every(v => v >= -0.01 && v <= n * a + 0.01)) pts.push(new T.Vector3(p[0] + o, p[1] + o, p[2] + o));
    }));
    const L = Math.sqrt(3) / 4 * a, INFO = { name: 'Nguyên tử carbon (lai hóa sp³)', sci: 'C', rows: [['Liên kết', 'Mỗi C liên kết cộng hóa trị với 4 C khác'], ['Góc liên kết', '109,5° (tứ diện đều)'], ['Độ dài C–C', '154 pm'], ['Năng lượng C–C', '≈ 347 kJ/mol']], zoom: 5 };
    const bondsG = api.group(); api.tag(bondsG, 'bond');
    const bondInfo = { name: 'Liên kết cộng hóa trị C–C', sci: 'σ', rows: [['Độ dài', '154 pm'], ['Năng lượng', '≈ 347 kJ/mol'], ['Vì sao kim cương cứng nhất?', 'Mạng liên kết bền chặt theo cả 3 chiều, muốn làm xước phải bẻ hàng loạt liên kết C–C']] };
    for (let x = 0; x < pts.length; x++) for (let y = x + 1; y < pts.length; y++) if (Math.abs(pts[x].distanceTo(pts[y]) - L) < 0.05) api.part(api.lineBetween(pts[x], pts[y], 0.08, api.mat(C3().SIGMA), bondsG), bondInfo);
    pts.forEach(p => { const m = C3().atom(api, 'C', p); api.part(m, INFO); api.tag(m, 'atom'); });
    // tô 1 tứ diện mẫu
    const c = pts.reduce((best, p) => p.length() < best.length() ? p : best, pts[0]);
    const near = pts.filter(p => Math.abs(p.distanceTo(c) - L) < 0.05);
    if (near.length >= 2) C3().angleArc(api, c, near[0].clone().sub(c), near[1].clone().sub(c), 0.55, null, '109,5°');
    api.checklist([{ k: 'atom', label: 'Nguyên tử C' }, { k: 'bond', label: 'Liên kết C–C' }, { k: 'ang', label: 'Góc tứ diện' }]);
    api.note('Mỗi nguyên tử C nối với <b>4</b> nguyên tử C khác thành khung tứ diện kéo dài khắp tinh thể: kim cương là chất tự nhiên <b>cứng nhất</b> (độ cứng 10) và <b>không dẫn điện</b> vì không còn electron tự do.');
    api.view({ pos: [9, 7, 12], target: [0, 0, 0], min: 2, max: 30 });
  }

  // ---------- than chì ----------
  function buildGraphite(api) {
    const T = api.T, b = 1.28, gap = 3.0, R = 5.2, layers = [];
    const INFO = { name: 'Nguyên tử carbon (lai hóa sp²)', sci: 'C', rows: [['Liên kết', 'Mỗi C nối 3 C khác trong cùng lớp thành lục giác'], ['Góc liên kết', '120°'], ['Độ dài C–C trong lớp', '142 pm'], ['Electron thứ 4', 'Không tham gia liên kết σ, chạy tự do trong lớp → than chì dẫn điện']] };
    const VDW = { name: 'Lực van der Waals giữa các lớp', sci: 'van der Waals', rows: [['Khoảng cách 2 lớp', '335 pm (gấp hơn 2 lần C–C trong lớp)'], ['Độ mạnh', 'Rất yếu so với liên kết cộng hóa trị'], ['Hệ quả', 'Các lớp dễ trượt lên nhau: than chì mềm, để lại vệt đen trên giấy (ruột bút chì)']] };
    for (let L = 0; L < 3; L++) {
      const g = api.group(null, [L === 2 ? slide : 0, (L - 1) * gap, 0]); api.tag(g, 'layer' + L);
      const sh = L % 2 ? b : 0, pts = [];
      for (let i = -6; i <= 6; i++) for (let j = -6; j <= 6; j++) [[0, 0], [0, b]].forEach(([dx, dz]) => {
        const x = i * Math.sqrt(3) * b + j * Math.sqrt(3) / 2 * b + dx, z = j * 1.5 * b + dz + sh;
        if (x * x + z * z < R * R) pts.push(new T.Vector3(x, 0, z));
      });
      for (let x = 0; x < pts.length; x++) for (let y = x + 1; y < pts.length; y++) if (Math.abs(pts[x].distanceTo(pts[y]) - b) < 0.05) api.lineBetween(pts[x], pts[y], 0.07, api.mat(C3().SIGMA), g).userData.noPick = true;
      pts.forEach(p => { const m = C3().atom(api, 'C', p, g, { scale: 0.85, seg: 16 }); api.part(m, INFO); });
      layers.push({ g, pts });
    }
    // lực van der Waals: nét đứt nối nguyên tử chồng thẳng hàng giữa 2 lớp
    const vd = C3().dashes(api, 200, 0x94A3B8);
    const vpairs = () => {
      const out = [];
      for (let L = 0; L < 2; L++) { const A = layers[L], B = layers[L + 1]; A.pts.forEach(p => { const w = p.clone().add(A.g.position); B.pts.forEach(q => { const u = q.clone().add(B.g.position); if (Math.hypot(w.x - u.x, w.z - u.z) < 0.15) out.push([w, u]); }); }); }
      return out;
    };
    vd.set(vpairs()); api.tag(vd.obj, 'vdw');
    const vdHit = api.mesh(new T.CylinderGeometry(R, R, gap * 2, 32, 1, true), api.mat(0x94A3B8, { opacity: 0.04, depthWrite: false, side: T.DoubleSide }), [0, 0, 0]); api.part(vdHit, VDW); vdHit.userData.group = 'vdw';
    // electron π tự do chạy trong lớp
    const es = [];
    layers.forEach(Lr => { for (let k = 0; k < 14; k++) { const e = api.sphere(0.09, api.mat(0xFDE047, { emissive: 0xFDE047, emissiveIntensity: 1.2 }), null, Lr.g, 10); e.userData.noPick = true; e.userData.a = Math.random() * 6.28; e.userData.r = Math.random() * (R - 0.5); e.userData.w = (Math.random() - 0.5) * 2; api.tag(e, 'epi'); es.push(e); } });
    api.onFrame(dt => es.forEach(e => {
      const u = e.userData; if (!flowE) { e.visible = false; return; } e.visible = true;
      u.a += u.w * dt; u.r += Math.sin(api.time * 3 + u.a) * dt * 0.6; u.r = Math.max(0.2, Math.min(R - 0.4, u.r));
      e.position.set(Math.cos(u.a) * u.r, 0.25 * Math.sin(api.time * 9 + u.a * 3), Math.sin(u.a) * u.r);
    }));
    api.slider({ label: '↔ Trượt lớp trên cùng', min: 0, max: 4, step: 0.1, value: slide, unit: 'đv', lazy: true, onInput(v) { slide = v; layers[2].g.position.x = v; vd.set(vpairs()); if (v >= 2) api.toast('Các lớp trượt rất dễ vì chỉ giữ nhau bằng lực van der Waals yếu'); } });
    api.toggle({ label: '⚡ Electron tự do trong lớp', value: flowE, onChange(v) { flowE = v; } });
    api.checklist([{ k: 'layer0', label: 'Lớp dưới' }, { k: 'layer1', label: 'Lớp giữa' }, { k: 'layer2', label: 'Lớp trên' }, { k: 'vdw', label: 'Lực van der Waals (nét đứt)' }]);
    api.note('Trong mỗi lớp, C nối 3 C thành lưới lục giác rất bền. Giữa các lớp chỉ có lực van der Waals yếu: than chì <b>mềm</b>, <b>trơn</b> và <b>dẫn điện</b>, trái ngược kim cương dù cùng là carbon.');
    api.view({ pos: [9, 6, 10], target: [0, 0, 0], min: 3, max: 35 });
  }

  // ---------- nước đá / nước lỏng / hơi nước ----------
  function buildWater(api) {
    const T = api.T, V = api.V, bond = 1.66, a = bond / 0.6124, c = a * Math.sqrt(8 / 3), R = api.rand(7);
    // mạng nước đá lục giác (Ih): nguyên tử O xếp như wurtzite
    const basis = [[0, 0, 0], [2 / 3, 1 / 3, 0.5], [0, 0, 0.375], [2 / 3, 1 / 3, 0.875]];
    const Opos = [];
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) for (let k = 0; k < 2; k++) basis.forEach(b => {
      const u = i + b[0], v = j + b[1], w = k + b[2];
      Opos.push(V((u + v * 0.5) * a, w * c, v * Math.sqrt(3) / 2 * a));
    });
    const ctr = Opos.reduce((s, p) => s.add(p), V(0, 0, 0)).multiplyScalar(1 / Opos.length); Opos.forEach(p => p.sub(ctr));
    const N = Opos.length, nb = Opos.map(() => []);
    for (let x = 0; x < N; x++) for (let y = x + 1; y < N; y++) if (Math.abs(Opos[x].distanceTo(Opos[y]) - bond) < 0.08) { nb[x].push(y); nb[y].push(x); }
    // quy tắc băng (gần đúng): mỗi O giữ đúng 2 H, mỗi cặp O–O chỉ 1 H
    const hdir = Opos.map(() => []), edges = [];
    nb.forEach((l, x) => l.forEach(y => { if (x < y) edges.push([x, y]); }));
    edges.sort(() => R() - 0.5).forEach(([x, y]) => { const s = hdir[x].length <= hdir[y].length ? [x, y] : [y, x]; if (hdir[s[0]].length < 2) hdir[s[0]].push(Opos[s[1]].clone().sub(Opos[s[0]]).normalize()); });
    const INFO_W = { name: 'Phân tử nước H₂O', sci: 'H₂O', rows: [['Liên kết trong phân tử', '2 liên kết cộng hóa trị O–H phân cực (dài 96 pm, ≈ 463 kJ/mol)'], ['Góc H–O–H', '104,5°'], ['Liên kết hydrogen', 'H (δ+) của phân tử này hút O (δ−) của phân tử bên cạnh, ≈ 20 kJ/mol, yếu hơn O–H khoảng 20 lần']], zoom: 6 };
    const mols = Opos.map((p, x) => {
      const g = api.group(null, [p.x, p.y, p.z]);
      while (hdir[x].length < 2) { const t = C3().tetraFill(T, hdir[x], 1)[0] || V(R() - 0.5, R() - 0.5, R() - 0.5).normalize(); hdir[x].push(t); }
      C3().atom(api, 'O', [0, 0, 0], g, { scale: 0.9, seg: 16 });
      const hs = hdir[x].map(d => C3().atom(api, 'H', d.clone().multiplyScalar(0.58), g, { scale: 0.6, seg: 12 }));
      hs.forEach(h => api.lineBetween(V(0, 0, 0), h.position, 0.06, api.mat(0xE2E8F0), g).userData.noPick = true);
      api.part(g, INFO_W);
      const q0 = new T.Quaternion();
      return { g, hs, L: p.clone(), q0, vel: V(R() - 0.5, R() - 0.5, R() - 0.5), spin: V(R() - 0.5, R() - 0.5, R() - 0.5) };
    });
    const box = new T.Box3().setFromPoints(Opos), half = box.getSize(V(0, 0, 0)).multiplyScalar(0.5);
    const hb = C3().dashes(api, 400, 0x5EEAD4, null, { dots: 4, r: 0.075 }); api.tag(hb.obj, 'hb');
    let tHB = 0, pairs = [];
    const wp = new T.Vector3(), wq = new T.Vector3();
    api.onFrame((dt) => {
      const st = temp <= 0 ? 'ice' : temp < 100 ? 'liq' : 'gas';
      waterState = st;
      const kT = Math.sqrt((temp + 273) / 273), lim = st === 'gas' ? half.clone().multiplyScalar(2.3) : half.clone().multiplyScalar(st === 'liq' ? 0.98 : 1.05);
      mols.forEach(m => {
        if (st === 'ice') {
          m.g.position.lerp(m.L, Math.min(1, dt * 3)); m.g.quaternion.slerp(m.q0, Math.min(1, dt * 3));
          m.g.position.x += Math.sin(api.time * 30 + m.L.y) * 0.002 * kT;
        } else {
          const sp = (st === 'gas' ? 6 : 1.1) * kT;
          m.vel.add(V(R() - 0.5, R() - 0.5, R() - 0.5).multiplyScalar(dt * (st === 'gas' ? 4 : 10)));
          m.vel.setLength(sp);
          m.g.position.addScaledVector(m.vel, dt);
          ['x', 'y', 'z'].forEach(ax => { if (Math.abs(m.g.position[ax]) > lim[ax]) { m.g.position[ax] = Math.sign(m.g.position[ax]) * lim[ax]; m.vel[ax] *= -1; } });
          m.g.rotateOnAxis(m.spin.clone().normalize(), dt * (st === 'gas' ? 4 : 1.5) * kT);
        }
      });
      tHB -= dt;
      if (tHB <= 0) {
        tHB = st === 'liq' ? 0.18 : 0.5; pairs = [];
        if (st !== 'gas') {
          const keep = st === 'ice' ? 1 : 0.8 - 0.12 * temp / 100;
          for (let x = 0; x < N; x++) for (let y = 0; y < N; y++) {
            if (x === y) continue;
            const d = mols[x].g.position.distanceTo(mols[y].g.position); if (d > (st === 'ice' ? bond + 0.15 : 2.05)) continue;
            let best = null, bd = 9;
            mols[x].hs.forEach(h => { h.getWorldPosition(wp); const dd = wp.distanceTo(mols[y].g.position); if (dd < bd) { bd = dd; best = wp.clone(); } });
            if (st === 'ice' ? bd < 1.2 : (R() < keep / 2 && bd < 1.7)) pairs.push([best, mols[y].g.position.clone()]);
          }
        }
        liveHB = 2 * pairs.length / N;
      }
      hb.set(st === 'ice' ? pairs : pairs.filter((p, k) => (k + Math.floor(api.time * 8)) % 5 !== 0));
      api.caption(`${temp} °C · ${st === 'ice' ? 'Nước đá: liên kết hydrogen cố định' : st === 'liq' ? 'Nước lỏng: liên kết hydrogen liên tục đứt và tạo lại' : 'Hơi nước: liên kết hydrogen bị phá vỡ'} · trung bình ${liveHB.toFixed(1).replace('.', ',')} liên kết H / phân tử`);
    });
    const stateNote = api.note('');
    const setNote = () => stateNote.set(temp <= 0
      ? `<b>Nước đá (${temp} °C)</b>: mỗi phân tử nối 4 phân tử khác bằng liên kết hydrogen thành mạng lục giác <b>rỗng</b> → nước đá nhẹ hơn nước lỏng (0,917 so với 1,000 g/cm³) nên băng nổi.`
      : temp < 100 ? `<b>Nước lỏng (${temp} °C)</b>: các phân tử trượt qua nhau, liên kết hydrogen đứt và tạo lại liên tục.` : `<b>Hơi nước (${temp} °C)</b>: các phân tử bay tự do, cách xa nhau, không còn liên kết hydrogen.`);
    api.slider({ label: '🌡 Nhiệt độ', min: -50, max: 150, step: 1, value: temp, unit: '°C', onInput(v) {
      temp = v; setNote();
      if (v >= 1 && v <= 99) api.warn('liq', 'Nước lỏng! Các liên kết hydrogen <b>không biến mất</b> mà liên tục đứt gãy và tái tạo, giúp nước có tính lưu động. Liên kết cộng hóa trị O–H bên trong phân tử vẫn bền vững.', '💧 Thông điệp khoa học');
      if (v >= 100) api.warn('gas', 'Nước hóa hơi! Nhiệt năng đủ lớn để phá vỡ các liên kết hydrogen giữa các phân tử. Tuy nhiên, phân tử H₂O <b>không hề bị phân hủy</b> thành H₂ và O₂: liên kết O–H vẫn nguyên vẹn!', '♨️ Thông điệp khoa học');
    } });
    api.checklist([{ k: 'hb', label: '<span style="color:#67E8F9">- -</span> Liên kết hydrogen' }]);
    api.note(`Mô hình có ${N} phân tử nước. Nét đứt xanh là liên kết hydrogen.`);
    api.view({ pos: [3, 12, 7], target: [0, 0, 0], min: 3, max: 40 });
  }

  NL.m3d.register('HM1', {
    title: 'Mạng tinh thể',
    tabs: [{ t: '🧂 NaCl', v: 'nacl' }, { t: '💎 Kim cương', v: 'diamond' }, { t: '✏️ Than chì', v: 'graphite' }, { t: '🧊 Nước đá → hơi', v: 'water' }],
    init() { slide = 0; temp = -20; },
    build(api, tab) {
      if (tab === 'nacl') buildNaCl(api); else if (tab === 'diamond') buildDiamond(api); else if (tab === 'graphite') buildGraphite(api); else buildWater(api);
    },
    data(api) {
      const water = api.tab === 'water';
      return {
        title: water ? 'Liên kết hydrogen của nước theo nhiệt độ' : 'So sánh 4 loại mạng tinh thể',
        sub: water ? `Đang xem: ${temp} °C, mô hình đếm được trung bình ${liveHB.toFixed(1).replace('.', ',')} liên kết H mỗi phân tử (phân tử ở mặt ngoài có ít hơn)` : 'Nhiệt độ nóng chảy cao khi lực giữ các hạt mạnh',
        sheets: [
          { name: 'So sánh tinh thể', head: ['Chất', 'Loại tinh thể', 'Hạt ở nút mạng', 'Lực liên kết giữa các hạt', 'Nhiệt độ nóng chảy (°C)', 'Độ cứng (thang Mohs)', 'Tính dẫn điện'], rows: COMPARE.map(r => [r[0], r[1], r[2], r[3], r[4] === 3550 ? '≈ 3550 (ở áp suất cao)' : r[4] === 3650 ? '≈ 3650 (thăng hoa)' : r[4], r[5], r[6]]) },
          { name: 'Nước theo nhiệt độ', head: ['Nhiệt độ (°C)', 'Trạng thái', 'Liên kết H trung bình mỗi phân tử (ước lượng)', 'Liên kết O–H trong phân tử'], rows: HB_TREND.map(([t, h]) => [t, t <= 0 ? 'Rắn' : t < 100 ? 'Lỏng' : 'Khí', h.toFixed(2).replace('.', ','), 'Còn nguyên']) }
        ],
        chart: water
          ? { type: 'line', title: 'Số liên kết hydrogen mỗi phân tử nước', xMin: -50, xMax: 150, yMax: 5, series: [{ name: 'Liên kết H / phân tử', color: '#38BDF8', points: HB_TREND }], yLabel: 'Liên kết H / phân tử', xLabel: 'Nhiệt độ (°C)' }
          : { title: 'Nhiệt độ nóng chảy (°C)', max: 4000, labels: ['NaCl', 'Kim cương', 'Than chì', 'Nước đá'], series: [{ name: 'Nhiệt độ nóng chảy', color: '#F59E0B', values: COMPARE.map(r => r[4]) }], yLabel: '°C' }
      };
    },
    liveData: true
  });
})();
