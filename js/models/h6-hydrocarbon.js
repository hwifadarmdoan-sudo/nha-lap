// Mô hình Hóa 6: Cấu trúc hydrocarbon. Alkane (quay quanh liên kết C–C của ethane), alkene (cis / trans), alkyne, benzene (hệ π liên hợp), cyclohexane (ghế / thuyền); 3 kiểu hiển thị và công thức khung 2D.
(function () {
  const C3 = () => NL.chem3d;
  const INFO = {
    CH4: { f: 'CH₄', name: 'Methane', fam: 'Alkane', gen: 'CₙH₂ₙ₊₂', hyb: 'sp³', ang: '109,5°', cc: '–', bp: -162 },
    C2H6: { f: 'C₂H₆', name: 'Ethane', fam: 'Alkane', gen: 'CₙH₂ₙ₊₂', hyb: 'sp³', ang: '≈ 109,5°', cc: 'C–C 154 pm', bp: -89 },
    C3H8: { f: 'C₃H₈', name: 'Propane', fam: 'Alkane', gen: 'CₙH₂ₙ₊₂', hyb: 'sp³', ang: '≈ 109,5° (mạch gấp khúc)', cc: 'C–C 154 pm', bp: -42 },
    C4H10: { f: 'C₄H₁₀', name: 'Butane', fam: 'Alkane', gen: 'CₙH₂ₙ₊₂', hyb: 'sp³', ang: '≈ 109,5° (mạch gấp khúc)', cc: 'C–C 154 pm', bp: -0.5 },
    C2H4: { f: 'C₂H₄', name: 'Ethene', fam: 'Alkene', gen: 'CₙH₂ₙ', hyb: 'sp²', ang: '≈ 120° (phân tử phẳng)', cc: 'C=C 134 pm', bp: -104 },
    C3H6: { f: 'C₃H₆', name: 'Propene', fam: 'Alkene', gen: 'CₙH₂ₙ', hyb: 'sp² và sp³', ang: '≈ 120° quanh C=C', cc: 'C=C 134 pm, C–C 150 pm', bp: -48 },
    cis: { f: 'cis-C₄H₈', name: 'cis-But-2-ene', fam: 'Alkene', gen: 'CₙH₂ₙ', hyb: 'sp² và sp³', ang: '≈ 120° quanh C=C', cc: 'C=C 134 pm', bp: 3.7 },
    trans: { f: 'trans-C₄H₈', name: 'trans-But-2-ene', fam: 'Alkene', gen: 'CₙH₂ₙ', hyb: 'sp² và sp³', ang: '≈ 120° quanh C=C', cc: 'C=C 134 pm', bp: 0.9 },
    C2H2: { f: 'C₂H₂', name: 'Ethyne (acetylene)', fam: 'Alkyne', gen: 'CₙH₂ₙ₋₂', hyb: 'sp', ang: '180° (thẳng hàng)', cc: 'C≡C 120 pm', bp: -84 },
    C3H4: { f: 'C₃H₄', name: 'Propyne', fam: 'Alkyne', gen: 'CₙH₂ₙ₋₂', hyb: 'sp và sp³', ang: '180° quanh C≡C', cc: 'C≡C 120 pm, C–C 146 pm', bp: -23 },
    C6H6: { f: 'C₆H₆', name: 'Benzene', fam: 'Arene', gen: 'CₙH₂ₙ₋₆', hyb: 'sp²', ang: '120° (vòng phẳng)', cc: '6 liên kết C–C đều 139 pm', bp: 80 },
    C6H12: { f: 'C₆H₁₂', name: 'Cyclohexane', fam: 'Cycloalkane', gen: 'CₙH₂ₙ', hyb: 'sp³', ang: '≈ 111° (vòng không phẳng)', cc: 'C–C 153 pm', bp: 81 }
  };
  const TABS = { alkane: ['CH4', 'C2H6', 'C3H8', 'C4H10'], alkene: ['C2H4', 'C3H6', 'cis', 'trans'], alkyne: ['C2H2', 'C3H4'], ring: ['C6H6', 'C6H12'] };
  const CUR = { alkane: 'C2H6', alkene: 'cis', alkyne: 'C2H2', ring: 'C6H6' };
  let style = 'ball', dihedral = 60, chair = true, kekule = false;
  const WARN_BZ = 'Benzene <b>không phải</b> là vòng chứa 3 liên kết đơn xen kẽ 3 liên kết đôi riêng biệt! Độ dài của cả 6 liên kết C–C đều bằng nhau (<b>139 pm</b>), tạo thành hệ <b>π liên hợp</b> bao trùm toàn bộ vòng 6 cạnh.';
  const WARN_CY = 'Vòng cyclohexane <b>không nằm trên một mặt phẳng</b>, nhờ đó góc liên kết giữ gần 109,5° và không bị căng. Cấu dạng <b>ghế</b> là cấu dạng bền nhất, năng lượng thấp nhất (thuyền cao hơn khoảng 30 kJ/mol)!';
  const torsionE = phi => 6 * (1 + Math.cos(3 * phi * Math.PI / 180)); // kJ/mol, rào quay ethane ≈ 12 kJ/mol

  // trả về { atoms: [{el, p}], bonds: [[i, j, order]] }
  function geom(T, key) {
    const V = (x, y, z) => new T.Vector3(x, y, z), A = [], B = [];
    const add = (el, p) => (A.push({ el, p }), A.length - 1);
    const addH = (ci, dirs, len) => dirs.forEach(d => B.push([ci, add('H', A[ci].p.clone().add(d.clone().multiplyScalar(len || 1.09))), 1]));
    const nbDirs = ci => B.filter(b => b[0] === ci || b[1] === ci).map(b => A[b[0] === ci ? b[1] : b[0]].p.clone().sub(A[ci].p).normalize());
    const fillSp3 = ci => addH(ci, C3().tetraFill(T, nbDirs(ci), 4 - nbDirs(ci).length));
    if (/^C\d*H\d+$/.test(key) && INFO[key].fam === 'Alkane') {
      const n = key === 'CH4' ? 1 : +key[1];
      for (let i = 0; i < n; i++) add('C', V(i * 1.258 - (n - 1) * 0.629, (i % 2) * 0.889 - (n > 1 ? 0.444 : 0), 0));
      for (let i = 0; i + 1 < n; i++) B.push([i, i + 1, 1]);
      for (let i = 0; i < n; i++) fillSp3(i);
      return { atoms: A, bonds: B };
    }
    if (INFO[key].fam === 'Alkene') {
      const c1 = add('C', V(-0.67, 0, 0)), c2 = add('C', V(0.67, 0, 0)); B.push([c1, c2, 2]);
      const slot = (c, up) => V(c === c1 ? -0.5 : 0.5, up ? 0.866 : -0.866, 0);
      const me = { C2H4: [], C3H6: [[c2, 1]], cis: [[c1, 1], [c2, 1]], trans: [[c1, 1], [c2, 0]] }[key];
      [[c1, 1], [c1, 0], [c2, 1], [c2, 0]].forEach(([c, up]) => {
        const d = slot(c, up);
        if (me.some(m => m[0] === c && m[1] === up)) { const m = add('C', A[c].p.clone().add(d.clone().multiplyScalar(1.5))); B.push([c, m, 1]); fillSp3(m); }
        else addH(c, [d], 1.08);
      });
      return { atoms: A, bonds: B };
    }
    if (INFO[key].fam === 'Alkyne') {
      const c1 = add('C', V(-0.6, 0, 0)), c2 = add('C', V(0.6, 0, 0)); B.push([c1, c2, 3]);
      addH(c1, [V(-1, 0, 0)], 1.06);
      if (key === 'C2H2') addH(c2, [V(1, 0, 0)], 1.06); else { const m = add('C', V(2.06, 0, 0)); B.push([c2, m, 1]); fillSp3(m); }
      return { atoms: A, bonds: B };
    }
    if (key === 'C6H6') {
      for (let k = 0; k < 6; k++) add('C', V(1.39 * Math.cos(k * Math.PI / 3 + Math.PI / 6), 1.39 * Math.sin(k * Math.PI / 3 + Math.PI / 6), 0));
      for (let k = 0; k < 6; k++) B.push([k, (k + 1) % 6, kekule ? (k % 2 ? 1 : 2) : 1]);
      for (let k = 0; k < 6; k++) addH(k, [A[k].p.clone().normalize()], 1.09);
      return { atoms: A, bonds: B };
    }
    // cyclohexane: ghế hoặc thuyền (vòng nằm ngang, trục y thẳng đứng)
    for (let k = 0; k < 6; k++) {
      const a = k * Math.PI / 3, R = chair ? 1.446 : 1.48, y = chair ? (k % 2 ? 0.25 : -0.25) : (k === 0 || k === 3 ? 0.5 : 0);
      add('C', V(R * Math.cos(a), y, R * Math.sin(a)));
    }
    for (let k = 0; k < 6; k++) B.push([k, (k + 1) % 6, 1]);
    for (let k = 0; k < 6; k++) fillSp3(k);
    return { atoms: A, bonds: B };
  }

  function skeletonSVG(G, key) {
    const C = G.atoms.map((a, i) => ({ a, i })).filter(o => o.a.el === 'C');
    const P = o => key === 'C6H12' ? [o.a.p.x, o.a.p.z] : [o.a.p.x, -o.a.p.y];
    const xs = C.map(o => P(o)[0]), ys = C.map(o => P(o)[1]);
    const mx = Math.min(...xs), Mx = Math.max(...xs), my = Math.min(...ys), My = Math.max(...ys), sc = 46 / Math.max(1, Mx - mx, My - my) * 1.6;
    const w = Math.max(60, (Mx - mx) * sc + 30), h = Math.max(40, (My - my) * sc + 30);
    const pt = o => { const [x, y] = P(o); return [(x - mx) * sc + 15, (y - my) * sc + 15]; };
    let s = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="display:block;margin-top:4px">`;
    G.bonds.forEach(([i, j, o]) => {
      const a = C.find(c => c.i === i), b = C.find(c => c.i === j); if (!a || !b) return;
      const [x1, y1] = pt(a), [x2, y2] = pt(b), dx = y2 - y1, dy = x1 - x2, L = Math.hypot(dx, dy) || 1;
      const offs = o === 3 ? [-4, 0, 4] : o === 2 ? [0, 5] : [0];
      offs.forEach(k => { s += `<line x1="${x1 + dx / L * k}" y1="${y1 + dy / L * k}" x2="${x2 + dx / L * k}" y2="${y2 + dy / L * k}" stroke="#1F4E79" stroke-width="3" stroke-linecap="round"/>`; });
    });
    if (key === 'C6H6' && !kekule) { const cx = C.reduce((t, o) => t + pt(o)[0], 0) / 6, cy = C.reduce((t, o) => t + pt(o)[1], 0) / 6; s += `<circle cx="${cx}" cy="${cy}" r="${sc * 0.85}" fill="none" stroke="#A855F7" stroke-width="3"/>`; }
    if (C.length === 1) s += `<text x="${w / 2}" y="${h / 2 + 6}" text-anchor="middle" font-weight="800" fill="#1F4E79">CH₄</text>`;
    return s + '</svg>';
  }

  function build(api, tab) {
    const T = api.T, key = CUR[tab], m = INFO[key], G = geom(T, key), fill = style === 'fill', skel = style === 'skel';
    const g = api.group(), objs = [];
    const rotSet = new Set();
    if (key === 'C2H6') G.bonds.forEach(([i, j]) => { if (i === 1 && G.atoms[j].el === 'H') rotSet.add(j); });
    const rotG = api.group(g);
    G.atoms.forEach((a, i) => {
      if (skel && a.el === 'H') return;
      const parent = rotSet.has(i) ? rotG : g;
      const mesh = C3().atom(api, a.el, a.p, parent, { fill, scale: skel ? 0.7 : 1 });
      api.part(mesh, a.el === 'C' ? { name: 'Nguyên tử carbon', sci: 'C', rows: [['Lai hóa', m.hyb], ['Hóa trị', 'IV: luôn tạo đủ 4 liên kết']] } : { name: 'Nguyên tử hydrogen', sci: 'H', rows: [['Liên kết', 'C–H, dài ≈ 109 pm, bền ≈ 413 kJ/mol']] });
      objs[i] = mesh;
    });
    if (!fill) G.bonds.forEach(([i, j, o]) => {
      if (skel && (G.atoms[i].el === 'H' || G.atoms[j].el === 'H')) return;
      const parent = rotSet.has(i) || rotSet.has(j) ? rotG : g;
      const b = C3().bond(api, G.atoms[i].p, G.atoms[j].p, o, parent, { perp: key.startsWith('C2H4') || INFO[key].fam === 'Alkene' ? new T.Vector3(0, 0, 1) : null, r: skel ? 0.12 : 0.085 });
      const both = G.atoms[i].el === 'C' && G.atoms[j].el === 'C';
      api.part(b, both ? { name: o === 3 ? 'Liên kết ba C≡C' : o === 2 ? 'Liên kết đôi C=C' : 'Liên kết đơn C–C', sci: o === 3 ? '1σ + 2π' : o === 2 ? '1σ + 1π' : 'σ', rows: [['Gồm', o === 3 ? '1 liên kết σ (xám) + 2 liên kết π (tím)' : o === 2 ? '1 liên kết σ (xám) + 1 liên kết π (tím)' : '1 liên kết σ, quay tự do được'], ['Độ dài', o === 3 ? '120 pm' : o === 2 ? '134 pm' : key === 'C6H6' ? '139 pm' : '154 pm'], ['Ghi nhớ', o >= 2 ? 'Liên kết π kém bền, dễ bị phá trong phản ứng cộng; không quay tự do được (nên có đồng phân cis – trans)' : 'Liên kết σ bền']] } : { name: 'Liên kết C–H', sci: 'σ', rows: [['Độ dài', '≈ 109 pm']] });
    });
    // benzene: đám mây π liên hợp trên và dưới vòng
    if (key === 'C6H6' && !kekule && !fill) {
      const piG = api.group(g); api.tag(piG, 'pi');
      [-0.55, 0.55].forEach(z => { const t = api.mesh(new T.TorusGeometry(1.39, 0.32, 16, 60), api.mat(C3().PI, { opacity: 0.3, depthWrite: false, emissive: C3().PI, emissiveIntensity: 0.3 }), [0, 0, z], piG); t.scale.z = 0.6; });
      api.part(piG, { name: 'Hệ π liên hợp của benzene', sci: '6 electron π', rows: [['Hình thành', 'Mỗi C còn 1 orbital p vuông góc mặt vòng; 6 orbital p xen phủ với nhau thành 2 vành electron trên và dưới vòng'], ['Hệ quả', '6 liên kết C–C dài bằng nhau 139 pm (giữa đơn 154 pm và đôi 134 pm); vòng rất bền, khó cộng, dễ thế']] });
    }
    if (key === 'C2H6') {
      const axis = G.atoms[1].p.clone().sub(G.atoms[0].p).normalize(), c = G.atoms[1].p.clone();
      const apply = () => { rotG.position.set(0, 0, 0); rotG.quaternion.setFromAxisAngle(axis, dihedral * Math.PI / 180); rotG.position.copy(c.clone().sub(c.clone().applyQuaternion(rotG.quaternion))); };
      apply();
      api.slider({ label: '🔄 Quay nhóm CH₃ bên phải (góc nhị diện)', min: 0, max: 360, step: 5, value: dihedral, unit: '°', onInput(v) { dihedral = v; apply(); const e = torsionE(v); api.caption(`Góc nhị diện ${v}° · ${e > 9 ? 'dạng che khuất' : e < 3 ? 'dạng xen kẽ (bền nhất)' : 'dạng trung gian'} · E = ${e.toFixed(1).replace('.', ',')} kJ/mol`); } });
      api.note('Liên kết đơn C–C <b>quay tự do</b>: dạng xen kẽ (60°, 180°, 300°) bền hơn dạng che khuất khoảng 12 kJ/mol. Mở 📊 Số liệu để xem đồ thị năng lượng.');
    }
    if (key === 'C6H12') {
      api.choices({ label: 'Cấu dạng', items: [{ t: '🪑 Ghế', v: 1 }, { t: '⛵ Thuyền', v: 0 }], value: chair ? 1 : 0, onPick(v) { chair = !!v; api.setTab(tab); } });
      setTimeout(() => api.warn('cy', WARN_CY, '🔬 Thông điệp khoa học'), 500);
    }
    if (key === 'C6H6') {
      api.toggle({ label: '✏️ Vẽ kiểu Kekulé (3 đôi xen kẽ 3 đơn)', value: kekule, onChange(v) { kekule = v; if (v) api.warn('bzk', WARN_BZ, '🔬 Thông điệp khoa học'); api.setTab(tab); } });
      setTimeout(() => api.warn('bz', WARN_BZ, '🔬 Thông điệp khoa học'), 500);
    }
    if (key === 'cis' || key === 'trans') api.note(`<b>${key === 'cis' ? 'cis' : 'trans'}</b>: 2 nhóm CH₃ nằm <b>${key === 'cis' ? 'cùng phía' : 'khác phía'}</b> liên kết đôi. Liên kết π không cho quay, nên cis và trans là 2 chất khác nhau (sôi ở ${key === 'cis' ? '3,7' : '0,9'} °C).`);
    api.overlay(`<div class="hm-card"><b style="font-size:1.2em">${m.f}</b> · ${m.name}<br>Dãy ${m.fam} (${m.gen}) · lai hóa ${m.hyb}<br>Góc: ${m.ang} · ${m.cc}${skel ? '<br><small>Công thức khung: mỗi đỉnh và đầu mút là 1 nguyên tử C, H được ẩn đi</small>' + skeletonSVG(G, key) : ''}</div>`, 'hm-tl');
    api.choices({ label: '🧪 Chọn chất', items: TABS[tab].map(k => ({ t: INFO[k].f, v: k })), value: key, onPick(k) { CUR[tab] = k; api.setTab(tab); } });
    api.choices({ label: 'Kiểu hiển thị', items: [{ t: 'Quả cầu – que', v: 'ball' }, { t: 'Khung C (2D)', v: 'skel' }, { t: 'Đặc (không gian)', v: 'fill' }], value: style, onPick(s) { style = s; api.setTab(tab); } });
    if (!fill) api.note('<span style="color:#B8C2CC">■</span> liên kết σ · <span style="color:#A855F7">■</span> liên kết π');
    api.caption(`${m.f}: ${m.name}`);
    const size = Math.max(...G.atoms.map(a => a.p.length())) + 1.5;
    api.view({ pos: key === 'C6H12' ? [size * 1.7, size * 0.7, size * 1.3] : [size * 0.5, size * 0.5, size * 2.2], target: [0, 0, 0], min: 2, max: 25 });
  }

  NL.m3d.register('HM6', {
    title: 'Cấu trúc hydrocarbon',
    tabs: [{ t: 'Alkane', v: 'alkane' }, { t: 'Alkene', v: 'alkene' }, { t: 'Alkyne', v: 'alkyne' }, { t: 'Vòng', v: 'ring' }],
    init() { dihedral = 60; kekule = false; chair = true; },
    build(api, tab) { build(api, tab); },
    data(api) {
      const eth = api.tab === 'alkane' && CUR.alkane === 'C2H6', pts = []; for (let a = 0; a <= 360; a += 10) pts.push([a, +torsionE(a).toFixed(2)]);
      return {
        title: eth ? 'Năng lượng quay quanh liên kết C–C của ethane' : 'So sánh các hydrocarbon trong mô hình',
        sub: eth ? `Đang ở góc ${dihedral}°: E = ${torsionE(dihedral).toFixed(1).replace('.', ',')} kJ/mol (0 là dạng xen kẽ bền nhất)` : 'Mạch carbon càng dài, nhiệt độ sôi càng cao',
        sheets: [
          { name: 'Hydrocarbon', head: ['Chất', 'Tên', 'Dãy', 'Công thức chung', 'Lai hóa C', 'Góc liên kết', 'Liên kết C–C', 'Nhiệt độ sôi (°C)'], rows: Object.keys(INFO).map(k => { const m = INFO[k]; return [m.f, m.name, m.fam, m.gen, m.hyb, m.ang, m.cc, m.bp]; }) },
          { name: 'Quay ethane', head: ['Góc nhị diện (°)', 'Năng lượng (kJ/mol)', 'Dạng'], rows: pts.filter(p => p[0] % 30 === 0).map(p => [p[0], p[1], p[1] > 9 ? 'Che khuất' : p[1] < 3 ? 'Xen kẽ' : 'Trung gian']) }
        ],
        chart: eth
          ? { type: 'line', title: 'Năng lượng theo góc quay (ethane)', xMin: 0, xMax: 360, yMax: 15, series: [{ name: 'E (kJ/mol)', color: '#A855F7', points: pts }, { name: 'Đang ở đây', color: '#F59E0B', points: [[dihedral, +torsionE(dihedral).toFixed(2)]] }], yLabel: 'kJ/mol', xLabel: 'Góc nhị diện (°)', marks: [{ y: 12, label: 'Che khuất', color: '#E5534B' }] }
          : { type: 'line', title: 'Nhiệt độ sôi theo số nguyên tử C', xMin: 0, xMax: 4, yMin: -200, yMax: 100, series: [
            { name: 'Alkane', color: '#38BDF8', points: [[1, -162], [2, -89], [3, -42], [4, -0.5]] },
            { name: 'Alkene', color: '#A855F7', points: [[2, -104], [3, -48], [4, 0.9]] },
            { name: 'Alkyne', color: '#F59E0B', points: [[2, -84], [3, -23]] }], yLabel: '°C', xLabel: 'Số C' }
      };
    },
    liveData: true
  });
})();
