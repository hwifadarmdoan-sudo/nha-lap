// Mô hình Hóa 5: Orbital nguyên tử. 23 nguyên tố (H → Ca, Fe, Cu, Zn); orbital s / p / d dạng bề mặt hoặc đám mây xác suất, so với mô hình Bohr; ô orbital theo Aufbau, Pauli, Hund.
(function () {
  const C3 = () => NL.chem3d;
  const LIST = [...Array(20)].map((_, k) => k + 1).concat([26, 29, 30]);
  const IE1 = { 1: 1312, 2: 2372, 3: 520, 4: 899, 5: 801, 6: 1086, 7: 1402, 8: 1314, 9: 1681, 10: 2081, 11: 496, 12: 738, 13: 578, 14: 787, 15: 1012, 16: 1000, 17: 1251, 18: 1521, 19: 419, 20: 590, 26: 762, 29: 745, 30: 906 };
  const NEU = { 1: 0, 2: 2, 3: 4, 4: 5, 5: 6, 6: 6, 7: 7, 8: 8, 9: 10, 10: 10, 11: 12, 12: 12, 13: 14, 14: 14, 15: 16, 16: 16, 17: 18, 18: 22, 19: 20, 20: 20, 26: 30, 29: 34, 30: 34 };
  const COL = { s: 0x38BDF8, p: 0xF59E0B, d: 0xC084FC };
  const RN = [0, 0.55, 1.25, 2.05, 2.85];
  const ORBS = { s: [''], p: ['x', 'y', 'z'], d: ['xy', 'xz', 'yz', 'x²−y²', 'z²'] };
  let Z = 8, view = 'surf', hidden = {};
  // điền electron theo quy tắc Hund: mỗi orbital 1 electron trước, rồi mới ghép đôi
  function fill(e, k) { const o = Array(k).fill(0); for (let i = 0; i < e; i++) o[i % k]++; return o; }
  const SHELL = 'KLMN';

  function angOK(l, name, v, R) {
    if (l === 's') return true;
    const { x, y, z } = v;
    // trục: x ngang, y dọc màn hình, z hướng về người xem (pz vẽ theo trục dọc cho dễ nhìn)
    const a = { x: x, y: z, z: y }, f = { xy: (2 * x * z) ** 2, xz: (2 * x * y) ** 2, yz: (2 * z * y) ** 2, 'x²−y²': (x * x - z * z) ** 2, 'z²': ((3 * y * y - 1) ** 2) / 4 };
    const p = l === 'p' ? a[name] ** 2 : f[name];
    return R() < p;
  }
  function samplePts(T, n, l, name, count, R) {
    const out = [];
    while (out.length < count * 3) {
      const v = new T.Vector3(R() - 0.5, R() - 0.5, R() - 0.5); if (v.lengthSq() > 0.25 || v.lengthSq() < 1e-4) continue; v.normalize();
      if (!angOK(l, name, v, R)) continue;
      const g = -Math.log(R() * R() * R() + 1e-9) / 3;
      out.push(v.multiplyScalar(RN[n] * g * (l === 's' ? 1 : 1.15)));
    }
    return out;
  }
  // bề mặt orbital
  function lobes(api, n, l, name, color, g) {
    const T = api.T, V = api.V, s = RN[n];
    const lobeAt = (dir, len, w) => { const m = api.mesh(new T.SphereGeometry(1, 28, 18), api.mat(color, { opacity: 0.42, depthWrite: false, emissive: color, emissiveIntensity: 0.25 }), null, g); m.scale.set(w, len, w); m.position.copy(dir.clone().multiplyScalar(len)); m.quaternion.setFromUnitVectors(V(0, 1, 0), dir); return m; };
    if (l === 's') { const m = api.mesh(new T.SphereGeometry(s, 36, 24), api.mat(color, { opacity: n === 1 ? 0.5 : 0.22, depthWrite: false, emissive: color, emissiveIntensity: 0.2 }), null, g); return [m]; }
    if (l === 'p') { const ax = { x: V(1, 0, 0), y: V(0, 0, 1), z: V(0, 1, 0) }[name]; return [lobeAt(ax, s * 0.7, s * 0.38), lobeAt(ax.clone().negate(), s * 0.7, s * 0.38)]; }
    const q = Math.SQRT1_2, P = {
      xy: [V(q, 0, q), V(-q, 0, -q), V(q, 0, -q), V(-q, 0, q)], xz: [V(q, q, 0), V(-q, -q, 0), V(q, -q, 0), V(-q, q, 0)], yz: [V(0, q, q), V(0, -q, -q), V(0, q, -q), V(0, -q, q)],
      'x²−y²': [V(1, 0, 0), V(-1, 0, 0), V(0, 0, 1), V(0, 0, -1)]
    };
    if (name === 'z²') {
      const a = lobeAt(V(0, 1, 0), s * 0.62, s * 0.3), b = lobeAt(V(0, -1, 0), s * 0.62, s * 0.3);
      const t = api.mesh(new T.TorusGeometry(s * 0.42, s * 0.13, 12, 40), api.mat(color, { opacity: 0.42, depthWrite: false, emissive: color, emissiveIntensity: 0.25 }), null, g); t.rotation.x = Math.PI / 2;
      return [a, b, t];
    }
    return P[name].map(d => lobeAt(d, s * 0.5, s * 0.24));
  }

  function build(api) {
    const T = api.T, V = api.V, R = api.rand(Z * 7 + 1);
    const e = C3().EL[Z - 1], subs = C3().subshells(Z), sh = C3().shells(Z);
    // hạt nhân và trục
    const nuc = api.sphere(0.12, api.mat(0xEF4444, { emissive: 0xEF4444, emissiveIntensity: 0.6 }), [0, 0, 0]);
    api.part(nuc, { name: `Hạt nhân ${e.sym}`, rows: [['Proton', `${Z}`], ['Neutron', `${NEU[Z]} (đồng vị phổ biến nhất)`]], focus: false });
    const axG = api.group(); api.tag(axG, 'axis');
    [[V(4, 0, 0), 'x'], [V(0, 0, 4), 'y'], [V(0, 4, 0), 'z']].forEach(([d, t]) => { const l = api.lineBetween(d.clone().negate(), d, 0.01, api.mat(0x64748B, { opacity: 0.6 }), axG); l.userData.noPick = true; const lb = api.label(t, d.clone().multiplyScalar(1.05), { cls: 'tag', color: '#94A3B8' }); lb.el.dataset.ax = 1; });
    if (view === 'bohr') {
      const es = [];
      sh.forEach((n, i) => {
        const r = 0.7 + 0.75 * i;
        api.mesh(new T.TorusGeometry(r, 0.015, 6, 100), api.mat(0x93C5FD, { opacity: 0.6, emissive: 0x93C5FD, emissiveIntensity: 0.4 })).userData.noPick = true;
        for (let k = 0; k < n; k++) { const m = api.sphere(0.09, api.mat(0xFDE047, { emissive: 0xFDE047, emissiveIntensity: 1 }), null, null, 10); m.userData.noPick = true; es.push({ m, r, a: k / n * 6.283, w: 1.5 / (i + 1) }); }
        api.label(`Lớp ${SHELL[i]}: ${n}e`, [r * 0.72, r * 0.72 + 0.1, 0], { cls: 'tag', color: '#93C5FD' });
      });
      api.onFrame(dt => es.forEach(o => { o.a += o.w * dt; o.m.position.set(Math.cos(o.a) * o.r, Math.sin(o.a) * o.r, 0); }));
      setTimeout(() => api.warn('bohr', 'Trong thực tế lượng tử, electron <b>không</b> di chuyển trên các quỹ đạo tròn cố định như mô hình Bohr. Chúng chuyển động rất nhanh, không theo quỹ đạo xác định, tạo thành <b>đám mây xác suất</b>; orbital là vùng có khoảng 90% khả năng tìm thấy electron!', '⚛️ Thông điệp khoa học'), 400);
    } else {
      subs.forEach((ss, si) => {
        const occ = fill(ss.e, ORBS[ss.l].length), base = new T.Color(COL[ss.l]).offsetHSL(0, 0, (ss.n - 2) * 0.06).getHex();
        const sg = api.group(); api.tag(sg, 'sub' + ss.sub);
        ORBS[ss.l].forEach((nm, k) => {
          if (!occ[k]) return;
          const og = api.group(sg), label = ss.sub + nm;
          if (view === 'surf') lobes(api, ss.n, ss.l, nm, base, og);
          else {
            const pts = samplePts(T, ss.n, ss.l, nm, 140 * occ[k], R);
            const geo = new T.BufferGeometry().setFromPoints(pts);
            const p = new T.Points(geo, new T.PointsMaterial({ color: base, size: 0.06, transparent: true, opacity: 0.85, depthWrite: false })); og.add(p);
            // vỏ vô hình để chạm được vào đám mây
            const hit = api.mesh(new T.SphereGeometry(RN[ss.n] * (ss.l === 's' ? 1 : 1.25), 16, 12), api.mat(base, { opacity: 0.02, depthWrite: false }), null, og); void hit;
          }
          api.part(og, { name: `Orbital ${label}`, sci: ss.l.toUpperCase() + ' orbital', rows: [['Phân lớp', ss.sub], ['Lớp electron', `n = ${ss.n} (lớp ${SHELL[ss.n - 1]})`], ['Thứ tự năng lượng', `Phân lớp thứ ${si + 1} được điền (Aufbau)`], ['Số electron trong orbital này', occ[k] + (occ[k] === 2 ? ' (↑↓ ghép đôi, spin ngược chiều: nguyên lí Pauli)' : ' (↑ độc thân: quy tắc Hund)')], ['Hình dạng', ss.l === 's' ? 'Hình cầu' : ss.l === 'p' ? 'Hình số 8 nổi (2 thùy)' : nm === 'z²' ? '2 thùy và 1 vành khuyên' : 'Hoa 4 cánh']], zoom: 3 });
        });
        sg.visible = !hidden[ss.sub];
      });
    }
    // ô orbital (Aufbau – Pauli – Hund)
    const box = subs.map(ss => { const occ = fill(ss.e, ORBS[ss.l].length); return `<div class="sub"><div class="row">${occ.map(o => `<div class="ob">${o === 2 ? '↑↓' : o === 1 ? '↑' : ''}</div>`).join('')}</div>${ss.sub}<sup>${ss.e}</sup></div>`; }).join('');
    api.overlay(`<div class="hm-card"><b style="font-size:1.2em">${e.sym}</b> · ${e.vi} (Z = ${Z}) · ${sh.map((n, i) => SHELL[i] + n).join(' ')}<br><span style="font-size:.95em">${C3().config(Z)}</span><div class="hm-boxes" style="margin-top:6px">${box}</div></div>`, 'hm-tl');
    api.caption(`${e.sym}: ${C3().config(Z)}`);
    if (Z === 19 || Z === 20) setTimeout(() => api.warn('4s3d', `Tại nguyên tử K (Z = 19) và Ca (Z = 20), electron thứ 19 và 20 điền vào orbital <b>4s trước 3d</b> vì phân lớp 4s lúc này có mức năng lượng thấp hơn 3d!`, '⚛️ Thông điệp khoa học'), 500);
    if (Z === 29) setTimeout(() => api.toast('Cu là trường hợp đặc biệt: 3d¹⁰4s¹ (phân lớp d bão hòa bền hơn)'), 500);
    // điều khiển
    api.choices({ label: '🧪 Chọn nguyên tố', items: LIST.map(z => ({ t: C3().EL[z - 1].sym, v: z })), value: Z, onPick(z) { Z = z; hidden = {}; api.beep(880, 0.12, 'sine', 0.06); api.setTab(api.tab); } });
    api.choices({ label: 'Cách nhìn electron', items: [{ t: '☁️ Bề mặt orbital', v: 'surf' }, { t: '✨ Đám mây xác suất', v: 'cloud' }, { t: '🪐 Mô hình Bohr (cũ)', v: 'bohr' }], value: view, onPick(v) { view = v; api.setTab(api.tab); } });
    if (view !== 'bohr') api.checklist(subs.map(ss => ({ k: ss.sub, label: `<span style="color:#${COL[ss.l].toString(16)}">●</span> Phân lớp ${ss.sub} (${ss.e}e)`, on: !hidden[ss.sub] })), (k, on) => { hidden[k] = !on; api.groupVis('sub' + k, on); });
    api.toggle({ label: 'Trục tọa độ x, y, z', value: true, onChange(v) { api.groupVis('axis', v); document.querySelectorAll('.m3d-lab[data-ax]').forEach(el => { el.style.visibility = v ? '' : 'hidden'; }); } });
    api.note('<span style="color:#38BDF8">●</span> s · <span style="color:#F59E0B">●</span> p · <span style="color:#C084FC">●</span> d. Chỉ vẽ các orbital có electron. Chạm vào một thùy để xem chi tiết.');
    const far = RN[Math.max(...subs.map(x => x.n))] * 3.2 + 3;
    api.view({ pos: [far * 0.55, far * 0.4, far * 0.75], target: [0, 0, 0], min: 1.5, max: 30 });
  }

  NL.m3d.register('HM5', {
    title: 'Orbital nguyên tử',
    init() { Z = 8; view = 'surf'; hidden = {}; },
    build(api) { build(api); },
    data() {
      const e = C3().EL[Z - 1], sh = C3().shells(Z);
      return {
        title: `Nguyên tử ${e.sym} (${e.vi}) và năng lượng ion hóa thứ nhất`,
        sub: 'IE₁ tăng dần trong một chu kỳ, giảm mạnh khi sang chu kỳ mới (bắt đầu lớp electron mới)',
        sheets: [
          { name: 'Nguyên tử ' + e.sym, head: ['Đại lượng', 'Giá trị'], rows: [['Proton (P)', Z], ['Neutron (N)', NEU[Z]], ['Electron (E)', Z], ['Cấu hình electron', C3().config(Z)], ...sh.map((n, i) => [`Lớp ${SHELL[i]} (n = ${i + 1})`, n + ' electron']), ['Bán kính nguyên tử (pm)', e.r], ['Độ âm điện (Pauling)', e.chi ? C3().fmtVN(e.chi) : '–'], ['IE₁ (kJ/mol)', IE1[Z]]] },
          { name: '23 nguyên tố', head: ['Z', 'Ký hiệu', 'Cấu hình electron', 'K', 'L', 'M', 'N', 'Bán kính (pm)', 'Độ âm điện', 'IE₁ (kJ/mol)'], rows: LIST.map(z => { const x = C3().EL[z - 1], s = C3().shells(z); return [z, x.sym, C3().config(z), s[0] || 0, s[1] || 0, s[2] || 0, s[3] || 0, x.r, x.chi ? C3().fmtVN(x.chi) : '–', IE1[z]]; }) }
        ],
        chart: { type: 'line', title: 'Năng lượng ion hóa thứ nhất IE₁ theo Z', xMin: 0, xMax: 32, yMax: 2500, series: [{ name: 'IE₁ (kJ/mol)', color: '#F59E0B', points: LIST.map(z => [z, IE1[z]]) }], yLabel: 'kJ/mol', xLabel: 'Số hiệu nguyên tử Z' }
      };
    }
  });
})();
